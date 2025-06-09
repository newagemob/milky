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
            
            // Noise function for more organic fire movement
            vec3 hash3(vec3 p) {
              p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                       dot(p, vec3(269.5, 183.3, 246.1)),
                       dot(p, vec3(113.5, 271.9, 124.6)));
              return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
            }
            
            float noise(vec3 p) {
              vec3 i = floor(p);
              vec3 f = fract(p);
              vec3 u = f * f * (3.0 - 2.0 * f);
              
              return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                                 dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                             mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                                 dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
                         mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                                 dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                             mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                                 dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
            }
            
            // Fractal noise for more complex patterns
            float fbm(vec3 p) {
              float value = 0.0;
              float amplitude = 0.5;
              for(int i = 0; i < 6; i++) {
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
              
              float t = iTime * 0.8;
              vec4 o = vec4(0.0);
              vec4 r = vec4(uv, 1.0, 0.0);
              
              float z = 0.0;
              float d = 0.0;
              
              // Main ray marching loop with enhanced iterations
              for(float i = 0.0; i < 80.0; i++) {
                // Calculate ray position with more dynamic movement
                vec3 p = z * normalize(vec3(uv, 1.0) * 2.0 - vec3(r.x, r.y, r.y));
                
                // Add depth offset with oscillation
                p.z += 3.0 + sin(t * 0.7) * 2.0;
                
                // More complex rotation for cosmic swirling
                float angle1 = t * 0.3 + p.y * 0.8;
                float angle2 = t * 0.5 + p.z * 0.4;
                mat2 rot1 = mat2(cos(angle1), -sin(angle1), sin(angle1), cos(angle1));
                mat2 rot2 = mat2(cos(angle2), -sin(angle2), sin(angle2), cos(angle2));
                
                p.xz *= rot1;
                p.xy *= rot2;
                
                // Scale with depth
                p.xz /= max(p.y * 0.15 + 0.8, 0.1);
                
                // Enhanced fractal deformation with noise
                vec3 np = p + vec3(t * 0.1, t * 0.15, t * 0.08);
                float n1 = fbm(np * 2.0);
                float n2 = fbm(np * 4.0 + vec3(100.0));
                float n3 = fbm(np * 8.0 + vec3(200.0));
                
                p += vec3(n1, n2, n3) * 0.3;
                
                // Traditional fractal iteration with enhanced parameters
                for(float j = 1.5; j < 12.0; j *= 0.7) {
                  vec3 offset = vec3(t * 0.12, t * 0.08, t * 0.15);
                  p += cos((p.yzx - offset) * j + t * 0.6) / j * 0.8;
                }
                
                // Distance calculation with more complexity
                float dist1 = length(p.xz) + p.y * 0.4 - 0.6;
                float dist2 = length(p.xy) * 0.7 + p.z * 0.2;
                d = 0.008 + abs(mix(dist1, dist2, sin(t * 0.3) * 0.5 + 0.5)) / 6.0;
                z += d;
                
                // Enhanced color accumulation with cosmic RGB
                vec4 fireColor = vec4(0.0);
                
                // Red channel - intense fire core
                fireColor.r = (sin(z * 0.4 + t * 1.2 + 2.0) + 1.5) * 1.8;
                
                // Green channel - mystical middle layer
                fireColor.g = (sin(z * 0.3 + t * 0.8 + 4.0) + 1.2) * 1.4;
                
                // Blue channel - cosmic outer glow
                fireColor.b = (sin(z * 0.2 + t * 0.6 + 6.0) + 1.0) * 1.2;
                
                // Add some purple/magenta for cosmic feel
                float purple = (sin(z * 0.25 + t * 1.5 + 1.0) + 1.0) * 0.8;
                fireColor.r += purple * 0.6;
                fireColor.b += purple * 0.8;
                
                // Distance-based intensity
                fireColor *= (1.0 / (d * 800.0 + 1.0));
                
                // Add flickering with noise
                float flicker = noise(vec3(uv * 10.0, t * 3.0)) * 0.3 + 0.7;
                fireColor *= flicker;
                
                o += fireColor;
              }
              
              // Enhanced tone mapping for cosmic fire
              o = o / (1.0 + o); // Reinhard tone mapping
              o = pow(o, vec4(0.85)); // Gamma correction
              
              // Color grading for cosmic fire ambience
              o.r = pow(o.r, 0.9) * 1.3; // Warmer reds
              o.g = pow(o.g, 1.1) * 1.1; // Slightly cooler greens
              o.b = pow(o.b, 0.95) * 1.4; // Enhanced blues
              
              // Add subtle color shifts
              float colorShift = sin(t * 0.4) * 0.1;
              o.rgb += vec3(colorShift, -colorShift * 0.5, colorShift * 0.3);
              
              // Ensure we don't exceed 1.0
              o = clamp(o, 0.0, 1.0);
              
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
