import { InfoTip } from "./InfoTip";

type Props = {
  title: string;
  help: string;
  points: string[];
};

export function AnalysisPanel({ title, help, points }: Props) {
  if (!points.length) return null;
  return (
    <section id="section-analisis" className="card panel arch-panel">
      <header className="panel-title-row">
        <h2>
          <InfoTip label={title}>{help}</InfoTip>
        </h2>
        <span className="panel-accent-line" aria-hidden />
      </header>
      <ol className="analysis-list">
        {points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ol>
    </section>
  );
}
