import { profile } from "../../data/profile.ts";
import { ProfilePortrait } from "../profile/ProfilePortrait.tsx";
import "./Contact.css";

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <p className="kicker">CONTACT</p>
      <div className="contact__row">
        <div>
          <h2 className="display contact__title">
            LET'S BUILD
            <br />
            SOMETHING
            <br />
            USEFUL.
          </h2>
          <p className="contact__sub">Have a difficult system problem? Let's talk.</p>
          <div className="contact__actions">
            <a
              className="btn btn--solid"
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
            >
              LINKEDIN
            </a>
            <a
              className="btn"
              href={profile.links.leetcode}
              target="_blank"
              rel="noreferrer"
              data-cursor="open"
            >
              LEETCODE
            </a>
            {profile.links.github ? (
              <a
                className="btn"
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                data-cursor="open"
              >
                GITHUB
              </a>
            ) : null}
            {profile.links.email ? (
              <a className="btn" href={`mailto:${profile.links.email}`} data-cursor="open">
                EMAIL
              </a>
            ) : null}
          </div>
        </div>
        <ProfilePortrait treatment="contact" />
      </div>
    </section>
  );
}
