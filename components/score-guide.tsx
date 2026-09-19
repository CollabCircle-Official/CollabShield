"use client";

import { useEffect, useRef, useState } from "react";

const GRADES = [
  ["95–100", "A+"],
  ["85–94", "A"],
  ["75–84", "B"],
  ["65–74", "C"],
  ["50–64", "D"],
  ["0–49", "F"],
];

export function ScoreGuide() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <>
    <button className="score-guide-trigger" type="button" onClick={() => setOpen(true)}>Scoring</button>
    <dialog ref={dialogRef} className="score-guide" onClose={() => setOpen(false)} onClick={(event) => {
      if (event.target === event.currentTarget) setOpen(false);
    }}>
      <div className="score-guide-card">
        <button className="dialog-close" type="button" aria-label="Close scoring guide" onClick={() => setOpen(false)}>×</button>
        <span className="eyebrow">SCORING GUIDE</span>
        <h2>Score and grade table</h2>
        <p>Each control earns evidence-based partial credit. Warnings retain points according to the strength of the protection observed; confirmed strong configurations receive full credit.</p>
        <table>
          <thead><tr><th scope="col">Security score</th><th scope="col">Grade</th></tr></thead>
          <tbody>{GRADES.map(([range, grade]) => <tr key={grade}><td>{range}</td><td><strong>{grade}</strong></td></tr>)}</tbody>
        </table>
        <small>Grades are ShieldCircle risk indicators based on OWASP-aligned header checks, not an official certification.</small>
      </div>
    </dialog>
  </>;
}
