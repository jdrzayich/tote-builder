"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

type Props = {
  cols: number;
  rows: number;
};

function Rack({ cols, rows }: Props) {
  const toteW = 1;
  const toteH = 0.7;
  const toteD = 1.2;

  const gap = 0.15;

  const totalW = cols * toteW + (cols - 1) * gap;
  const totalH = rows * toteH + (rows - 1) * gap;

  const startX = -totalW / 2;
  const startY = -totalH / 2;

  return (
    <group>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const x = startX + c * (toteW + gap) + toteW / 2;
          const y = startY + r * (toteH + gap) + toteH / 2;

          return (
            <group key={`${r}-${c}`} position={[x, y, 0]}>
              {/* Tote body */}
              <mesh>
                <boxGeometry args={[toteW, toteH, toteD]} />
                <meshStandardMaterial color="#111418" />
              </mesh>

              {/* Lid */}
              <mesh position={[0, toteH / 2 - 0.05, 0]}>
                <boxGeometry args={[toteW * 1.05, 0.12, toteD * 1.05]} />
                <meshStandardMaterial color="#f6c20a" />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}

export default function RackPreview3D({ cols, rows }: Props) {
  return (
    <div className="w-full rounded-3xl border border-neutral-200 overflow-hidden bg-white">
      <div className="h-[320px]">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ touchAction: "none" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          <Rack cols={Math.max(cols, 1)} rows={Math.max(rows, 1)} />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.8}
          />
        </Canvas>
      </div>
    </div>
  );
}
