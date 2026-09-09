import { Tooltip } from '@faclon-labs/fds/tooltip'

/**
 * A Tooltip that can be switched off.
 *
 * design-sdk's Tooltip took `isDisabled`, which several places used to suppress
 * a hint while its own popover was open (or while the label was already on
 * screen). fds has no such prop, so the suppression becomes a branch: when
 * `show` is false the trigger is returned alone, with no wrapper element to
 * disturb the surrounding layout.
 */
export function MaybeTooltip({
  show,
  content,
  placement,
  children,
}: {
  show: boolean
  content: string
  placement?: React.ComponentProps<typeof Tooltip>['placement']
  children: React.ReactElement<Record<string, unknown>>
}) {
  if (!show) return children
  return (
    <Tooltip content={content} placement={placement}>
      {children}
    </Tooltip>
  )
}
