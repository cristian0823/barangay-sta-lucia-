# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Barangay Sta. Lucia Management System — a two-portal web app for a Philippine barangay (local government unit). Deployed as two separate Vercel projects from sub-directories:

- **User portal** → `user-portal/` → `https://barangay-sta-lucia-user.vercel.app`
- **Admin portal** → `admin-portal/` → `https://barangay-sta-lucia-admin.vercel.app`

Backend is **Supabase** (project `cojgsyrnexbwgsfttojq`). No build step — static HTML/JS/CSS deployed directly.

## Deployment

```bash
# Stage and push — Vercel auto-redeploys on push to main
git add user-portal/user-dashboard.html admin-portal/admin.html
git commit -m "..."
git push origin main
```

No local dev server needed. Open HTML files directly in a browser, or use a simple static server. There are no npm scripts, no build pipeline, and no test runner.

## JS Syntax Checking

After modifying either main SPA file, always verify the inline script block:

```bash
node -e "
const fs = require('fs');
const h = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');
const si = h.lastIndexOf('<script>'); const ei = h.lastIndexOf('</script>');
fs.writeFileSync('test-syntax.js', h.substring(si+8, ei));
"
node --check test-syntax.js

# Same for admin:
node -e "
const fs = require('fs');
const a = fs.readFileSync('admin-portal/admin.html', 'utf8');
const si = a.lastIndexOf('<script>'); const ei = a.lastIndexOf('</script>');
fs.writeFileSync('test-admin-syntax.js', a.substring(si+8, ei));
"
node --check test-admin-syntax.js
```

## Architecture

### Two monolithic SPAs

Each portal is effectively a **single large HTML file** with all HTML, inline CSS, and JS in one place:

| File | Role |
|------|------|
| `user-portal/user-dashboard.html` | Resident SPA — all panels |
| `admin-portal/admin.html` | Admin SPA — all sections |

These files are the **source of truth**. The root-level `*.html` files (`user-dashboard.html`, `admin.html`) are stale backups — do not edit them.

### Shared JS (duplicated per portal)

Each portal has its own copy under `user-portal/js/` and `admin-portal/js/`:

| File | Purpose |
|------|---------|
| `app.js` (~4100 lines) | All business logic: auth, CRUD, TOTP, audit logging, `getCurrentUser()`, `requireAdmin()`, `requireUser()` |
| `supabase-config.js` | Supabase client initialization |
| `portal-config.js` | Sets `window.__PORTAL__`, `__ADMIN_PORTAL_URL__`, `__USER_PORTAL_URL__` |
| `portal-overrides.js` | Patches `redirectToDashboard`, `requireAdmin`, `requireUser` for cross-portal redirects |
| `crypto-utils.js` | Password hashing / encryption helpers |
| `totp-handler.js` | 2FA TOTP logic |
| `incident-manager.js` | Security incident detection and logging |
| `darkmode.js` | Dark mode toggle (user portal only) |
| `realtime-listeners.js` | Supabase realtime subscriptions (user portal only) |

When modifying shared logic, edit both `user-portal/js/app.js` and `admin-portal/js/app.js` unless the change is portal-specific.

### Supabase tables

`users`, `borrowings`, `concerns`, `events`, `facility_reservations`, `residents`, `audit_log`, `security_log`, `user_notifications`

### Auth pattern

Sessions stored in `sessionStorage` (primary) and `localStorage` (fallback) under the key `currentUser` as a JSON object with `{ id, username, role, fullName, ... }`. Each SPA has an **early auth guard** — an inline `<script>` before any external JS loads that reads `currentUser` and redirects immediately if auth fails.

**Resident login is passwordless** — `loginUser()` in `app.js` only validates the password for admin-role accounts. Any resident (`role: 'user'`) that exists in the `users` table is accepted regardless of the password field. Admins require correct SHA-256-hashed password.

## User Portal Navigation

`showPanel(panelId)` switches between panels. Panel IDs: `dashboard`, `equipment`, `concerns`, `booking`, `events`, `history`, `profile`, `settings`. Each panel is a `<div id="panel-{id}" class="content-panel">`.

Internal tab switchers per panel:
- `switchEquipTab('catalog'|'history')` — Equipment panel
- `switchConcernTab('form'|'history')` — Concerns panel
- `switchBookingTab('calendar'|'history')` — Booking/Facility panel

