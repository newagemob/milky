"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyOrbR3F() {
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
              // Normalized and centered screen coordinates
              vec2 FC = gl_FragCoord.xy;
              vec2 r = iResolution.xy;
              vec2 p = (FC.xy * 2.0 - r) / r.y;
              
              // Start with zero output color
              vec4 o = vec4(0.0);
              
              // Initialize variables
              vec2 l = vec2(0.0);
              float dot_val = dot(p, p);
              float abs_val = abs(0.7 - dot_val);
              l += abs_val;
              
              // Calculate initial vector v
              vec2 v = p * (1.0 - l) / 0.2;
              
              // Iterate through the loop 8 times
              float t = iTime;
              for(float i = 0.0; i < 8.0; i++) {
                // Increment i by 1 for calculations
                float ii = i + 1.0;
                
                // Calculate vector and combine into output
                vec4 sinTerm = sin(vec4(v.x, v.y, v.y, v.x)) + 1.0;
                float diffTerm = abs(v.x - v.y) * 0.2;
                o += sinTerm * diffTerm;
                
                // Update vector v for next iteration
                vec3 vV = vec3(v.y, v.x, ii);
                vec2 cosInput = vV.xy + vec2(0.0, ii) + t;
                v += cos(cosInput) / ii + 0.7;
              }
              
              // Final color calculation with amber/gold color tint
              vec4 expTerm = exp(p.y * vec4(1.0, -1.0, -2.0, 0.0));
              float expFactor = exp(-4.0 * l.x);
              o = tanh(expTerm * expFactor / o);
              
              // Apply amber/gold tint
              vec3 amber = vec3(1.0, 0.8, 0.2);
              gl_FragColor = vec4(o.rgb * amber, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
