VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END

Attribute VB_Name = "ThisWorkbook"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True


Private Sub Workbook_Open()

  Call Macro3

End Sub


Sub Macro3()
'
' Macro3 Macro
'

'

  Dim sh As Worksheet, flg As Boolean
  For Each sh In Worksheets
    If sh.name = "Balance Sheet" Then flg = True: Exit For
  Next

  If flg <> True Then
    Sheets.Add.name = "Balance Sheet"
  End If

End Sub
