export function ScoreRing({ score, grade }: { score: number; grade: string }) {
  return <div className="score-ring" style={{ "--score": score } as React.CSSProperties} aria-label={`Security score ${score} out of 100, grade ${grade}`}>
    <div><span>{grade}</span><strong>{score}<small>/100</small></strong></div>
  </div>;
}
