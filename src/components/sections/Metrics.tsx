import { metrics } from "../../data/principles.ts";
import "./Metrics.css";

export function Metrics() {
  return (
    <section className="section metrics" id="metrics" aria-label="Engineering qualities">
      <div className="section__head">
        <p className="kicker">SYSTEM QUALITIES</p>
        <p className="kicker">NO VANITY COUNTS</p>
      </div>
      <ul className="metrics__list">
        {metrics.map((item) => (
          <li key={item.id} data-reveal>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
