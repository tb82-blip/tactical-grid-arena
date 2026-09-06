import { useRef } from "react";
import { UNIT_CLASSES } from "../../game/classes";
import { actions, useGame } from "../../game/store";
import type { TileType } from "../../game/types";

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
      className={`pointer-events-auto border px-2 py-1 text-[11px] uppercase tracking-widest transition-colors ${
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
  const cls = selected ? UNIT_CLASSES[selected.cls]! : null;

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
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3 font-mono text-xs text-foreground">
      {/* top bar */}
      <div className="flex flex-wrap items-start gap-2">
        <div className="pointer-events-auto border border-border bg-background/80 p-2 backdrop-blur">
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Tactics grid / wireframe
          </div>
          <div className="flex flex-wrap gap-1">
            <Btn active={s.mode === "move"} onClick={() => actions.setMode("move")}>
              Move
            </Btn>
            <Btn active={s.mode === "attack"} onClick={() => actions.setMode("attack")}>
              Attack
            </Btn>
            <Btn onClick={() => actions.select(null)}>Deselect</Btn>
            <Btn onClick={() => actions.reset()}>Reset</Btn>
            <Btn onClick={onEnterVR}>Enter VR</Btn>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(["land", "water", "void"] as TileType[]).map((t) => (
              <Btn key={t} active={s.paint === t} onClick={() => actions.setPaint(s.paint === t ? null : t)}>
                paint {t}
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
        <div className="pointer-events-auto w-56 border border-border bg-background/80 p-2 backdrop-blur">
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Import .obj + pixel texture
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
        <div className="pointer-events-auto border border-border bg-background/80 p-2 backdrop-blur">
          {selected && cls ? (
            <div className="space-y-0.5">
              <div className="text-primary">
                {selected.name} — {cls.label} [{selected.team}]
              </div>
              <div className="text-muted-foreground">
                HP {selected.hp}/{cls.hp} · MOVE {cls.move} · JUMP {cls.jump} · RANGE {cls.attackMin}-
                {cls.attackMax} {cls.aquatic ? "· aquatic" : ""}
              </div>
              <div className="text-muted-foreground">
                cyan = movement range · red = attack range
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Click a piece to select it.</div>
          )}
        </div>
        <div className="pointer-events-auto max-w-xs border border-border bg-background/80 p-2 text-[10px] leading-relaxed text-muted-foreground backdrop-blur">
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
