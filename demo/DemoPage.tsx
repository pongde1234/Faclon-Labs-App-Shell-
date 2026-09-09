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
          <span className={styles.org}>Faclon Labs</span>
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
        onViewAll: () => navigate('/devices'),
        onSelect: () => navigate('/steamtrap'),
      }}
      profile={{
        user: USER,
        actions: [
          { id: 'profile', label: 'Your profile', onSelect: () => navigate('/') },
          { id: 'settings', label: 'Settings', onSelect: () => navigate('/tools') },
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
        * A page written the way generated content will be: nothing here sets a
        * margin and no wrapper invents a gap. Stack, Grid and Card carry the
        * spacing, so the rhythm holds at every depth — 16px between blocks,
        * 8px inside a card. Deleting a tile or nesting another Grid changes
        * nothing.
        */}
      <Stack>
        <Stack gap="spacing.1">
          <h1 className={styles.title}>{trail[trail.length - 1]?.label}</h1>
          <p className={styles.path}>
            <code>{path}</code>
          </p>
        </Stack>

        <Grid>
          <Card title="Active devices">
            <p className={styles.metric}>1,284</p>
            <p className={styles.muted}>across 24 sites</p>
          </Card>
          <Card title="Energy today">
            <p className={styles.metric}>84.2 MWh</p>
            <p className={styles.muted}>+3.1% vs yesterday</p>
          </Card>
          <Card title="Open alerts">
            <p className={styles.metric}>7</p>
            <p className={styles.muted}>2 critical</p>
          </Card>
          <Card title="Uptime">
            <p className={styles.metric}>99.4%</p>
            <p className={styles.muted}>rolling 30 days</p>
          </Card>
        </Grid>

        <Grid columns={2}>
          <Card title="Steam trap health">
            <p className={styles.muted}>
              Traps reporting above threshold in the last hour, by plant. Replace this
              with a chart — the Card supplies the surface and the spacing, nothing else.
            </p>
          </Card>
          <Card title="Recent runs">
            <p className={styles.muted}>
              The last workflow executions with their trigger and outcome. The content
              area owns the scrollbar, so this column scrolls while the chrome stays put.
            </p>
          </Card>
        </Grid>
      </Stack>
    </AppShell>
  )
}
