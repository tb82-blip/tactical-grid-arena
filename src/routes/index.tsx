import { createFileRoute } from "@tanstack/react-router";
import { GameCanvas } from "../components/game/GameCanvas";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Voxel Tactics Grid — VR Skirmish Engine" },
      {
        name: "description",
        content:
          "Wireframe voxel grid tactics sandbox: FFT-style movement and attack ranges, land/water tiles, and .obj model importing for Quest 2 browser VR.",
      },
      { property: "og:title", content: "Voxel Tactics Grid — VR Skirmish Engine" },
      {
        property: "og:description",
        content:
          "Barebones tabletop skirmish engine on a voxel wireframe grid with movement/attack range display and custom .obj imports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameCanvas,
});
