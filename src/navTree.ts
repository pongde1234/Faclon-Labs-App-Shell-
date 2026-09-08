import type { NavItem } from './types'

/**
 * Every href in this subtree, including the item's own.
 *
 * This is what lets a parent be active when a GRANDCHILD is the current page.
 * A `href === currentPath` test on the parent would leave the whole branch
 * collapsed on a cold load, and the user would land on a page whose position in
 * the nav is invisible — so this is also what decides which branches start
 * open.
 *
 * Its own module rather than sitting beside SideNavLink: a non-component export
 * in a component file costs that file Fast Refresh, and the row is the most
 * edited file in the package.
 */
export function collectHrefs(item: NavItem): string[] {
  const own = item.href ? [item.href] : []
  if (!item.children) return own
  return item.children.reduce<string[]>(
    (all, child) => all.concat(collectHrefs(child)),
    own,
  )
}
