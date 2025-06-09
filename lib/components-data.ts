import type React from "react"

import { MilkyOrbR3F } from "@/components/glsl/MilkyOrbR3F"
import { MilkyStarsR3F } from "@/components/glsl/MilkyStarsR3F"
import { MilkyCosmicR3F } from "@/components/glsl/MilkyCosmicR3F"
import { MilkyFireR3F } from "@/components/glsl/MilkyFireR3F"
import { MilkyTitanR3F } from "@/components/glsl/MilkyTitanR3F"

export interface ComponentData {
  id: string
  name: string
  description: string
  tags: string[]
  thumbnail: string
  component: React.ComponentType
  code: string
}

// This would typically come from an API or database
export const componentsData: ComponentData[] = [
  {
    id: "milky-orb",
    name: "Milky Orb",
    description: "A mesmerizing orb effect with milky fluid-like animations",
    tags: ["shader", "animation", "fluid"],
    thumbnail: "/thumbnails/milky-orb.jpg",
    component: MilkyOrbR3F,
    code: `import { useRef } from 'react'
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
  \`
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
    description: "A starfield effect with twinkling stars and smooth animation",
    tags: ["shader", "stars", "animation"],
    thumbnail: "/thumbnails/milky-stars.jpg",
    component: MilkyStarsR3F,
    code: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Create a shader material using drei's shaderMaterial
const MilkyStarsMaterial = shaderMaterial(
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
      
      // Tanh tonemap
      rgb = tanh(rgb);
      
      // Apply amber tint
      vec3 amber = vec3(1.0, 0.8, 0.2);
      gl_FragColor = vec4(rgb * amber, 1.0);
    }
  \`
)

// Extend the Three.js materials with our custom material
extend({ MilkyStarsMaterial })

// Add the missing type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'milkyStarsMaterial': any
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
    id: "milky-cosmic",
    name: "Milky Cosmic",
    description: "A cosmic swirl effect with dynamic patterns and fluid motion",
    tags: ["shader", "cosmic", "swirl"],
    thumbnail: "/thumbnails/milky-cosmic.jpg",
    component: MilkyCosmicR3F,
    code: `import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

// Create a shader material using drei's shaderMaterial
const MilkyCosmicMaterial = shaderMaterial(
  {
    t: 0,
    r: new THREE.Vector2(1, 1)
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
      gl_FragColor = vec4(o.rgb * amber, 1.0);
    }
  \`
)

// Extend the Three.js materials with our custom material
extend({ MilkyCosmicMaterial })

// Add the missing type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'milkyCosmicMaterial': any
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
    id: "milky-titan",
    name: "Milky Titan",
    description: "A cosmic moon effect that waxes and wanes with glowing atmospheric optics.",
    tags: ["shader", "titan", "moon", "planet", "cosmic", "animation"],
    thumbnail: "/thumbnails/milky-titan.jpg",
    component: MilkyTitanR3F,
    code: `"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"
import { extend } from "@react-three/fiber"

// Create a shader material using drei's shaderMaterial
const MilkySmokeScreenMaterial = shaderMaterial(
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
  \`
)

// Extend the Three.js materials with our custom material
extend({ MilkySmokeScreenMaterial })

// Add the missing type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'milkySmokeScreenMaterial': any
    }
  }
}

export function MilkySmokeScreenR3F() {
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
        <milkySmokeScreenMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`
  },
  {
    id: "milky-fire",
    name: "Milky Fire",
    description: "A cosmic fire effect that rises from the bottom with shifting colors",
    tags: ["shader", "fire", "cosmic", "animation"],
    thumbnail: "/thumbnails/milky-fire.jpg",
    component: MilkyFireR3F,
    code: `"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import * as THREE from "three"
import { extend } from "@react-three/fiber"

// Create a shader material using drei's shaderMaterial
const MilkySmokeScreenMaterial = shaderMaterial(
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
  \`
)

// Extend the Three.js materials with our custom material
extend({ MilkySmokeScreenMaterial })

// Add the missing type for the extended material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'milkySmokeScreenMaterial': any
    }
  }
}

export function MilkySmokeScreenR3F() {
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
        <milkySmokeScreenMaterial ref={materialRef} />
      </mesh>
    </>
  )
}`
  }
]

// Helper function to get component by ID
export function getComponentById(id: string): ComponentData | undefined {
  return componentsData.find((component) => component.id === id)
}
