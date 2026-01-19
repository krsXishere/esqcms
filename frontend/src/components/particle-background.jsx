"use client";

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import { useTheme } from "@mui/material";

export default function ParticlesBackground() {
  const theme = useTheme();
  const [engineReady, setEngineReady] = useState(false);

  // Inisialisasi engine tsparticles sekali
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine); // memuat semua fitur
    }).then(() => {
      setEngineReady(true);
    });
  }, []);

  // Render hanya setelah engine siap
  if (!engineReady) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1, // agar di belakang konten
        },
        particles: {
          number: { value: 80 },
          color: { value: "#2F80ED" },
          links: {
            enable: true,
            color: "#2F80ED",
            distance: 150,
            opacity: 0.3,
          },
          move: { enable: true, speed: 2 },
          size: { value: 2 },
          opacity: { value: 0.5 },
        },
        background: { color: "transparent" },
      }}
    />
  );
}
