---
name: OnnoRokom Projukti
description: Drafting-sheet assignment and submission workboard for schools and colleges.
colors:
  drafting-paper: "#f4f1ea"
  paper-card: "#fdfcf7"
  paper-sheet: "#fffef9"
  ink: "#1b2430"
  ink-soft: "#5a6472"
  ink-faint: "#8b93a0"
  engineering-blue: "#2050c9"
  blue-deep: "#163a94"
  blue-ink: "#0f2a6e"
  vermillion: "#bf2a1e"
  release-green: "#1a7a4b"
  notice-amber: "#8a6200"
  violet: "#5a3fc4"
  slate: "#4b5563"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 650
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    letterSpacing: "-0.01em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 400
  table:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
  nav:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
  secondary:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 400
  button:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 600
  action-tile:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
  field-error:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 400
  small-button:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 600
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 600
    letterSpacing: "0.12em"
  status:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
  table-header:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.64rem"
    fontWeight: 700
    letterSpacing: "0.12em"
  auth-title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 650
    letterSpacing: "-0.02em"
  stat-value:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 650
    letterSpacing: "-0.02em"
  stat-label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 700
    letterSpacing: "0.13em"
rounded:
  sm: "2px"
  md: "3px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
components:
  button-primary:
    backgroundColor: "{colors.engineering-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.9rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.9rem"
  button-danger:
    backgroundColor: "{colors.vermillion}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.9rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    padding: "0.5rem 0.9rem"
  status:
    textColor: "{colors.ink-soft}"
    padding: "0"
  input:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.55rem 0.7rem"
  stat-block:
    backgroundColor: "{colors.paper-sheet}"
    rounded: "{rounded.md}"
    padding: "{spacing.s4}"
  action-tile:
    backgroundColor: "{colors.paper-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.6rem 0.9rem"
---

# Design System: OnnoRokom Projukti

## Overview

**Creative North Star: "The Drawing Sheet"**

This is not a SaaS dashboard — it is an engineering drawing of the assignment cycle. Every screen is read the way a machinist reads a sheet: warm drafting paper as the ground, hairline ink rules separating information, a title block naming each surface, statuses stamped like rubber inspection marks where any other system would reach for a tinted pill, and engineering-blue as the only active ink. Vermillion appears solely for revision — a late submission, an overdue deadline, a destructive action — because in drafting, red is the color of "change this, this is wrong."

The system refuses the generic "white card + rounded shadow" default outright. Cards are *sheets*: crisp-cornered rectangles with hairline frames and corner registration marks, floating on a faint drafting grid. Tabular numerals everywhere a number appears. Small-caps tracked labels (`.anno`) read like drawing annotations. Nothing is ambiguous; a deadline is a dimension, a status is a stamp, a list is a ruled table.

**Key Characteristics:**
- Warm paper ground with a faint drafting grid; content lives on sheets, never directly on the grid
- Hairline rules and crisp corners (3px max); depth by tonal wash, not heavy shadow
- Blue = active work; vermillion = revision/late/destructive; green = reviewed/complete; gray = dormant (draft)
- Statuses and roles are stamps in cells and cards — 0.66rem uppercase tracked text with a hairline border, a dot, and a tonal wash; never tinted pills
- Tabular numerals for all figures; small-caps tracked labels for all field/annotation text
 - The sidebar is a "drawing index" — a left rail of sheet entries, the active sheet marked as a rounded blue-wash pill

## Colors

The palette reads like ink on drafting paper: warm neutrals for the surface, one engineering blue for active work, and status inks that each carry a single, non-negotiable meaning.

