"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyTitanR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime()
      
      // Update resolution
      const size = state.size
      materialRef.current.uniforms.iResolution.value = new THREE.Vector3(size.width, size.height, 1)
    }
  })

  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={{
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3(1, 1, 1) }
          }}
          vertexShader={`
            void main() {
              gl_Position = vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float iTime;
            uniform vec3 iResolution;
            
            void main() {
              vec2 FC = gl_FragCoord.xy;
              vec3 r = iResolution;
              vec4 o = vec4(0.0);
              float t = iTime;
              
              // Raymarching loop - converted from the compact GLSL
              for(float i = 0.0; i < 40.0; i++) {
                // Ray direction calculation
                vec3 p = (i * 0.02) * normalize((FC.rgb * 2.0 - r.xyx) / r.y);
                
                // Apply rotation matrix to yz components
                float c = cos(0.8);
                float s = sin(0.8);
                mat2 rot = mat2(c, s, -s, c);
                p.yz *= 0.1 * rot;
                p.z += 8.0;
                
                // Distance field calculation
                float sphereDist = length(p) - 6.0;
                float d = 0.02 + 0.2 * abs(sphereDist);
                
                // Lighting calculation with animated phase
                float phase = sin(t * 0.5) * 0.5 + 0.5; // Smooth 0-1 oscillation
                vec2 lightDir = vec2(cos(t * 0.5), sin(t * 0.5 + 11.0));
                float lighting = max(dot(p.xz, lightDir) - p.y + sphereDist, 0.1);
                
                // Atmospheric glow with phase modulation
                float glow = mix(0.3, 1.0, phase);
                vec4 colorContrib = (cos(tanh(sphereDist + sphereDist) * 3.0 + lighting * glow - vec4(0,1,2,0) - 2.0) + 1.0) / d / (i * 0.02 + 0.1) * lighting;
                
                // Add phase-based color variation for waxing/waning effect
                colorContrib.rgb *= mix(vec3(0.6, 0.7, 1.0), vec3(1.0, 0.9, 0.7), phase);
                
                o += colorContrib;
                
                // Early termination for efficiency
                if(d < 0.001) break;
              }
              
              // Final color processing with smooth phase transition
              o = tanh(o / 4000.0);
              
              // Create infinite loop by smoothly inverting colors
              float cycle = sin(t * 0.3) * 0.5 + 0.5;
              o.rgb = mix(o.rgb, 1.0 - o.rgb, cycle * 0.3);
              
              // Enhanced atmospheric glow
              vec2 uv = (FC.xy * 2.0 - r.xy) / r.y;
              float dist = length(uv);
              float atmosGlow = exp(-dist * 2.0) * 0.1;
              o.rgb += atmosGlow * vec3(0.4, 0.6, 1.0);
              
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
