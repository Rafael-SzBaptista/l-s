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
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Rasteira de dedo com placa dourada, modelada a partir das fotos do produto
// "Rasteira Placa Ouro": ponta quadrada, salto baixo em bloco, duas tiras largas
// de couro caramelo com pesponto e uma placa de ouro martelado no peito do pé.
// O bico aponta para -Z e o chão é y = 0.

const STRAP_W = 0.21;
const STRAP_T = 0.04;
const SOLE_TOP = 0.125;
const HEEL_H = 0.12;
const TILT = -0.05;
// A sola gira em torno do centro; sobe o quanto o bico desceria para tocar o chão.
const TILT_LIFT = 1.22 * Math.sin(-TILT);

type Frame = { p: THREE.Vector3; t: THREE.Vector3; w: THREE.Vector3; n: THREE.Vector3 };

/** Amostra a curva e monta um referencial (tangente, largura, normal) por ponto. */
function frames(curve: THREE.Curve<THREE.Vector3>, widthDir: (u: number) => THREE.Vector3, count: number) {
  const out: Frame[] = [];
  for (let i = 0; i <= count; i++) {
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

/** Tira de couro: uma caixa achatada que segue a curva, com UV para o grão. */
function ribbonGeometry(fs: Frame[], width = STRAP_W, thick = STRAP_T) {
  const positions: number[] = [];
  const uvs: number[] = [];
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

  const along: number[] = [0];
  for (let i = 1; i < fs.length; i++) along.push(along[i - 1] + fs[i].p.distanceTo(fs[i - 1].p));

  for (let face = 0; face < 4; face++) {
    const c0 = corners[face];
    const c1 = corners[(face + 1) % 4];
    const span = face % 2 === 0 ? width : thick;
    const base = positions.length / 3;
    for (let i = 0; i < fs.length; i++) {
      positions.push(...at(fs[i], c0).toArray(), ...at(fs[i], c1).toArray());
      uvs.push(along[i] * 4, face * 10, along[i] * 4, face * 10 + span * 4);
    }
    for (let i = 0; i < fs.length - 1; i++) {
      const a = base + i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  for (const f of [fs[0], fs[fs.length - 1]]) {
    const base = positions.length / 3;
    for (const c of corners) {
      positions.push(...at(f, c).toArray());
      uvs.push(c[0], c[1]);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Pesponto: traços curtos de linha rente à borda, de cada lado da tira. */
function stitchGeometry(fs: Frame[], width: number) {
  const parts: THREE.BufferGeometry[] = [];
  const inset = width / 2 - 0.028;
  for (const side of [1, -1]) {
    for (let i = 1; i < fs.length - 2; i += 2) {
      const slice = [fs[i], fs[i + 1]].map((f) => ({
        ...f,
        p: f.p.clone().addScaledVector(f.w, side * inset),
      }));
      parts.push(ribbonGeometry(slice, 0.012, STRAP_T + 0.007).toNonIndexed());
    }
  }
  return mergeGeometries(parts, false) ?? new THREE.BufferGeometry();
}

function footprint() {
  // Desenhado no plano XY (y = comprimento, bico em +y); vira o chão depois.
  // Ponta quadrada, cintura estreita e calcanhar curto, como a sola da foto.
  const shape = new THREE.Shape();
  shape.moveTo(0, -1.15);
  shape.bezierCurveTo(0.17, -1.15, 0.27, -1.05, 0.27, -0.9);
  shape.bezierCurveTo(0.28, -0.55, 0.28, -0.3, 0.31, -0.05);
  shape.bezierCurveTo(0.36, 0.3, 0.44, 0.55, 0.44, 0.85);
  shape.bezierCurveTo(0.44, 1.08, 0.42, 1.2, 0.28, 1.22);
  shape.lineTo(-0.22, 1.22);
  shape.bezierCurveTo(-0.36, 1.2, -0.4, 1.05, -0.4, 0.85);
  shape.bezierCurveTo(-0.4, 0.55, -0.3, 0.3, -0.27, -0.05);
  shape.bezierCurveTo(-0.25, -0.3, -0.26, -0.55, -0.27, -0.9);
  shape.bezierCurveTo(-0.27, -1.05, -0.17, -1.15, 0, -1.15);
  return shape;
}

function soleGeometry(scale: number, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(footprint(), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 48,
  });
  if (scale !== 1) geometry.scale(scale, scale, 1);
  // (x, y, z) -> (x, z, -y): o contorno deita no chão e a espessura sobe em +Y.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function heelGeometry() {
  const w = 0.235;
  const y0 = -1.1;
  const y1 = -0.6;
  const r = 0.1;
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, y0);
  shape.lineTo(w - r, y0);
  shape.quadraticCurveTo(w, y0, w, y0 + r);
  shape.lineTo(w, y1 - r);
  shape.quadraticCurveTo(w, y1, w - r, y1);
  shape.lineTo(-w + r, y1);
  shape.quadraticCurveTo(-w, y1, -w, y1 - r);
  shape.lineTo(-w, y0 + r);
  shape.quadraticCurveTo(-w, y0, -w + r, y0);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: HEEL_H,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** Placa de ouro martelado: contorno irregular, cúpula suave e ondas batidas. */
function plateGeometry() {
  const RINGS = 34;
  const SEGS = 112;
  const halfW = 0.19;
  const halfH = 0.23;
  const n = 3.2;
  const rim = (a: number) =>
    Math.pow(Math.pow(Math.abs(Math.cos(a)), n) + Math.pow(Math.abs(Math.sin(a)), n), -1 / n) *
    (1 + 0.07 * Math.sin(2 * a + 0.8) + 0.05 * Math.sin(3 * a + 2.1) + 0.03 * Math.sin(5 * a));
  const height = (x: number, y: number) => {
    const dome = 0.05 * Math.max(0, 1 - (x * x + y * y) / 2.2);
    const waves =
      0.018 * Math.sin(y * 6 + 1.1 * Math.sin(x * 2.6) + 0.5) +
      0.009 * Math.sin(x * 4.6 - y * 2.4 + 2) +
      0.0025 * Math.sin(x * 11 + y * 9);
    return dome + waves;
  };

  const positions: number[] = [];
  const ringCount = RINGS + 3;
  for (let k = 0; k < ringCount; k++) {
    for (let s = 0; s < SEGS; s++) {
      const a = (s / SEGS) * Math.PI * 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      let radial: number;
      let y: number;
      if (k <= RINGS) {
        radial = (k / RINGS) * rim(a);
        y = height(radial * dx, radial * dy);
      } else if (k === RINGS + 1) {
        radial = rim(a);
        y = height(radial * dx, radial * dy) - 0.014;
      } else {
        radial = rim(a) * 0.985;
        y = -0.032;
      }
      positions.push(radial * dx * halfW, y, radial * dy * halfH);
    }
  }
  const indices: number[] = [];
  for (let k = 0; k < ringCount - 1; k++) {
    for (let s = 0; s < SEGS; s++) {
      const s2 = (s + 1) % SEGS;
      const a = k * SEGS + s;
      const b = k * SEGS + s2;
      const c = (k + 1) * SEGS + s;
      const d = (k + 1) * SEGS + s2;
      indices.push(a, c, b, b, c, d);
    }
  }
  // Fundo plano
  const last = (ringCount - 1) * SEGS;
  const center = positions.length / 3;
  positions.push(0, -0.032, 0);
  for (let s = 0; s < SEGS; s++) indices.push(center, last + s, last + ((s + 1) % SEGS));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Grão de couro: ruído em três escalas, usado só como relevo (bump). */
function leatherGrain(repeat: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);
    for (const [cells, alpha] of [
      [48, 1],
      [96, 0.55],
      [160, 0.3],
    ] as const) {
      const small = document.createElement("canvas");
      small.width = small.height = cells;
      const sctx = small.getContext("2d");
      if (!sctx) continue;
      const img = sctx.createImageData(cells, cells);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 90 + Math.random() * 130;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      sctx.putImageData(img, 0, 0);
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(small, 0, 0, size, size);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  return texture;
}

function useSandal() {
  return useMemo(() => {
    const straps: THREE.BufferGeometry[] = [];
    const stitches: THREE.BufferGeometry[] = [];

    // Placa no peito do pé: as duas tiras e o dedo nascem dela.
    const plate = new THREE.Vector3(0.02, SOLE_TOP + 0.2, -0.5);

    // Duas tiras largas que descem em V da placa até as laterais da sola.
    const sides: THREE.Vector3[] = [
      new THREE.Vector3(-0.31, SOLE_TOP - 0.012, 0.14),
      new THREE.Vector3(0.34, SOLE_TOP - 0.012, 0.2),
    ];
    for (const end of sides) {
      const mix = (u: number) => new THREE.Vector3().lerpVectors(end, plate, u);
      const out = Math.sign(end.x);
      const curve = new THREE.CatmullRomCurve3([
        end,
        mix(0.1).add(new THREE.Vector3(out * 0.04, 0.09, 0)),
        mix(0.4).add(new THREE.Vector3(out * 0.02, 0.14, 0)),
        mix(0.75).add(new THREE.Vector3(0, 0.09, 0)),
        plate.clone().add(new THREE.Vector3(0, -0.015, 0)),
      ]);
      const d = new THREE.Vector3(plate.x - end.x, 0, plate.z - end.z).normalize();
      let side = new THREE.Vector3(-d.z, 0, d.x);
      let fs = frames(curve, () => side, 44);
      if (fs[22].n.y < 0) {
        side = side.negate();
        fs = frames(curve, () => side, 44);
      }
      straps.push(ribbonGeometry(fs));
      stitches.push(stitchGeometry(fs, STRAP_W));
    }

    // Tira do dedo: curta e estreita, desce da placa até a sola entre os dedos.
    const post = new THREE.CatmullRomCurve3([
      plate.clone().add(new THREE.Vector3(0, -0.02, -0.03)),
      new THREE.Vector3(0.02, SOLE_TOP + 0.1, -0.64),
      new THREE.Vector3(0.02, SOLE_TOP + 0.04, -0.74),
      new THREE.Vector3(0.02, SOLE_TOP - 0.01, -0.8),
    ]);
    let postFrames = frames(post, () => new THREE.Vector3(1, 0, 0), 14);
    if (postFrames[7].n.y < 0) postFrames = frames(post, () => new THREE.Vector3(-1, 0, 0), 14);
    straps.push(ribbonGeometry(postFrames, 0.075));

    return {
      outsole: soleGeometry(1, 0.075, 0.025),
      insole: soleGeometry(0.955, 0.02, 0),
      heel: heelGeometry(),
      straps,
      stitches: mergeGeometries(stitches, false) ?? new THREE.BufferGeometry(),
      plate: plateGeometry(),
      plateAt: plate.clone().add(new THREE.Vector3(0, 0.02, -0.01)),
    };
  }, []);
}

function Sandal() {
  const { outsole, insole, heel, straps, stitches, plate, plateAt } = useSandal();

  const materials = useMemo(() => {
    return {
      leather: new THREE.MeshPhysicalMaterial({
        color: "#7a3d1b",
        roughness: 0.55,
        envMapIntensity: 0.6,
        bumpMap: leatherGrain(1),
        bumpScale: 0.9,
        sheen: 0.3,
        sheenColor: new THREE.Color("#a8663a"),
        clearcoat: 0.18,
        clearcoatRoughness: 0.45,
        side: THREE.DoubleSide,
      }),
      stitch: new THREE.MeshStandardMaterial({ color: "#a8693a", roughness: 0.85 }),
      insole: new THREE.MeshPhysicalMaterial({
        color: "#8a4a22",
        roughness: 0.6,
        envMapIntensity: 0.6,
        bumpMap: leatherGrain(3),
        bumpScale: 0.6,
        clearcoat: 0.12,
      }),
      outsole: new THREE.MeshStandardMaterial({ color: "#4a2713", roughness: 0.7 }),
      heel: new THREE.MeshStandardMaterial({ color: "#3d2010", roughness: 0.62 }),
      gold: new THREE.MeshPhysicalMaterial({
        color: "#f2c35f",
        metalness: 1,
        roughness: 0.16,
        envMapIntensity: 2.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
      }),
    };
  }, []);

  return (
    <group position={[0, -0.5, 0]} rotation={[0, -0.55, 0]}>
      <mesh geometry={heel} material={materials.heel} />
      <group position={[0, TILT_LIFT, 0]} rotation={[TILT, 0, 0]}>
        <mesh geometry={outsole} material={materials.outsole} />
        <mesh geometry={insole} material={materials.insole} position={[0, 0.103, 0]} />
        {straps.map((geometry, index) => (
          <mesh key={index} geometry={geometry} material={materials.leather} />
        ))}
        <mesh geometry={stitches} material={materials.stitch} />
        <mesh geometry={plate} material={materials.gold} position={plateAt} rotation={[-0.3, 0.08, 0]} />
      </group>
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
      // Fora da tela o laço de render para (só o primeiro quadro é desenhado): a GPU fica livre para a rolagem.
      frameloop={active ? "always" : "demand"}
      dpr={[1, 1.5]}
      camera={{ position: [3.1, 1.9, 3.3], fov: 30 }}
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