### Primary
- **Engineering Blue** (#2050c9): the system's single active accent — primary buttons, links, focus rings, published/submitted states, the active nav pill. Deepened to **Blue Deep** (#163a94) on hover and **Blue Ink** (#0f2a6e) for stat figures and brand marks. Use sparingly; it is the "ink in use" color.

### Secondary
- **Vermillion** (#bf2a1e): revision ink only. Late/overdue states, destructive buttons, delete icons, error notices, "past due" states. Hover and destructive text deepen to **Red Deep** (#a52318) and **Red Ink** (#7f1d16). If a red element is not a revision or destruction, it is misused.
- **Release Green** (#1a7a4b): reviewed/graded/complete states and success notices. Green never decorates; it always means "finished and approved."
- **Notice Amber** (#8a6200): secondary warnings (e.g. "cannot edit after deadline"). Reserve for tertiary caution, never for the primary late state.
- **Violet** (#5a3fc4): used for class/link metadata accents only.

### Neutral
- **Drafting Paper** (#f4f1ea): the page ground, with a faint drafting grid.
- **Paper Card** (#fdfcf7): secondary tone surface — the sidebar rail.
- **Paper Sheet** (#fffef9): the canonical surface — tables, modals, cards, auth sheet.
- **Ink** (#1b2430): primary text, body, strong rules.
- **Ink Soft** (#5a6472): secondary text, labels, table headers.
- **Ink Faint** (#8b93a0): captions, revision notes, placeholder text.
- **Slate** (#4b5563): dormant/draft state text.

### Named Rules
**The One-Ink Rule.** Blue for active work, vermillion for revision/destruction, green for completion, gray for dormant. Each color means exactly one thing; two states never share an ink. **The Rarity of Red Rule.** Vermillion appears on under ~10% of any screen. Its scarcity is what makes a late state alarming.

## Typography

**Display Font:** system sans stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) — one family across the whole system, because on a drawing the lettering is uniform and the *annotations* carry the hierarchy.
**Body Font:** same system stack.
**Label/Mono Font:** none — figures use tabular numerals (`font-variant-numeric: tabular-nums`), not a mono face.

**Character:** A machined, technical voice: tight display titles, small-caps tracked annotation labels, and clean body text. Hierarchy comes from size, weight, letter-spacing and case rather than font switches.

### Hierarchy
- **Display / Page Title** (650 weight, 1.45rem, -0.02em tracking): the title-block `h1` at the top of every surface. Never larger; the title block, not the hero, sets the tone.
- **Headline / Card Title** (650 weight, 1rem): modal headings and section titles.
- **Title / Card Heading** (600 weight, 0.95rem): inline card and table-row titles.
- **Body** (400 weight, 0.86–0.9rem): content, table cells, inputs, descriptions. Keep to ~75ch max on description text.
- **Secondary Text** (400 weight, 0.84rem): notices, auth-footer links.
- **Nav Entry** (500 weight, 0.85rem): drawing-index sidebar entries.
- **Button** (600 weight, 0.82rem): primary, secondary, danger, ghost.
- **Small Button** (600 weight, 0.74rem): table row actions (Grade / Re-grade).
- **Action Tile** (600 weight, 0.8rem): quick-action tiles on dashboards.
- **Field Error** (400 weight, 0.76rem): inline validation messages.
- **Stat Label** (700 weight, 0.62rem, 0.13em tracking, uppercase): labels on measurement blocks.
- **Status / Role Stamp** (700 weight, 0.66rem, 0.11em tracking, uppercase): `.stamp` statuses and role markers in cells and cards.
- **Table Header** (700 weight, 0.64rem, 0.12em tracking, uppercase): ruled-table column heads.
- **Annotation Label** (600 weight, 0.68rem, 0.12–0.16em tracking, uppercase): `.anno` labels, field labels, title-block revision notes. This small-caps voice is the system's signature.

### Named Rules
**The Annotation Rule.** Every piece of metadata is introduced by a small-caps tracked label, never bare text. If you cannot name the datum, it does not belong on the sheet. **The Tabular Figure Rule.** Any number that can be compared — marks, deadlines, counts — uses tabular numerals so columns and totals align.

## Layout

A fixed left rail ("drawing index," 16rem) plus a fluid main column capped at 6xl (72rem). The rail carries the brand block, the nav entries, and the user block with role text and sign-out. Each surface opens with a **title block**: the page name on the baseline left, the action button and/or a `REV · n items` revision note on the baseline right, closed by a strong hairline rule. Below it, content is laid on `.sheet` surfaces with 16–24px internal padding. Stat rows are 1/2/3/4-column grids that collapse to one column under 768px; card grids are 1/2/3-column (breakpoint 768px / 1024px). Modals center at 8vh from the top, max-width 30rem, and scroll internally rather than shrinking the viewport. Auth screens center a 26rem sheet over a warm classroom-photo backdrop (a paper-tone scrim and radial vignette keep the drafting identity and preserve legibility). The rhythm is the `--s1…--s7` scale (4 / 8 / 12 / 16 / 24 / 32 / 48px); 16px is the workhorse gutter.

## Elevation & Depth

Flat by default — depth is carried by tonal layering and hairline borders, not shadows. Surfaces sit on the paper ground; the difference between "page" and "sheet" is color (warm paper vs. near-white sheet) plus a hairline frame, exactly as a drawing reads. The only shadows are ambient: sheets use `0 1px 2px rgba(27,36,48,0.06), 0 6px 18px -12px rgba(27,36,48,0.18)`; the modal sheet lifts with `0 24px 48px -24px rgba(20,26,35,0.4)` over a 45% scrim; the auth sheet adds `0 24px 48px -28px`. Hover is communicated with a faint blue wash (`rgba(32,80,201,0.045)` on table rows, `0.09` on buttons and nav) — never a grow, never a lift.

### Named Rules
**The Flat-By-Default Rule.** Sheets are flat at rest. Shadows exist only to separate the modal and the auth sheet from the board; everything else uses tone and hairline. **The Blue Wash Rule.** All hover/active feedback is a blue tonal wash, never a shadow or scale change.

## Shapes

Corners carry a deliberate hierarchy: **structural** surfaces stay crisp — `3px` on sheets, cards, modals (`--r`/`--r-sm`) — while **everything clickable rounds off** at `7px` (`--r-btn`) with buttons, action tiles, and the nav entries sitting at full `999px` pills for icon buttons. This is the Interactive Roundness Rule: the more a thing invites a tap, the rounder and more colored it becomes. Drafting still forbids 8px+ roundness on surfaces and any skeuomorphic bevel. Borders are 1px hairlines (`rgba(27,36,48,0.18)` at rest, `0.34` for strong rules like title-block closures and table headers). The signature geometry is the corner registration mark: `.sheet` and `.auth-sheet` carry a small L-shaped tick at their top-left and bottom-right corners, like a machined drawing sheet. Statuses are rubber stamps — small uppercase ink marks with a hairline border, a dot, and a tonal wash; never tinted pills.

## Components

### Buttons
- **Shape:** rounded controls (`7px` radius), 1px border, tabular text, 0.82rem/600.
- **Primary:** Engineering Blue fill, white text. Hover deepens to Blue Deep. This is the only filled blue control.
- **Danger:** Vermillion fill, white text, hover darkens to Red Deep. Reserved for destructive confirms.
- **Secondary:** Slate wash fill, Ink text, hairline-strong border; hover strengthens the wash. Used for Cancel/Back and the sign-out action.
- **Ghost:** transparent, Ink-Soft text, no border; hover gains a faint ink wash.
- **Small (`btn-sm`):** 0.28/0.55rem padding, 0.74rem text — the Grade/Re-grade table action.
- **Icon button:** circular (full pill), fixed 2.1rem, Engineering Blue wash fill with Blue-Ink icon; danger variant uses a Vermillion wash. Hovers deepen the wash.
- **Focus:** 2px Engineering Blue outline at 2px offset on all controls.
- **Disabled:** 50% opacity, `not-allowed` cursor.

### Statuses
- **Style:** `.stamp` — 0.66rem/700 uppercase with 0.11em tracking, 1px current-color border, `--r-sm` radius, a 5px dot before the word, and a tonal wash background.
- **Meaning:** stamps in cells and cards carry the state (Submitted / Due / Overdue / Reviewed / Late / Draft / Published) and roles (Admin / Teacher / Student); color meaning follows the One-Ink Rule — blue active, green reviewed, red late/destructive, amber caution, purple class/link metadata, gray dormant (Draft).

### Cards / Containers (`.sheet`)
- **Corner Style:** crisp (3px radius), with corner registration marks.
- **Background:** Paper Sheet (#fffef9).
- **Border:** 1px hairline frame.
- **Shadow Strategy:** ambient only (see Elevation).
- **Internal Padding:** 16–24px (`--s4`–`--s5`).

### Inputs / Fields
- **Style:** Paper Sheet fill, hairline-strong 1px border, 3px radius, 0.55/0.7rem padding, 0.9rem text.
- **Focus:** border shifts to Engineering Blue with a 3px blue wash ring (`0 0 0 3px rgba(32,80,201,0.09)`).
- **Error:** `aria-invalid` turns the border Vermillion; a 0.76rem field-error line follows.
- **Labels:** always the small-caps annotation voice above the field.

### Navigation (`.nav-item`)
- **Style:** 0.85rem/500 Ink-Soft text, 0.5/0.9rem padding, full pill radius, small icon + label.
- **States:** hover gains a faint ink wash; active is an Engineering Blue wash pill with Blue-Ink text, 600 weight, `aria-current="page"`.

### Table (`.table-sheet`)
- **Style:** full-width, collapsed borders, 0.86rem cells, 0.64rem uppercase tracked headers, strong hairline under headers, hairline row rules, 0.72/0.9rem cell padding, blue-wash row hover. Numbers use tabular figures. All columns — including the Actions column — center their content, so buttons and status text sit on a shared optical axis.

### Signature Components
- **Title Block:** baseline-aligned page title (left) with action button and/or `REV · n items` note (right), closed by a strong hairline. Present on every surface.
- **Stat Block:** hairline-framed Paper Sheet block with a 0.62rem uppercase label and a 2rem/650 Blue-Ink tabular figure — a "measurement note" on the sheet.
- **Auth Sheet:** 26rem centered sheet over the classroom-photo backdrop — translucent paper glass (`blur(8px)`), corner registration marks, a 1px white edge-highlight ring backed by an inset blue-wash halo, a strong lift shadow and outer glow, a brand bar, and a hairline-closed footer link. The edge highlight is the sheet's answer to the photographic ground: it stays readable without a heavy frame.

## Do's and Don'ts

### Do:
- **Do** open every surface with a title block: name left, action/revision note right, strong hairline below.
- **Do** express statuses and roles as stamps and figures as tabular numerals.
- **Do** keep corners at 3px (2px for icon buttons).
- **Do** use vermillion only for late/overdue/destructive — nothing else.
- **Do** introduce every metadata value with a small-caps annotation label.
- **Do** place all content on sheets; the drafting grid is the ground, never a backdrop behind readable content.

### Don't:
- **Don't** use white cards with `rounded-lg`-style 8px+ radius, heavy shadows, or gradient fills — the sheet replaces the card.
- **Don't** render statuses as colored pill backgrounds or bordered badges; use `.stamp` marks.
- **Don't** mix green into constructive buttons or blue into completion states; the One-Ink Rule holds.
- **Don't** let any screen exceed one filled accent color at a time.
- **Don't** add motion to rest states; transitions are brief (0.12–0.15s) color/border fades only.
