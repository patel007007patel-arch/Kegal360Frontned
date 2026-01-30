# Run from Kegal360Frontned folder: .\scripts\untrack-template-pages.ps1
# Stops tracking template/demo pages so only admin panel is pushed (e.g. to Render).
# Use 2>$null so PowerShell ignores "path not found" when a path was never tracked.

$paths = @(
    "src/app/[lang]/(blank-layout-pages)/pages",
    "src/app/[lang]/(dashboard)/(private)/apps",
    "src/app/[lang]/(dashboard)/(private)/charts",
    "src/app/[lang]/(dashboard)/(private)/dashboards",
    "src/app/[lang]/(dashboard)/(private)/forms",
    "src/app/[lang]/(dashboard)/(private)/pages",
    "src/app/[lang]/(dashboard)/(private)/react-table",
    "src/app/front-pages",
    "src/app/api/apps",
    "src/app/api/pages",
    "src/views/apps",
    "src/views/charts",
    "src/views/dashboards",
    "src/views/forms",
    "src/views/front-pages",
    "src/views/react-table",
    "src/views/pages"
)

foreach ($p in $paths) {
    git rm -r --cached $p 2>$null
}

Write-Host "Done. Run: git status"
Write-Host "Then: git add . && git commit -m 'chore: stop tracking template pages'"
