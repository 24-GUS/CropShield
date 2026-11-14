Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "d:\Desktop\project\cropai"
WshShell.Run "pythonw desktop_app.py", 0, False
