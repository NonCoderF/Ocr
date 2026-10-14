[CmdletBinding()]
param(
    [ValidateSet("debug", "release", "all")]
    [string]$Variant,
    [switch]$Clean
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
$androidRoot = Join-Path $projectRoot "android"
$gradleWrapper = Join-Path $androidRoot "gradlew.bat"
$appJsonPath = Join-Path $projectRoot "app.json"
$packageJsonPath = Join-Path $projectRoot "package.json"
$gradleBuildPath = Join-Path $androidRoot "app\build.gradle"

if (-not (Test-Path -LiteralPath $gradleWrapper)) {
    throw "Android Gradle wrapper not found: $gradleWrapper"
}

if (-not $PSBoundParameters.ContainsKey("Variant")) {
    Write-Host "Select Android build variant:" -ForegroundColor Cyan
    Write-Host "  1) debug"
    Write-Host "  2) release"
    Write-Host "  3) all"

    $variantChoice = Read-Host "Enter choice [1-3]"
    $Variant = switch ($variantChoice) {
        "1" { "debug"; break }
        "2" { "release"; break }
        "3" { "all"; break }
        default { throw "Invalid build variant choice." }
    }
}

$appConfig = Get-Content -LiteralPath $appJsonPath -Raw | ConvertFrom-Json
$packageConfig = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
$gradleContent = Get-Content -LiteralPath $gradleBuildPath -Raw

if ($null -eq $appConfig -or $null -eq $appConfig.expo) {
    throw "Invalid app.json: expected a top-level 'expo' object."
}
if ($null -eq $packageConfig) {
    throw "Invalid package.json: the file is empty or does not contain a JSON object."
}

$currentVersionName = $appConfig.expo.version
$versionNameMatch = [regex]::Match($gradleContent, 'versionName\s+["'']([^"'']+)["'']')
if ($versionNameMatch.Success) {
    $currentVersionName = $versionNameMatch.Groups[1].Value
}

$currentVersionCode = $appConfig.expo.android.versionCode
if ($null -eq $currentVersionCode) {
    $versionCodeMatch = [regex]::Match($gradleContent, 'versionCode\s+(\d+)')
    if ($versionCodeMatch.Success) {
        $currentVersionCode = [int]$versionCodeMatch.Groups[1].Value
    }
}
if ($null -eq $currentVersionCode) {
    $currentVersionCode = 1
}

$versionCodeInput = Read-Host "Enter versionCode [$currentVersionCode]"
$versionCode = if ([string]::IsNullOrWhiteSpace($versionCodeInput)) {
    [int]$currentVersionCode
} else {
    $versionCodeInput
}

if ($versionCode -notmatch '^\d+$' -or [int64]$versionCode -lt 1) {
    throw "Invalid versionCode '$versionCode'. Use a positive integer."
}
$versionCode = [int]$versionCode

$versionNameInput = Read-Host "Enter versionName [$currentVersionName]"
$versionName = if ([string]::IsNullOrWhiteSpace($versionNameInput)) {
    $currentVersionName
} else {
    $versionNameInput
}

if ($versionName -notmatch '^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$') {
    throw "Invalid versionName '$versionName'. Use semantic version format, for example 1.2.3."
}

Write-Host "Updating versionCode to $versionCode and versionName to $versionName..." -ForegroundColor Cyan
$appConfig.expo.version = $versionName
if ($null -eq $appConfig.expo.android) {
    $appConfig.expo | Add-Member -MemberType NoteProperty -Name android -Value ([pscustomobject]@{})
}
if ($null -eq $appConfig.expo.android.PSObject.Properties['versionCode']) {
    $appConfig.expo.android | Add-Member -MemberType NoteProperty -Name versionCode -Value $versionCode
} else {
    $appConfig.expo.android.versionCode = $versionCode
}
$appConfig | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $appJsonPath

if ($packageConfig.PSObject.Properties['version']) {
    $packageConfig.version = $versionName
} else {
    $packageConfig | Add-Member -MemberType NoteProperty -Name version -Value $versionName
}
$packageConfig | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $packageJsonPath

if ($gradleContent -notmatch 'versionCode\s+\d+') {
    throw "Could not find versionCode in $gradleBuildPath"
}
if ($gradleContent -notmatch 'versionName\s+["'']') {
    throw "Could not find versionName in $gradleBuildPath"
}
$gradleContent = $gradleContent -replace 'versionCode\s+\d+', "versionCode $versionCode"
$gradleContent = $gradleContent -replace 'versionName\s+["''][^"'']+["'']', "versionName `"$versionName`""
Set-Content -LiteralPath $gradleBuildPath -Value $gradleContent -NoNewline

if ($Clean) {
    Write-Host "Cleaning Android build outputs..." -ForegroundColor Cyan
    Push-Location -LiteralPath $androidRoot
    try {
        & $gradleWrapper clean --no-daemon --console=plain
    }
    finally {
        Pop-Location
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle clean failed with exit code $LASTEXITCODE"
    }
}

$variantsToBuild = if ($Variant -eq "all") { @("debug", "release") } else { @($Variant) }

foreach ($buildVariant in $variantsToBuild) {
    $variantName = $buildVariant.Substring(0, 1).ToUpperInvariant() + $buildVariant.Substring(1)
    $task = ":app:assemble$variantName"

    Write-Host "Building $buildVariant APK ($task)..." -ForegroundColor Cyan
    Push-Location -LiteralPath $androidRoot
    try {
        & $gradleWrapper $task --no-daemon --console=plain
    }
    finally {
        Pop-Location
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle $task failed with exit code $LASTEXITCODE"
    }

    $apkDirectory = Join-Path $androidRoot "app\build\outputs\apk\$buildVariant"
    $apkFiles = @(Get-ChildItem -LiteralPath $apkDirectory -Filter "*.apk" -File -ErrorAction SilentlyContinue)
    if ($apkFiles.Count -eq 0) {
        throw "Build completed, but no APK was found in $apkDirectory"
    }

    foreach ($apk in $apkFiles) {
        Write-Host "APK: $($apk.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nBuild output folder(s):" -ForegroundColor Green
foreach ($buildVariant in $variantsToBuild) {
    Write-Host (Join-Path $androidRoot "app\build\outputs\apk\$buildVariant")
}
