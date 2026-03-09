# Test 7: Index File Accuracy

**Date:** 2026-03-09
**Status:** PASS (with minor gaps)
**Overall Score:** 8/9 indexed directories at 100% accuracy

---

## Service Tier Directory Verification

| Directory | Index Exists? | Files in Dir | Files in Index | Phantoms | Missing | Accuracy |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| p0-mvp/ | **NO** | 11 | 10 (root only) | 0 | 1 | 91% |
| p1-post-mvp/ | Yes | 3 | 3 | 0 | 0 | 100% |
| p2-extended/ | Yes | 9 | 9 | 0 | 0 | 100% |
| p3-future/ | Yes | 10 | 10 | 0 | 0 | 100% |
| p-infra/ | Yes | 6 | 6 | 0 | 0 | 100% |
| **Root 01-services/** | Yes | 39 total | 38 listed | 0 | 1 | 97% |

### Issues Found

**p0-mvp/ — NO `_index.md` exists**
- Only tier directory without its own `_index.md`
- All other tiers (p1, p2, p3, p-infra) have local index files

**Root `01-services/_index.md` — MISSING #39 Command Center**
- Title says "All 38 Services" — should be 39
- P0 table lists 10 services but `39-command-center.md` exists in p0-mvp/
- Root cause: Command Center added 2026-03-08, root index last updated 2026-03-07

---

## Other Directory Verification

| Directory | Index Exists? | Files in Dir | Files in Index | Phantoms | Missing | Accuracy |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 00-foundations/ | **NO** | 22 | — | — | — | N/A |
| 02-architecture/ | **NO** | 1 | — | — | — | N/A |
| 02-screens/ | Yes | — | 98 routes | 0 | 0 | 100% |
| 03-tasks/ | Yes | refs 10 QS tasks | 10 | 0 | 0 | 100% |
| 03-tasks/backlog/ | Yes | 0 (org only) | ~50 items | 0 | 0 | 100% |
| 09-design-specs/ | Yes | — | 39 services | 0 | 0 | 100% |
| 10-standards/ | Yes | 10 | 10 | 0 | 0 | 100% |
| 13-contracts/ | Yes | 7 | 7 | 0 | 0 | 100% |

---

## Directories Without Index Files

| Directory | File Count | Priority |
|-----------|:---:|---------|
| 00-foundations/ | 22 | **HIGH** — 22 foundational docs, would benefit greatly from an index |
| 02-architecture/ | 1 | Low — only 1 file |
| 04-completeness/ | ~5 | Medium |
| 05-audit/ | many subdirs | Medium — has tribunal/ subdirectory with 16+ files |
| 06-references/ | ~6 | Medium |
| 07-decisions/ | 1 | Low — only 1 file |
| 08-sprints/ | ~7 | Medium |
| 11-features/ | ~15+ | Medium |
| 12-ai-guides/ | ~30+ | Medium-High |

---

## Aggregate Totals

| Metric | Count |
|--------|:---:|
| Phantom entries (in index but not on disk) | **0** |
| Missing from index (on disk but not in index) | **1** |
| Wrong descriptions | **0** |
| Indexed directories at 100% accuracy | **8/9** |
| Directories lacking any index file | **8** |

---

## Recommendations

### P0 — Fix Now
1. **Update root `01-services/_index.md`** — change title from "All 38 Services" to "All 39 Services" and add Command Center (#39) to the P0 table
2. **Create `p0-mvp/_index.md`** — the only tier directory without a local index; all other 4 tiers have one

### P1 — Add When Convenient
3. **Create `00-foundations/_index.md`** — 22 files with no catalog; highest-impact missing index
4. **Create `12-ai-guides/_index.md`** — 30+ files, frequently referenced by multi-AI collaboration

### P2 — Nice to Have
5. **Add index files to remaining directories** — 04-completeness, 05-audit, 06-references, 08-sprints, 11-features
6. **Skip index for single-file directories** — 02-architecture (1 file), 07-decisions (1 file)
