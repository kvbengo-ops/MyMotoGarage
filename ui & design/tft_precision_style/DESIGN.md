---
name: TFT Precision Style
colors:
  surface: '#1b110a'
  surface-dim: '#1b110a'
  surface-bright: '#43372e'
  surface-container-lowest: '#150c06'
  surface-container-low: '#241912'
  surface-container: '#281d15'
  surface-container-high: '#33281f'
  surface-container-highest: '#3f3229'
  on-surface: '#f3dfd1'
  on-surface-variant: '#ddc1ae'
  inverse-surface: '#f3dfd1'
  inverse-on-surface: '#3a2e25'
  outline: '#a48c7a'
  outline-variant: '#564334'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#ff8c00'
  on-primary-container: '#623200'
  inverse-primary: '#904d00'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#85cfff'
  on-tertiary: '#00344c'
  tertiary-container: '#00b5fc'
  on-tertiary-container: '#004360'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#85cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  background: '#1b110a'
  on-background: '#f3dfd1'
  surface-variant: '#3f3229'
typography:
  display-data:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container_padding: 16px
  stack_gap: 12px
  section_gap: 24px
---

## Brand & Style
The brand personality is technical, high-performance, and utilitarian. It targets motorcycle enthusiasts who appreciate the high-fidelity aesthetics of modern Thin-Film-Transistor (TFT) instrument clusters. The UI should evoke the feeling of a cockpit—organized, critical, and instantaneous. 

This design system utilizes a **Tactile / Modern** style. It focuses on high-contrast data visualization and physical-digital hybrid metaphors. Every interaction should feel like toggling a high-end handlebar switch, prioritizing legibility at a glance and a rugged, industrial elegance.

## Colors
The palette is rooted in a deep "Matte Asphalt" background to reduce glare and mimic the housing of a premium dash. "Engine Casing Gray" is used for surfaces to create subtle structural depth. The "Dash Amber" primary accent is reserved for critical information, active states, and call-to-action elements, mirroring the warning and indicator lights of a motorcycle. Semantic colors for diagnostics (green/red) should be used sparingly but with high saturation to ensure visibility.

## Typography
The system uses Inter for its technical clarity and excellent legibility in low-light environments. 
- **Data over Text:** Numerical values and telemetry data use the `display-data` scale to dominate the visual hierarchy.
- **Hierarchical Headers:** Bold weights are mandatory for headings to provide a "glanceable" structure.
- **Labels:** Use `label-caps` for metadata, timestamps, and secondary descriptors to differentiate from interactive body content.

## Layout & Spacing
This design system follows a **fluid grid** model optimized for single-column mobile consumption. 
- **Margins:** A standard 16px lateral margin ensures content does not touch the bezel of the device.
- **Vertical Rhythm:** Elements are stacked using an 8px base grid. Components are typically separated by 12px (`stack_gap`) to maintain a compact, "instrument" feel, while major functional sections are separated by 24px.
- **Alignment:** All data points should be left-aligned for rapid scanning, with numerical values occasionally right-aligned when paired with labels in list rows.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** rather than traditional shadows. 
- **Level 0 (Background):** #121212.
- **Level 1 (Cards/Surfaces):** #222222.
- **Level 2 (Active/Pressed):** A subtle 1px inner stroke of #FFFFFF at 10% opacity is used to define "pressed" or "active" states.

Shadows are avoided to maintain the flat-panel TFT aesthetic. Contrast is instead achieved through color blocking and thin, high-contrast borders (1px) in subtle grays to define the edges of interactive components.

## Shapes
The shape language is defined by the "No Sharp Corners" rule. A base radius of 8px (`rounded-md`) is used for buttons and input fields. Larger containers and cards use a 12px radius (`rounded-lg`). This softens the industrial aesthetic, making the interface feel modern and ergonomically considered, similar to the rounded corners of a physical dash display.

## Components
- **Buttons:** Primary buttons use the Dash Amber background with black text for maximum contrast. Secondary buttons use a #222222 fill with a 1px white border at 20% opacity.
- **Cards:** Cards are the primary container. They use the #222222 background. Header areas within cards should have a distinct bottom border or a slightly lighter background to separate titles from content.
- **Data Gauges:** Horizontal progress bars (linear gauges) should be used for diagnostic health levels, filling with Dash Amber or semantic colors.
- **Inputs:** Fields are dark (#181818) with 8px radius. On focus, the border transitions to Dash Amber.
- **Bottom Navigation:** A persistent, high-blur or solid #121212 bar. Icons are 24px, using Dash Amber for the active state and Secondary Text for inactive states.
- **Status Chips:** Small capsules with a subtle background tint and bold text, used for "Healthy," "Service Due," or "Warning" indicators.