"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

function WaveShader() {
  const materialRef = useRef();
  
  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(1, 1, 1) }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      // Smooth continuous time for infinite looping
      materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime();
      
      // Update resolution
      const size = state.size;
      materialRef.current.uniforms.iResolution.value.set(size.width, size.height, 1);
    }
  });

  const vertexShader = `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float iTime;
    uniform vec3 iResolution;
    
    void main() {
      vec2 FC = gl_FragCoord.xy;
      vec2 r = iResolution.xy;
      float t = iTime;
      
      // Your original shader logic with smooth looping
      vec2 p = (FC.xy * 2.0 - r) / r.y;
      
      // Create smooth infinite loop by using sin/cos for time modulation
      float loopTime = t + 0.1 * fract(dot(FC, sin(FC.yxyx)));
      
      // Calculate the wave effect
      vec4 timeOffset = p.x * vec4(0.7, 1.0, 1.3, 0.0) + vec4(0.0, 1.0, 2.0, 0.0);
      vec4 wavePattern = 0.3 * cos(loopTime + timeOffset);
      
      // Apply the tanh function for smooth wave shapes
      vec4 o = tanh(0.2 / abs(p.y + wavePattern));
      
      // Add smooth color transitions for infinite loop feel
      float colorCycle = sin(t * 0.5) * 0.5 + 0.5;
      vec3 color1 = vec3(0.2, 0.8, 1.0); // Cyan
      vec3 color2 = vec3(1.0, 0.4, 0.8); // Pink
      vec3 finalColor = mix(color1, color2, colorCycle);
      
      // Apply color and ensure smooth transitions
      gl_FragColor = vec4(o.rgb * finalColor, 1.0);
    }
  `;

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function MilkyHillsideR3F() {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true }}
      >
        <WaveShader />
      </Canvas>
    </div>
  );
}
