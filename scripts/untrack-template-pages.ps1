# Run from Kegal360Frontned: .\scripts\untrack-template-pages.ps1
# If repo root is Kegal360 (parent), run from Kegal360 and use $prefix = "Kegal360Frontned/"
$prefix = ""

$paths = @(
    # Template app routes & views
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
    "src/views/pages",
    # Mock data & scripts
    "src/fake-db",
    "src/remove-translation-scripts",
    # Template public images
    "public/images/apps",
    "public/images/front-pages",
    "public/images/pages",
    "public/images/illustrations",
    "public/images/cards",
    "public/images/logos",
    # Local Prisma & Redux template
    "src/prisma/dev.db",
    "src/prisma/migrations",
    "src/redux-store/slices",
    # Template components (dialogs, front-pages layout, pricing, stepper-dot)
    "src/components/dialogs",
    "src/components/layout/front-pages",
    "src/components/pricing",
    "src/components/stepper-dot",
    # Template assets
    "src/assets/svg/front-pages",
    # Template libs (keep ApexCharts + AppReactApexCharts for dashboard)
    "src/libs/ReactPlayer.jsx",
    "src/libs/Recharts.jsx",
    "src/libs/styles/AppFullCalendar.js",
    "src/libs/styles/AppKeenSlider.js",
    "src/libs/styles/AppReactDatepicker.jsx",
    "src/libs/styles/AppReactDropzone.js",
    "src/libs/styles/AppReactToastify.jsx",
    "src/libs/styles/AppRecharts.js",
    "src/libs/styles/inputOtp.module.css",
    "src/libs/styles/tiptapEditor.css",
    # Extra lockfile
    "pnpm-lock.yaml"
)

foreach ($p in $paths) {
    $path = $prefix + $p
    git rm -r --cached $path 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "Untracked: $path" }
}

Write-Host ""
Write-Host "Done. Run: git status"
Write-Host "Then: git add . && git commit -m 'chore: stop tracking template/unused files'"
Write-Host "Then: git push"
