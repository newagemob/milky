"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Define noise functions needed for the shader
const noiseFunction = `
  // 3D Noise functions based on improved Perlin noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
    // Gradients: 7x7 points over a square, mapped onto an octahedron
    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  
  // fbm (fractal Brownian motion) for layered noise
  float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 1.0;
    float freq = 1.0;
    // Number of octaves - more means more detail
    for(int i = 0; i < 6; i++) {
      sum += amp * snoise(p * freq);
      amp *= 0.5;
      freq *= 2.0;
    }
    return sum;
  }
`

export function MilkySmokeScreenR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime()

      // Update resolution if needed
      const size = state.size
      materialRef.current.uniforms.resolution.value = new THREE.Vector2(size.width, size.height)
    }
  })

  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={{
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(1, 1) }
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform vec2 resolution;
            varying vec2 vUv;
            
            ${noiseFunction}
            
            // Function to get color based on position and time
            vec3 getCosmicColor(float value, float time) {
              // Shift the colors over time
              float t = time * 0.15;
              
              // Create color palette for cosmic effect - adjusted for more realism
              vec3 color1 = vec3(0.5, 0.0, 0.8); // Purple
              vec3 color2 = vec3(0.0, 0.7, 1.0); // Cyan
              vec3 color3 = vec3(1.0, 0.4, 0.0); // Orange/amber
              vec3 color4 = vec3(0.9, 0.1, 0.3); // Red
              vec3 color5 = vec3(0.2, 0.9, 0.5); // Green
              
              // Add a subtle darkening for more realistic smoke transitions
              vec3 darkShade = vec3(0.05, 0.05, 0.1);
              
              // Create smoother transitions between colors
              float colorPhase = value + t;
              
              // Use smoother functions for color blending
              float c1 = pow(0.5 + 0.5 * sin(colorPhase * 0.8), 2.0);
              float c2 = pow(0.5 + 0.5 * sin(colorPhase * 0.8 + 1.5), 2.0);
              float c3 = pow(0.5 + 0.5 * sin(colorPhase * 0.8 + 3.0), 2.0);
              float c4 = pow(0.5 + 0.5 * sin(colorPhase * 0.8 + 4.5), 2.0);
              float c5 = pow(0.5 + 0.5 * sin(colorPhase * 0.8 + 6.0), 2.0);
              
              // Add a subtle dark edge to transitions for more realistic smoke look
              float darkEdge = pow(sin(colorPhase * 2.0) * 0.5 + 0.5, 3.0) * 0.15;
              
              // Mix colors with dark edges for more realism
              vec3 finalColor = color1 * c1 + color2 * c2 + color3 * c3 + color4 * c4 + color5 * c5;
              finalColor = mix(finalColor, darkShade, darkEdge);
              
              return finalColor;
            }
            
            void main() {
              // Normalize coordinates
              vec2 uv = vUv;
              
              // Create UV coordinates centered at screen center
              vec2 p = (uv - 0.5) * 2.0;
              
              // Calculate distance from center
              float dist = length(p);
              
              // Calculate angle for radial effects
              float angle = atan(p.y, p.x);
              
              // Time variables for different animation speeds
              float t1 = time * 0.2;  // Slow overall movement
              float t2 = time * 0.5;  // Medium speed for billowing
              float t3 = time * 0.05; // Very slow for stable structure
              
              // Expansion factor - smoke expands outward over time
              float expansion = 0.5 + time * 0.1;
              float expandedDist = dist / expansion;
              
              // Create multiple layers of smoke with different movements
              float smoke = 0.0;
              
              // Base structure - billowing outward in all directions
              smoke += fbm(vec3(
                p.x * 0.5 + cos(angle * 2.0 + t1) * 0.1,
                p.y * 0.5 + sin(angle * 2.0 + t1) * 0.1,
                t3
              )) * smoothstep(1.0, 0.0, expandedDist);
              
              // Billowing detail layer - creates the outward expanding puffs
              smoke += fbm(vec3(
                p.x * 0.8 + cos(angle * 3.0 + t2) * 0.2 * (1.0 - expandedDist),
                p.y * 0.8 + sin(angle * 3.0 + t2) * 0.2 * (1.0 - expandedDist),
                t1 + expandedDist * 2.0
              )) * 0.4 * smoothstep(0.8, 0.0, expandedDist);
              
              // Fine turbulence layer - adds realistic chaotic movement
              smoke += fbm(vec3(
                p.x * 2.0 + t2 * (0.1 + 0.2 * sin(angle * 5.0)),
                p.y * 2.0 + t2 * (0.1 + 0.2 * cos(angle * 5.0)),
                t1 * 2.0
              )) * 0.15 * smoothstep(0.7, 0.0, expandedDist);
              
              // Edge turbulence - creates wisps at the edges
              smoke += fbm(vec3(
                p.x * 3.0 + cos(angle * 8.0) * 0.1 * expandedDist + t2 * 0.2,
                p.y * 3.0 + sin(angle * 8.0) * 0.1 * expandedDist + t2 * 0.2,
                t1 * 0.5 + expandedDist
              )) * 0.1 * smoothstep(0.0, 0.4, expandedDist) * smoothstep(1.0, 0.7, expandedDist);
              
              // Density adjustments
              float densityFalloff = smoothstep(expansion, 0.0, dist);
              smoke *= densityFalloff;
              
              // Add center density for smoke source
              smoke += (1.0 - smoothstep(0.0, 0.2, dist)) * 0.3;
              
              // Clamp and adjust density for better visual
              smoke = clamp(smoke, 0.0, 1.0);
              
              // Calculate dynamic density pockets for realistic smoke look
              float dynamicSmokeDetail = fbm(vec3(p * 3.0 + vec2(cos(time * 0.3), sin(time * 0.2)), time * 0.1));
              
              // Make the smoke density vary more realistically
              smoke = mix(smoke, smoke * (0.7 + 0.3 * dynamicSmokeDetail), 0.5);
              
              // Apply cosmic colors with position-based variation for more natural coloring
              vec3 smokeColor = getCosmicColor(smoke + dist * 0.5 + dynamicSmokeDetail * 0.2, time);
              
              // Adjust alpha for transparent effect with more variation at the edges
              float alpha = smoothstep(0.0, 0.1, smoke) * smoothstep(expansion + 0.2, expansion - 0.3, dist);
              
              // Apply some brightness boost to the central regions
              float brightBoost = (1.0 - smoothstep(0.0, 0.3, dist)) * 0.4;
              smokeColor += brightBoost;
              
              // Add subtle depth variations based on noise
              smokeColor *= 0.8 + 0.2 * dynamicSmokeDetail;
              
              // Output the final color with transparency
              gl_FragColor = vec4(smokeColor, alpha);
            }
          `}
          transparent={true}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  )
}