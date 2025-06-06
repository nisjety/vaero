// components/ThreeClouds.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * ThreeClouds
 * Viser en drøss av transparente "sky-flak" som drifter forbi,
 * nå med avansert bakgrunnsskygge og roterende teksturoverlegg på hver sky.
 * Alt er kommentert og skrevet på norsk.
 */
export default function ThreeClouds() {
  // Referanse til <div> som omkranser <canvas>
  const containerRef = useRef<HTMLDivElement>(null);
  // Referanse til <canvas> for renderer
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Kjører kun i nettleser (SSR-sjekk)
    if (typeof window === 'undefined') return;
    const container = containerRef.current!;
    const canvas = canvasRef.current!;

    // --- 1) Opprett WebGLRenderer som binder seg mot vårt <canvas> ---
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Slå av automatisk clearing, slik at vi kan tegne bakgrunn først, så hovedscene
    renderer.autoClear = false;

    // --- 2) Opprett hovedscene og kamera for skyene ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      30,                              // Synsvinkel i grader
      window.innerWidth / window.innerHeight, // Aspektforhold
      1,                               // Nærklipping
      3000                             // Fjernklipping
    );
    camera.position.set(0, 0, 6000);

    // --- 3) Opprett OrbitControls for kamerarotasjon ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;         // deaktiver zoom
    controls.enableDamping = true;       // aktiver demping for jevn rotasjon
    controls.enablePan = false;          // deaktiver pan
    controls.dampingFactor = 0.1;        // dempingsfaktor
    controls.rotateSpeed = 0.1;          // rotasjonshastighet
    controls.target.set(0, 0, 0);        // kameraet roterer rundt origo

    // --- 4) Bakgrunnsscene: Gradient + lysflekker med inline GLSL ---
    // 4.a) Definer vertex- og fragmentshader for bakgrunn
    const bgVertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const bgFragmentShader = /* glsl */ `
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform vec3 uSpot1Color;
      uniform vec3 uSpot2Color;
      uniform vec2 uSpot1Position;
      uniform vec2 uSpot2Position;

      varying vec2 vUv;

      // Funksjon som gir en jevn overgang fra senterpunkt til kant
      float distanceFromPoint(vec2 uv, vec2 point, float maxDist) {
        float d = distance(uv, point);
        d = smoothstep(0.0, maxDist, d);
        d = 1.0 - d;
        return d;
      }

      void main() {
        // Beregn lysflekk 1
        float d1 = distanceFromPoint(vUv, uSpot1Position, 0.3);
        vec4 colorSpot1 = vec4(uSpot1Color, 0.8 * d1);

        // Beregn lysflekk 2
        float d2 = distanceFromPoint(vUv, uSpot2Position, 0.4);
        vec4 colorSpot2 = vec4(uSpot2Color, 0.8 * d2);

        // Vertikal gradient fra bunn- til toppfarge
        vec4 verticalGradient = vec4(mix(uBottomColor, uTopColor, vUv.y), 1.0);

        // Blend gradient med lysflekk 1
        vec4 mixVS1 = mix(verticalGradient, colorSpot1, colorSpot1.a);
        // Blend resultat med lysflekk 2
        vec4 finalColor = mix(mixVS1, colorSpot2, colorSpot2.a);

        gl_FragColor = vec4(finalColor.rgb, 1.0);
      }
    `;
    // 4.b) Uniforms for bakgrunnsshader
    const bgUniforms = {
      uTopColor:      { value: new THREE.Color(0x1e4877) },
      uBottomColor:   { value: new THREE.Color(0x4584b4) },
      uSpot1Color:    { value: new THREE.Color(0xffffff) },
      uSpot2Color:    { value: new THREE.Color(0xffeeaa) },
      uSpot1Position: { value: new THREE.Vector2(0.5, 0.75) },
      uSpot2Position: { value: new THREE.Vector2(0.25, 0.25) },
    };
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader:   bgVertexShader,
      fragmentShader: bgFragmentShader,
      uniforms:       bgUniforms,
      depthWrite:     false,
      depthTest:      false,
    });
    // 4.c) Fullskjermsplane for bakgrunn (to enheter i NDC)
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    const bgMesh     = new THREE.Mesh(bgGeometry, bgMaterial);
    const bgScene    = new THREE.Scene();
    bgScene.add(bgMesh);
    // Kamera for bakgrunn (orto-kamera som tegner i NDC)
    const bgCamera = new THREE.Camera();

    // --- 5) Last inn base-tekstur (cloud.png) og overlay-tekstur (cloud2.jpg) ---
    // Vi vil vente til begge teksturene er lastet før vi starter animasjonen
    const loadingManager = new THREE.LoadingManager(() => {
      // Start animasjonsløkken når alle teksturer er ferdig lastet
      animate();
    });
    const loader = new THREE.TextureLoader(loadingManager);

    // 5.a) Base-tekstur (skyform med alpha)
    const baseTexture = loader.load('/textures/cloud.png');
    baseTexture.magFilter = THREE.LinearFilter;
    baseTexture.minFilter = THREE.LinearMipMapLinearFilter;
    baseTexture.wrapS     = THREE.RepeatWrapping;
    baseTexture.wrapT     = THREE.RepeatWrapping;

    // 5.b) Overlay-tekstur (støymønster)
    const overlayTexture = loader.load('/textures/cloud2.jpg');
    overlayTexture.magFilter = THREE.LinearFilter;
    overlayTexture.minFilter = THREE.LinearMipMapLinearFilter;
    overlayTexture.wrapS     = THREE.RepeatWrapping;
    overlayTexture.wrapT     = THREE.RepeatWrapping;

    // --- 6) Sky-shader: overlay roterer svakt rundt sentrum (vUv=0.5,0.5) ---
    const cloudVertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const cloudFragmentShader = /* glsl */ `
      uniform sampler2D uBaseMap;      // cloud.png (alpha-maske)
      uniform sampler2D uOverlayMap;   // cloud2.jpg (støymønster)
      uniform float uTime;

      varying vec2 vUv;

      void main() {
        // --- 1) Les base (sky-silhuett) statisk, uten bevegelse ---
        vec4 baseColor = texture2D(uBaseMap, vUv);
        // --- 2) Dersom alpha fra base er ≈ 0, kutt framen (alphaTest i JS sørger for kantutjevning) ---

        // --- 3) Beregn roterende UV for overlay rundt (0.5, 0.5) ---
        float speed = 0.5;             // hastighet på oscillasjon
        float amplitude = 0.2;         // maksimal rotasjonsvinkel i radianer (±0.2 rad ≈ ±11°)
        float angle = sin(uTime * speed) * amplitude;

        // Flytt UV-senter til (0.5, 0.5), roter, og flytt tilbake
        vec2 center = vec2(0.5, 0.5);
        vec2 uvFromCenter = vUv - center;
        float c = cos(angle);
        float s = sin(angle);
        mat2 rotMat = mat2(c, -s,
                           s,  c);
        vec2 rotatedUV = rotMat * uvFromCenter + center;

        // --- 4) Les overlay-farge med roterte UV (wrap pga RepeatWrapping) ---
        vec4 overlayColor = texture2D(uOverlayMap, rotatedUV);

        // --- 5) Bruk base-alpha som maske for hvor overlay skal vises ---
        float mask = baseColor.a;

        // --- 6) Bland base mot overlay: 30 % overlay, 70 % base i de mest opake delene av skyen ---
        vec3 midBlend = mix(baseColor.rgb, overlayColor.rgb, 0.3);
        // Bruk mask for å blende mot midBlend
        vec3 blended = mix(baseColor.rgb, midBlend, mask);

        // --- 7) Sett slutt-alpha lik base-alpha * 0.5 for lavere opasitet ---
        float loweredAlpha = baseColor.a * 0.5;
        gl_FragColor = vec4(blended, loweredAlpha);
      }
    `;
    const cloudUniforms = {
      uBaseMap:    { value: baseTexture },
      uOverlayMap: { value: overlayTexture },
      uTime:       { value: 0.0 },
    };
    const cloudMaterial = new THREE.ShaderMaterial({
      vertexShader:       cloudVertexShader,
      fragmentShader:     cloudFragmentShader,
      uniforms:           cloudUniforms,
      transparent:        true,
      premultipliedAlpha: false,
      depthWrite:         false,
      depthTest:          false,
      blending:           THREE.NormalBlending,
      alphaTest:          0.02,   // Kaster alle piksler der baseColor.a < 0.02
    });

    // --- 7) Bygg sky-geometri med BufferGeometryUtils.mergeBufferGeometries ---
    // 7.a) Lag en base PlaneGeometry vi kloner og transformerer
    const planeGeometry = new THREE.PlaneGeometry(64, 64);
    const geometries: THREE.BufferGeometry[] = [];

    // 7.b) For hver "sky-flak" (8000 iterasjoner), klon geometri og anvend transform
    for (let i = 0; i < 8000; i++) {
      const geom = planeGeometry.clone(); // klon BufferGeometry

      // Tilfeldig posisjon, rotasjon og skala
      const positionX = Math.random() * 1000 - 500;
      const positionY = -Math.random() * Math.random() * 200 - 15;
      const positionZ = i;
      const rotationZ = Math.random() * Math.PI;
      const scaleValue = Math.random() * Math.random() * 1.5 + 0.5;

      // Komponér transformmatrise
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(positionX, positionY, positionZ), // posisjon
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1), // rotasjon om Z-aksen
          rotationZ
        ),
        new THREE.Vector3(scaleValue, scaleValue, scaleValue) // skala
      );

      // Anvend transform
      geom.applyMatrix4(matrix);

      // Legg til i array for merging
      geometries.push(geom);
    }

    // 7.c) Slå sammen alle plane-geometrier til én stor BufferGeometry
    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false);

    // --- 8) Opprett to Mesh-instanser: én ved Z=0, én ved Z=-8000 ---
    const meshA = new THREE.Mesh(mergedGeometry, cloudMaterial);
    scene.add(meshA);

    const meshB = new THREE.Mesh(mergedGeometry, cloudMaterial);
    meshB.position.z = -8000;
    scene.add(meshB);

    // Variabler for museposisjon og tid (parallakse-effekt)
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    const startTime = Date.now();

    // --- 9) Håndter musebevegelse og vindu-resize ---
    function onDocumentMouseMove(event: MouseEvent) {
      mouseX = (event.clientX - windowHalfX) * 0.25;
      mouseY = (event.clientY - windowHalfY) * 0.15;
    }
    function onWindowResize() {
      // Oppdater hovedkamera
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      // Oppdater renderer-størrelse
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    // --- 10) Animasjonsløype: Tegn bakgrunn + skyene, oppdater shaders og kontrollere ---
    function animate() {
      requestAnimationFrame(animate);

      // Oppdater OrbitControls før rendring for demping/rotering
      controls.update();

      // Oppdater tidsuniform for sky-shader (i sekunder)
      const elapsed = (Date.now() - startTime) / 1000; // tid i sekunder
      cloudUniforms.uTime.value = elapsed;

      // Beregn ny posisjon langs Z basert på tid (sky-drift)
      const pos = ((Date.now() - startTime) * 0.03) % 8000;

      // Parallakse: flytt kamera litt mot musepeker-posisjon
      camera.position.x += (mouseX - camera.position.x) * 0.01;
      camera.position.y += (-mouseY - camera.position.y) * 0.01;
      // Kamera Z-stilling overstyres av pos for å gi sky-drift
      camera.position.z = -pos + 8000;

      // Først: tegn bakgrunnsscene (gradient + lysflekker)
      renderer.clear(); // tøm buffers
      renderer.render(bgScene, bgCamera);

      // Så: tegn hovedscene med skyene
      renderer.render(scene, camera);
    }

    // --- 11) Rydd opp ved demontering av komponent ---
    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', onWindowResize);

      // Kall dispose() på controls for å fjerne event-listenere og frigi minne
      controls.dispose();

      // Rydd opp materialer, geometrier og teksturer
      cloudMaterial.dispose();
      mergedGeometry.dispose();
      baseTexture.dispose();
      overlayTexture.dispose();

      // Rydd opp bakgrunnsgeometri og materiale
      bgGeometry.dispose();
      bgMaterial.dispose();

      // Renderer kan også ryddes om ønsket
      renderer.dispose();
    };
  }, []);

  // JSX: En <div> med full skjerm som inneholder vårt <canvas>
  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
