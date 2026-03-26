/**
 * Design tokens extracted from the Stitch screens in /screens/
 * Source of truth: panel-corporativo-gamificado.html (The Executive Atelier design system)
 *
 * Import these into your Tailwind config and any component that needs direct access to values.
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colors = {
  // Base surfaces — stack these from back to front
  surface:                  "#131313", // base layer / desk surface
  surfaceDim:               "#131313",
  surfaceBright:            "#393939", // module cards
  surfaceContainer:         "#1f2020",
  surfaceContainerLow:      "#1b1c1c",
  surfaceContainerHigh:     "#2a2a2a",
  surfaceContainerHighest:  "#353535", // dark-wood bezel
  surfaceContainerLowest:   "#0e0e0e", // inset data areas
  surfaceVariant:           "#353535",
  surfaceTint:              "#e9c400",
  background:               "#131313",

  // Primary — gold / contracts & alliances accent
  primary:               "#e9c400",
  primaryContainer:      "#3d3200",
  primaryFixed:          "#ffe16d",
  primaryFixedDim:       "#e9c400",
  onPrimary:             "#3a3000",
  onPrimaryContainer:    "#b69900",
  onPrimaryFixed:        "#221b00",
  onPrimaryFixedVariant: "#544600",
  inversePrimary:        "#705d00",

  // Secondary — green / sales & leads accent
  secondary:               "#78dc77",
  secondaryContainer:      "#00761f",
  secondaryFixed:          "#94f990",
  secondaryFixedDim:       "#78dc77",
  onSecondary:             "#00390a",
  onSecondaryContainer:    "#95fb92",
  onSecondaryFixed:        "#002204",
  onSecondaryFixedVariant: "#005313",

  // Tertiary — blue / projects & schedule accent
  tertiary:               "#9ecaff",
  tertiaryContainer:      "#00355d",
  tertiaryFixed:          "#d1e4ff",
  tertiaryFixedDim:       "#9ecaff",
  onTertiary:             "#003258",
  onTertiaryContainer:    "#34a0fe", // reports & compliance accent
  onTertiaryFixed:        "#001d36",
  onTertiaryFixedVariant: "#00497d",

  // On-surface / text
  onSurface:        "#e4e2e1", // default text — never use pure white
  onSurfaceVariant: "#c4c7c7",
  onBackground:     "#e4e2e1",
  inverseOnSurface: "#303030",
  inverseSurface:   "#e4e2e1",

  // Borders & dividers
  outline:        "#8e9192", // strategy & expansion accent; default icon/muted color
  outlineVariant: "#444748",

  // Error
  error:            "#ffb4ab",
  errorContainer:   "#93000a",
  onError:          "#690005",
  onErrorContainer: "#ffdad6",
} as const;

export type ColorToken = keyof typeof colors;

// ---------------------------------------------------------------------------
// Module accent map — use these to pick the right color per domain
// ---------------------------------------------------------------------------

export const moduleAccents = {
  "ventas-leads":          colors.secondary,
  "proyectos-cronograma":  colors.tertiary,
  "alianzas-contratos":    colors.primary,
  "informes-cumplimiento": colors.onTertiaryContainer,
  "estrategia-expansion":  colors.outline,
} as const;

export type ModuleAccentKey = keyof typeof moduleAccents;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const fonts = {
  headline: ["Manrope", "sans-serif"],  // display, headlines, KPI values
  body:     ["Inter", "sans-serif"],    // UI labels, data, descriptions
  label:    ["Inter", "sans-serif"],    // small caps labels
} as const;

export const fontWeights = {
  regular:   "400",
  medium:    "500",
  semibold:  "600",
  bold:      "700",
  extrabold: "800",
} as const;

export const typescale = {
  displayLg:   { size: "3.5rem",   font: "headline", weight: fontWeights.extrabold }, // hero KPIs
  headlineMd:  { size: "1.75rem",  font: "headline", weight: fontWeights.bold },      // module titles
  titleSm:     { size: "1rem",     font: "body",     weight: fontWeights.semibold },  // card headers
  labelMd:     { size: "0.75rem",  font: "label",    weight: fontWeights.bold },      // ALL CAPS labels
  labelSm:     { size: "0.625rem", font: "label",    weight: fontWeights.bold },      // micro-copy
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export const radius = {
  DEFAULT: "0.125rem",
  lg:      "0.25rem",   // inner cards
  xl:      "0.5rem",    // module bezel outer frame
  full:    "0.75rem",   // pills / badges
} as const;

// ---------------------------------------------------------------------------
// Spacing scale (multiplier = 2 from base 0.25rem)
// ---------------------------------------------------------------------------

export const spacing = {
  1:  "0.25rem",
  2:  "0.5rem",
  3:  "0.75rem",
  4:  "1rem",
  6:  "1.5rem",
  8:  "2rem",
  10: "2.5rem",  // minimum gap between major module groups
  12: "3rem",
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const shadows = {
  card:        "0px 20px 40px rgba(0, 0, 0, 0.4)",
  cardLg:      "0px 20px 50px rgba(0, 0, 0, 0.5)",
  woodBezel:   "inset 0 2px 10px rgba(0,0,0,0.8), 0 5px 20px rgba(0,0,0,0.5)",
  primaryGlow: "0 0 20px rgba(233, 196, 0, 0.1)",
  secondary:   "0 4px 6px rgba(120, 220, 119, 0.1)",
} as const;

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

export const transitions = {
  sidebar:   "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  panel:     "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  hover:     "opacity 0.1s ease-in-out",
} as const;

// ---------------------------------------------------------------------------
// Glassmorphism (modals / floating panels)
// ---------------------------------------------------------------------------

export const glass = {
  background:    `${colors.surfaceVariant}99`, // 60% opacity
  backdropBlur:  "20px",
} as const;

// ---------------------------------------------------------------------------
// Tailwind config extension — spread this into theme.extend
// ---------------------------------------------------------------------------

export const tailwindTokens = {
  colors: {
    // Map all color tokens to Tailwind-compatible kebab-case keys
    "surface":                   colors.surface,
    "surface-dim":               colors.surfaceDim,
    "surface-bright":            colors.surfaceBright,
    "surface-container":         colors.surfaceContainer,
    "surface-container-low":     colors.surfaceContainerLow,
    "surface-container-high":    colors.surfaceContainerHigh,
    "surface-container-highest": colors.surfaceContainerHighest,
    "surface-container-lowest":  colors.surfaceContainerLowest,
    "surface-variant":           colors.surfaceVariant,
    "surface-tint":              colors.surfaceTint,
    "background":                colors.background,
    "primary":                   colors.primary,
    "primary-container":         colors.primaryContainer,
    "primary-fixed":             colors.primaryFixed,
    "primary-fixed-dim":         colors.primaryFixedDim,
    "on-primary":                colors.onPrimary,
    "on-primary-container":      colors.onPrimaryContainer,
    "on-primary-fixed":          colors.onPrimaryFixed,
    "on-primary-fixed-variant":  colors.onPrimaryFixedVariant,
    "inverse-primary":           colors.inversePrimary,
    "secondary":                 colors.secondary,
    "secondary-container":       colors.secondaryContainer,
    "secondary-fixed":           colors.secondaryFixed,
    "secondary-fixed-dim":       colors.secondaryFixedDim,
    "on-secondary":              colors.onSecondary,
    "on-secondary-container":    colors.onSecondaryContainer,
    "on-secondary-fixed":        colors.onSecondaryFixed,
    "on-secondary-fixed-variant":colors.onSecondaryFixedVariant,
    "tertiary":                  colors.tertiary,
    "tertiary-container":        colors.tertiaryContainer,
    "tertiary-fixed":            colors.tertiaryFixed,
    "tertiary-fixed-dim":        colors.tertiaryFixedDim,
    "on-tertiary":               colors.onTertiary,
    "on-tertiary-container":     colors.onTertiaryContainer,
    "on-tertiary-fixed":         colors.onTertiaryFixed,
    "on-tertiary-fixed-variant": colors.onTertiaryFixedVariant,
    "on-surface":                colors.onSurface,
    "on-surface-variant":        colors.onSurfaceVariant,
    "on-background":             colors.onBackground,
    "inverse-on-surface":        colors.inverseOnSurface,
    "inverse-surface":           colors.inverseSurface,
    "outline":                   colors.outline,
    "outline-variant":           colors.outlineVariant,
    "error":                     colors.error,
    "error-container":           colors.errorContainer,
    "on-error":                  colors.onError,
    "on-error-container":        colors.onErrorContainer,
  },
  fontFamily: {
    headline: fonts.headline,
    body:     fonts.body,
    label:    fonts.label,
  },
  borderRadius: radius,
  boxShadow: shadows,
} as const;
