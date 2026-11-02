$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"

$req = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/htdocs/js")
$req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
$req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
$req.UsePassive = $true
$req.KeepAlive = $false
try {
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $out = $reader.ReadToEnd()
    $reader.Close()
    $resp.Close()
    Write-Host "Success listing /htdocs/js:"
    Write-Host $out
} catch {
    Write-Host "Error listing /htdocs/js:" $_.Exception.Message
}

$req2 = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/htdocs/frontend/js")
$req2.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
$req2.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
$req2.UsePassive = $true
$req2.KeepAlive = $false
try {
    $resp2 = $req2.GetResponse()
    $reader2 = New-Object System.IO.StreamReader($resp2.GetResponseStream())
    $out2 = $reader2.ReadToEnd()
    $reader2.Close()
    $resp2.Close()
    Write-Host "Success listing /htdocs/frontend/js:"
    Write-Host $out2
} catch {
    Write-Host "Error listing /htdocs/frontend/js:" $_.Exception.Message
}
