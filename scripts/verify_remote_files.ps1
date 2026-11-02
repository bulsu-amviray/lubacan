$localFiles = Get-ChildItem -Path "c:\xampp\htdocs\LUBACanFindIT\frontend" -Recurse -File
Write-Host "Total local files in frontend: $($localFiles.Count)"

$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"
$cred = New-Object System.Net.NetworkCredential($user, $pass)

function Get-FtpDirectoryListing($remoteUri) {
    try {
        $req = [System.Net.FtpWebRequest]::Create($remoteUri)
        $req.Credentials = $cred
        $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
        $req.UsePassive = $true
        $req.KeepAlive = $false
        $resp = $req.GetResponse()
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $lines = @()
        while (-not $reader.EndOfStream) {
            $line = $reader.ReadLine()
            if ($line -and $line -ne "." -and $line -ne "..") {
                $lines += $line
            }
        }
        $reader.Close()
        $resp.Close()
        return $lines
    } catch {
        return @()
    }
}

# Recursively crawl FTP
$remoteFiles = @()
function Crawl-Ftp($curUri, $prefix) {
    $items = Get-FtpDirectoryListing $curUri
    foreach ($item in $items) {
        $name = $item.Trim()
        # check if item has an extension or is a directory
        if ($name -match '\.(html|js|css|php|png|jpg|map|htaccess|svg)$') {
            $remoteFiles += ($prefix + $name)
        } else {
            # directory
            Crawl-Ftp "$curUri/$name" "$prefix$name/"
        }
    }
}

Crawl-Ftp "ftp://$ftpServer/htdocs" ""
Write-Host "Total remote files found in /htdocs: $($remoteFiles.Count)"

# Check missing
$missing = @()
foreach ($f in $localFiles) {
    $rel = $f.FullName.Substring("c:\xampp\htdocs\LUBACanFindIT\frontend".Length).TrimStart('\', '/').Replace('\', '/')
    if ($remoteFiles -notcontains $rel) {
        $missing += $rel
    }
}

if ($missing.Count -eq 0) {
    Write-Host "SUCCESS: All $($localFiles.Count) files are 100% present on InfinityFree!"
} else {
    Write-Host "Missing files ($($missing.Count)):"
    $missing | ForEach-Object { Write-Host " - $_" }
}
