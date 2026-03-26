# CLAUDE.md — Work Leveling Project

## Design System Rules

All UI must match the visual style defined in the Stitch screens located in `/screens/`.
The source of truth for visual decisions is `panel-corporativo-gamificado.html` and the other screens in that folder.

### Theme
- **Dark theme only.** Never use light backgrounds. `html` element must always have the `dark` class.
- Base background: `#131313` (`surface` token). Never use `#ffffff` or any near-white background.
- All "light" text uses `on-surface` (`#e4e2e1`), never pure white.

### Styling
- **Tailwind CSS** for all styling. No inline `style` attributes except when Tailwind cannot express the value (e.g. dynamic widths from data).
- **shadcn/ui** as the base component library, customized to use the design tokens from `/styles/design-tokens.ts`.
- No 1px solid borders to define layout sections — use background color shifts between surface layers instead.

### Colors
Import and use tokens from `/styles/design-tokens.ts`. Never hardcode hex values directly in components.
The Tailwind config must extend colors using these same token names so classes like `bg-surface`, `text-primary`, `border-outline-variant` work throughout.

Module accent colors by domain:
- **Ventas & Leads** → `secondary` (`#78dc77`)
- **Proyectos & Cronograma** → `tertiary` (`#9ecaff`)
- **Alianzas & Contratos** → `primary` (`#e9c400`)
- **Informes & Cumplimiento** → `on-tertiary-container` (`#34a0fe`)
- **Estrategia & Expansión** → `outline` (`#8e9192`)

### Typography
- **Headlines & Display** → `Manrope` (700, 800). Used for KPI values, module titles, hero text.
- **Body & UI** → `Inter` (400, 500, 600). Used for labels, data, nav items, descriptions.
- Nav labels: `text-[10px] font-bold uppercase tracking-widest`
- Section labels: `text-[10px] font-bold uppercase tracking-widest`
- Never use font sizes larger than `text-2xl` for body content; reserve `text-3xl`+ for hero KPIs only.

### Surface Hierarchy (layering)
Stack surfaces in this order, from back to front:

| Layer | Token | Hex |
|---|---|---|
| Base (desk) | `surface` | `#131313` |
| Bezel / Dark Wood | `surface-container-highest` | `#353535` |
| Module cards | `surface-bright` | `#393939` |
| Inset data areas | `surface-container-lowest` | `#0e0e0e` |

### Components

**Wood-Bezel Module**
- Outer frame: `rounded-xl bg-surface-container-highest p-1`
- Inner card: `rounded-lg bg-surface-bright`
- Never put borders between sections — use spacing or color layer shifts.

**Buttons**
- Primary: gradient `from-primary to-primary-fixed-dim`, `rounded-md`, no border, uppercase `text-[10px] tracking-widest`.
- Ghost: no background, `text-on-surface`, hover shows `bg-surface-container-high`.
- Active state: `active:scale-95` or `active:scale-[0.98]`.

**Progress Bars**
- Track: `bg-surface-container-lowest`
- Fill: accent color for the module
- Height: `h-1.5`, `rounded-full`

**Shadows**
- Cards: `shadow-[0px_20px_40px_rgba(0,0,0,0.4)]`
- Never use pure black shadows — tint them toward the surface color.
- Ghost border fallback (accessibility only): `border border-outline-variant/15`

**Transitions**
- Use opacity fades (`transition-opacity`) not Material ripples.
- Sidebar/panel transitions: `transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
- Hover micro-interactions: `hover:translate-x-1`, `hover:scale-[1.02]`.

### Icons
- Use **Material Symbols Outlined** (`material-symbols-outlined`).
- Default variation: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`.
- Active/filled icons: `font-variation-settings: 'FILL' 1`.

### Glassmorphism (modals / floating panels)
- Background: `surface-variant` at 60% opacity.
- Backdrop blur: 20px.
- Applied to: modals, quick-action panels, tooltips.

### Layout
- Scrollable containers use `no-scrollbar` (hide scrollbar, keep scroll behavior).
- Snap carousels: `snap-x snap-mandatory scroll-smooth`.
- Max content width: `max-w-[1600px] mx-auto`.
- Minimum `spacing-10` (2.5rem) between major module groups.
