Add-Type -AssemblyName System.Drawing

$beforeSrc = "C:\Users\Cliente\.gemini\antigravity-ide\brain\aca22113-a582-49fe-a8f1-15af29c1db6c\before_transformation_1782244256352.png"
$afterSrc = "C:\Users\Cliente\.gemini\antigravity-ide\brain\aca22113-a582-49fe-a8f1-15af29c1db6c\after_transformation_1782244271962.png"

# Save Before
$imgBefore = [System.Drawing.Image]::FromFile($beforeSrc)
$imgBefore.Save("c:\Users\Cliente\Downloads\iron-forge-improved\src\assets\before.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$imgBefore.Dispose()
Write-Host "New before.jpg saved to assets!"

# Save After
$imgAfter = [System.Drawing.Image]::FromFile($afterSrc)
$imgAfter.Save("c:\Users\Cliente\Downloads\iron-forge-improved\src\assets\after.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$imgAfter.Dispose()
Write-Host "New after.jpg saved to assets!"
