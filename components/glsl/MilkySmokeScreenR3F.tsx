"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Define noise functions needed for the shader
const noiseFunction = `
  // 3D Simplex noise function - better for smoke effect
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise3D(vec3 v) {
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
            
    // Gradients
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

  // Fractional Brownian Motion function for more natural looking smoke
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < octaves; i++) {
      value += amplitude * snoise3D(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
`

export function MilkySmokeScreenR3F() {
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
          transparent={true}
          uniforms={{
            t: { value: 0 },
            r: { value: new THREE.Vector2(1, 1) }
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float t;
            uniform vec2 r;
            varying vec2 vUv;
            
            ${noiseFunction}
            
            void main() {
              // Normalize coordinates around center
              vec2 uv = vUv - 0.5;
              
              // Distance from center
              float dist = length(uv);
              
              // Calculate the angle for our position
              float angle = atan(uv.y, uv.x);
              
              // Time variables for animation
              float slowTime = t * 0.15;
              float fastTime = t * 0.4;
              
              // Create base coordinates for 3D noise
              vec3 p = vec3(uv * 2.0, slowTime * 0.5);
              
              // Add some turbulence to the coordinates based on position
              p.xy += vec2(
                0.1 * sin(angle * 3.0 + slowTime),
                0.1 * cos(angle * 2.0 + slowTime * 0.7)
              );
              
              // Create billowing smoke effect using Fractional Brownian Motion
              float smoke = fbm(p, 5);
              
              // Add more detail/turbulence at different frequencies
              smoke += 0.5 * fbm(p * 2.0 + vec3(0.0, 0.0, slowTime * 0.3), 3);
              
              // Make the smoke rise from the center
              // Higher value = more dense in center
              float centerIntensity = smoothstep(1.0, 0.0, dist * 2.0);
              
              // Adjust the smoke thickness based on distance
              // This makes smoke thinner as it moves away from center
              float smokeIntensity = smoke * (1.0 - dist * 0.8);
              
              // Add time-based pulsing to the center intensity
              centerIntensity *= 1.0 + 0.2 * sin(fastTime * 2.0);
              
              // Combine the two effects
              float finalSmoke = smokeIntensity + centerIntensity * 0.5;
              
              // Apply soft threshold for more defined smoke billows
              finalSmoke = smoothstep(0.1, 0.6, finalSmoke);
              
              // Create color cycling
              vec3 color1 = vec3(0.7, 0.2, 0.8); // Purple
              vec3 color2 = vec3(0.2, 0.5, 0.9); // Blue
              vec3 color3 = vec3(0.9, 0.4, 0.2); // Orange-ish
              
              // Cycle between colors based on time
              float colorCycle = sin(slowTime) * 0.5 + 0.5;
              float colorCycle2 = sin(slowTime * 0.7 + 2.0) * 0.5 + 0.5;
              
              vec3 smokeColor = mix(
                mix(color1, color2, colorCycle),
                color3,
                colorCycle2
              );
              
              // Add subtle glow in the center
              float glow = exp(-dist * 8.0) * 0.5;
              smokeColor += glow * vec3(1.0, 0.8, 0.9);
              
              // Final opacity based on smoke and some distance falloff
              float alpha = finalSmoke * smoothstep(1.2, 0.0, dist * 1.5);
              
              // Output final color with alpha
              gl_FragColor = vec4(smokeColor, alpha);
            }
          `}
        />
      </mesh>
    </>
  )
}