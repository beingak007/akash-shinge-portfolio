import { useState } from "react";
import { principles } from "../../data/principles.ts";
import { useMediaQuery } from "../../hooks/useMediaQuery.ts";
import "./HowIThink.css";

export function HowIThink() {
  const [openId, setOpenId] = useState<string | null>(null);
  const coarse = useMediaQuery("(pointer: coarse)");

  return (
    <section className="section think" id="think">
      <div className="section__head">
        <p className="kicker">HOW I THINK</p>
        <p className="kicker">MANIFESTO</p>
      </div>
      <h2 className="display think__title" data-reveal>
        An engineering stance.
      </h2>
      <ul className="think__list">
        {principles.map((item) => {
          const open = openId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`think__item${open ? " is-open" : ""}`}
                aria-expanded={open}
                onMouseEnter={() => {
                  setOpenId(item.id);
                }}
                onMouseLeave={() => {
                  setOpenId(null);
                }}
                onFocus={() => {
                  setOpenId(item.id);
                }}
                onBlur={() => {
                  setOpenId(null);
                }}
                onClick={() => {
                  if (coarse) {
                    setOpenId((current) => (current === item.id ? null : item.id));
                  }
                }}
              >
                <span className="think__index">{item.index}</span>
                <span className="think__copy">
                  <span className="think__name">{item.title}</span>
                  <span className="think__body">{item.body}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
