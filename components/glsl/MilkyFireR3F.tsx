"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyFireR3F() {
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
              // Get normalized screen coordinates (-1 to 1)
              vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
              // Fix aspect ratio
              uv.x *= iResolution.x / iResolution.y;
              
              // Time variable
              float t = iTime;
              
              // Initialize output color
              vec4 o = vec4(0.0);
              // Create ray direction
              vec4 r = vec4(uv, 1.0, 0.0);
              
              // Ray marching - declare z and d outside the loop
              float z = 0.0;
              float d = 0.0;
              float j = 0.0;
              
              // Main ray marching loop
              for(float i = 0.0; i < 5e1; i++) {
                // Calculate ray position
                vec3 p = z * normalize(vec3(uv, 1.0) * 2.0 - vec3(r.x, r.y, r.y));
                
                // Add depth offset
                p.z += 5.0 + cos(t);
                
                // Apply rotation matrix - correctly constructed mat2
                float c1 = cos(t + p.y * 0.5);
                float c2 = cos(t + p.y * 0.5 + 33.0);
                float c3 = cos(t + p.y * 0.5 + 11.0);
                float c4 = cos(t + p.y * 0.5);
                mat2 rotMat = mat2(c1, c2, c3, c4);
                
                // Apply rotation and scaling
                p.xz *= rotMat;
                p.xz /= max(p.y * 0.1 + 1.0, 0.1);
                
                // Apply fractal deformation
                for(j = 2.0; j < 15.0; j /= 0.6) {
                  p += cos((p.yzx - vec3(t, 0.0, 0.0) / 0.1) * j + t) / j;
                }
                
                // Calculate distance and advance ray
                d = 0.01 + abs(length(p.xz) + p.y * 0.3 - 0.5) / 7.0;
                z += d;
                
                // Accumulate color based on distance
                o += (sin(z / 3.0 + vec4(7.0, 2.0, 3.0, 0.0)) + 1.1) / d;
              }
              
              // Apply tone mapping and color adjustment
              o = tanh(o / 1000.0);
              
              // Add some warmth to the fire colors
              o.r *= 1.2; // Boost red
              o.b *= 0.8; // Reduce blue
              
              // Output final color
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}

        />
      </mesh>
    </>
  )
}