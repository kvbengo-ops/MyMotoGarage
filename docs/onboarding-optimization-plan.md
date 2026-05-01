# Onboarding Optimization Plan
# PersonalGarage — Motorcycle Setup Flow
# Date: April 30, 2026
# ─────────────────────────────────────────────────

## Problem Statement

Adding a motorcycle currently requires 2 screens × 6 steps with 20+ manual input
fields. Most of these fields (displacement, weight, fuel capacity, consumption,
category) are static facts about the motorcycle model that the user should never
have to type manually.

Current flow time: ~5-8 minutes per bike.
Target flow time: ~45 seconds per bike.


## Current Flow (2 Screens)

### Screen 1: AddVehicle (AddVehicle.jsx)
  - Upload & crop photo
  - Pick brand from grid (11 brands)
  - Type model name manually
  - Type year manually
  - Select category from dropdown
  - Enter initial odometer

### Screen 2: VehicleSetupWizard (VehicleSetupWizard.jsx)
  Step 1 — General Info (7 fields):
    - Bike condition (Brand New / Used)
    - Riding habit (dropdown)
    - Engine displacement (cc)
    - Weight (kg)
    - Fuel type (Standard / Premium)
    - Fuel capacity (L)
    - Fuel consumption (km/L)

  Steps 2-6 — Components (per category: Drivetrain, Tires, Brakes, Oils, Electronics):
    Per component added (5-7 fields each):
      - Component name
      - Brand
      - Model
      - Replacement threshold (km)
      - Wear state (Brand New / Currently Used)
      - Estimated km used (if used)
      - Last service date (if time-degrading)


