$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"
$localDir = "c:\xampp\htdocs\LUBACanFindIT\frontend"
$remoteBase = "ftp://$ftpServer/htdocs"

Write-Host "Connecting to InfinityFree FTP at $ftpServer..."

function Ensure-FtpDirectory($uri, $cred) {
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
        # Directory might already exist, ignore
    }
}

function Upload-FtpFile($localFile, $remoteUri, $cred) {
    $req = [System.Net.FtpWebRequest]::Create($remoteUri)
    $req.Credentials = $cred
    $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $req.UseBinary = $true
    $req.UsePassive = $true
    $req.KeepAlive = $false

    $bytes = [System.IO.File]::ReadAllBytes($localFile)
    $req.ContentLength = $bytes.Length
    $stream = $req.GetRequestStream()
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Close()
    $resp = $req.GetResponse()
    $resp.Close()
}

$cred = New-Object System.Net.NetworkCredential($user, $pass)

# Test listing htdocs
try {
    $req = [System.Net.FtpWebRequest]::Create($remoteBase)
    $req.Credentials = $cred
    $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $req.UsePassive = $true
    $req.KeepAlive = $false
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $list = $reader.ReadToEnd()
    $reader.Close()
    $resp.Close()
    Write-Host "Successfully connected to /htdocs!"
} catch {
    Write-Host "Notice on listing htdocs: $($_.Exception.Message)"
}

# Collect all files in frontend
$allFiles = Get-ChildItem -Path $localDir -Recurse -File

Write-Host "Found $($allFiles.Count) files to upload. Starting upload..."

$count = 0
$total = $allFiles.Count

foreach ($file in $allFiles) {
    $count++
    $relPath = $file.FullName.Substring($localDir.Length).TrimStart('\', '/')
    $remotePath = $relPath.Replace('\', '/')
    $remoteFileUri = "$remoteBase/$remotePath"

    # Ensure parent directories exist
    $parts = $remotePath.Split('/')
    if ($parts.Length -gt 1) {
        $curDir = $remoteBase
        for ($i = 0; $i -lt ($parts.Length - 1); $i++) {
            $curDir = "$curDir/$($parts[$i])"
            Ensure-FtpDirectory $curDir $cred
        }
    }

    Write-Host "[$count/$total] Uploading: $remotePath ($([math]::Round($file.Length / 1KB, 1)) KB)..."
    
    $success = $false
    $retries = 3
    while (-not $success -and $retries -gt 0) {
        try {
            Upload-FtpFile $file.FullName $remoteFileUri $cred
            $success = $true
        } catch {
            $retries--
            Write-Host "  Retry left ($retries): $($_.Exception.Message)"
            Start-Sleep -Milliseconds 800
        }
    }

    if (-not $success) {
        Write-Error "Failed to upload $remotePath after 3 attempts."
    }
}

Write-Host "=========================================="
Write-Host "All files successfully uploaded to InfinityFree!"
Write-Host "Website URL: http://LUBACanFIndIT.infinityfreeapp.com"
Write-Host "=========================================="
