"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const noiseFunction = `
// Simplex noise (2D)
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
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

export function MilkySmokeScreenR3F() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.t.value = state.clock.getElapsedTime()
      const size = state.size
      materialRef.current.uniforms.r.value = new THREE.Vector2(size.width, size.height)
    }
  })

  return (
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
            vec2 uv = (gl_FragCoord.xy - r * 0.5) / r.y;
            float time = t * 0.25;

            float d = length(uv);
            float angle = atan(uv.y, uv.x);
            float swirl = angle + snoise2D(uv * 2.0 + time) * 0.5;

            float smoke = 0.0;
            for (float i = 1.0; i < 7.0; i++) {
              float scale = i * 1.5;
              vec2 offset = vec2(cos(swirl), sin(swirl)) * scale * 0.1;
              smoke += snoise2D(uv * scale - offset + vec2(0.0, time * 0.2));
            }

            smoke = pow(smoke / 7.0, 2.0);

            vec3 color1 = vec3(0.4, 0.3, 0.5);  // lavender-gray
            vec3 color2 = vec3(0.2, 0.5, 0.6);  // dusty teal
            vec3 color3 = vec3(0.6, 0.4, 0.3);  // warm copper tone

            float colorShift = sin(t * 0.2) * 0.5 + 0.5;
            vec3 blendedColor = mix(color1, mix(color2, color3, colorShift), smoke);

            float alpha = smoothstep(0.2, 0.8, smoke);

            gl_FragColor = vec4(blendedColor, alpha);
          }
        `}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  )
}