# Framework source review

Reviewed the three registered route patterns and their local views. This is source review plus TypeScript/lint checks, not browser or accessibility certification.

| Route / view | Reviewed |
|---|---|
| `/framework` — Editions | DataTable composition, edit/restore/deactivate actions, confirmation |
| `/framework` — Levels | Vertical order, connectors, card surfaces, edit action, final add action, next-level number |
| `/framework` — Nodes | Header/action alignment, level filter, DataTable and color swatches |
| `/framework` — Relationships | Parent expansion, child rows, surfaces, action alignment, confirmation |
| Edition, Level, Node, Relationship sheets | Field composition, submit handling, pending controls, error visibility |
| `/framework/levels/:levelCode` | Grid/list renderers, search/parent filters, metrics and navigation |
| `/framework/levels/:levelCode/:nodeCode` | Nested hierarchy selection, collapse controls and indicator navigation |
| `?selected=` detail state | Selection remounting and indicator loading/error/empty states |

Corrections include visible sheet errors, blocking dismissal during saves, duplicate-submit guard, allowing the optional color method to remain unset, and retry feedback for failed indicator requests.

Validation: TypeScript no-emit passes; diff whitespace checks pass. Framework management and level tree have no lint errors. The level page retains three existing unused-variable lint findings. No builds were run.

Remaining limitations: browser layout, narrow-width interaction and focus restoration are unverified. Existing Framework copy is still partly hardcoded; the newly added tree/filter labels have English and Hindi translations. Invalid node URLs and malformed/cyclic server hierarchy data require further behavioral testing.
