$src = 'user-dashboard.html'
$lines = Get-Content $src -Encoding UTF8
# Delete orphaned old modal HTML block: 0-indexed lines 827-948 (1-indexed 828-949)
$result = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($i -ge 827 -and $i -le 948) { continue }
    $result.Add($lines[$i])
}
[System.IO.File]::WriteAllLines((Resolve-Path $src).Path, $result, [System.Text.Encoding]::UTF8)
Write-Host "Done. Total lines: $($result.Count)"
