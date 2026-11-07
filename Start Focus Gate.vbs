' Focus Gate Silent Launcher
' Double-clicking this launches Focus Gate locally with in-page YouTube enabled,
' without flashing any command prompt window.
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir

' Check if port 8899 is already listening
Set oExec = WshShell.Exec("powershell -NoProfile -Command ""(Get-NetTCPConnection -LocalPort 8899 -ErrorAction SilentlyContinue).Count""")
portActive = Trim(oExec.StdOut.ReadAll())

If portActive = "" Or portActive = "0" Then
  WshShell.Run "cmd /c node server.js", 0, False
  WScript.Sleep 800
End If

WshShell.Run "cmd /c start """" ""http://localhost:8899/""", 0, False
