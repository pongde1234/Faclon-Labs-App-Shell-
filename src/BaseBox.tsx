import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react'

/**
 * BaseBox — the layout primitive everything in the shell is built on.
 *
 * Blade's split, followed deliberately: `BaseBox` takes RAW CSS values and is
 * the escape hatch; `Box` (see Box.tsx) takes TOKEN NAMES, resolves them, and
 * is what the rest of the shell uses. Anything reaching for BaseBox directly is
 * declaring that it needs a value the token scales do not have — which makes
 * that a reviewable event rather than an invisible one.
 *
 * HOW STYLES ARE APPLIED, and its one real limit: props become an inline
 * `style` object. That covers every static box property, but inline styles
 * cannot express a media query, a pseudo-class, or a descendant selector. So:
 *
 *     static box properties  →  props
 *     responsive / :hover / :focus-visible / descendant rules  →  className
 *
 * Both land on the same element and inline wins on specificity, so a property
 * must be owned by ONE of the two — never set in both. Every call site in the
 * shell splits along that line, and the module CSS that remains is exclusively
 * media queries, interaction states and `:global` collapsed-rail rules.
 *
 * This is why there is no responsive-array prop (Blade has one). Supporting
 * `padding={['spacing.2', 'spacing.4']}` needs generated classes or a
 * style element, which is a build-time machine the shell does not have and
 * cannot take a dependency for.
 */

/**
 * The CSS properties BaseBox forwards. A list rather than "anything goes":
 * it is what separates a style prop from a DOM prop below, and it keeps the
 * primitive to layout — a box that can set `font-family` becomes the place
 * every one-off style ends up.
 */
const CSS_PROPS = [
  // flex + grid
  'display',
  'flexDirection',
  'alignItems',
  'justifyContent',
  'flexWrap',
  'flex',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumn',
  'gridRow',
  'gridAutoRows',
  'gridAutoFlow',
  'alignSelf',
  'justifySelf',
  'alignContent',
  'gap',
  // spacing
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  // size
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'boxSizing',
  // overflow
  'overflow',
  'overflowX',
  'overflowY',
  // position
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'zIndex',
  // paint
  'background',
  'backgroundColor',
  'borderRadius',
  'borderWidth',
  'borderStyle',
  'borderColor',
  'borderBottom',
  'borderRight',
  'borderTop',
  'boxShadow',
  'opacity',
  // text — the minimum a container needs to set for its subtree
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'textAlign',
  'whiteSpace',
  'listStyle',
  'transition',
  'cursor',
  'userSelect',
] as const

type CssProp = (typeof CSS_PROPS)[number]

/** Set once at module scope — rebuilding it per render would run on every box. */
const CSS_PROP_SET: ReadonlySet<string> = new Set(CSS_PROPS)

export type BaseBoxStyleProps = {
  [K in CssProp]?: string
}

export interface BaseBoxOwnProps extends BaseBoxStyleProps {
  /** The element rendered. `div` by default; `header`, `nav`, `main`, `ul`… */
  as?: ElementType
  className?: string
  children?: ReactNode
  /** Merged last, so it wins over the style props. A hatch inside a hatch. */
  style?: CSSProperties
}

export type BaseBoxProps = BaseBoxOwnProps &
  Omit<ComponentPropsWithoutRef<'div'>, keyof BaseBoxOwnProps>

export function BaseBox({
  as: As = 'div',
  className,
  children,
  style,
  ...rest
}: BaseBoxProps) {
  // One pass, splitting style props from everything the DOM should receive —
  // `id`, `role`, `aria-*`, `data-*`, `onClick`, `tabIndex` and the rest all
  // pass straight through, so a Box is never a barrier to an attribute.
  const css: Record<string, string> = {}
  const dom: Record<string, unknown> = {}
  for (const key of Object.keys(rest)) {
    const value = (rest as Record<string, unknown>)[key]
    if (value === undefined) continue
    if (CSS_PROP_SET.has(key)) css[key] = value as string
    else dom[key] = value
  }

  return (
    <As className={className} style={{ ...css, ...style }} {...dom}>
      {children}
    </As>
  )
}
