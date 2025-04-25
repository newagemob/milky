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
              // Normalized pixel coordinates (from -0.5 to 0.5)
              vec2 FC = gl_FragCoord.xy / iResolution.xy;
              FC = FC - 0.5;
              FC.x *= iResolution.x / iResolution.y;
              
              // Time variable
              float t = iTime;
              
              // Initialize output color and ray variables
              vec4 o = vec4(0.0);
              vec4 r = vec4(FC.xy, 1.0, 0.0);
              
              // Ray marching loop
              for(float i = 0.0, z = 0.0, d = 0.0, j = 0.0; i < 5e1; i++) {
                vec3 p = z * normalize(FC.rgb * 2.0 - r.xyy);
                p.z += 5.0 + cos(t);
                p.xz *= mat2(cos(t + p.y * 0.5 + vec4(0, 33, 11, 0)));
                p.xz /= max(p.y * 0.1 + 1.0, 0.1);
                
                for(j = 2.0; j < 15.0; j /= 0.6) {
                  p += cos((p.yzx - vec3(t, 0, 0) / 0.1) * j + t) / j;
                }
                
                d = 0.01 + abs(length(p.xz) + p.y * 0.3 - 0.5) / 7.0;
                z += d;
                o += (sin(z / 3.0 + vec4(7, 2, 3, 0)) + 1.1) / d;
              }
              
              // Apply tone mapping
              o = tanh(o / 1e3);
              
              // Output to screen
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}