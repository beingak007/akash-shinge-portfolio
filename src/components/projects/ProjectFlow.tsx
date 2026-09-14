import type { Project } from "../../types/index.ts";

interface ProjectFlowProps {
  project: Project;
}

export function ProjectFlow({ project }: ProjectFlowProps) {
  const branched = project.id === "dual-store";

  if (branched) {
    return (
      <div className="project-flow" data-project-flow>
        <span className="project-flow__node" data-flow-node>
          API
        </span>
        <span className="project-flow__line" data-flow-line aria-hidden="true" />
        <span className="project-flow__node" data-flow-node>
          SERVICE
        </span>
        <span className="project-flow__fork">
          <span className="project-flow__col">
            <span className="project-flow__line" data-flow-line aria-hidden="true" />
            <span className="project-flow__node" data-flow-node>
              MYSQL
            </span>
          </span>
          <span className="project-flow__col">
            <span className="project-flow__line" data-flow-line aria-hidden="true" />
            <span className="project-flow__node" data-flow-node>
              CASSANDRA
            </span>
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="project-flow" data-project-flow>
      {project.flow.map((node, index) => (
        <span key={node.id} className="project-flow__row">
          <span className="project-flow__node" data-flow-node>
            {node.label}
          </span>
          {index < project.flow.length - 1 ? (
            <span className="project-flow__line" data-flow-line aria-hidden="true" />
          ) : null}
        </span>
      ))}
    </div>
  );
}
