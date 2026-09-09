/**
 * Organisation label for the rail header. Static — there is no workspace
 * switching in this app, so it is deliberately not a control (no hover state,
 * no menu).
 */
export function WorkspaceLabel({ name }: { name: string }) {
  return (
    <span className="app-sidenav__workspace-org">
      <span className="app-sidenav__workspace-name">{name}</span>
    </span>
  )
}
