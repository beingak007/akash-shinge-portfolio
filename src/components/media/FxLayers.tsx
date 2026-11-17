import "./Fx.css";

/** Decorative light + border layers for any `.fx` frame. */
export function FxLayers() {
  return (
    <>
      <span className="fx__glare" aria-hidden="true" />
      <span className="fx__border" aria-hidden="true" />
    </>
  );
}
