$ErrorActionPreference = 'Stop'
$auraRoot = Split-Path -Parent $PSScriptRoot
$auraUrl = 'http://127.0.0.1:4318/'
$auraRunning = $false
try {
    $auraResponse = Invoke-WebRequest -Uri $auraUrl -UseBasicParsing -TimeoutSec 2
    $auraRunning = $auraResponse.Content -match '<title>Matrix Programmer \| Aura Matrix Studio</title>'
    if (-not $auraRunning) { throw 'Another application is using port 4318.' }
} catch {
    if ($_.Exception.Message -eq 'Another application is using port 4318.') { throw }
}
if (-not $auraRunning) {
    $auraNode = (Get-Command node -ErrorAction Stop).Source
    $auraServer = Join-Path $PSScriptRoot 'serve.cjs'
    Start-Process -FilePath $auraNode -ArgumentList ('"' + $auraServer + '"') -WorkingDirectory $auraRoot -WindowStyle Hidden
    for ($auraAttempt = 0; $auraAttempt -lt 30; $auraAttempt++) {
        try {
            $auraResponse = Invoke-WebRequest -Uri $auraUrl -UseBasicParsing -TimeoutSec 1
            if ($auraResponse.StatusCode -eq 200) { $auraRunning = $true; break }
        } catch { Start-Sleep -Milliseconds 200 }
    }
}
if (-not $auraRunning) { throw 'Aura could not start. Check that Node.js is installed.' }
Start-Process $auraUrl
