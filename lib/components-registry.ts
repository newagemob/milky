"use client"

import type React from "react"
import type { ComponentProps } from "react"

import { MilkyOrbR3F } from "@/components/glsl/MilkyOrbR3F"
import { MilkyStarsR3F } from "@/components/glsl/MilkyStarsR3F"
import { MilkyShowerR3F } from "@/components/glsl/MilkyShowerR3F"
import { MilkyCosmicR3F } from "@/components/glsl/MilkyCosmicR3F"
import { MilkyRingR3F } from "@/components/glsl/MilkyRingR3F"
import { MilkyWaveR3F } from "@/components/glsl/MilkyWaveR3F"

export interface ComponentInfo {
  id: string
  name: string
  description: string
  tags: string[]
  thumbnail: string
  component: React.ComponentType<Record<string, unknown>>
  source: string
}

// This registry serves as the single source of truth for all component information
export const componentsRegistry: ComponentInfo[] = [
  {
    id: "milky-orb",
    name: "Milky Orb",
    description: "A mesmerizing orb effect with milky fluid-like animations",
    tags: ["shader", "animation", "fluid"],
    thumbnail: "/thumbnails/milky-orb.jpg",
    component: MilkyOrbR3F,
    source: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Create a shader material using drei's shaderMaterial
const MilkyMaterial = shaderMaterial(
  {
    iTime: 0,
    iResolution: new THREE.Vector3(1, 1, 1)
  },
  // Vertex shader
  \`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  \`,
  // Fragment shader
  \`
    uniform float iTime;
    uniform vec3 iResolution;
    
    void main() {
      // Normalized and centered screen coordinates
      vec2 FC = gl_FragCoord.xy;
      vec2 r = iResolution.xy;
      vec2 p = (FC.xy * 2.0 - r) / r.y;
      
      // Start with zero output color
      vec4 o = vec4(0.0);
      
      // Initialize variables
      vec2 l = vec2(0.0);
      float dot_val = dot(p, p);
      float abs_val = abs(0.7 - dot_val);
      l += abs_val;
      
      // Calculate initial vector v
      vec2 v = p * (1.0 - l) / 0.2;
      
      // Iterate through the loop 8 times
      float t = iTime;
      for(float i = 0.0; i < 8.0; i++) {
        // Increment i by 1 for calculations
        float ii = i + 1.0;
        
        // Calculate vector and combine into output
        vec4 sinTerm = sin(vec4(v.x, v.y, v.y, v.x)) + 1.0;
        float diffTerm = abs(v.x - v.y) * 0.2;
        o += sinTerm * diffTerm;
        
        // Update vector v for next iteration
        vec3 vV = vec3(v.y, v.x, ii);
        vec2 cosInput = vV.xy + vec2(0.0, ii) + t;
        v += cos(cosInput) / ii + 0.7;
      }
      
      // Final color calculation with amber/gold color tint
      vec4 expTerm = exp(p.y * vec4(1.0, -1.0, -2.0, 0.0));
      float expFactor = exp(-4.0 * l.x);
      o = tanh(expTerm * expFactor / o);
      
      // Apply amber/gold tint
      vec3 amber = vec3(1.0, 0.8, 0.2);
      gl_FragColor = vec4(o.rgb * amber, 1.0);
    }
  \`,
)

// Extend the Three.js materials with our custom material
extend({ MilkyMaterial })

// Add the missing type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'milkyMaterial': any
    }
  }
}

export function MilkyOrbR3F() {
  const materialRef = useRef<any>()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.iTime = state.clock.getElapsedTime()
      
      // Update resolution if needed
      const size = state.size
      materialRef.current.iResolution = new THREE.Vector3(size.width, size.height, 1)
    }
  })
  
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <milkyMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`,
  },
  {
    id: "milky-stars",
    name: "Milky Stars",
    description: "A beautiful starfield animation with twinkling amber stars",
    tags: ["shader", "animation", "stars", "space"],
    thumbnail: "/thumbnails/milky-stars.jpg",
    component: MilkyStarsR3F,
    source: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Create shader material using drei's shaderMaterial
const MilkyStarsMaterial = shaderMaterial(
  {
    iTime: 0,
    iResolution: new THREE.Vector3(1, 1, 1),
  },
  // Vertex shader
  \`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  \`,
  // Fragment shader
  \`
    uniform float iTime;
    uniform vec3 iResolution;
    
    void main() {
      // Initialize animate time (10x speed)
      float t = iTime/0.1,
      // Fractional starting index
      f = fract(-t),
      // Whole-index for star
      w = 0.0;
      
      // Screen uvs, centered and aspect correct (-0.5 to +0.5)
      vec2 suv = (gl_FragCoord.xy - iResolution.xy*0.5) / iResolution.y;
      
      // Prepare the sum of the star colors
      vec3 rgb = vec3(0.0);
      
      // Loop through 100 stars
      for(float i = f; i<1e2; i++) {
        // Find the whole-number star index
        w = round(i+t);
        // Square to prevent linear patterns. sin is a better alternative
        w *= w; // sin(w)
        // Pick a color using the index
        rgb += (cos(w+vec3(0,1,2))+1.)
        // Vary the brightness with the index
        * exp(cos(w/.1)/.6)
        // Fade in and out
        * min(1e3-i/.1+9.,i) / 5e4
        // Attentuate outward
        / length(suv
        // Set the star position
        + .05*cos(w/.31+vec2(0,5))*sqrt(i));
      }
      
      // Increase contrast
      rgb *= rgb;
      
      // Tanh tonemap and apply amber tint
      rgb = tanh(rgb);
      vec3 amber = vec3(1.0, 0.8, 0.2);
      
      gl_FragColor = vec4(rgb * amber, 1.0);
    }
  \`
)

// Extend Three.js with our custom material
extend({ MilkyStarsMaterial })

// Add the type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      milkyStarsMaterial: any
    }
  }
}

export function MilkyStarsR3F() {
  const materialRef = useRef<any>()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.iTime = state.clock.getElapsedTime()
      
      // Update resolution if needed
      const size = state.size
      materialRef.current.iResolution = new THREE.Vector3(size.width, size.height, 1)
    }
  })
  
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <milkyStarsMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`,
  },
  {
    id: "milky-shower",
    name: "Milky Shower",
    description: "A flowing shower of amber particles with dynamic animations",
    tags: ["shader", "animation", "particles", "flow"],
    thumbnail: "/thumbnails/milky-shower.jpg",
    component: MilkyShowerR3F,
    source: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Define noise functions needed for the shader
const noiseFunction = \`
  // 2D Noise function based on Morgan McGuire's work
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise2D(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
\`

// Create shader material using drei's shaderMaterial
const MilkyShowerMaterial = shaderMaterial(
  {
    t: 0,
    r: new THREE.Vector2(1, 1),
    colorIntensity: 1.0,
    animationSpeed: 1.0,
  },
  // Vertex shader
  \`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  \`,
  // Fragment shader
  \`
    uniform float t;
    uniform vec2 r;
    uniform float colorIntensity;
    uniform float animationSpeed;
    varying vec2 vUv;
    
    ${noiseFunction}
    
    void main() {
      // Get fragment coordinates
      vec2 FC = gl_FragCoord.xy;
      
      // Create transformation matrix for the coordinates
      mat2 rotationMatrix = mat2(8.0, -6.0, 6.0, 8.0);
      
      // Transform coordinates
      vec2 p = (FC.xy - r * 0.5) / r.y * rotationMatrix;
      vec2 v;
      
      // Initialize output color
      vec4 o = vec4(0.0);
      
      // Calculate noise factor
      float f = 3.0 + snoise2D(p + vec2(t * 7.0 * animationSpeed, 0.0));
      
      // Main loop for the effect
      for (float i = 0.0; i < 50.0; i++) {
        i++;
        
        // Calculate vector v based on noise, time and position
        v = p + cos(i * i + (t + p.x * 0.1) * 0.03 * animationSpeed + i * vec2(11.0, 9.0)) * 5.0;
        
        // Add to output color based on calculations
        vec4 colorTerm = (cos(sin(i) * vec4(1.0, 2.0, 3.0, 1.0)) + 1.0) * colorIntensity;
        float expTerm = exp(sin(i * i + t * animationSpeed));
        float lenTerm = length(max(v, vec2(v.x * f * 0.02, v.y)));
        
        o += colorTerm * expTerm / lenTerm;
      }
      
      // Final color transformation
      o = tanh(pow(o / 100.0, vec4(1.5)));
      
      // Apply amber tint
      vec3 amber = vec3(1.0, 0.8, 0.2);
      o.rgb *= amber;
      
      gl_FragColor = vec4(o.rgb, 1.0);
    }
  \`
)

// Extend Three.js with our custom material
extend({ MilkyShowerMaterial })

// Add the type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      milkyShowerMaterial: any
    }
  }
}

export function MilkyShowerR3F() {
  const materialRef = useRef<any>()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.t = state.clock.getElapsedTime()
      
      // Update resolution if needed
      const size = state.size
      materialRef.current.r = new THREE.Vector2(size.width, size.height)
    }
  })
  
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <milkyShowerMaterial
          ref={materialRef}
          colorIntensity={1.0}
          animationSpeed={1.0}
        />
      </mesh>
    </>
  )
}`,
  },
  {
    id: "milky-cosmic",
    name: "Milky Cosmic",
    description: "A cosmic effect with radial amber animations and spiral patterns",
    tags: ["shader", "animation", "cosmic", "radial"],
    thumbnail: "/thumbnails/milky-cosmic.jpg",
    component: MilkyCosmicR3F,
    source: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Create shader material using drei's shaderMaterial
const MilkyCosmicMaterial = shaderMaterial(
  {
    t: 0,
    r: new THREE.Vector2(1, 1),
  },
  // Vertex shader
  \`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  \`,
  // Fragment shader
  \`
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
      o.rgb *= amber;
      
      gl_FragColor = vec4(o.rgb, 1.0);
    }
  \`
)

// Extend Three.js with our custom material
extend({ MilkyCosmicMaterial })

// Add the type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      milkyCosmicMaterial: any
    }
  }
}

export function MilkyCosmicR3F() {
  const materialRef = useRef<any>()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.t = state.clock.getElapsedTime()
      
      // Update resolution if needed
      const size = state.size
      materialRef.current.r = new THREE.Vector2(size.width, size.height)
    }
  })
  
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <milkyCosmicMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`,
  },
  {
    id: "milky-ring",
    name: "Milky Ring",
    description: "A mesmerizing ring pattern with noise-based fluid animations",
    tags: ["shader", "animation", "ring", "noise"],
    thumbnail: "/thumbnails/milky-ring.jpg",
    component: MilkyRingR3F,
    source: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Define noise functions needed for the shader
const noiseFunction = \`
  // 2D Noise function based on Morgan McGuire's work
  // https://www.shadertoy.com/view/4dS3Wd
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise2D(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
\`

// Create shader material using drei's shaderMaterial
const MilkyRingMaterial = shaderMaterial(
  {
    t: 0,
    r: new THREE.Vector2(1, 1),
  },
  // Vertex shader
  \`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  \`,
  // Fragment shader
  \`
    uniform float t;
    uniform vec2 r;
    varying vec2 vUv;
    
    ${noiseFunction}
    
    void main() {
      // Get fragment coordinates and resolution
      vec2 FC = gl_FragCoord.xy;
      
      // Create transformation matrix for the coordinates
      mat2 rotationMatrix = mat2(8.0, -3.0, 3.0, 8.0);
      
      // Transform coordinates
      vec2 p = (FC.xy - r * 0.5) / r.y * rotationMatrix;
      vec2 v;
      
      // Initialize output color
      vec4 o = vec4(0.0);
      
      // Main loop for the effect
      for (float i = 0.0; i < 50.0; i++) {
        i++;
        
        // Calculate vector v based on noise and time
        v = p + cos(i * i + t * 0.2 + vec2(i / 100.0, 11.0)) * 2.0;
        
        // Add to output color based on complex calculations
        float noiseVal = snoise2D(p + vec2(t * 7.0, i));
        float vxTerm = v.x * (3.0 + noiseVal) / 100.0;
        vec2 maxVec = max(v, vec2(vxTerm, v.y * 0.2));
        float lenTerm = length(maxVec);
        
        vec4 colorTerm = cos(sin(i) * vec4(2.0, 5.0, 6.0, 1.0)) + 1.0;
        float expTerm = exp(sin(i * i + t));
        
        o += colorTerm * expTerm / lenTerm;
      }
      
      // Final color transformation
      o = tanh(pow(o / 300.0, vec4(1.5)));
      
      // Apply amber tint
      vec3 amber = vec3(1.0, 0.8, 0.2);
      o.rgb *= amber;
      
      gl_FragColor = vec4(o.rgb, 1.0);
    }
  \`
)

// Extend Three.js with our custom material
extend({ MilkyRingMaterial })

// Add the type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      milkyRingMaterial: any
    }
  }
}

export function MilkyRingR3F() {
  const materialRef = useRef<any>()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.t = state.clock.getElapsedTime()
      
      // Update resolution if needed
      const size = state.size
      materialRef.current.r = new THREE.Vector2(size.width, size.height)
    }
  })
  
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <milkyRingMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`,
  },
  {
    id: "milky-wave",
    name: "Milky Wave",
    description: "A wave-like effect with smooth animations and amber tones",
    tags: ["shader", "animation", "wave", "fluid"],
    thumbnail: "/thumbnails/milky-wave.jpg",
    component: MilkyWaveR3F,
    source: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Create shader material using drei's shaderMaterial
const MilkyWaveMaterial = shaderMaterial(
  {
    t: 0,
    r: new THREE.Vector2(1, 1),
  },
  // Vertex shader
  \`
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  \`,
  // Fragment shader
  \`
    uniform float t;
    uniform vec2 r;
    
    // Simplex 2D noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise2D(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec4 o = vec4(0.0);
      vec2 FC = gl_FragCoord.xy;
      vec2 p = (FC.xy - r * 0.5) / r.y * mat2(8.0, -3.0, 3.0, 8.0);
      vec2 v;
      
      for(float i = 0.0; i < 50.0; i++) {
        i += 1.0;
        o += (cos(sin(i) * vec4(2.0, 5.0, 6.0, 1.0)) + 1.0) * 
             exp(sin(i * i + t)) / 
             length(max(v, vec2(v.x * (3.0 + snoise2D(p + vec2(t * 7.0, i))) / 100.0, v.y * 0.2)));
        v = p + cos(i * i + t * 0.2 + vec2(i / 100.0, 11.0)) * 2.0;
      }
      
      o = tanh(pow(o / 300.0, vec4(1.5)));
      
      // Apply amber tint
      vec3 amber = vec3(1.0, 0.8, 0.2);
      o.rgb *= amber;
      
      gl_FragColor = vec4(o.rgb, 1.0);
    }
  \`
)

// Extend Three.js with our custom material
extend({ MilkyWaveMaterial })

// Add the type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      milkyWaveMaterial: any
    }
  }
}

export function MilkyWaveR3F() {
  const materialRef = useRef<any>()
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.t = state.clock.getElapsedTime()
      
      // Update resolution if needed
      const size = state.size
      materialRef.current.r = new THREE.Vector2(size.width, size.height)
    }
  })
  
  return (
    <>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <milkyWaveMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`,
  },
]

// Helper function to get a component by ID
export const getComponentById = (id: string) => {
  return componentsRegistry.find((comp) => comp.id === id)
}

// Helper function to get component source code by ID
export const getComponentSourceById = (id: string) => {
  const component = getComponentById(id)
  return component?.source || "// Component source not found"
}

// Helper function to get all unique tags
export const getAllTags = () => {
  const allTags = componentsRegistry.flatMap((comp) => comp.tags)
  return Array.from(new Set(allTags))
}
