# PST Design System

## Product Positioning

Postgraduate Submissions Tracker is an academic operations product for students, supervisors, coordinators, and senior administrators. The interface should feel calm, authoritative, legible, and efficient rather than decorative.

## Color Tokens

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--color-primary` | `#17443d` | `#67d5bd` | Primary actions, active navigation, brand moments |
| `--color-secondary` | `#2f6f73` | `#8bc7d0` | Links and secondary emphasis |
| `--color-accent` | `#b7791f` | `#f2c464` | Selective emphasis and warm highlights |
| `--color-success` | `#146c43` | `#7dd3a4` | Completed/verified states |
| `--color-warning` | `#9a5b00` | `#f4c76a` | Pending/incomplete states |
| `--color-danger` | `#b42318` | `#ff928a` | Errors, destructive actions, overdue states |
| `--color-info` | `#245b91` | `#9cc6f1` | Informational states |

## Surface Tokens

| Token | Usage |
| --- | --- |
| `--bg-base` / `--bg-main` | Page background |
| `--bg-surface` | Cards, panels, tables |
| `--bg-elevated` | Header, nav, raised surfaces |
| `--bg-muted` | Table headers, chips, quiet controls |
| `--bg-inset` | Table row hover and recessed content |

## Typography

The app uses `Inter` for UI text and `Merriweather` as an available display face for restrained academic brand moments.

| Token | Size | Usage |
| --- | --- | --- |
| `--text-xs` | `12px` | Badges, table labels, microcopy |
| `--text-sm` | `14px` | Buttons, metadata, form help |
| `--text-md` | `16px` | Body text and form controls |
| `--text-lg` | `18px` | Section labels |
| `--text-xl` | `20px` | Card headings |
| `--text-2xl` | `24px` | Page section headings |
| `--text-3xl` | `30px` | Page titles |

Headings use weight `800`, body text uses `400-500`, interactive text uses `700`, and all UI letter spacing is `0`.

## Spacing, Radius, Elevation

Spacing follows an 8pt grid through `--space-2` (`8px`), `--space-4` (`16px`), `--space-6` (`24px`), `--space-8` (`32px`), and `--space-12` (`48px`).

Cards and controls use compact radii: `--radius-md` (`8px`) for controls and `--radius-lg` (`12px`) for panels. Elevation is intentionally subtle via `--shadow-xs`, `--shadow-sm`, and `--shadow-md`.

## Accessibility

Primary text, secondary text, buttons, alerts, badges, and focus rings are tokenized for AA contrast on both light and dark surfaces. All interactive controls share `:focus-visible` rings through `--shadow-focus`.