Each panel (except dashboard) has a breadcrumb: `Dashboard › Page Name` rendered as a small div before the `<h2>`.

## Admin Portal Navigation

`switchSection(sectionId, btnEl)` shows/hides admin sections. Section IDs: `overview`, `court-bookings`, `requests`, `concerns`, `users`, `events`, `equipment`, `audit-log`, `security-log`, `analytics`.

The `events` section (Court Events) has internal tab switching via `switchEventsTab('calendar'|'schedule')` — "Court Events" shows the calendar, "Schedule Overview" shows the bookings list.

The `court-bookings` section (Facility Reservations) shows only the reservations management table — it does **not** have Court Events/Schedule Overview tabs.

## Making Bulk HTML/CSS/JS Changes

The root-level `fix-*.js`, `patch-*.js`, and `temp-*.js` files are one-off Node.js scripts used to apply targeted text replacements. Pattern:

```js
const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n'); // normalize CRLF
const idx = c.indexOf(OLD);
if (idx === -1) { console.log('MISS'); } else { c = c.substring(0, idx) + NEW + c.substring(idx + OLD.length); }
fs.writeFileSync('user-portal/user-dashboard.html', c);
```

**Critical:** Always `.replace(/\r\n/g, '\n')` first — Windows CRLF will cause every `indexOf` to miss. When a match fails, `JSON.stringify(c.substring(idx, idx+200))` reveals exact whitespace.

For multi-replacement scripts with backtick template literals, **write the script to a `.js` file first and run with `node`** — passing backtick strings via `node -e` in bash will fail with unexpected EOF.

## Color System

### User portal — unified navy brand color

| Value | Usage |
|-------|-------|
| `#1e3a5f` | **Primary brand** — all active tab buttons, icon circles, focus rings, links, header icons |
| `rgba(30,58,95,0.1)` | Icon circle backgrounds on cards |
| `#0f2547` | Button hover darkening |
| `#0f1f3d` | Sidebar background (`--sidebar-bg`) |
| `linear-gradient(135deg,#1e3a5f,#2563eb)` | Modal headers and hero banners only |

`#2563eb` (bright blue) is intentionally kept only inside modal/popup headers and gradients. Do **not** use it for tabs, icon circles, or standalone buttons on the main pages.

Status badge colors are semantic and must **not** be changed to navy: Resolved = green, Rejected = red, Cancelled = gray, Pending = yellow/amber.

### Admin portal

| Value | Usage |
|-------|-------|
| `#1A3A6B` / `#0F2547` | Calendar headers, table headers, older section styling |
| `#1e3a5f` / `#2563eb` | Newer sections — prefer these for any new work |
| `#2563eb` | Active sidebar button, active tab buttons |

## Calendar Style (both portals)

Both the admin Court Events calendar and the user portal Facility booking calendar share the same visual structure:
- Dark navy header (`#1A3A6B`) with chevron nav buttons (`bi-chevron-left/right`), Today button, optional Add Event button
- Darker navy day-label row (`#0F2547`) with white text
- White cells (`background:#fff`) with `0.5px solid #e2e8f0` borders and `min-height:64px`
- Past cells: `background:#FAFAFA`, gray text, `cursor:default`
- Today: navy circle badge (`background:#1A3A6B`) on the date number, `outline:3px solid #1A3A6B`
- Events/bookings: navy pill labels inside the cell (`background:#1A3A6B;color:#fff`)
- Legend: green (Available), yellow (Brgy Event), blue (Booked), gray (Past) — decorative color boxes only

## Inline Styles Convention

Both portals use **inline styles exclusively** for component-level styling (no separate CSS files for components). Tailwind CDN utility classes are used for layout in the user portal. Bootstrap Icons (`bi bi-*`) are loaded **locally** from `css/bootstrap-icons/bootstrap-icons.min.css` (not CDN).

**Avoid hover effects via inline `onmouseover`/`onmouseout` when the handler value contains single quotes inside double-quoted HTML attributes** — e.g. `onmouseover="this.style.background='red'"` is valid HTML but becomes unparseable if the entire attribute value is later embedded inside a JS string or template literal. Prefer CSS `transition` on a class, or use `onmouseover` only when no string nesting is involved.
