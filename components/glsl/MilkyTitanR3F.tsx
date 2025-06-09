import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function MilkyTitanR3F() {
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
            
            void main() {
              vec2 FC = gl_FragCoord.xy;
              vec2 r = iResolution.xy;
              vec4 o = vec4(0.0);
              float t = iTime;
              
              // Add smooth continuous animation with sine wave modulation
              float animCycle = sin(t * 0.3) * 0.5 + 0.5; // 0 to 1 cycle
              float inversionFactor = sin(t * 0.15) * 2.0; // Smooth inversion
              
              // Raymarching loop - translated from original compact code
              for(float i = 0.0; i < 40.0; i++) {
                float ii = i + 1.0;
                
                // Reconstruct the original raymarching logic
                vec3 p = (ii * 0.1) * normalize(FC.rgb * 2.0 - r.xyx);
                
                // Apply rotation matrix to p.yz
                float rotAngle = 0.1 * animCycle; // Smooth rotation
                mat2 rotMat = mat2(cos(rotAngle), sin(rotAngle), -sin(rotAngle), cos(rotAngle));
                p.yz *= rotMat;
                p.z += 8.0;
                
                // Distance calculation
                float s = length(p) - 6.0;
                float d = 0.02 + 0.2 * abs(s);
                
                // Lighting/shading calculation
                vec2 cosInput = vec2(0.0, 11.0) + t * 0.5;
                float b = max(dot(p.xz, cos(cosInput)) - p.y + s, 0.1);
                
                // Color accumulation with smooth animation
                vec4 colorTerm = cos(tanh(s + s) * 3.0 + b * 0.3 - vec4(0, 1, 2, 0) - 2.0) + 1.0;
                float intensity = b / (d * (ii * 0.1));
                
                // Apply inversion factor for continuous animation
                o += colorTerm * intensity * (1.0 + inversionFactor * 0.5);
              }
              
              // Final color processing with smooth animation
              o = tanh(o / 4000.0);
              
              // Add continuous color cycling
              vec3 colorShift = vec3(
                sin(t * 0.2) * 0.3 + 0.7,
                cos(t * 0.25) * 0.3 + 0.7,
                sin(t * 0.3 + 1.57) * 0.3 + 0.7
              );
              
              // Apply smooth inversion and color modulation
              vec3 finalColor = o.rgb * colorShift;
              finalColor = mix(finalColor, 1.0 - finalColor, sin(t * 0.1) * 0.5 + 0.5);
              
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
        />
      </mesh>
    </>
  )
}
