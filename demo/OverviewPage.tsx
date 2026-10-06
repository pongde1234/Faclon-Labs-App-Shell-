import { useState } from 'react'
// EVERY SURFACE ON THE PAGE COMES FROM THE SDK — Card, Alert, LineChart. Not a
// hand-rolled <div> with a border and a radius: a div dressed as a card will
// not follow the theme, will not match the next page, and will drift the moment
// the SDK's own card changes. The one exception is LAYOUT (the grid below),
// because arranging cards is not a component the SDK ships.
import { Alert } from '@faclon-labs/design-sdk/Alert'
import { Card, CardBody, CardHeader, CardHeaderLeading } from '@faclon-labs/design-sdk/Card'
import { LineChart } from '@faclon-labs/design-sdk/LineChart'

/**
 * The Overview dashboard — the page inside the iosense chrome.
 *
 * IT IS THE HOST'S, not the shell's. `IosenseShell` renders `children`
 * verbatim and has no opinion about what a page is; everything here is content
 * this demo owns, the same way the nav rows are.
 *
 * NOTHING HERE SETS AN OUTER MARGIN. The 16px above, beside and between these
 * blocks is the content container's — `.app-main-scroll` owns the whole spacing
 * rule (16px left, right and top, none at the bottom, 16px between blocks).
 * Delete a card or add a row and the rhythm does not change, because no block
 * on this page owns it. That is the property the demo exists to demonstrate, so
 * adding a margin here would make it lie.
 */

/** A week of energy, in MWh. Invented — this is a demo, not a reading. */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const THIS_WEEK = [41, 44, 39, 47, 52, 49, 48]
const LAST_WEEK = [38, 40, 41, 43, 45, 42, 44]

const STATS = [
  { title: 'Energy today', subtitle: 'All sites', value: '48.2 MWh' },
  { title: 'Peak demand', subtitle: 'Since midnight', value: '3.1 MW' },
  { title: 'Steam trap health', subtitle: 'Across all sites', value: '98.2%' },
  { title: 'Open alerts', subtitle: 'Needs a look', value: '7' },
]

const RECENT_ALERTS = [
  { id: 'a1', title: 'High temperature in Zone A', where: 'Zomato · 5th floor', when: '15:50' },
  { id: 'a2', title: 'VRV 2 communication failure', where: 'Zomato · 5th floor', when: '10:15' },
  { id: 'a3', title: 'Steam trap ST-114 failed open', where: 'Site 7 · Boiler house', when: '09:02' },
  { id: 'a4', title: 'Consumption trigger "mwh" fired', where: 'Trigger engine', when: '08:30' },
]

export function OverviewPage() {
  // The banner is dismissible, so it needs somewhere to remember that. Page
  // state, not shell state — the shell knows nothing about this page.
  const [showBanner, setShowBanner] = useState(true)

  return (
    <>
      <h1 className="page-title">Overview</h1>

      {/* Layout is ours; every surface inside it is the SDK's. */}
      <div className="demo-grid">
        {STATS.map((stat) => (
          <Card key={stat.title} padding="spacing.5">
            <CardHeader>
              <CardHeaderLeading title={stat.title} subtitle={stat.subtitle} />
            </CardHeader>
            <CardBody>
              <p className="demo-metric-value">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* The chart brings its OWN card wrapper, header and toolbar — so it is
          not wrapped in a <Card>. `showInfo` / `showSettings` / `showMore` are
          what draw the three icons at the top right of its header. */}
      <LineChart
        title="Energy use"
        categories={DAYS}
        yAxisUnit=" MWh"
        showMarkers
        showInfo
        showSettings
        showMore
        onInfoClick={() => {}}
        onSettingsClick={() => {}}
        onMoreClick={() => {}}
        series={[
          // The marker SHAPE is what separates the two series for anyone who
          // cannot rely on the colour difference — the DOM legend draws the
          // same marker it plots.
          { name: 'This week', data: THIS_WEEK, marker: { symbol: 'circle' } },
          { name: 'Last week', data: LAST_WEEK, marker: { symbol: 'diamond' } },
        ]}
      />

      {showBanner && (
        <Alert
          color="Notice"
          title="Two chillers are due for service"
          description="Chiller A and Chiller B pass 2,000 running hours this week."
          // Full width puts the × at the top right and stacks the body under
          // the title, which is the layout a page-level banner wants.
          isFullWidth
          isDismissible
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <Card padding="spacing.5">
        <CardHeader showDivider>
          <CardHeaderLeading title="Recent alerts" subtitle="Last 24 hours" />
        </CardHeader>
        <CardBody>
          <ul className="alert-list">
            {RECENT_ALERTS.map((alert) => (
              <li key={alert.id} className="alert-row">
                <span className="alert-row-title">{alert.title}</span>
                <span className="alert-row-meta">
                  {alert.where} · {alert.when}
                </span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </>
  )
}

/**
 * What every other nav row shows.
 *
 * The dashboard above is the Overview page specifically, and pretending it is
 * also the Devices page would be the demo lying about what it has. This states
 * the page it is standing in for instead.
 */
export function PlaceholderPage({ id, title }: { id: string; title: string }) {
  return (
    <Card padding="spacing.5">
      <CardHeader>
        <CardHeaderLeading title={title} subtitle={`Page id: ${id}`} />
      </CardHeader>
      <CardBody>
        <p className="demo-text">
          This page has no content in the demo. The chrome around it — the rail,
          the top bar, the breadcrumb, the menus and the container this sits in —
          is <code>@faclon-labs/iosense-shell</code>. Open <strong>Home</strong>{' '}
          for a page with something in it.
        </p>
      </CardBody>
    </Card>
  )
}
