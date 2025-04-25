"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyFireR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.t.value = state.clock.getElapsedTime()

      // Update resolution if needed
      const size = state.size
      materialRef.current.uniforms.FC.value = new THREE.Vector3(size.width, size.height, 1)
    }
  })

  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial 
          ref={materialRef}
          uniforms={{
            t: { value: 0.0 },
            FC: { value: new THREE.Vector3(1, 1, 1) },
            r: { value: new THREE.Vector2(1, 1) }
          }}
          vertexShader={`
            void main() {
              gl_Position = vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float t;
            uniform vec3 FC;
            uniform vec2 r;
            
            void main() {
              vec4 o = vec4(0.0);
              
              for(float i = 0.0, z = 0.0, d = 0.0, j = 0.0; i++ < 5e1; o += (sin(z/3.+vec4(7,2,3,0))+1.1)/d) {
                vec3 p = z * normalize(FC.rgb * 2. - r.xyy);
                p.z += 5. + cos(t);
                p.xz *= mat2(cos(t + p.y * .5 + vec4(0,33,11,0))) / max(p.y * .1 + 1., .1);
                
                for(j = 2.; j < 15.; j /= .6) {
                  p += cos((p.yzx - vec3(t,0,0) / .1) * j + t) / j;
                }
                
                z += d = .01 + abs(length(p.xz) + p.y * .3 - .5) / 7.;
              }
              
              o = tanh(o / 1e3);
              gl_FragColor = o;
            }
          `}
          transparent={true}
        />
      </mesh>
    </>
  )
}