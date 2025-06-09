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
            
            // Fire color palette function
            vec3 fireColor(float intensity, float heat) {
              // Create realistic fire colors from deep red to bright yellow-white
              vec3 darkRed = vec3(0.1, 0.0, 0.0);
              vec3 red = vec3(1.0, 0.1, 0.0);
              vec3 orange = vec3(1.0, 0.4, 0.0);
              vec3 yellow = vec3(1.0, 0.8, 0.2);
              vec3 white = vec3(1.0, 1.0, 0.9);
              vec3 blue = vec3(0.3, 0.5, 1.0);
              
              vec3 color;
              if (heat < 0.2) {
                color = mix(darkRed, red, heat * 5.0);
              } else if (heat < 0.4) {
                color = mix(red, orange, (heat - 0.2) * 5.0);
              } else if (heat < 0.7) {
                color = mix(orange, yellow, (heat - 0.4) * 3.33);
              } else if (heat < 0.9) {
                color = mix(yellow, white, (heat - 0.7) * 5.0);
              } else {
                // Hottest parts get blue-white tint
                color = mix(white, blue, (heat - 0.9) * 10.0);
              }
              
              return color * intensity;
            }
            
            // Noise function for organic fire movement
            float noise(vec3 p) {
              return sin(p.x * 1.2) * sin(p.y * 1.3) * sin(p.z * 1.1) +
                     sin(p.x * 2.4) * sin(p.y * 2.6) * sin(p.z * 2.2) * 0.5 +
                     sin(p.x * 4.8) * sin(p.y * 5.2) * sin(p.z * 4.4) * 0.25;
            }
            
            void main() {
              // Get normalized screen coordinates
              vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
              uv.x *= iResolution.x / iResolution.y;
              
              float t = iTime;
              vec4 o = vec4(0.0);
              float z = 0.0;
              
              // Create radial distance for ember shape
              float centerDist = length(uv);
              
              // Main raymarching loop for atmospheric fire
              for(float i = 0.0; i < 45.0; i++) {
                float ii = i + 1.0;
                
                // Create 3D position with depth
                vec3 p = vec3(uv * (1.0 + z * 0.1), z);
                
                // Add organic fire movement with multiple noise layers
                p.x += sin(t * 0.8 + p.y * 2.0) * 0.3;
                p.y += cos(t * 0.6 + p.x * 1.5) * 0.2;
                p.z += sin(t * 0.4 + centerDist * 3.0) * 0.5;
                
                // Apply turbulent rotation for fire swirling
                float swirl = sin(t * 0.5 + centerDist * 4.0) * 0.5;
                mat2 rotMat = mat2(cos(swirl), sin(swirl), -sin(swirl), cos(swirl));
                p.xy *= rotMat;
                
                // Multi-scale fractal deformation for organic fire shapes
                vec3 pp = p;
                for(float j = 1.0; j < 4.0; j++) {
                  pp += sin(p * j + t * (0.5 + j * 0.1)) / j * 0.3;
                }
                
                // Distance field - creates ember-like density
                float density = 1.0 - smoothstep(0.0, 1.8, centerDist);
                float fireShape = abs(length(pp.xy) - 0.3 - noise(pp + t * 0.2) * 0.2);
                float d = 0.01 + fireShape * 0.1;
                
                // Calculate heat based on position and time
                float heat = density * (1.0 - centerDist * 0.7) + 
                           sin(t * 2.0 + ii * 0.3) * 0.2 + 
                           noise(pp * 2.0 + t * 0.3) * 0.3;
                heat = clamp(heat, 0.0, 1.0);
                
                // Intensity based on distance and heat
                float intensity = heat / (d * sqrt(ii) + 0.1);
                intensity *= (1.0 - z * 0.1); // Fade with depth
                
                // Add flickering
                intensity *= 0.8 + sin(t * 4.0 + ii * 1.5) * 0.2;
                
                // Get fire color and accumulate
                vec3 color = fireColor(intensity * 0.3, heat);
                o.rgb += color;
                
                // Step forward
                z += d;
                if (z > 3.0) break; // Don't go too deep
              }
              
              // Post-processing for atmospheric glow
              o.rgb = pow(o.rgb, vec3(0.8)); // Gamma correction
              
              // Add outer glow
              float glow = exp(-centerDist * 2.0) * 0.5;
              o.rgb += fireColor(glow, glow) * 0.3;
              
              // Add subtle atmospheric scattering
              vec3 atmosphere = vec3(1.0, 0.6, 0.3) * exp(-centerDist * 1.5) * 0.1;
              o.rgb += atmosphere;
              
              // Enhance contrast and warmth
              o.rgb = tanh(o.rgb * 1.2);
              
              gl_FragColor = vec4(o.rgb, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
