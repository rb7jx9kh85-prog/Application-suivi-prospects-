import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ShaderBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    container.appendChild(renderer.domElement)

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = p * 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          vec2 p = uv * 3.0;
          p.x += iTime * 0.2;

          float f = fbm(p + vec2(iTime * 0.3, 0.0));

          float r = 0.1 * sin(uv.x * 10.0 + iTime) + f * 0.15;
          float g = 0.05 * cos(uv.y * 8.0 + iTime * 0.7) + f * 0.08;
          float b = 0.2 * sin((uv.x + uv.y) * 6.0 + iTime * 0.5) + f * 0.1;

          vec3 col = mix(vec3(0.02, 0.01, 0.05), vec3(r, g, b), f);
          gl_FragColor = vec4(col, 1.0);
        }
      `
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let frameId
    const startTime = Date.now()
    const animate = () => {
      const elapsed = (Date.now() - startTime) * 0.001
      material.uniforms.iTime.value = elapsed
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      container.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 w-full h-full -z-10" />
}
