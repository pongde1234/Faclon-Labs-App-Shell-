import { useCallback, useEffect, useState } from 'react'
import { AppShell, Breadcrumb, Card, Grid, HelpIcon, Stack } from '@faclon-labs/app-shell'
import type { LinkComponent } from '@faclon-labs/app-shell'

import { NAV, NOTIFICATIONS, USER, trailFor } from './navConfig'
import styles from './demo.module.css'

/**
 * A link that keeps the demo on one page.
 *
 * This is the whole router-agnostic contract, demonstrated: the shell renders
 * `<As href={...}>` and nothing more, so a component like this — or Next's
 * Link, or React Router's — drops straight in. No router is imported anywhere
 * in the shell OR here.
 */
function makeLink(navigate: (path: string) => void): LinkComponent {
  return function DemoLink(props: Record<string, unknown>) {
    const { href, children, ...rest } = props as {
      href?: string
      children?: React.ReactNode
    } & Record<string, unknown>
    return (
      <a
        {...rest}
        href={href ?? '#'}
        onClick={(e) => {
          if (!href) return
          e.preventDefault()
          navigate(href)
          ;(props.onClick as (() => void) | undefined)?.()
        }}
      >
        {children}
      </a>
    )
  }
}

export function DemoPage() {
  // `location.hash` as the store, so deep links and the back button both work
  // without a router dependency.
  const [path, setPath] = useState(() => location.hash.slice(1) || '/')

  useEffect(() => {
    const onHash = () => setPath(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((next: string) => {
    location.hash = next
  }, [])

  const [Link] = useState(() => makeLink(navigate))
  const trail = trailFor(path)

  /**
   * The two axes exist as props, so the demo drives them from real controls
   * rather than leaving them as untested code paths in a package that is about
   * to be extracted.
   */
  const [collapsible, setCollapsible] = useState<'icon' | 'offcanvas' | 'none'>('icon')
  const [side, setSide] = useState<'left' | 'right'>('left')

  return (
    <AppShell
      navItems={NAV}
      currentPath={path}
      linkComponent={Link}
      collapsible={collapsible}
      side={side}
      brand={
        <>
          <span className={styles.logo} aria-hidden="true">
            ◆
          </span>
          <span className={styles.org}>Northwind Ltd</span>
        </>
      }
      topNavContent={<Breadcrumb trail={trail} />}
      // EXTRAS only. The bell and the avatar are the shell's own now — see the
      // notifications/profile props below — so they sit hard right and these
      // land to their left.
      topNavActions={
        <>
          <label className={styles.control}>
            collapse
            <select
              value={collapsible}
              onChange={(e) =>
                setCollapsible(e.target.value as 'icon' | 'offcanvas' | 'none')
              }
            >
              <option value="icon">icon</option>
              <option value="offcanvas">offcanvas</option>
              <option value="none">none</option>
            </select>
          </label>
          <label className={styles.control}>
            side
            <select value={side} onChange={(e) => setSide(e.target.value as 'left' | 'right')}>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </label>
        </>
      }
      notifications={{
        items: NOTIFICATIONS,
        onViewAll: () => navigate('/orders'),
        onSelect: () => navigate('/txns'),
      }}
      profile={{
        user: USER,
        actions: [
          { id: 'profile', label: 'Your profile', onSelect: () => navigate('/team') },
          { id: 'billing', label: 'Billing', onSelect: () => navigate('/billing') },
          { id: 'signout', label: 'Sign out', tone: 'danger', onSelect: () => {} },
        ],
      }}
      footer={
        <a className={styles.help} href="#/help">
          <HelpIcon />
          <span className={styles.helpLabel}>Help</span>
        </a>
      }
    >
      {/*
        * Written the way generated content will be: nothing here sets a margin,
        * and no wrapper invents a gap. Stack, Grid and Card carry the spacing,
        * so the rhythm holds at every depth — which is the whole point of them
        * existing. Deleting a card or nesting another Grid changes nothing.
        */}
      <Stack>
        <Stack gap="spacing.1">
          <h1 className={styles.title}>{trail[trail.length - 1]?.label}</h1>
          <p className={styles.path}>
            <code>{path}</code>
          </p>
        </Stack>

        <Grid>
          <Card title="Total tokens">
            <p className={styles.metric}>6.9M</p>
            <p className={styles.muted}>6.0M in · 933K out</p>
          </Card>
          <Card title="Est. spend">
            <p className={styles.metric}>$0.91</p>
            <p className={styles.muted}>priced from live catalog</p>
          </Card>
          <Card title="Cache reads">
            <p className={styles.metric}>3%</p>
            <p className={styles.muted}>saved ~$0.19</p>
          </Card>
          <Card title="Messages">
            <p className={styles.metric}>499</p>
            <p className={styles.muted}>AI responses</p>
          </Card>
        </Grid>

        <Card title="What this page is proving">
          <ul className={styles.list}>
            <li>Every gap on this page comes from Stack, Grid or Card — nothing sets a margin.</li>
            <li>The Grid above reflows by item width, so it has no breakpoints to get wrong.</li>
            <li>
              Headings and paragraphs carry UA margins; the content area zeroes them, so
              spacing does not change depending on which tag came first.
            </li>
            <li>Depth is derived from context; nothing here passes a level.</li>
            <li>No router is imported — the link component is 15 lines of local code.</li>
          </ul>
        </Card>

        <Grid columns={2}>
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} title={`Row ${i + 1}`}>
              <p className={styles.muted}>
                The top bar and the sidebar stay put while this column scrolls — the
                content area owns the scrollbar, not the document.
              </p>
            </Card>
          ))}
        </Grid>
      </Stack>
    </AppShell>
  )
}
