/**
 * Decorative floating gradient orbs rendered behind the app.
 * Pure CSS animation — GPU accelerated, no re-renders.
 */
export function AmbientOrbs() {
  return (
    <div className="ambient-orbs" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
