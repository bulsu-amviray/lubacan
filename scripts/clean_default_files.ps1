$ftpServer = "ftpupload.net"
$user = "if0_43334610"
$pass = "FPyoZMzCtjr"

function Delete-FtpFile($remoteUri) {
    try {
        $req = [System.Net.FtpWebRequest]::Create($remoteUri)
        $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $req.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
        $req.UsePassive = $true
        $req.KeepAlive = $false
        $resp = $req.GetResponse()
        $resp.Close()
        Write-Host "Successfully deleted: $remoteUri"
    } catch {
        Write-Host "Notice on deleting $remoteUri - $($_.Exception.Message)"
    }
}

Delete-FtpFile "ftp://$ftpServer/htdocs/index2.html"
Delete-FtpFile "ftp://$ftpServer/htdocs/files for your website should be uploaded here!"
