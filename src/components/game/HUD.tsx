import { useRef } from "react";
import { UNIT_CLASSES } from "../../game/classes";
import { actions, useGame } from "../../game/store";
import type { TileType } from "../../game/types";
import { Box, Crosshair, Footprints, Maximize, Mountain, RotateCcw, Swords, Upload, Waves, X } from "lucide-react";

function Btn({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`pointer-events-auto flex h-8 items-center gap-1.5 border px-2 text-[10px] uppercase transition-colors ${
        active
          ? "border-primary bg-primary/20 text-primary"
          : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function HUD({ onEnterVR }: { onEnterVR: () => void }) {
  const s = useGame();
  const objRef = useRef<HTMLInputElement>(null);
  const texRef = useRef<HTMLInputElement>(null);
  const selected = s.units.find((u) => u.id === s.selectedUnitId);
  const cls = selected ? UNIT_CLASSES[selected.cls] : null;

  function importModel() {
    const objFile = objRef.current?.files?.[0];
    if (!objFile) return;
    const texFile = texRef.current?.files?.[0];
    actions.addModel({
      id: crypto.randomUUID(),
      name: objFile.name,
      url: URL.createObjectURL(objFile),
      textureUrl: texFile ? URL.createObjectURL(texFile) : undefined,
    });
    if (objRef.current) objRef.current.value = "";
    if (texRef.current) texRef.current.value = "";
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-2 font-mono text-xs text-foreground sm:p-3">
      {/* top bar */}
      <div className="flex flex-wrap items-start gap-2">
        <div className="pointer-events-auto border border-border bg-background/90 p-2 backdrop-blur">
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Tabletop grid · 1 tile = 1 meter
          </div>
          <div className="flex flex-wrap gap-1">
            <Btn active={s.mode === "move"} onClick={() => actions.setMode("move")}>
              <Footprints size={13} /> Move
            </Btn>
            <Btn active={s.mode === "attack"} onClick={() => actions.setMode("attack")}>
              <Swords size={13} /> Attack
            </Btn>
            <Btn onClick={() => actions.select(null)}><X size={13} /> Deselect</Btn>
            <Btn onClick={() => actions.reset()}><RotateCcw size={13} /> Reset</Btn>
            <Btn onClick={onEnterVR}><Maximize size={13} /> Enter VR</Btn>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(["land", "water", "void"] as TileType[]).map((t) => (
              <Btn key={t} active={s.paint === t} onClick={() => actions.setPaint(s.paint === t ? null : t)}>
                {t === "land" ? <Mountain size={13} /> : t === "water" ? <Waves size={13} /> : <Box size={13} />} {t}
              </Btn>
            ))}
            {s.hoverTile && (
              <>
                <Btn onClick={() => actions.raiseTile(s.hoverTile!.x, s.hoverTile!.y, 1)}>h+</Btn>
                <Btn onClick={() => actions.raiseTile(s.hoverTile!.x, s.hoverTile!.y, -1)}>h-</Btn>
              </>
            )}
          </div>
        </div>

        {/* import panel */}
        <div className="pointer-events-auto hidden w-56 border border-border bg-background/90 p-2 backdrop-blur sm:block">
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
             <span className="flex items-center gap-1.5"><Upload size={12} /> Import .obj + pixel texture</span>
          </div>
          <input ref={objRef} type="file" accept=".obj" className="w-full text-[10px]" />
          <input ref={texRef} type="file" accept="image/*" className="mt-1 w-full text-[10px]" />
          <div className="mt-1">
            <Btn onClick={importModel}>Load model</Btn>
          </div>
          {s.models.length > 0 && selected && (
            <div className="mt-2 space-y-1">
              <div className="text-[10px] text-muted-foreground">Assign to {selected.name}:</div>
              {s.models.map((m) => (
                <Btn
                  key={m.id}
                  active={selected.modelId === m.id}
                  onClick={() =>
                    actions.assignModel(selected.id, selected.modelId === m.id ? undefined : m.id)
                  }
                >
                  {m.name.slice(0, 22)}
                </Btn>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="pointer-events-auto border border-border bg-background/90 p-2 backdrop-blur">
          {selected && cls ? (
            <div className="space-y-0.5">
              <div className="text-accent">
                {selected.name} — {cls.label} [{selected.team}]
              </div>
              <div className="text-muted-foreground">
                HP {selected.hp}/{cls.hp} · MOVE {cls.move}m · JUMP {cls.jump * 0.25}m · RANGE {cls.attackMin}-
                {cls.attackMax}m {cls.aquatic ? "· aquatic" : ""}
              </div>
              <div className="text-muted-foreground">
                teal = movement · coral = attack · lavender = team one
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground"><Crosshair size={13} /> Select a piece.</div>
          )}
        </div>
        <div className="pointer-events-auto hidden max-w-xs border border-border bg-background/90 p-2 text-[10px] leading-relaxed text-muted-foreground backdrop-blur sm:block">
          {s.log.map((l, i) => (
            <div key={i} style={{ opacity: 1 - i * 0.1 }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
