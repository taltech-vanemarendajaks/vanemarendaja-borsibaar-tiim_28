# HANDIN

## Repository
- https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28

## Pull requests
- #14 **Feature/inventory sorting** (merged)  
  https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28/pull/14
- #23 **Add manual price input to drink edit dialog** (closed)  
  https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28/pull/23
- #25 **Add manual price input to drink edit dialog vol2** (merged)  
  https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28/pull/25
- #26 **fix: update docker-compose.prod.yaml** (merged)  
  https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28/pull/26
- #27 **Feature/handin file** (merged)  
  https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28/pull/27

## Merge conflict (what happened & how we resolved it)
**Where it happened**
- File: `TEAM.md`
- Conflict resolution commit:  
  https://github.com/taltech-vanemarendajaks/vanemarendaja-borsibaar-tiim_28/commit/b722b797c8816a8fbf4075e1ede35f352a3d20d2

**Why it happened**
- `TEAM.md` was edited in parallel on different branches and the same parts of the file were changed, which produced conflict markers
  (`<<<<<<<`, `=======`, `>>>>>>>`).

**How we resolved it**
- The conflict was resolved by keeping **marleenu’s version** of `TEAM.md` and overwriting/removing **jarmo164’s conflicting changes**.
- In practice: conflict markers were removed and the final file content was chosen from marleenu’s side, then committed.

**Result**
- `TEAM.md` contains the final agreed version and no longer includes merge conflict markers.

## Who did what
- **@jarmo164**
  - Implemented inventory sorting (PR #14).
  - Updated production docker compose configuration (PR #26).
- **@District4k**
  - Implemented manual price input feature (PR #23 initial attempt, PR #25 final version).
- **@marleenu**
  - Added hand-in documentation file (PR #27) and provided the final `TEAM.md` version used during conflict resolution.
- **@uLauri**
  - Maintained/reviewed and merged PR #14 into `dev` (integration/maintenance role).
