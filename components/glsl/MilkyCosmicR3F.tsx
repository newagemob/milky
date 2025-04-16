"use client"

import { useRef } from "react"
import { useFrame, extend } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"

// Create a shader material using drei's shaderMaterial
const MilkyCosmicMaterial = shaderMaterial(
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
      vec2 p = (FC.xy * 2.0 - r) / r.y / 0.7;
      vec2 d = vec2(-1.0, 1.0);
      vec2 c = p * mat2(1.0, 1.0, d / (0.1 + 5.0 / dot(5.0 * p - d, 5.0 * p - d)));
      vec2 v = c;
      
      v *= mat2(cos(log(length(v)) + t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0))) * 5.0;
      
      for(float i = 0.0; i < 9.0; i++) {
        i++;
        o += sin(v.xyyx) + 1.0;
        v += 0.7 * sin(v.yx * i + t) / i + 0.5;
      }
      
      o = 1.0 - exp(
        -exp(c.x * vec4(0.6, -0.4, -1.0, 0.0)) / o / 
        (0.1 + 0.1 * pow(length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0, 2.0)) / 
        (1.0 + 7.0 * exp(0.3 * c.y - dot(c, c))) / 
        (0.03 + abs(length(p) - 0.7)) * 0.2
      );
      
      // Apply amber tint
      vec3 amber = vec3(1.0, 0.8, 0.2);
      gl_FragColor = vec4(o.rgb * amber, 1.0);
    }
  `,
)

// Extend the Three.js materials with our custom material
extend({ MilkyCosmicMaterial })

export function MilkyCosmicR3F() {
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
        <shaderMaterial 
          ref={materialRef}
          uniforms={{
            t: { value: 0 },
            r: { value: new THREE.Vector2(1, 1) }
          }}
          vertexShader={`
            void main() {
              gl_Position = vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float t;
            uniform vec2 r;
            
            void main() {
              vec4 o = vec4(0.0);
              vec2 FC = gl_FragCoord.xy;
              vec2 p = (FC.xy * 2.0 - r) / r.y / 0.7;
              vec2 d = vec2(-1.0, 1.0);
              vec2 c = p * mat2(1.0, 1.0, d / (0.1 + 5.0 / dot(5.0 * p - d, 5.0 * p - d)));
              vec2 v = c;
              
              v *= mat2(cos(log(length(v)) + t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0))) * 5.0;
              
              for(float i = 0.0; i < 9.0; i++) {
                i++;
                o += sin(v.xyyx) + 1.0;
                v += 0.7 * sin(v.yx * i + t) / i + 0.5;
              }
              
              o = 1.0 - exp(
                -exp(c.x * vec4(0.6, -0.4, -1.0, 0.0)) / o / 
                (0.1 + 0.1 * pow(length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0, 2.0)) / 
                (1.0 + 7.0 * exp(0.3 * c.y - dot(c, c))) / 
                (0.03 + abs(length(p) - 0.7)) * 0.2
              );
              
              // Apply amber tint
              vec3 amber = vec3(1.0, 0.8, 0.2);
              gl_FragColor = vec4(o.rgb * amber, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
