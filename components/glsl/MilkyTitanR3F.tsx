"use client";

import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyTitanR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime()

      // Update resolution if needed
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
              
              // Create smooth infinite loop for moon phases (0 to 1 and back)
              float phaseTime = sin(t * 0.3) * 0.5 + 0.5;
              
              // Raymarching loop - adapted from original GLSL
              for(float i = 0.0; i < 40.0; i++) {
                // Calculate ray direction
                vec3 p = (i * 0.02) * normalize(vec3(FC.rgb * 2.0 - r.xyx));
                
                // Apply transformation matrix for interesting shape
                mat2 rotMat = mat2(0.8, 0.6, -0.6, 0.8);
                p.yz *= 0.1 * rotMat;
                p.z += 8.0;
                
                // Distance field for sphere (moon)
                float s = length(p) - 6.0;
                float d = 0.02 + 0.2 * abs(s);
                
                // Moon phase calculation - creates the waxing/waning effect
                vec2 sunDir = vec2(cos(phaseTime * 6.28318), sin(phaseTime * 6.28318));
                float moonPhase = max(dot(p.xz, sunDir) - p.y + s, 0.1);
                
                // Color calculation with atmospheric glow
                vec4 colorContrib = (cos(tanh(s + s) * 3.0 + moonPhase * 0.3 - vec4(0, 1, 2, 0) - 2.0) + 1.0) / d / (i + 1.0) * moonPhase;
                o += colorContrib;
              }
              
              // Final color processing
              o = tanh(o / 4000.0);
              
              // Add moon-like silver-blue tint with atmospheric glow
              vec3 moonColor = vec3(0.9, 0.95, 1.0); // Cool moonlight
              vec3 atmosphereColor = vec3(0.3, 0.4, 0.8); // Blue atmospheric glow
              
              // Mix colors based on intensity
              float intensity = length(o.rgb);
              vec3 finalColor = mix(atmosphereColor, moonColor, smoothstep(0.1, 0.8, intensity));
              
              // Add subtle warm glow at the edges (like earthshine)
              float edgeGlow = 1.0 - smoothstep(0.0, 0.3, intensity);
              finalColor += vec3(0.8, 0.6, 0.3) * edgeGlow * 0.2;
              
              gl_FragColor = vec4(finalColor * o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
