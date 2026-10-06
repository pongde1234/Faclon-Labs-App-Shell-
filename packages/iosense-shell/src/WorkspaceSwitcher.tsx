/**
 * Organisation label for the rail header. Static — there is no workspace
 * switching in this app, so it is deliberately not a control (no hover state,
 * no menu).
 */
export function WorkspaceLabel({ name }: { name: string }) {
  // `BodyLargeMedium` is the system's named style — the same one the rail's
  // entity rows wear. It used to be three `font-*` declarations in
  // theme-overrides.css that happened to spell it out.
  return (
    <span className="app-sidenav__workspace-org BodyLargeMedium">
      <span className="app-sidenav__workspace-name">{name}</span>
    </span>
  )
}
