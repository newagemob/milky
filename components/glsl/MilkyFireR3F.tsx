"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyFireR3F() {
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
            
            // Noise function for organic fire movement
            float noise(vec3 p) {
              return sin(p.x) * sin(p.y) * sin(p.z);
            }
            
            // Fractal brownian motion for detailed fire texture
            float fbm(vec3 p) {
              float value = 0.0;
              float amplitude = 0.5;
              for(int i = 0; i < 4; i++) {
                value += amplitude * noise(p);
                p *= 2.0;
                amplitude *= 0.5;
              }
              return value;
            }
            
            void main() {
              // Get normalized screen coordinates
              vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
              uv.x *= iResolution.x / iResolution.y;
              
              float t = iTime;
              vec4 o = vec4(0.0);
              float z = 0.0;
              
              // Fire ember characteristics
              float emberCore = length(uv);
              float emberPulse = sin(t * 2.0) * 0.1 + 0.9;
              
              // Main raymarching loop for fire volume
              for(float i = 0.0; i < 60.0; i++) {
                // Create 3D position with organic movement
                vec3 p = vec3(uv * (1.0 + z * 0.3), z + t * 0.5);
                
                // Add swirling motion like rising hot air
                float swirl = sin(t * 1.5 + p.z * 0.5) * 0.3;
                p.x += swirl * (1.0 - emberCore);
                p.y += cos(t * 1.2 + p.z * 0.7) * 0.2;
                
                // Create flickering with fractal noise
                float flicker = fbm(p * 3.0 + vec3(0.0, t * 2.0, 0.0));
                p += flicker * 0.1;
                
                // Distance field for ember shape
                float emberDist = length(p.xy) - (0.4 + flicker * 0.2) * emberPulse;
                float d = max(emberDist, 0.01);
                
                // Step size based on distance
                float step = 0.02 + d * 0.1;
                z += step;
                
                // Fire color temperature based on density and position
                float density = 1.0 / (1.0 + d * 10.0);
                float temperature = density * (1.0 - z * 0.1);
                
                // Multicolor fire gradient
                vec3 emberColor = vec3(0.0);
                if(temperature > 0.8) {
                  // Hot core - white/blue
                  emberColor = vec3(1.2, 1.1, 0.8);
                } else if(temperature > 0.6) {
                  // Medium heat - yellow/orange
                  emberColor = vec3(1.5, 0.8, 0.3);
                } else if(temperature > 0.3) {
                  // Warm glow - orange/red
                  emberColor = vec3(1.2, 0.4, 0.1);
                } else if(temperature > 0.1) {
                  // Cool edges - deep red
                  emberColor = vec3(0.8, 0.2, 0.05);
                }
                
                // Add atmospheric scattering
                float scatter = exp(-z * 0.5) * density;
                emberColor *= scatter;
                
                // Accumulate color with proper fire opacity
                o.rgb += emberColor * temperature * 0.02;
                o.a += density * 0.01;
                
                // Early exit for performance
                if(z > 3.0 || o.a > 0.95) break;
              }
              
              // Add outer glow effect
              float outerGlow = exp(-emberCore * 3.0) * emberPulse;
              vec3 glowColor = vec3(1.0, 0.3, 0.1) * outerGlow * 0.5;
              o.rgb += glowColor;
              
              // Enhanced atmospheric effect
              float atmosphere = exp(-emberCore * 1.5);
              o.rgb += vec3(0.9, 0.4, 0.1) * atmosphere * 0.2;
              
              // Tone mapping for realistic fire look
              o.rgb = 1.0 - exp(-o.rgb * 1.5);
              
              // Add subtle sparkle effects
              float sparkle = noise(vec3(uv * 20.0, t * 5.0));
              if(sparkle > 0.97) {
                o.rgb += vec3(1.0, 0.8, 0.3) * (sparkle - 0.97) * 10.0;
              }
              
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
