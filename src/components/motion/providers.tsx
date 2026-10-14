"use client";

import { MotionConfig } from "motion/react";
import { ReactLenis } from "lenis/react";
import { BagProvider } from "@/components/store/bag";
import { LenisRouteSync } from "./lenis-route-sync";
import { useReducedMotion } from "./use-media-query";

export function Providers({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const tree = (
    <BagProvider>
      {reduce ? null : <LenisRouteSync />}
      {children}
    </BagProvider>
  );

  return (
    <MotionConfig reducedMotion="user">
      {reduce ? (
        tree
      ) : (
        <ReactLenis
          root
          options={{
            lerp: 0.085,
            wheelMultiplier: 0.95,
            anchors: true,
          }}
        >
          {tree}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
