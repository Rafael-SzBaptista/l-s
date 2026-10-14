"use client";

import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Rasteira de tachas montada em geometria: sola, palmilha, tiras de couro,
// tachas douradas e fivela. O bico aponta para -Z e a sola fica em y = 0.

const STRAP_W = 0.19;
const STRAP_T = 0.035;
const SOLE_TOP = 0.13;

const Y = new THREE.Vector3(0, 1, 0);

type Frame = { p: THREE.Vector3; t: THREE.Vector3; w: THREE.Vector3; n: THREE.Vector3 };

/** Amostra a curva e monta um referencial (tangente, largura, normal) por ponto. */
function frames(curve: THREE.Curve<THREE.Vector3>, widthDir: (u: number) => THREE.Vector3, count: number, closed: boolean) {
  const out: Frame[] = [];
  const last = closed ? count : count + 1;
  for (let i = 0; i < last; i++) {
    const u = i / count;
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u).normalize();
    const w = widthDir(u).clone();
    w.sub(t.clone().multiplyScalar(w.dot(t))).normalize();
    const n = new THREE.Vector3().crossVectors(t, w).normalize();
    out.push({ p, t, w, n });
  }
  return out;
}

/** Tira de couro: uma caixa achatada que segue a curva, com quinas vivas. */
function ribbonGeometry(fs: Frame[], closed: boolean, width = STRAP_W, thick = STRAP_T) {
  const positions: number[] = [];
  const indices: number[] = [];
  const hw = width / 2;
  const ht = thick / 2;
  const corners: [number, number][] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  const at = (f: Frame, [a, b]: [number, number]) =>
    f.p.clone().addScaledVector(f.w, a * hw).addScaledVector(f.n, b * ht);

  for (let face = 0; face < 4; face++) {
    const c0 = corners[face];
    const c1 = corners[(face + 1) % 4];
    const base = positions.length / 3;
    const rows = closed ? fs.length + 1 : fs.length;
    for (let i = 0; i < rows; i++) {
      const f = fs[i % fs.length];
      positions.push(...at(f, c0).toArray(), ...at(f, c1).toArray());
    }
    for (let i = 0; i < rows - 1; i++) {
      const a = base + i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  if (!closed) {
    for (const f of [fs[0], fs[fs.length - 1]]) {
      const base = positions.length / 3;
      for (const c of corners) positions.push(...at(f, c).toArray());
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function footprint(scale = 1) {
  // Desenhado no plano XY (y = comprimento, bico em +y); vira o chão depois.
  const s = (x: number, y: number) => [x * scale, y * scale] as const;
  const shape = new THREE.Shape();
  shape.moveTo(...s(0, -1.15));
  shape.bezierCurveTo(...s(0.34, -1.15), ...s(0.33, -0.6), ...s(0.29, -0.25));
  shape.bezierCurveTo(...s(0.26, 0.1), ...s(0.46, 0.42), ...s(0.43, 0.75));
  shape.bezierCurveTo(...s(0.4, 1.1), ...s(0.2, 1.22), ...s(0, 1.22));
  shape.bezierCurveTo(...s(-0.22, 1.22), ...s(-0.38, 1.05), ...s(-0.38, 0.75));
  shape.bezierCurveTo(...s(-0.38, 0.4), ...s(-0.22, 0.1), ...s(-0.24, -0.25));
  shape.bezierCurveTo(...s(-0.26, -0.6), ...s(-0.34, -1.15), ...s(0, -1.15));
  return shape;
}

function soleGeometry(scale: number, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(footprint(scale), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 48,
  });
  // (x, y, z) -> (x, z, -y): o contorno deita no chão e a espessura sobe em +Y.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function studGeometry() {
  const points: THREE.Vector2[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    // Da base para o topo: nessa ordem as faces do torno ficam viradas para fora.
    const a = (1 - i / steps) * (Math.PI / 2);
    const ridge = 1 + 0.035 * Math.sin(a * 30);
    points.push(new THREE.Vector2(0.075 * Math.sin(a) * ridge, 0.055 * Math.cos(a)));
  }
  return new THREE.LatheGeometry(points, 40);
}

function buckleGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.12, -0.11);
  shape.lineTo(0.12, -0.11);
  shape.lineTo(0.12, 0.11);
  shape.lineTo(-0.12, 0.11);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.085, -0.075);
  hole.lineTo(-0.085, 0.075);
  hole.lineTo(0.085, 0.075);
  hole.lineTo(0.085, -0.075);
  hole.closePath();
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  geometry.translate(0, 0, -0.01);
  return geometry;
}

/** Tira que arqueia sobre o peito do pé, de um lado da sola ao outro. */
function archCurve(from: [number, number], to: [number, number], height: number) {
  const a = new THREE.Vector3(from[0], SOLE_TOP, from[1]);
  const b = new THREE.Vector3(to[0], SOLE_TOP, to[1]);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const p = a.clone().lerp(b, u);
    p.y += height * Math.pow(Math.sin(Math.PI * u), 0.65);
    points.push(p);
  }
  return new THREE.CatmullRomCurve3(points);
}

