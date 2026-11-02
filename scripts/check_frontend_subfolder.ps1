$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"

function Get-Listing($uri) {
    $req = [System.Net.FtpWebRequest]::Create($uri)
    $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
    $req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $req.UsePassive = $true
    $req.KeepAlive = $false
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $res = $reader.ReadToEnd()
    $reader.Close()
    $resp.Close()
    return $res
}

Write-Host "--- Content of /htdocs/frontend ---"
try {
    Write-Host (Get-Listing "ftp://$ftpServer/htdocs/frontend/")
} catch {
    Write-Host "Error listing /htdocs/frontend: $($_.Exception.Message)"
}
