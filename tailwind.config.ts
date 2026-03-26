import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Source of truth: /styles/design-tokens.ts — duplicated here so Tailwind
      // can read tokens at build time without a runtime import.
      colors: {
        surface:                   "#131313",
        "surface-dim":             "#131313",
        "surface-bright":          "#393939",
        "surface-container":       "#1f2020",
        "surface-container-low":   "#1b1c1c",
        "surface-container-high":  "#2a2a2a",
        "surface-container-highest":"#353535",
        "surface-container-lowest":"#0e0e0e",
        "surface-variant":         "#353535",
        "surface-tint":            "#e9c400",
        background:                "#131313",

        primary:                   "#e9c400",
        "primary-container":       "#3d3200",
        "primary-fixed":           "#ffe16d",
        "primary-fixed-dim":       "#e9c400",
        "on-primary":              "#3a3000",
        "on-primary-container":    "#b69900",
        "on-primary-fixed":        "#221b00",
        "on-primary-fixed-variant":"#544600",
        "inverse-primary":         "#705d00",

        secondary:                 "#78dc77",
        "secondary-container":     "#00761f",
        "secondary-fixed":         "#94f990",
        "secondary-fixed-dim":     "#78dc77",
        "on-secondary":            "#00390a",
        "on-secondary-container":  "#95fb92",
        "on-secondary-fixed":      "#002204",
        "on-secondary-fixed-variant":"#005313",

        tertiary:                  "#9ecaff",
        "tertiary-container":      "#00355d",
        "tertiary-fixed":          "#d1e4ff",
        "tertiary-fixed-dim":      "#9ecaff",
        "on-tertiary":             "#003258",
        "on-tertiary-container":   "#34a0fe",
        "on-tertiary-fixed":       "#001d36",
        "on-tertiary-fixed-variant":"#00497d",

        "on-surface":              "#e4e2e1",
        "on-surface-variant":      "#c4c7c7",
        "on-background":           "#e4e2e1",
        "inverse-on-surface":      "#303030",
        "inverse-surface":         "#e4e2e1",

        outline:                   "#8e9192",
        "outline-variant":         "#444748",

        error:                     "#ffb4ab",
        "error-container":         "#93000a",
        "on-error":                "#690005",
        "on-error-container":      "#ffdad6",
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        body:     ["var(--font-inter)", "sans-serif"],
        label:    ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg:      "0.25rem",
        xl:      "0.5rem",
        full:    "0.75rem",
      },
      boxShadow: {
        card:        "0px 20px 40px rgba(0, 0, 0, 0.4)",
        "card-lg":   "0px 20px 50px rgba(0, 0, 0, 0.5)",
        "wood-bezel":"inset 0 2px 10px rgba(0,0,0,0.8), 0 5px 20px rgba(0,0,0,0.5)",
        "glow-gold": "0 0 25px rgba(233, 196, 0, 0.3)",
        "glow-green":"0 0 10px rgba(120, 220, 119, 0.5)",
        "glow-blue": "0 0 10px rgba(158, 202, 255, 0.5)",
      },
    },
  },
  plugins: [],
}

export default config
