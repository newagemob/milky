"use client"

import { useRef } from "react"
import { useFrame, extend } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"

// Create a shader material using drei's shaderMaterial
const LickingFlameMaterial = shaderMaterial(
  {
    t: 0,
    r: new THREE.Vector2(1, 1),
  },
  // Vertex shader
  `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float t;
    uniform vec2 r;
    
    void main() {
      vec4 o = vec4(0.0);
      vec2 FC = gl_FragCoord.xy;
      
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
      
      o = tanh(o / 1e3);
      
      // Apply warm flame colors
      vec3 flameColor = vec3(1.0, 0.5, 0.2);
      gl_FragColor = vec4(o.rgb * flameColor, 1.0);
    }
  `,
)

// Extend the Three.js materials with our custom material
extend({ LickingFlameMaterial })

export function MilkyFireR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.t.value = state.clock.getElapsedTime()

      // Update resolution if needed
      const size = state.size
      materialRef.current.uniforms.r.value = new THREE.Vector2(size.width, size.height)
    }
  })

  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <lickingFlameMaterial ref={materialRef} />
      </mesh>
    </>
  )
}
