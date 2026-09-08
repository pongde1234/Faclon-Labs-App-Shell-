import { BaseBox } from './BaseBox'
import type { BaseBoxProps } from './BaseBox'
import {
  COLOR,
  ELEVATION,
  FONT_SIZE,
  FONT_WEIGHT,
  LAYER,
  RADIUS,
  SIZE,
  SPACING,
} from './boxTokens'
import type {
  ColorToken,
  ElevationToken,
  FontSizeToken,
  FontWeightToken,
  LayerToken,
  RadiusToken,
  SizeToken,
  SpacingToken,
} from './boxTokens'

/**
 * Box — the layout primitive, restricted to the token scales.
 *
 * This is the one the shell uses. `padding="4"` is checked by the compiler
 * against the spacing scale, so a stray `padding="17px"` is a type error rather
 * than a value that silently escapes the design system. BaseBox stays available
 * underneath for the cases the scales genuinely do not cover.
 *
 * Everything Box does not name — `display`, `position`, `overflow` and the rest
 * — passes through to BaseBox untouched, because those are keywords with no
 * scale behind them. Only the properties that take a *value* are tokenised.
 */

interface BoxTokenProps {
  padding?: SpacingToken
  paddingTop?: SpacingToken
  paddingRight?: SpacingToken
  paddingBottom?: SpacingToken
  paddingLeft?: SpacingToken
  margin?: SpacingToken
  marginTop?: SpacingToken
  marginRight?: SpacingToken
  marginBottom?: SpacingToken
  marginLeft?: SpacingToken
  gap?: SpacingToken

  width?: SizeToken
  height?: SizeToken
  minWidth?: SizeToken
  minHeight?: SizeToken
  maxWidth?: SizeToken
  maxHeight?: SizeToken

  background?: ColorToken
  color?: ColorToken
  borderColor?: ColorToken
  borderRadius?: RadiusToken
  boxShadow?: ElevationToken
  zIndex?: LayerToken
  fontSize?: FontSizeToken
  fontWeight?: FontWeightToken
}

export type BoxProps = BoxTokenProps & Omit<BaseBoxProps, keyof BoxTokenProps>

/** Undefined in, undefined out — so an unset prop never emits `style: {}` noise. */
function look<T extends string>(
  scale: Record<string, string>,
  token: T | undefined,
): string | undefined {
  return token === undefined ? undefined : scale[token]
}

export function Box({
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  gap,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  background,
  color,
  borderColor,
  borderRadius,
  boxShadow,
  zIndex,
  fontSize,
  fontWeight,
  ...rest
}: BoxProps) {
  return (
    <BaseBox
      {...rest}
      padding={look(SPACING, padding)}
      paddingTop={look(SPACING, paddingTop)}
      paddingRight={look(SPACING, paddingRight)}
      paddingBottom={look(SPACING, paddingBottom)}
      paddingLeft={look(SPACING, paddingLeft)}
      margin={look(SPACING, margin)}
      marginTop={look(SPACING, marginTop)}
      marginRight={look(SPACING, marginRight)}
      marginBottom={look(SPACING, marginBottom)}
      marginLeft={look(SPACING, marginLeft)}
      gap={look(SPACING, gap)}
      width={look(SIZE, width)}
      height={look(SIZE, height)}
      minWidth={look(SIZE, minWidth)}
      minHeight={look(SIZE, minHeight)}
      maxWidth={look(SIZE, maxWidth)}
      maxHeight={look(SIZE, maxHeight)}
      background={look(COLOR, background)}
      color={look(COLOR, color)}
      borderColor={look(COLOR, borderColor)}
      borderRadius={look(RADIUS, borderRadius)}
      boxShadow={look(ELEVATION, boxShadow)}
      zIndex={look(LAYER, zIndex)}
      fontSize={look(FONT_SIZE, fontSize)}
      fontWeight={look(FONT_WEIGHT, fontWeight)}
    />
  )
}
