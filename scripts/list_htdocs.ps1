$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"
$req = [System.Net.FtpWebRequest]::Create("ftp://$ftpServer/htdocs/")
$req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
$req.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
$req.UsePassive = $true
$req.KeepAlive = $false
$resp = $req.GetResponse()
$reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
$list = $reader.ReadToEnd()
$reader.Close()
$resp.Close()
Write-Host "Files in htdocs:"
Write-Host $list
