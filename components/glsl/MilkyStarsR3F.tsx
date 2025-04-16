"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyStarsR3F() {
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
              // Initialize animate time (10x speed)
              float t = iTime/0.1,
              // Fractional starting index
              f = fract(-t),
              // Whole-index for star
              w = 0.0;
              
              // Screen uvs, centered and aspect correct (-0.5 to +0.5)
              vec2 suv = (gl_FragCoord.xy - iResolution.xy*0.5) / iResolution.y;
              
              // Prepare the sum of the star colors
              vec3 rgb = vec3(0.0);
              
              // Loop through 100 stars
              for(float i = f; i<1e2; i++) {
                // Find the whole-number star index
                w = round(i+t);
                // Square to prevent linear patterns. sin is a better alternative
                w *= w; // sin(w)
                // Pick a color using the index
                rgb += (cos(w+vec3(0,1,2))+1.)
                // Vary the brightness with the index
                * exp(cos(w/.1)/.6)
                // Fade in and out
                * min(1e3-i/.1+9.,i) / 5e4
                // Attentuate outward
                / length(suv
                // Set the star position
                + .05*cos(w/.31+vec2(0,5))*sqrt(i));
              }
              
              // Increase contrast
              rgb *= rgb;
              
              // Tanh tonemap
              rgb = tanh(rgb);
              
              // Apply amber tint
              vec3 amber = vec3(1.0, 0.8, 0.2);
              gl_FragColor = vec4(rgb * amber, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
