# Review notes — sldb-ui / marcado-ui

Date: 2026-07-04

Context: quick architectural and implementation review of `/home/jp/proyectos/hum-ecosystem/tools/sldb-ui`, with the clarification that this is effectively **marcado-ui** and the current repo naming is transitional.

---

## Executive summary

My overall read is:

- the project has a **good prototype/product direction**
- the UI intent is clear and useful
- the app **builds successfully**
- but the project is currently in a **mixed trust state** because the tests are not green and the frontend appears to maintain its own partial Marcado parser/runtime model in TypeScript

The highest-level recommendation is:

> keep this project as a frontend/operator surface for the real Marcado runtime, and avoid letting it become a second implementation of the language/model.

That matters more than any single UI bug.

---

## What looks good

### 1. Clear product direction

The current app is understandable at a glance:

- choose a document
- inspect metadata
- inspect namespaces and graph edges
- inspect marker ranges
- view rendered projection vs source
- save/load/reset/download local drafts

That is a coherent operator story.

### 2. The app builds

`npm run build` passes.

That means the project is at least production-bundleable right now, which is a useful baseline.

### 3. The UI has real structure, not just a toy demo

There is clear decomposition into:

- components
- hooks
- data fixtures
- tests
- parsing utilities

So this is not just a throwaway one-file mockup.

---

## Main concerns

## 1. Test health is poor right now

This is the most immediate operational problem.

There is no `test` script in `package.json`, so `npm test` fails even though the repo clearly has a test suite.

Running `npx vitest run` shows multiple failures.

The failures are not all of one kind. They point to a combination of:

- UI/test drift
- brittle text assertions
- likely stale expectations after UI changes
- at least one real parser/utility bug

Examples from the run:

- duplicate text causing `getByText(...)` ambiguity
- annotation-count expectations no longer matching actual rendering
- tests using special characters in `user.type(...)` in a way that `user-event` interprets specially
- `parseFrontmatter` empty-frontmatter expectation failure
- integration tests assuming app behavior that the current app no longer matches

This means the current repo is in a state where:

- **build succeeds**
- **tests do not establish confidence**

That should be corrected soon.

### Recommendation

Short-term:

1. add a proper `test` script to `package.json`
2. make `vitest` green again before growing the surface much more
3. separate:
   - brittle test failures
   - genuine parser/model bugs

---

## 2. The frontend is implementing too much Marcado logic itself

`src/lib/marcado.ts` is doing substantial parsing/model work itself:

- frontmatter detection via regex
- document metadata extraction
- namespace extraction from indentation-sensitive text scanning
- graph edge extraction via manual line heuristics
- marker token/range extraction via regex and offset bookkeeping

That is okay for a prototype, but risky as a direction.

### Why this is risky

Because this duplicates behavior that belongs to the real runtime/model.

Risks:

- semantic drift from the actual runtime
- edge-case differences between TS parser and Python/runtime parser
- duplicated bug-fixing burden
- temptation to evolve the UI parser independently because it is "close at hand"
- higher long-term cost when canonical JSON/runtime semantics tighten

### Recommendation

Prefer one of these directions:

#### Best direction
Use the real Marcado runtime as source of truth and have the UI consume:

- canonical JSON export
- validation output
- anchor output
- retrieval/show output

#### Acceptable intermediate direction
Share a generated contract/schema and minimize frontend-side interpretation.

#### Worst direction
Continue growing `src/lib/marcado.ts` into a parallel runtime.

My advice is strongly to avoid the third option.

---

## 3. Product boundary still needs clarification, even with the naming note

You clarified that this is really **marcado-ui** and the path/name mismatch is transitional.

That helps a lot.

Still, the project should be made explicit about that in-repo.

Right now:

- path says `sldb-ui`
- package says `marcado-ui`
- code and sample data look centered on Marcado-style document behavior

### Recommendation

At minimum, add a short README that states:

- this repo is the UI for Marcado-oriented document inspection/editing
- the current path/name mismatch is transitional
- the backend/source-of-truth plan is X

That alone would reduce confusion for future contributors.

---

## 4. Some tests appear too text-fragile

Several failures suggest tests are asserting incidental DOM details instead of stable UI contracts.

Examples:

- exact visible text where duplicates exist (`draft`, titles, counts)
- `getByText(...)` where multiple matches are expected
- count strings that are assembled from separate elements
- user-event special characters typed as raw keyboard syntax

### Recommendation

Prefer more stable queries such as:

- `getAllByText(...)` where duplicates are intentional
- role-based queries
- label-based queries
- `data-testid` only where necessary for stable operator surfaces
- assertions on semantic sections rather than global text uniqueness

This is not just test cleanup: better tests will make UI iteration much cheaper.

---

## 5. There is at least one real parsing/utility bug signal

From the test output:

- `parseFrontmatter` seems not to handle empty frontmatter the way the test expects

That one does not look like mere test brittleness. It looks like either:

- the utility is wrong, or
- the contract changed and the tests were not updated

Either way, that area needs explicit contract clarification.

---

## 6. Current architecture seems fixture/demo-driven rather than runtime-driven

The app loads bundled example docs from `src/data/...` and parses them client-side.

That is fine for a prototype, but long term the key question is:

> is the UI meant to inspect the real runtime outputs, or only showcase examples?

If the answer is "real runtime outputs," then the next step should be architectural, not cosmetic.

### Recommendation

A likely good next slice would be:

- feed the UI from canonical JSON exports or CLI outputs from Marcado
- keep the bundled examples, but treat them as fixtures feeding the real runtime/export path
- make the UI a renderer/inspector over runtime truth, not over locally re-derived truth

---

## Prioritized recommendations

## Short-term

### A. Repair basic developer ergonomics

- add `test` script
- possibly add `test:watch`
- possibly add `coverage`

### B. Get the test suite green

Suggested order:

1. fix brittle text-query failures
2. fix `user-event` special-character test usage
3. fix count-display expectations
4. decide whether `parseFrontmatter` empty-frontmatter behavior or the test is correct
5. rerun full `vitest`

### C. Add a minimal README

State clearly:

- this is effectively `marcado-ui`
- current repo path/name is transitional
- build/test/dev commands
- intended relation to the runtime

---

## Medium-term

### D. Reduce duplicated parser logic in the frontend

Move toward one of:

- consuming canonical JSON from `marcado export`
- consuming validation JSON from `marcado validate`
- consuming anchors/show output from the CLI/runtime
- wiring the UI to a small adapter around the real runtime

### E. Decide the frontend contract explicitly

The UI should probably render some combination of:

- source Markdown
- plain text projection
- marker list
- logical ranges
- namespaces
- graph edges
- diagnostics
- validation findings
- anchor resolution results

Those are all already naturally represented by the runtime/export direction.

---

## Strong architectural recommendation

If I had to compress the main advice into one sentence:

> make marcado-ui a frontend over the real Marcado runtime outputs, not a second handwritten parser/runtime.

That is the decision that will save the most pain later.

---

## Final summary

My current opinion is:

- **good UI/prototype direction**
- **worth continuing**
- **needs test stabilization soon**
- **should not keep growing its own parsing semantics independently**
- **should converge toward canonical runtime/export integration**

If this repo is indeed becoming `marcado-ui`, that direction makes much more sense than treating it as a generic `sldb-ui`.