function useSandal() {
  return useMemo(() => {
    const straps: THREE.BufferGeometry[] = [];
    const studs: THREE.Matrix4[] = [];

    const placeStud = (f: Frame, lift = STRAP_T / 2) => {
      const q = new THREE.Quaternion().setFromUnitVectors(Y, f.n);
      studs.push(new THREE.Matrix4().compose(f.p.clone().addScaledVector(f.n, lift), q, new THREE.Vector3(1, 1, 1)));
    };

    // Duas tiras paralelas cruzando a frente do pé, com tachas.
    const toeStraps: [[number, number], [number, number]][] = [
      [[0.44, -0.78], [-0.38, -0.5]],
      [[0.36, -0.44], [-0.3, -0.16]],
    ];
    for (const [from, to] of toeStraps) {
      const curve = archCurve(from, to, 0.3);
      const d = new THREE.Vector3(to[0] - from[0], 0, to[1] - from[1]).normalize();
      let side = new THREE.Vector3(-d.z, 0, d.x);
      let fs = frames(curve, () => side, 40, false);
      if (fs[20].n.y < 0) {
        side = side.negate();
        fs = frames(curve, () => side, 40, false);
      }
      straps.push(ribbonGeometry(fs, false));
      for (const i of [9, 16, 24, 31]) placeStud(fs[i]);
    }

    // Tornozeleira: uma elipse fechada, com fivela do lado de fora.
    const ankle = new THREE.Vector3(0, 0.92, 0.84);
    const ankleCurve = new THREE.EllipseCurve(0, 0, 0.27, 0.23, 0, Math.PI * 2, false, 0);
    const ankle3d = new THREE.CatmullRomCurve3(
      ankleCurve.getPoints(64).slice(0, -1).map((p) => new THREE.Vector3(ankle.x + p.x, ankle.y, ankle.z + p.y)),
      true,
    );
    let ankleFrames = frames(ankle3d, () => Y, 96, true);
    if (ankleFrames[0].n.x < 0) ankleFrames = frames(ankle3d, () => Y.clone().negate(), 96, true);
    straps.push(ribbonGeometry(ankleFrames, true, 0.15));
    for (const i of [16, 30, 44, 58, 72]) placeStud(ankleFrames[i]);

    // Tiras laterais e de trás ligando a sola à tornozeleira.
    const risers: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
      [new THREE.Vector3(0.31, SOLE_TOP, 0.5), new THREE.Vector3(0.33, 0.45, 0.62), new THREE.Vector3(0.29, 0.75, 0.78), new THREE.Vector3(0.27, 0.86, 0.84)],
      [new THREE.Vector3(-0.27, SOLE_TOP, 0.5), new THREE.Vector3(-0.3, 0.45, 0.62), new THREE.Vector3(-0.28, 0.75, 0.78), new THREE.Vector3(-0.27, 0.86, 0.84)],
      [new THREE.Vector3(0, SOLE_TOP, 1.13), new THREE.Vector3(0, 0.4, 1.17), new THREE.Vector3(0, 0.72, 1.1), new THREE.Vector3(0, 0.86, 1.07)],
    ];
    risers.forEach((pts, index) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const across = index < 2 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
      let fs = frames(curve, () => across, 24, false);
      const outward = index === 0 ? 1 : index === 1 ? -1 : 0;
      if ((outward !== 0 && Math.sign(fs[12].n.x) !== outward) || (outward === 0 && fs[12].n.z < 0)) {
        fs = frames(curve, () => across.clone().negate(), 24, false);
      }
      straps.push(ribbonGeometry(fs, false, index < 2 ? 0.14 : 0.12));
      if (index < 2) placeStud(fs[12]);
    });

    const buckleFrame = ankleFrames[0];
    const buckle = new THREE.Matrix4()
      .makeBasis(buckleFrame.t, buckleFrame.w, buckleFrame.n)
      .setPosition(buckleFrame.p.clone().addScaledVector(buckleFrame.n, STRAP_T / 2 + 0.012));

    return {
      outsole: soleGeometry(1, 0.08, 0.025),
      insole: soleGeometry(0.95, 0.02, 0),
      straps,
      studs,
      stud: studGeometry(),
      buckleGeo: buckleGeometry(),
      buckle,
    };
  }, []);
}

