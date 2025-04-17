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
              float t = time * 0.1; // Slower color transitions for more dreamy effect
              
              // Create color palette for cosmic infinity stone effect
              vec3 color1 = vec3(0.5, 0.0, 0.8); // Purple (Mind Stone)
              vec3 color2 = vec3(0.0, 0.7, 1.0); // Cyan (Space Stone)
              vec3 color3 = vec3(1.0, 0.4, 0.0); // Orange/amber (Soul Stone) 
              vec3 color4 = vec3(0.9, 0.1, 0.3); // Red (Reality Stone)
              vec3 color5 = vec3(0.2, 0.9, 0.5); // Green (Time Stone)
              vec3 color6 = vec3(1.0, 0.8, 0.1); // Yellow/gold (Power Stone)
              
              // Create smoother transitions with better color blending
              float colorPhase = value * 2.0 + t;
              
              // Use smoother transitions for more natural color blending
              float c1 = smoothstep(0.0, 0.5, sin(colorPhase) * 0.5 + 0.5);
              float c2 = smoothstep(0.0, 0.5, sin(colorPhase + 1.05) * 0.5 + 0.5);
              float c3 = smoothstep(0.0, 0.5, sin(colorPhase + 2.1) * 0.5 + 0.5);
              float c4 = smoothstep(0.0, 0.5, sin(colorPhase + 3.15) * 0.5 + 0.5);
              float c5 = smoothstep(0.0, 0.5, sin(colorPhase + 4.2) * 0.5 + 0.5);
              float c6 = smoothstep(0.0, 0.5, sin(colorPhase + 5.25) * 0.5 + 0.5);
              
              // Mix colors with normalization to prevent oversaturation
              float sum = c1 + c2 + c3 + c4 + c5 + c6;
              return (color1 * c1 + color2 * c2 + color3 * c3 + color4 * c4 + color5 * c5 + color6 * c6) / sum;
            }
            
            void main() {
              // Normalize coordinates
              vec2 uv = vUv;
              
              // Create UV coordinates centered at screen center
              vec2 p = (uv - 0.5) * 2.0;
              
              // Calculate distance from center
              float dist = length(p);
              
              // Calculate angle from center (for rotation effects)
              float angle = atan(p.y, p.x);
              
              // Create realistic billowing movement
              // Use time with different frequencies for different layers
              float baseTime = time * 0.2;
              
              // Calculate smoke density based on position and time
              float smoke = 0.0;
              
              // Base layer - billowing outward from center
              // Use angle to create swirling outward motion
              float swirl = sin(angle * 2.0 + baseTime) * 0.1;
              float outwardFlow = baseTime * 0.3;
              
              // Create expanding rings of smoke
              float ringDist = fract(dist * 2.0 - outwardFlow);
              float ringMask = smoothstep(0.4, 0.6, ringDist) * smoothstep(0.6, 0.4, ringDist);
              
              // Main billowing smoke layer
              vec3 noisePos = vec3(
                p.x * (0.5 + swirl) + cos(angle * 3.0 + baseTime * 0.7) * 0.1,
                p.y * (0.5 + swirl) + sin(angle * 2.0 + baseTime * 0.5) * 0.1,
                baseTime * 0.15
              );
              smoke += fbm(noisePos) * (1.5 - dist * 0.7);
              
              // Add turbulence layers
              // Layer 1 - large billows
              vec3 turbPos1 = vec3(
                p.x * 0.7 + sin(baseTime * 0.3) * 0.2,
                p.y * 0.7 + cos(baseTime * 0.4) * 0.2,
                baseTime * 0.1 + dist * 0.5
              );
              smoke += fbm(turbPos1) * 0.6 * (1.0 - dist * 0.5);
              
              // Layer 2 - medium details with rotation
              float rot = baseTime * 0.2;
              vec2 pRot = vec2(
                p.x * cos(rot) - p.y * sin(rot),
                p.x * sin(rot) + p.y * cos(rot)
              );
              vec3 turbPos2 = vec3(
                pRot.x * 1.5 + baseTime * 0.05,
                pRot.y * 1.5 + baseTime * 0.06,
                baseTime * 0.13
              );
              smoke += fbm(turbPos2) * 0.4 * (0.8 - dist * 0.3);
              
              // Layer 3 - fine curling details
              vec3 turbPos3 = vec3(
                p.x * 3.0 - baseTime * 0.07,
                p.y * 3.0 + baseTime * 0.08,
                baseTime * 0.2 + dist
              );
              smoke += fbm(turbPos3) * 0.2;
              
              // Create pulsing effect from center
              float pulse = sin(baseTime * 1.5) * 0.5 + 0.5;
              smoke += (1.0 - smoothstep(0.0, 0.4 + pulse * 0.2, dist)) * 0.3;
              
              // Create edge curl details (realistic smoke curl at edges)
              float edgeTurb = fbm(vec3(p * 4.0, baseTime * 0.3));
              smoke += edgeTurb * ringMask * 0.3;
              
              // Density falloff from center
              float falloff = smoothstep(2.0, 0.2, dist);
              smoke *= falloff;
              
              // Add center density for source effect
              smoke += smoothstep(0.4, 0.0, dist) * 0.5;
              
              // Clamp and adjust density for better visual
              smoke = clamp(smoke, 0.0, 1.0);
              
              // Apply cosmic colors with variations based on position
              // Use distance and angle to create spatial color variation
              float colorVar = smoke + dist * 0.3 + angle * 0.05;
              vec3 smokeColor = getCosmicColor(colorVar, time);
              
              // Enhance realistic smoke look with depth variations
              // Inner smoke is brighter and more energetic
              float centerIntensity = smoothstep(1.0, 0.0, dist) * 0.5;
              smokeColor += centerIntensity;
              
              // Add subtle dark edges to some smoke tendrils for realism
              float edgeDark = smoothstep(0.4, 0.5, smoke) * smoothstep(0.6, 0.5, smoke) * 0.15;
              smokeColor *= (1.0 - edgeDark);
              
              // Create subtle color variation in darker regions
              vec3 darkColor = getCosmicColor(colorVar + 1.57, time + 2.0) * 0.2;
              smokeColor = mix(darkColor, smokeColor, smoothstep(0.0, 0.2, smoke));
              
              // Adjust alpha for transparent effect
              // Thinner at edges, denser near center
              float alpha = smoothstep(0.05, 0.15, smoke) * falloff;
              
              // Add subtle glow for more cosmic feel
              float glow = smoothstep(0.0, 0.3, smoke) * 0.3;
              smokeColor += glow * getCosmicColor(time * 0.2, time);
              
              // Apply soft saturation adjustment
              float luminance = dot(smokeColor, vec3(0.299, 0.587, 0.114));
              smokeColor = mix(vec3(luminance), smokeColor, 1.2); // Slight saturation boost
              
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