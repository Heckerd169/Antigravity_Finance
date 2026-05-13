"use client";

import { useState } from "react";
import { SingularityRing } from "@/components/singularity-ring";
import styles from "./dashboard-ring-stage.module.css";

type Props = {
  realCurrent: number | null;
  realPlanned: number | null;
};

export function DashboardRingStage({ realCurrent, realPlanned }: Props) {
  const [forceCurrent, setForceCurrent] = useState<number | null>(null);
  const [forcePlanned, setForcePlanned] = useState<number | null>(null);

  const effectiveCurrent = forceCurrent ?? realCurrent;
  const effectivePlanned = forcePlanned ?? realPlanned;

  return (
    <div className={styles.wrapper}>
      <SingularityRing
        currentSparrate={effectiveCurrent}
        plannedSparrate={effectivePlanned}
      />
      {process.env.NODE_ENV === "development" && (
        <RingForceDevPanel
          forceCurrent={forceCurrent}
          forcePlanned={forcePlanned}
          realCurrent={realCurrent}
          realPlanned={realPlanned}
          onForceCurrent={setForceCurrent}
          onForcePlanned={setForcePlanned}
        />
      )}
    </div>
  );
}

type DevPanelProps = {
  forceCurrent: number | null;
  forcePlanned: number | null;
  realCurrent: number | null;
  realPlanned: number | null;
  onForceCurrent: (v: number | null) => void;
  onForcePlanned: (v: number | null) => void;
};

function RingForceDevPanel({
  forceCurrent,
  forcePlanned,
  realCurrent,
  realPlanned,
  onForceCurrent,
  onForcePlanned,
}: DevPanelProps) {
  const [currentInput, setCurrentInput] = useState<string>("");
  const [plannedInput, setPlannedInput] = useState<string>("");

  function commit(raw: string, setter: (v: number | null) => void) {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setter(null);
      return;
    }
    const normalized = trimmed.replace(",", ".");
    const parsed = Number(normalized);
    setter(Number.isFinite(parsed) ? parsed : null);
  }

  return (
    <div className={styles.devPanel}>
      <span className={styles.devLabel}>DEV · Force Ring</span>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Force currentSparrate</span>
        <input
          type="text"
          inputMode="decimal"
          className={styles.input}
          value={currentInput}
          placeholder={realCurrent === null ? "—" : String(realCurrent)}
          onChange={(e) => {
            setCurrentInput(e.target.value);
            commit(e.target.value, onForceCurrent);
          }}
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Force plannedSparrate</span>
        <input
          type="text"
          inputMode="decimal"
          className={styles.input}
          value={plannedInput}
          placeholder={realPlanned === null ? "—" : String(realPlanned)}
          onChange={(e) => {
            setPlannedInput(e.target.value);
            commit(e.target.value, onForcePlanned);
          }}
        />
      </label>
      <button
        type="button"
        className={styles.resetButton}
        onClick={() => {
          setCurrentInput("");
          setPlannedInput("");
          onForceCurrent(null);
          onForcePlanned(null);
        }}
        disabled={forceCurrent === null && forcePlanned === null}
      >
        Force zurücksetzen
      </button>
    </div>
  );
}
