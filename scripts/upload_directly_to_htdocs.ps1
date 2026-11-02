$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"
$localDir = "c:\xampp\htdocs\LUBACanFindIT\frontend"
$remoteBase = "ftp://$ftpServer/htdocs"
$cred = New-Object System.Net.NetworkCredential($user, $pass)

function Ensure-RemoteDir($uri) {
    try {
        $req = [System.Net.FtpWebRequest]::Create($uri)
        $req.Credentials = $cred
        $req.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $req.UsePassive = $true
        $req.KeepAlive = $false
        $resp = $req.GetResponse()
        $resp.Close()
        Write-Host "Created remote dir: $uri"
    } catch {
        # Already exists or parent exists
    }
}

function Upload-File($localPath, $remoteUri) {
    $req = [System.Net.FtpWebRequest]::Create($remoteUri)
    $req.Credentials = $cred
    $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $req.UseBinary = $true
    $req.UsePassive = $true
    $req.KeepAlive = $false

    $bytes = [System.IO.File]::ReadAllBytes($localPath)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $resp = $req.GetResponse()
    $resp.Close()
}

# 1. Ensure all directories directly under /htdocs exist
$dirsToCreate = @(
    "assets",
    "assets/leaflet",
    "assets/leaflet/images",
    "css",
    "js",
    "js/components",
    "js/config",
    "js/data",
    "js/modals",
    "js/pages",
    "js/services",
    "js/state",
    "js/utils"
)

foreach ($d in $dirsToCreate) {
    Ensure-RemoteDir "$remoteBase/$d"
}

# 2. Upload all files from frontend directly to /htdocs
$allFiles = Get-ChildItem -Path $localDir -Recurse -File
Write-Host "Uploading $($allFiles.Count) files directly to /htdocs..."

$i = 0
foreach ($f in $allFiles) {
    $i++
    $rel = $f.FullName.Substring($localDir.Length).TrimStart('\', '/').Replace('\', '/')
    $targetUri = "$remoteBase/$rel"

    $done = $false
    $attempts = 3
    while (-not $done -and $attempts -gt 0) {
        try {
            Upload-File $f.FullName $targetUri
            $done = $true
            Write-Host "[$i/$($allFiles.Count)] Uploaded: $rel"
        } catch {
            $attempts--
            Write-Host "  Retry $rel ($($_.Exception.Message))"
            Start-Sleep -Milliseconds 600
        }
    }
}

Write-Host "Direct upload to /htdocs complete!"
