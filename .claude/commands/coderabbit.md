Triage and respond to CodeRabbit review comments on the current PR.

## Steps

1. Find the open PR for the current branch using `gh pr list`
2. Fetch all CodeRabbit review comments using `gh api repos/{owner}/{repo}/pulls/{pr}/comments`
3. Read each comment and triage into categories:
   - **Will fix** — valid issues worth addressing (a11y quick wins, real bugs, type safety)
   - **Won't fix** — valid observations but not worth the effort (over-engineering for context, shadcn generated files, edge cases that can't happen)
   - **Noise** — already handled elsewhere or redundant with other fixes
4. Present the triage table to the user for approval
5. Apply all "will fix" changes to the code
6. Reply to every CodeRabbit comment on GitHub with the disposition:
   - "Fixed — [what was done]" for will-fix items
   - "Won't fix — [justification]" for won't-fix items
   - "Already handled — [explanation]" for noise items
7. Build to verify no regressions
8. Commit and push the fixes

## Triage guidelines

- Quick a11y wins (aria-label, aria-pressed, type="button") → will fix
- shadcn/ui generated files → won't fix (don't modify vendor code)
- Defensive coding that prevents impossible states → will fix if simple
- Over-engineering for teaching tools (keyboard nav on SVG demos) → won't fix
- Issues already addressed by other fixes → noise
