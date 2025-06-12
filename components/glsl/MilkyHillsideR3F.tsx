"use client";

import React, { useRef, useEffect } from 'react';

export default function MilkyHillsideR3F() {
  const canvasRef = useRef(null);
  const programRef = useRef(null);
  const timeRef = useRef(0);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader - simple passthrough
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader with your GLSL code
    const fragmentShaderSource = `
      precision mediump float;
      uniform float t;
      uniform vec2 r;
      
      void main() {
        vec2 FC = gl_FragCoord.xy;
        vec2 p = (FC.xy * 2.0 - r) / r.y;
        
        // Your original GLSL code adapted
        vec4 o = tanh(0.2 / abs(p.y + 0.3 * cos(t + 0.1 * fract(dot(FC, sin(FC.yxyx))) + p.x * vec4(0.7, 1.0, 1.3, 0.0) + vec4(0.0, 1.0, 2.0, 0.0))));
        
        gl_FragColor = vec4(o.rgb, 1.0);
      }
    `;

    // Compile shader
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    // Create program
    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    if (!program) return;

    programRef.current = program;

    // Set up geometry (full screen quad)
    const positions = new Float32Array([
      -1, -1,  // Bottom left
       1, -1,  // Bottom right
      -1,  1,  // Top left
       1,  1   // Top right
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const timeUniformLocation = gl.getUniformLocation(program, 't');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'r');

    // Resize canvas to match display size
    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Animation loop
    function animate() {
      timeRef.current += 0.016; // ~60fps
      
      resizeCanvas();
      
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.useProgram(program);
      
      // Set uniforms
      gl.uniform1f(timeUniformLocation, timeRef.current);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      
      // Set up attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationIdRef.current = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Handle resize
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (program) {
        gl.deleteProgram(program);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="relative w-full max-w-4xl aspect-video">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute top-4 left-4 text-white text-sm font-mono opacity-75">
          GLSL Wave Effect
        </div>
      </div>
    </div>
  );
}
