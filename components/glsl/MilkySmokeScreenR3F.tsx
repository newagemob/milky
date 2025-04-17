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
            
            // Noise functions from Inigo Quilez
            float hash(float n) {
              return fract(sin(n) * 43758.5453);
            }
            
            float noise(vec3 x) {
              vec3 p = floor(x);
              vec3 f = fract(x);
              f = f * f * (3.0 - 2.0 * f);
              
              float n = p.x + p.y * 57.0 + p.z * 113.0;
              float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                              mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                          mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                              mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
              return res;
            }
            
            float fbm(vec3 x) {
              float v = 0.0;
              float a = 0.5;
              vec3 shift = vec3(100.0);
              
              for (int i = 0; i < 5; ++i) {
                v += a * noise(x);
                x = x * 2.0 + shift;
                a *= 0.5;
              }
              return v;
            }
            
            vec3 getColorByTime(float t) {
              // Cycle through cosmic "infinity stone" colors
              vec3 colors[6];
              colors[0] = vec3(0.6, 0.0, 0.8); // Purple (Power)
              colors[1] = vec3(0.0, 0.7, 1.0); // Blue (Space)
              colors[2] = vec3(1.0, 0.2, 0.0); // Red (Reality)
              colors[3] = vec3(1.0, 0.8, 0.0); // Yellow (Mind)
              colors[4] = vec3(0.0, 0.8, 0.4); // Green (Time)
              colors[5] = vec3(1.0, 0.4, 0.0); // Orange (Soul)
              
              float cycleSpeed = 10.0; // Speed of color cycling
              float index = mod(t * 0.1, 6.0);
              int i = int(floor(index));
              int j = int(floor(mod(float(i) + 1.0, 6.0)));
              float blend = fract(index);
              
              return mix(colors[i], colors[j], blend);
            }
            
            void main() {
              // Normalized pixel coordinates (0 to 1)
              vec2 uv = gl_FragCoord.xy / iResolution.xy;
              
              // Center horizontally (x ranges from -1 to 1, y from 0 to 1)
              vec2 centered = vec2(uv.x * 2.0 - 1.0, uv.y);
              
              // Animate smoke rising from bottom center
              float t = iTime * 0.2;
              
              // Source of smoke is at the bottom center
              vec2 smokeSource = vec2(0.0, -0.5);
              
              // Calculate smoke density based on distance from source and noise
              float dist = length(centered - smokeSource);
              float speed = 0.15; // Speed of rising smoke
              float smokeLevel = t * speed; // How high the smoke has risen
              
              // Smoke rises and expands
              float expansionFactor = 1.5;
              float spreadFactor = 2.0;
              
              // Use noise to create swirling smoke effect
              vec3 noisePos = vec3(centered.x * spreadFactor, 
                                  centered.y * spreadFactor + t * 0.3, 
                                  t * 0.1);
              
              float noise1 = fbm(noisePos);
              float noise2 = fbm(noisePos * 2.0 + vec3(8.5, 2.3, 1.0));
              
              // Create smoke density that rises and swirls
              float smokeEffect = smoothstep(0.1, 0.9, noise1 * noise2);
              
              // Smoke fades at the top
              float fadeTop = smoothstep(1.0, 0.3, uv.y); 
              
              // More dense at the bottom
              float fadeBottom = smoothstep(0.0, smokeLevel, uv.y);
              
              // Smoke rises over time
              float smokeDensity = smokeEffect * fadeBottom * fadeTop;
              
              // Add vertical gradient to make smoke thicker at bottom
              smokeDensity *= mix(1.0, 0.2, pow(uv.y, 1.5));
              
              // Determine color based on noise and time
              vec3 smokeColor = getColorByTime(t + noise1 * 3.0);
              vec3 smokeColor2 = getColorByTime(t * 1.5 + noise2 * 2.0);
              vec3 finalColor = mix(smokeColor, smokeColor2, noise2);
              
              // Intensity and glow effect
              finalColor *= 1.2 + 0.5 * sin(t * 0.5);
              
              // Add some variation/texture to the smoke
              finalColor *= 0.8 + 0.4 * noise(vec3(centered * 5.0, t));
              
              // Combine everything
              vec3 color = finalColor * smokeDensity;
              
              // Output with transparency based on smoke density
              gl_FragColor = vec4(color, smokeDensity * 0.9);
            }
          `}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}