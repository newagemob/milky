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
  
  // Turbulence function for realistic smoke
  float turbulence(vec3 p, float frequency, float lacunarity, float gain, int octaves) {
    float sum = 0.0;
    float amplitude = 1.0;
    float scale = 1.0;
    
    for(int i = 0; i < octaves; i++) {
      sum += abs(snoise(p * scale) * amplitude);
      scale *= lacunarity;
      amplitude *= gain;
    }
    
    return sum;
  }

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
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Curl noise for fluid-like motion
  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    
    vec3 p_x0 = vec3(snoise(p - dx), snoise(p), snoise(p + dx));
    vec3 p_y0 = vec3(snoise(p - dy), snoise(p), snoise(p + dy));
    vec3 p_z0 = vec3(snoise(p - dz), snoise(p), snoise(p + dz));
    
    float x = p_y0.z - p_y0.x - p_z0.y + p_z0.x;
    float y = p_z0.z - p_z0.x - p_x0.z + p_x0.x;
    float z = p_x0.y - p_x0.x - p_y0.z + p_y0.x;
    
    return normalize(vec3(x, y, z));
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
          transparent={true}
          uniforms={{
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(1, 1) },
            colorA: { value: new THREE.Color(0x7B68EE) },  // Medium slate blue
            colorB: { value: new THREE.Color(0xFF69B4) },  // Hot pink
            colorC: { value: new THREE.Color(0x20B2AA) },  // Light sea green
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
            uniform vec3 colorA;
            uniform vec3 colorB;
            uniform vec3 colorC;
            varying vec2 vUv;
            
            ${noiseFunction}
            
            void main() {
              // Center coordinates (0,0) at center of screen
              vec2 uv = (vUv - 0.5) * 2.0;
              
              // Calculate distance from center
              float dist = length(uv);
              
              // Create base for the smoke effect
              vec3 p = vec3(uv * 1.5, time * 0.15);
              
              // Animate smoke rising
              p.y -= time * 0.2;
              
              // Add curl noise for fluid-like swirling
              vec3 curl = curlNoise(p * 0.3);
              p += curl * 0.3;
              
              // Multi-layered turbulence for realistic smoke
              float smoke = turbulence(p, 1.0, 2.0, 0.5, 5);
              smoke += turbulence(p * 2.5 + curl, 1.0, 2.0, 0.5, 3) * 0.5;
              
              // Shape the smoke - stronger in center, dissipating outward
              float falloff = smoothstep(1.0, 0.0, dist * 0.9);
              smoke *= falloff;
              
              // Add some variation based on time
              smoke *= 1.0 + 0.2 * sin(time * 0.5);
              
              // Color transitions
              float colorMix = sin(time * 0.3) * 0.5 + 0.5;
              vec3 baseColor = mix(colorA, colorB, colorMix);
              baseColor = mix(baseColor, colorC, sin(time * 0.2) * 0.5 + 0.5);
              
              // Make smoke fade out at the edges
              float alpha = smoothstep(0.0, 0.8, smoke);
              
              // Add subtle movement pulse
              alpha *= 0.8 + 0.2 * sin(time + dist * 3.0);
              
              // Final color with alpha
              gl_FragColor = vec4(baseColor, alpha);
              
              // Add subtle glow to the smoke
              gl_FragColor.rgb += vec3(0.05, 0.05, 0.1) * (1.0 - dist) * alpha;
            }
          `}
        />
      </mesh>
    </>
  )
}