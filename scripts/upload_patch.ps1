$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"

function Upload-FtpFile($localFile, $remoteUri) {
    $req = [System.Net.FtpWebRequest]::Create($remoteUri)
    $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
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
    Write-Host "Uploaded: $remoteUri"
}

Upload-FtpFile "c:\xampp\htdocs\LUBACanFindIT\frontend\index.html" "ftp://$ftpServer/htdocs/index.html"
Upload-FtpFile "c:\xampp\htdocs\LUBACanFindIT\frontend\.htaccess" "ftp://$ftpServer/htdocs/.htaccess"
