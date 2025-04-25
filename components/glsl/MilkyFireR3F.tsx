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
            varying vec2 vUv;
            
            void main() {
              vUv = uv;
              gl_Position = vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float iTime;
            uniform vec3 iResolution;
            varying vec2 vUv;
            
            void main() {
              // Frame coordinates - center of screen with aspect ratio correction
              vec2 FC = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
              
              // Time variable for animation
              float t = iTime;
              
              // Initialize output color
              vec4 o = vec4(0.0);
              
              // Parameters for raymarching
              vec4 r = vec4(FC.xy, 1.0, 0.0);
              
              // Main raymarching loop
              for(float i = 0.0, z = 0.0, d = 0.0, j = 0.0; i < 5e1; i++) {
                // Create position vector based on current ray distance
                vec3 p = z * normalize(vec3(FC.xy * 2.0 - r.xy, 1.0));
                
                // Offset z position and apply animation
                p.z += 5.0 + cos(t);
                
                // Rotate xz plane based on height and time
                float ct = cos(t + p.y * 0.5);
                float st = sin(t + p.y * 0.5);
                p.xz = mat2(ct, st, -st, ct) * p.xz / max(p.y * 0.1 + 1.0, 0.1);
                
                // Apply fractal displacement
                for(j = 2.0; j < 15.0; j /= 0.6) {
                  p += cos((p.yzx - vec3(t, 0.0, 0.0) / 0.1) * j + t) / j;
                }
                
                // Calculate distance to flame surface
                d = 0.01 + abs(length(p.xz) + p.y * 0.3 - 0.5) / 7.0;
                
                // Accumulate color based on distance
                o += (sin(z / 3.0 + vec4(7.0, 2.0, 3.0, 0.0)) + 1.1) / d;
                
                // Increment ray distance
                z += d;
              }
              
              // Apply tone mapping
              o = tanh(o / 1e3);
              
              // Output final color
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}