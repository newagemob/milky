"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkySmokeScreenR3F() {
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
            
            // Noise functions by Inigo Quilez
            float hash21(vec2 p) {
              p = fract(p * vec2(123.34, 456.21));
              p += dot(p, p + 45.32);
              return fract(p.x * p.y);
            }
            
            // 2D Simplex noise
            vec2 hash(vec2 p) {
              p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
              return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
            }
            
            float noise(vec2 p) {
              const float K1 = 0.366025404;
              const float K2 = 0.211324865;
              
              vec2 i = floor(p + (p.x + p.y) * K1);
              vec2 a = p - i + (i.x + i.y) * K2;
              vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
              vec2 b = a - o + K2;
              vec2 c = a - 1.0 + 2.0 * K2;
              
              vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
              vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
              
              return dot(n, vec3(70.0));
            }
            
            float fbm(vec2 p) {
              float f = 0.0;
              float w = 0.5;
              for (int i = 0; i < 5; i++) {
                f += w * noise(p);
                p *= 2.0;
                w *= 0.5;
              }
              return f;
            }
            
            // Color blending function
            vec3 colorBlend(float t) {
              // Infinity stone colors
              vec3 purple = vec3(0.5, 0.0, 0.5);  // Mind stone
              vec3 blue = vec3(0.0, 0.5, 1.0);    // Space stone 
              vec3 red = vec3(1.0, 0.1, 0.1);     // Reality stone
              vec3 orange = vec3(1.0, 0.5, 0.0);  // Soul stone
              vec3 yellow = vec3(1.0, 0.8, 0.0);  // Time stone
              vec3 green = vec3(0.0, 0.8, 0.2);   // Power stone
              
              // Cycle through colors based on time
              float cycle = mod(t, 6.0);
              
              if (cycle < 1.0) return mix(purple, blue, cycle);
              else if (cycle < 2.0) return mix(blue, red, cycle - 1.0);
              else if (cycle < 3.0) return mix(red, orange, cycle - 2.0);
              else if (cycle < 4.0) return mix(orange, yellow, cycle - 3.0);
              else if (cycle < 5.0) return mix(yellow, green, cycle - 4.0);
              else return mix(green, purple, cycle - 5.0);
            }
            
            void main() {
              // Normalized, centered UV coordinates
              vec2 uv = gl_FragCoord.xy / iResolution.xy;
              vec2 centered = uv - vec2(0.5, 0.0); // Origin at bottom center
              
              // Time variables
              float time = iTime * 0.2;
              float timeCycle = mod(time, 10.0);
              
              // Create base smoke effect
              float smoke = 0.0;
              
              // Multiple layers of noise
              for (int i = 0; i < 3; i++) {
                float t = time * (0.5 + float(i) * 0.2);
                
                // Rising movement, faster as it goes up
                float yOffset = t + uv.y * 2.0;
                
                // Swirl around center as it rises
                float xMod = centered.x * (1.0 + uv.y);
                float swirl = sin(uv.y * 3.0 + time) * 0.1 * (1.0 - uv.y);
                
                // Sample noise for smoke effect
                vec2 smokeUV = vec2(
                  xMod + swirl,
                  yOffset
                );
                
                // Scale the noise differently for each layer
                float scale = 2.0 + float(i) * 2.0;
                float n = fbm(smokeUV * scale);
                
                // Add to smoke with intensity falloff based on distance from bottom center
                float intensity = (1.0 - length(centered * vec2(1.2, 2.0))) * (1.0 - uv.y * 0.5);
                intensity = max(0.0, intensity);
                
                smoke += n * intensity * (0.5 - float(i) * 0.1);
              }
              
              // Edge glow effect
              float edge = 1.0 - smoothstep(0.4, 0.5, length(centered * vec2(1.0, 0.5)));
              smoke *= edge;
              
              // Fade the smoke near the top
              smoke *= (1.0 - smoothstep(0.5, 0.9, uv.y));
              
              // Add some subtle detail variations
              smoke += fbm(uv * 10.0 + time * 0.1) * 0.05 * smoke;
              
              // Color blending over time
              vec3 smokeColor = colorBlend(time * 0.2);
              
              // Add some brighter spots that change color at a different rate
              float brightSpots = fbm(uv * 5.0 + vec2(0.0, time * 0.3)) * smoke * 0.5;
              vec3 brightColor = colorBlend(time * 0.5 + 2.0);
              
              // Combine colors
              vec3 finalColor = smokeColor * smoke + brightColor * brightSpots;
              
              // Add some stars in the background
              float stars = pow(hash21(uv * 100.0), 20.0) * 0.5;
              finalColor += vec3(stars) * (1.0 - smoke * 2.0);
              
              // Gamma correction
              finalColor = pow(finalColor, vec3(0.8));
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}