function Sandal() {
  const { outsole, insole, straps, studs, stud, buckleGeo, buckle } = useSandal();

  const leather = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#4b2216",
        roughness: 0.5,
        sheen: 0.6,
        sheenColor: new THREE.Color("#8a4a35"),
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const gold = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#e0b45c", metalness: 1, roughness: 0.28, envMapIntensity: 1.6 }),
    [],
  );

  return (
    <group position={[0, -0.48, 0]} rotation={[0, -0.5, 0]}>
      <mesh geometry={outsole} castShadow>
        <meshStandardMaterial color="#2b1710" roughness={0.75} />
      </mesh>
      <mesh geometry={insole} position={[0, 0.105, 0]}>
        <meshPhysicalMaterial color="#3e1518" roughness={0.5} clearcoat={0.2} />
      </mesh>
      {straps.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={leather} castShadow />
      ))}
      {studs.map((matrix, index) => (
        <mesh key={index} geometry={stud} material={gold} matrix={matrix} matrixAutoUpdate={false} />
      ))}
      <mesh geometry={buckleGeo} material={gold} matrix={buckle} matrixAutoUpdate={false} />
    </group>
  );
}

/**
 * OrbitControls trava o toque (touch-action: none) e o celular não rola a página.
 * Com pan-y o gesto vertical volta a rolar e o arrasto lateral continua girando.
 */
function TouchScrollFix() {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      gl.domElement.style.touchAction = "pan-y";
    });
    return () => cancelAnimationFrame(id);
  }, [gl]);
  return null;
}

export default function SandalScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      // Fora da tela o laço de render para: a GPU fica livre para a rolagem.
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [3.3, 2, 3.5], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={1.6} />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
        <Sandal />
      </Float>
      <ContactShadows position={[0, -0.85, 0]} opacity={0.55} scale={6} blur={2.6} far={2} />
      <Environment resolution={128}>
        {/* Fundo morno no reflexo: sem ele o metal espelha preto. */}
        <color attach="background" args={["#3a3027"]} />
        <Lightformer form="rect" intensity={2} position={[0, 1, 5]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9a0" position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[4, 1, -2]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#c6a15b" position={[0, 1, 4]} scale={2} />
      </Environment>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.9}
        minPolarAngle={0.35}
        maxPolarAngle={1.75}
      />
      <TouchScrollFix />
    </Canvas>
  );
}
