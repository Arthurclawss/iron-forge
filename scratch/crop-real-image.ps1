Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Cliente\.gemini\antigravity-ide\brain\aca22113-a582-49fe-a8f1-15af29c1db6c\media__1782243853983.jpg"

Write-Host "Loading image: $srcPath"
$img = [System.Drawing.Image]::FromFile($srcPath)
$w = $img.Width
$h = $img.Height
$wHalf = [int]($w / 2)
Write-Host "Image dimensions: ${w}x${h}. Splitting at $wHalf"

# Crop Left Half (Before)
$leftBmp = New-Object System.Drawing.Bitmap $wHalf, $h
$gLeft = [System.Drawing.Graphics]::FromImage($leftBmp)
$rectLeft = New-Object System.Drawing.Rectangle 0, 0, $wHalf, $h
$gLeft.DrawImage($img, $rectLeft, 0, 0, $wHalf, $h, [System.Drawing.GraphicsUnit]::Pixel)
$gLeft.Dispose()
$leftBmp.Save("c:\Users\Cliente\Downloads\iron-forge-improved\src\assets\before.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$leftBmp.Dispose()
Write-Host "Before image saved to assets/before.jpg"

# Crop Right Half (After)
$rightBmp = New-Object System.Drawing.Bitmap $wHalf, $h
$gRight = [System.Drawing.Graphics]::FromImage($rightBmp)
$rectRight = New-Object System.Drawing.Rectangle 0, 0, $wHalf, $h
$gRight.DrawImage($img, $rectRight, $wHalf, 0, $wHalf, $h, [System.Drawing.GraphicsUnit]::Pixel)
$gRight.Dispose()
$rightBmp.Save("c:\Users\Cliente\Downloads\iron-forge-improved\src\assets\after.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$rightBmp.Dispose()
Write-Host "After image saved to assets/after.jpg"

$img.Dispose()
Write-Host "Crop completed successfully!"
