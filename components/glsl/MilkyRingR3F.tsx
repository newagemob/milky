"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Define noise functions needed for the shader
const noiseFunction = `
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
`

export function MilkyRingR3F() {
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
          `}
        />
      </mesh>
    </>
  )
}
