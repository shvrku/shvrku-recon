"use client";

import { Canvas } from "@react-three/fiber";
import { ProjectLayer } from "./ProjectLayer";
import { usePathname } from "next/navigation";

const canvasGl = {
  antialias: true,
  alpha: true,
  powerPreference: "high-performance" as const,
};

export function CanvasRoot() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[2]">
      <Canvas
        gl={canvasGl}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 8], fov: 32, near: 0.1, far: 40 }}
        style={{ pointerEvents: "none" }}
      >
        <ProjectLayer />
      </Canvas>
    </div>
  );
}