## Friction Points

  1. Model name is typed manually — should be searchable/selectable
  2. Year is typed manually — should auto-populate from model selection
  3. Category is selected manually — already known per model
  4. Displacement, weight, fuel specs are all typed — these are factory specs
  5. Component setup requires building each part from scratch across 5 steps
  6. Users must know replacement thresholds (most don't)


## Proposed Solution: 3-Layer Approach

### Layer 1: Motorcycle Specs Database (HIGH IMPACT)

  Create a local JSON database (src/data/bikeSpecs.js) indexed by (make, model).
  When the user selects a brand and searches for a model, ALL technical specs
  are auto-filled.

  Fields eliminated from manual entry:
    - Engine displacement (cc)
    - Weight (kg)
    - Fuel type
    - Fuel capacity (L)
    - Fuel consumption (km/L)
    - Category / style
    - Year (auto-suggest available years)

  Implementation:
    - New file: src/data/bikeSpecs.js
      ~5-8 popular models per brand (≈60 entries)
      Each entry: { make, model, years[], cc, weight, fuelType, fuelCapacity,
                    fuelConsumption, category }

    - Modify: AddVehicle.jsx
      Replace manual model input with searchable dropdown filtered by selected brand.
      On model selection → auto-fill year, category, and pass specs forward.

    - Modify: VehicleSetupWizard.jsx
      Pre-populate cc/weight/fuel fields from spec lookup.
      Show as read-only with "edit" toggle for corrections.

    - Modify: vehicleController.js (backend)
      Accept spec fields during addVehicle POST so General Info step can be skipped.


### Layer 2: Smart Component Presets + Clean Slate Setup (HIGH IMPACT)

  Based on the motorcycle's category, offer a "Quick Setup" that pre-fills
  common components with industry-standard replacement thresholds.

  Quick Setup presets per category type:

    Naked / Streetfighter:
      Drivetrain: Drive Chain (25,000km), Front Sprocket (30,000km), Rear Sprocket (30,000km)
      Tires: Front Tire (12,000km), Rear Tire (8,000km)
      Brakes: Front Brake Pads (15,000km), Rear Brake Pads (20,000km)
      Oils: Engine Oil (5,000km), Coolant (24,000km)
      Electronics: Battery (40,000km)

    (Similar presets for Sportbike, Cruiser, Adventure/Touring, etc.)

  UX Change:
    After General Info step, show a choice screen:
      ⚡ Quick Setup — Pre-fill common parts for your bike type
      🔧 Custom Setup — Add each component manually (current flow)

    Quick Setup fills ALL 5 category steps at once.
    User just reviews, optionally tweaks brand/model names, hits "Complete Setup".


  #### Clean Slate Setup (Layer 2 Modifier)

  Most users download the app right after buying a new bike or completing a
  full service — they want to track maintenance from a clean starting point.
  Asking them to estimate current wear on every component is the highest-
  friction step in the wizard and the #1 cause of bad data or abandonment.

  When Quick Setup is selected, offer a wear-state selector with two modes:

    🏍️ Brand New Bike:
      All components initialized to 0 km wear.
      Last service date set to today.
      Best for: users who just purchased a brand-new motorcycle.

    🔧 Fresh Service:
      Consumables (engine oil, brake pads, chain, sprockets) → 0 km wear.
      Long-life items (battery, coolant, tires) → marked as "Unknown".
      Dashboard will nudge the user to inspect/confirm those items later.
      Best for: used bike owners who just did a baseline service.

    📋 I'll Estimate Myself:
      Falls through to the current per-component wear review (default).
      For experienced owners who know their part history.

  This modifier eliminates the per-component wear estimation step for the
  ~80% of users whose answer is effectively "everything is fresh." It
  composes with the Quick Setup presets: presets answer WHAT to track +
  thresholds, Clean Slate answers WHERE you are in the wear cycle.

  Note: This is an explicit user choice, NOT auto-inferred from odometer.
  A user at 15,000 km may still want a Fresh Service reset; a user at 0 km
  on a demo bike may not mean "brand new everything."


### Layer 3: Progressive Setup (OPTIONAL)

  Don't force all setup upfront. Merge General Info into AddVehicle screen
  so there's only ONE screen before the dashboard.

  Component setup happens per-category from the diagnostic dashboard via the
  "Set Up" CTA button we already built on locked category cards.

  Flow:
    Add Vehicle (with auto-filled specs) → Dashboard (locked cards visible)
    User taps "Set Up" on any category → mini setup for just that category
    Done when they want, at their own pace.


## Recommended Implementation Order

  Phase 1: bikeSpecs.js database + model search in AddVehicle
           → Eliminates 5+ manual fields
           → Effort: 1 session

  Phase 2a: Component presets + Quick Setup choice screen
            → Reduces 5 wizard steps to 1 review step
            → Effort: 1 session

  Phase 2b: Clean Slate wear-state selector
            → Eliminates per-component wear estimation for ~80% of users
            → Builds on Phase 2a's Quick Setup path
            → Effort: 0.5 session

  Phase 3 (optional): Merge General Info into AddVehicle
           → Collapses 2 screens into 1
           → Effort: 0.5 session


## End-State User Experience

  Best case (Brand New Bike + Quick Setup):
    1. Tap "Add Vehicle"                              →  1 second
    2. Pick brand from grid                           →  2 seconds
    3. Search/tap model (e.g. "MT-07")                →  3 seconds (specs auto-filled)
    4. Enter odometer "0"                             →  2 seconds
    5. Upload photo (optional)                        →  5 seconds
    6. Submit → bike appears on dashboard             →  2 seconds
    7. Tap "Set Up" on dashboard                      →  1 second
    8. Choose "Quick Setup"                           →  2 seconds
    9. Select "Brand New Bike" → all wear = 0         →  1 second
    10. Confirm → Done ✅                              →  1 second
    Total: ~20 seconds

  Typical case (Used bike + Fresh Service):
    1. Tap "Add Vehicle"                              →  1 second
    2. Pick brand from grid                           →  2 seconds
    3. Search/tap model (e.g. "MT-07")                →  3 seconds (specs auto-filled)
    4. Enter odometer "12500"                         →  3 seconds
    5. Upload photo (optional)                        →  5 seconds
    6. Submit → bike appears on dashboard             →  2 seconds
    7. Tap "Set Up" on dashboard                      →  1 second
    8. Choose "Quick Setup" → all parts pre-filled    →  2 seconds
    9. Select "Fresh Service" → consumables zeroed    →  1 second
    10. Review long-life items flagged as unknown      →  10 seconds
    11. Confirm → Done ✅                              →  1 second
    Total: ~35 seconds


## Files Affected

  NEW:
    src/data/bikeSpecs.js — Motorcycle specifications database

  MODIFIED:
    src/pages/AddVehicle.jsx — Model search, auto-fill integration
    src/pages/VehicleSetupWizard.jsx — Quick Setup, preset injection, read-only fields
    src/data/brandLogos.js — Possibly add model lists per brand
    backend/src/controllers/vehicleController.js — Accept specs in addVehicle
