import { capabilities } from "../data/capabilities.ts";
import { experiences } from "../data/experience.ts";
import { leetcode } from "../data/leetcode.ts";
import { profile } from "../data/profile.ts";
import { projects } from "../data/projects.ts";
import { coreSkillIds, technologies } from "../data/technologies.ts";

/**
 * Static HTML written into <div id="root"> at build time (see vite.config.ts).
 *
 * Search engines get the real content — name, role, summary, skills,
 * projects, experience, links — in the first HTML response instead of an
 * empty div that only fills in after JavaScript runs. React replaces it on
 * load, and visitors without JavaScript get a readable page.
 *
 * Everything comes from src/data, so it cannot drift from the site.
 */
function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(text: string): string {
  return text.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, gap: string, letter: string) => gap + letter.toUpperCase());
}

export function crawlerMarkup(): string {
  const skills = coreSkillIds
    .map((id) => technologies.find((tech) => tech.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const links = [
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "GitHub", href: profile.links.github },
    { label: "LeetCode", href: leetcode.url },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return `
    <div class="seo-shell">
      <header>
        <p class="seo-shell__kicker">Portfolio · ${escape(profile.location)}</p>
        <h1>${escape(profile.name)}</h1>
        <p class="seo-shell__role">${escape(profile.role)} | ${escape(profile.secondaryRole)}</p>
        <p>${escape(profile.statement)}</p>
        <p>${escape(profile.positioning)}</p>
      </header>
      <section>
        <h2>What I do</h2>
        <ul>${capabilities
          .map((item) => `<li><strong>${escape(item.title)}</strong> — ${escape(item.body)}</li>`)
          .join("")}</ul>
      </section>
      <section>
        <h2>Technical skills</h2>
        <p>${skills.map(escape).join(" · ")}</p>
      </section>
      <section>
        <h2>Featured projects</h2>
        <ul>${projects
          .map(
            (project) =>
              `<li><strong>${escape(titleCase(project.name))}</strong> — ${escape(project.summary)} <em>${escape(project.tech.join(", "))}</em></li>`,
          )
          .join("")}</ul>
      </section>
      <section>
        <h2>Experience</h2>
        <ul>${experiences
          .map(
            (item) =>
              `<li><strong>${escape(item.role)}</strong>, ${escape(item.company)} · ${escape(item.period)} · ${escape(item.location)}</li>`,
          )
          .join("")}</ul>
      </section>
      <section>
        <h2>Contact</h2>
        <ul>${links
          .map((link) => `<li><a href="${escape(link.href)}" rel="me">${escape(link.label)}</a></li>`)
          .join("")}</ul>
      </section>
    </div>`;
}
