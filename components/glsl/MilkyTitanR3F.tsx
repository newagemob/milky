"use client";

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyTitanR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime()
      
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
              vec2 r = iResolution.xy;
              vec4 o = vec4(0.0);
              float t = iTime;
              
              // Proper screen coordinate setup
              vec2 uv = (FC.xy * 2.0 - r.xy) / r.y;
              
              // Add smooth continuous animation
              float animCycle = sin(t * 0.3) * 0.5 + 0.5;
              float inversionFactor = sin(t * 0.15);
              
              // Raymarching variables
              float z = 0.0;
              
              // Raymarching loop - closer to original
              for(float i = 0.0; i < 40.0; i++) {
                float ii = i + 1.0;
                
                // Ray direction setup (fixed the FC.rgb issue)
                vec3 rayDir = normalize(vec3(uv.x, uv.y, 1.0));
                vec3 p = z * rayDir;
                
                // Apply rotation matrix to p.yz
                float rotTime = t * 0.5;
                mat2 rotMat = mat2(cos(rotTime), sin(rotTime), -sin(rotTime), cos(rotTime));
                p.yz *= 0.1 * rotMat;
                p.z += 8.0;
                
                // Distance field
                float s = length(p) - 6.0;
                float d = 0.02 + 0.2 * abs(s);
                z += d;
                
                // Lighting calculation
                vec2 cosInput = t * 0.5 + vec2(0.0, 11.0);
                float b = max(dot(p.xz, cos(cosInput)) - p.y + s, 0.1);
                
                // Color accumulation
                vec4 colorTerm = cos(tanh(s + s) * 3.0 + b * 0.3 - vec4(0, 1, 2, 0) - 2.0) + 1.0;
                o += colorTerm / d / z * b;
              }
              
              // Final processing
              o = tanh(o / 4000.0);
              
              // Continuous color animation
              vec3 colorMod = vec3(
                0.5 + 0.5 * sin(t * 0.2),
                0.5 + 0.5 * cos(t * 0.25),
                0.5 + 0.5 * sin(t * 0.3)
              );
              
              // Apply smooth inversion for infinite loop
              vec3 finalColor = o.rgb * colorMod;
              finalColor = mix(finalColor, 1.0 - finalColor, 0.5 + 0.5 * sin(t * 0.1));
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
