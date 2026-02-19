"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  cols: number;
  rows: number;
  className?: string;
};

function WoodFrame({
  cols,
  rows,
  cellW,
  cellH,
  gap,
}: {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  gap: number;
}) {
  // overall inner footprint (totes area)
  const innerW = cols * cellW + (cols - 1) * gap;
  const innerH = rows * cellH + (rows - 1) * gap;

  // frame thicknesses
  const railT = 0.18; // thickness of frame beams
  const postT = 0.22;
  const depth = 1.2; // rack depth (z)

  const outerW = innerW + postT * 2 + 0.6;
  const outerH = innerH + postT * 2 + 0.6;

  const woodMat = useMemo(() => {
    // warm light wood look
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#E6D2A6"),
      roughness: 0.55,
      metalness: 0.05,
    });
  }, []);

  const darkEdgeMat = useMemo(() => {
    // slightly darker edges/shadows
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#D3B98C"),
      roughness: 0.7,
      metalness: 0.03,
    });
  }, []);

  // helper positions
  const xL = -outerW / 2;
  const xR = outerW / 2;
  const yB = -outerH / 2;
  const yT = outerH / 2;

  return (
    <group>
      {/* outer posts left/right */}
      <mesh castShadow receiveShadow material={woodMat} position={[xL + postT / 2, 0, 0]}>
        <boxGeometry args={[postT, outerH, depth]} />
      </mesh>
      <mesh castShadow receiveShadow material={woodMat} position={[xR - postT / 2, 0, 0]}>
        <boxGeometry args={[postT, outerH, depth]} />
      </mesh>

      {/* outer rails top/bottom */}
      <mesh castShadow receiveShadow material={woodMat} position={[0, yT - railT / 2, 0]}>
        <boxGeometry args={[outerW, railT, depth]} />
      </mesh>
      <mesh castShadow receiveShadow material={woodMat} position={[0, yB + railT / 2, 0]}>
        <boxGeometry args={[outerW, railT, depth]} />
      </mesh>

      {/* inner shelf rails per row (like the “bars” you see) */}
      {Array.from({ length: rows }).map((_, r) => {
        const y = yT - postT - 0.3 - r * (cellH + gap) - cellH - 0.08;
        return (
          <mesh
            key={`shelf-${r}`}
            castShadow
            receiveShadow
            material={darkEdgeMat}
            position={[0, y, depth / 2 - 0.1]}
          >
            <boxGeometry args={[outerW - postT * 2 - 0.2, 0.06, 0.06]} />
          </mesh>
        );
      })}

      {/* subtle front lip (gives that “frame” feel) */}
      <mesh castShadow receiveShadow material={darkEdgeMat} position={[0, 0, depth / 2 - 0.02]}>
        <boxGeometry args={[outerW, outerH, 0.03]} />
      </mesh>
    </group>
  );
}

function Tote({
  x,
  y,
}: {
  x: number;
  y: number;
}) {
  // tote dimensions
  const bodyW = 0.95;
  const bodyH = 0.7;
  const bodyD = 1.05;

  const lidH = 0.12;
  const lidW = bodyW + 0.06;
  const lidD = bodyD + 0.06;

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#121417"),
        roughness: 0.55,
        metalness: 0.1,
      }),
    []
  );

  const lidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#FFD21F"),
        roughness: 0.4,
        metalness: 0.05,
      }),
    []
  );

  const handleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0B0D10"),
        roughness: 0.7,
        metalness: 0.05,
      }),
    []
  );

  return (
    <group position={[x, y, 0]}>
      {/* body */}
      <mesh castShadow receiveShadow material={bodyMat} position={[0, 0, 0]}>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
      </mesh>

      {/* lid */}
      <mesh castShadow receiveShadow material={lidMat} position={[0, bodyH / 2 + lidH / 2 - 0.02, 0]}>
        <boxGeometry args={[lidW, lidH, lidD]} />
      </mesh>

      {/* front handle indent */}
      <mesh castShadow receiveShadow material={handleMat} position={[0, -0.02, bodyD / 2 - 0.03]}>
        <boxGeometry args={[bodyW * 0.55, 0.06, 0.03]} />
      </mesh>

      {/* subtle front highlight */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bodyW * 0.9, 0.02, 0.01]} />
        <meshStandardMaterial color="#FFFFFF" opacity={0.06} transparent />
      </mesh>
    </group>
  );
}

function Rack({
  cols,
  rows,
}: {
  cols: number;
  rows: number;
}) {
  // “cell” sizes = tote spacing grid
  const cellW = 1.1;
  const cellH = 0.85;
  const gap = 0.18;

  const totalW = cols * cellW + (cols - 1) * gap;
  const totalH = rows * cellH + (rows - 1) * gap;

  const startX = -totalW / 2 + cellW / 2;
  const startY = totalH / 2 - cellH / 2;

  return (
    <group>
      <WoodFrame cols={cols} rows={rows} cellW={cellW} cellH={cellH} gap={gap} />

      {/* totes */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const x = startX + c * (cellW + gap);
          const y = startY - r * (cellH + gap);
          return <Tote key={`t-${r}-${c}`} x={x} y={y} />;
        })
      )}
    </group>
  );
}

export default function RackPreview3D({ cols, rows, className }: Props) {
  // Keep it stable if cols/rows are 0
  const safeCols = Math.max(1, cols || 1);
  const safeRows = Math.max(1, rows || 1);

  return (
    <div className={className ?? ""}>
      <div className="w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="h-[260px] w-full">
          <Canvas
            shadows
            camera={{ position: [0, 0.6, 6.2], fov: 40 }}
            gl={{ antialias: true, alpha: false }}
          >
            {/* Background */}
            <color attach="background" args={["#ffffff"]} />

            {/* Lights */}
            <ambientLight intensity={0.55} />
            <directionalLight
              position={[5, 7, 6]}
              intensity={1.25}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-near={0.1}
              shadow-camera-far={30}
              shadow-camera-left={-6}
              shadow-camera-right={6}
              shadow-camera-top={6}
              shadow-camera-bottom={-6}
            />
            <directionalLight position={[-6, 4, 2]} intensity={0.55} />

            {/* Ground to catch shadows */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
              <planeGeometry args={[40, 40]} />
              <shadowMaterial opacity={0.18} />
            </mesh>

            {/* Rack */}
            <group position={[0, -0.2, 0]}>
              <Rack cols={safeCols} rows={safeRows} />
            </group>

            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              rotateSpeed={0.7}
              minPolarAngle={Math.PI / 2.8}
              maxPolarAngle={Math.PI / 1.8}
              minAzimuthAngle={-Math.PI / 2.5}
              maxAzimuthAngle={Math.PI / 2.5}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
