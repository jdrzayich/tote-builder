"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

type Props = {
  cols: number;
  rows: number;
};

/**
 * Simple wood tote rack:
 * - Frame posts (verticals)
 * - Top + bottom rectangles
 * - TWO rails per tote bay (left + right), running front-to-back
 * - Totes sitting on those rails
 */
function Rack({ cols, rows }: Props) {
  // --- “real-ish” proportions (tweak these later)
  const bayW = 1.25;          // width allocated per tote bay (left-right)
  const bayH = 0.85;          // height per row
  const depth = 1.35;         // rack depth (front-back)

  const post = 0.12;          // 2x framing thickness (visual)
  const railW = 0.10;         // rail thickness (left/right)
  const railH = 0.08;         // rail height
  const railInset = 0.08;     // push rails inward from the post face
  const toteClearSide = 0.05; // clearance between tote and rail

  // Tote size inside each bay
  const toteW = bayW - (post * 2) - (railW * 2) - (toteClearSide * 4);
  const toteH = bayH * 0.70;
  const toteD = depth * 0.82;

  // FRAME DIMENSIONS (in your Rack() function, near totalW/totalH/startX/startY)
  const rackOuterW = totalW + post * 2;      // full width including side posts
  const rackOuterH = totalH + post * 2;      // full height including top/bottom
  const halfDepth = depth / 2;

  // put the "front" and "back" posts just inside the depth edges
  const zFront = +halfDepth - post / 2;
  const zBack  = -halfDepth + post / 2;

  // y positions for top/bottom rails
  const yBottomRail = startY - post / 2;
  const yTopRail    = startY + rackOuterH - post / 2;

  // Overall rack size
  const rackW = cols * bayW + post * 2;   // outer posts
  const rackH = rows * bayH + post * 2;

  const startX = -rackW / 2;
  const startY = -rackH / 2;

  const woodMat = useMemo(
    () => ({
      color: "#C8B58C", // light wood
      roughness: 0.9,
      metalness: 0.0,
    }),
    []
  );

  const railMat = useMemo(
    () => ({
      color: "#B6A57F",
      roughness: 0.9,
      metalness: 0.0,
    }),
    []
  );

  const toteMat = useMemo(
    () => ({
      color: "#0B0D10",
      roughness: 0.7,
      metalness: 0.05,
    }),
    []
  );

  const lidMat = useMemo(
    () => ({
      color: "#D9B21F",
      roughness: 0.6,
      metalness: 0.05,
    }),
    []
  );

  return (
    <group>
      {/* FRONT + BACK bottom rails */}
      <mesh position={[startX + rackOuterW / 2, yBottomRail, zFront]} castShadow receiveShadow>
        <boxGeometry args={[rackOuterW, post, post]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>
      <mesh position={[startX + rackOuterW / 2, yBottomRail, zBack]} castShadow receiveShadow>
        <boxGeometry args={[rackOuterW, post, post]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>

      {/* VERTICAL POSTS at every bay divider (0..cols), FRONT + BACK */}
      {Array.from({ length: cols + 1 }).map((_, i) => {
        const x = startX + post / 2 + i * bayW;     // divider x position
        const y = startY + rackOuterH / 2 - post / 2; // center of vertical post
        return (
          <React.Fragment key={`vp-${i}`}>
            {/* front post */}
            <mesh position={[x, y, zFront]} castShadow receiveShadow>
              <boxGeometry args={[post, rackOuterH, post]} />
              <meshStandardMaterial {...woodMat} />
            </mesh>

      {/* back post */}
      <mesh position={[x, y, zBack]} castShadow receiveShadow>
        <boxGeometry args={[post, rackOuterH, post]} />
        <meshStandardMaterial {...woodMat} />
      </mesh>
    </React.Fragment>
  );
})}

{/* FRONT + BACK top rails */}
<mesh position={[startX + rackOuterW / 2, yTopRail, zFront]} castShadow receiveShadow>
  <boxGeometry args={[rackOuterW, post, post]} />
  <meshStandardMaterial {...woodMat} />
</mesh>
<mesh position={[startX + rackOuterW / 2, yTopRail, zBack]} castShadow receiveShadow>
  <boxGeometry args={[rackOuterW, post, post]} />
  <meshStandardMaterial {...woodMat} />
</mesh>
      {/* ====== VERTICAL POSTS (front + back) ====== */}
      {Array.from({ length: cols + 1 }).map((_, i) => {
          // i=0 left edge, i=cols right edge, in-between are dividers
        const x = startX + post / 2 + i * bayW;

        return (
          <group key={`post-pair-${i}`}>
            {/* front post */}
            <mesh position={[x, startY + rackH / 2, zFront]} castShadow receiveShadow>
            <boxGeometry args={[post, rackH, post]} />
            <meshStandardMaterial {...woodMat} />
          </mesh>

            {/* back post */}
            <mesh position={[x, startY + rackH / 2, zBack]} castShadow receiveShadow>
              <boxGeometry args={[post, rackH, post]} />
              <meshStandardMaterial {...woodMat} />
            </mesh>
          </group>
        );
      })}      

      {/* ====== TOP + BOTTOM BEAMS ====== */}
      {[
        // top
        [0, startY + rackH - post / 2, 0],
        // bottom
        [0, startY + post / 2, 0],
      ].map((p, i) => (
        <mesh key={`topbot-${i}`} position={p as any} castShadow receiveShadow>
          <boxGeometry args={[rackW, post, depth]} />
          <meshStandardMaterial {...woodMat} />
        </mesh>
      ))}
      
      {/* left/right depth beams (front-to-back) */}
      {[
        // left top depth
        [startX + post / 2, startY + rackH - post / 2, 0],
        // right top depth
        [startX + rackW - post / 2, startY + rackH - post / 2, 0],
        // left bottom depth
        [startX + post / 2, startY + post / 2, 0],
        // right bottom depth
        [startX + rackW - post / 2, startY + post / 2, 0],
      ].map((p, i) => (
        <mesh key={`dbeam-${i}`} position={p as any} castShadow receiveShadow>
          <boxGeometry args={[post, post, depth]} />
          <meshStandardMaterial {...woodMat} />
        </mesh>
      ))}

      {/* ====== RAILS + TOTES PER BAY ====== */}
      {Array.from({ length: rows }).map((_, r) => {
        return Array.from({ length: cols }).map((__, c) => {
          // bay center
          const bayLeftX = startX + post + c * bayW;
          const bayRightX = bayLeftX + bayW;
          const bayCenterX = bayLeftX + bayW / 2;
          const bayBottomY = startY + post + r * bayH;
          const bayCenterY = bayBottomY + bayH / 2;

          const railTopY = railY + railH / 2;
          const toteY = railTopY + toteH / 2 + 0.002; // tiny epsilon
          const lidY = toteY + toteH / 2 + 0.05;

          // Rails should sit right under lid
          const railY = lidY - 0.05 - railH / 2;
          const leftRailX = bayLeftX + railW / 2;
          const rightRailX = bayRightX - railW / 2;

          return (
            <group key={`bay-${r}-${c}`}>
              {/* Left rail */}
              <mesh position={[leftRailX, railY, 0]} castShadow receiveShadow>
                <boxGeometry args={[railW, railH, depth - post * 1.2]} />
                <meshStandardMaterial {...railMat} />
              </mesh>

              {/* Right rail */}
              <mesh position={[rightRailX, railY, 0]} castShadow receiveShadow>
                <boxGeometry args={[railW, railH, depth - post * 1.2]} />
                <meshStandardMaterial {...railMat} />
              </mesh>

              {/* Tote body */}
              <mesh position={[bayCenterX, toteY, 0]} castShadow receiveShadow>
                <boxGeometry args={[toteW, toteH, toteD]} />
                <meshStandardMaterial {...toteMat} />
              </mesh>

              {/* Tote lid */}
              <mesh position={[bayCenterX, toteY + toteH / 2 + 0.05, 0]} castShadow receiveShadow>
                <boxGeometry args={[toteW * 1.02, 0.08, toteD * 1.02]} />
                <meshStandardMaterial {...lidMat} />
              </mesh>
            </group>
          );
        });
      })}
    </group>
  );
}

export default function RackPreview3D({ cols, rows }: Props) {
  // Auto zoom: scale camera based on rack size
  const camZ = useMemo(() => {
    const biggest = Math.max(cols * 1.25, rows * 0.9);
    return 6 + biggest * 1.1; // zoom out more as rack grows
  }, [cols, rows]);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="h-[260px] w-full">
        <Canvas
          shadows
          camera={{ position: [0, 1.6, camZ], fov: 45 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[6, 8, 6]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          <Rack cols={cols} rows={rows} />

          <OrbitControls
            enablePan={false}
            minDistance={4.5}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Canvas>
      </div>
    </div>
  );
}
