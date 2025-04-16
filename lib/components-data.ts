"use client"

import type React from "react"

import { MilkyOrbR3F } from "@/components/glsl/MilkyOrbR3F"
import { MilkyStarsR3F } from "@/components/glsl/MilkyStarsR3F"
import { MilkyCosmicR3F } from "@/components/glsl/MilkyCosmicR3F"

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
]

// Helper function to get component by ID
export function getComponentById(id: string): ComponentData | undefined {
  return componentsData.find((component) => component.id === id)
}
