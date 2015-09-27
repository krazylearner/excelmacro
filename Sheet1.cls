VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Sheet1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Dim varRowBalanceSheet As Integer
Dim netBalance As Long
Dim d As Object

Sub prepareBalanceSheet()

Dim wrkSheet As Worksheet



Set d = CreateObject("scripting.dictionary")

Call updateNetBalance

For Each wrkSheet In Excel.ThisWorkbook.Worksheets

 If (isCoreSheets(wrkSheet.Name)) Then
   
   Call selectDistinct(wrkSheet)

End If

Next

Call getBalanceSheet

Call Macro3

End Sub

Sub updateNetBalance()

Dim wrkSheet As Worksheet

'PURPOSE:way to find the last row number of a range

For Each wrkSheet In Excel.ThisWorkbook.Worksheets

Call updateColumnNetBalance(wrkSheet)

Next
 
End Sub

Sub updateColumnNetBalance(wrkSheet As Worksheet)


Dim firstRow As Integer
Dim lastRow As Long
Dim varCredit As Long
Dim VarDebit As Long

Dim daySheet As Worksheet

If (StrComp(wrkSheet.Name, "Balance Sheet", vbTextCompare) <> 0) Then

Set daySheet = ThisWorkbook.Worksheets(wrkSheet.Name)

firstRow = 4

lastRow = daySheet.Cells(daySheet.Rows.Count, "A").End(xlUp).Row

While (firstRow <= lastRow)

'Excel.Sheets(daySheet.name).Range("E" & firstRow).Formula = "=SUM(C" & firstRow & ")-SUM(D" & firstRow & ")"
varCredit = ThisWorkbook.Sheets(daySheet.Name).Range("C" & firstRow).Value
VarDebit = ThisWorkbook.Sheets(daySheet.Name).Range("D" & firstRow).Value
ThisWorkbook.Sheets(daySheet.Name).Range("E" & firstRow).Value = varCredit - VarDebit
firstRow = firstRow + 1

Wend

End If

End Sub

Sub selectDistinct(wrkSheet As Worksheet)

    Dim daySheet As Worksheet
    Dim firstRow As Integer
    Dim lastRow As Integer
    
    firstRow = 4
    
    Dim k As Variant
    Dim varBalance As Long
    
    Dim tmp As String
    
    Set daySheet = ThisWorkbook.Worksheets(wrkSheet.Name)
    lastRow = daySheet.Cells(daySheet.Rows.Count, "B").End(xlUp).Row
     
    While (firstRow <= lastRow)
     tmp = Trim(daySheet.Range("B" & CStr(firstRow)).Value)
     
     If Len(tmp) > 0 Then
     d(tmp) = d(tmp) + daySheet.Range("E" & CStr(firstRow)).Value
     End If
     
     firstRow = firstRow + 1

     Wend
     
    
End Sub

Sub getBalanceSheet()

Dim balanceSheet As Worksheet

Call createBalanceSheet

Sheets("Balance Sheet").Cells.Delete
'Sheets().Cells.ClearContents

varRowBalanceSheet = 4

netBalance = 0

Set balanceSheet = ThisWorkbook.Worksheets("Balance Sheet")

For Each k In d.keys
      balanceSheet.Range("A" & CStr(varRowBalanceSheet)).Value = k
      balanceSheet.Range("B" & CStr(varRowBalanceSheet)).Value = d(k)
      netBalance = netBalance + d(k)
      varRowBalanceSheet = varRowBalanceSheet + 1
        'Call getBalanceSheet(k,)
Next k
      
ThisWorkbook.Worksheets("Balance Sheet").Range("B" & CStr(varRowBalanceSheet + 1)).Value = netBalance
ThisWorkbook.Worksheets("Balance Sheet").Range("A" & CStr(varRowBalanceSheet + 1)).FormulaR1C1 = "NET BALANCE"
      
End Sub

Sub createBalanceSheet()
'
' Macro3 Macro
'

'

    Dim sh As Worksheet, flg As Boolean
    For Each sh In Worksheets
        If sh.Name = "Balance Sheet" Then flg = True: Exit For
    Next

    If flg <> True Then
        Sheets.Add.Name = "Balance Sheet"
    End If

End Sub




Sub Macro3()
'
' Macro4 Macro
'

'
    Sheets("Balance Sheet").Select
    Sheets("Balance Sheet").Range("A2:B2").Select
    Selection.Merge
    Sheets("Balance Sheet").Range("A2:B2").Select
    
    ActiveCell.FormulaR1C1 = "Balance Sheet"
    Sheets("Balance Sheet").Range("A2:B2").Select
    With Selection
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlBottom
        .WrapText = False
        .Orientation = 0
        .AddIndent = False
        .IndentLevel = 0
        .ShrinkToFit = False
        .ReadingOrder = xlContext
        .MergeCells = True
    End With
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark2
        .TintAndShade = 0
        .PatternTintAndShade = 0
    End With
    Sheets("Balance Sheet").Columns("B:B").Select
    Selection.NumberFormat = "#,##0.00"
End Sub


Sub Macro2()
'
' Macro2 Macro
'

'
    
ThisWorkbook.Worksheets("Balance Sheet").Select
    Range("A3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.149998474074526
        .PatternTintAndShade = 0
    End With
    Range("B3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.149998474074526
        .PatternTintAndShade = 0
    End With
    Range("A3").Select
    ActiveCell.FormulaR1C1 = "Client"
    Range("B3").Select
    ActiveCell.FormulaR1C1 = "Balance"
    Range("B4").Select
    
    Columns("B:B").Select
    Selection.NumberFormat = "#,##0.00"
    
End Sub

Sub prepareClientSheet()

Dim startDate As Date
Dim endDate As Date
Dim wrkSheet As Worksheet
Dim clientName As String

On Error GoTo dateError


Call createBalanceSheet

Call updateNetBalance


startDate = CDate(Trim(InputBox("Enter start date.")))
endDate = CDate(Trim(InputBox("Enter end date.")))
clientName = LCase(Trim(InputBox("Enter client Name.")))

varRowBalanceSheet = 4
netBalance = 0

'clear clear the contents of an entire sheet 'sheetName'
Sheets("Balance Sheet").Cells.Delete

Call Macro1

'PURPOSE:way to find the last row number of a range

For Each wrkSheet In Excel.ThisWorkbook.Worksheets

If (isCoreSheets(wrkSheet.Name)) Then
   
   Call getClientSheet(clientName, startDate, endDate, wrkSheet)

End If

Next

ThisWorkbook.Worksheets("Balance Sheet").Range("D" & CStr(varRowBalanceSheet + 1)).Value = netBalance
ThisWorkbook.Worksheets("Balance Sheet").Range("C" & CStr(varRowBalanceSheet + 1)).FormulaR1C1 = "NET BALANCE"
ThisWorkbook.Worksheets("Balance Sheet").Range("B1").FormulaR1C1 = UCase(clientName)
ThisWorkbook.Worksheets("Balance Sheet").Range("B2").FormulaR1C1 = CStr(Format(startDate, "d MMM, yyyy")) & " To " & CStr(Format(endDate, "d MMM, yyyy"))

Exit Sub

Call Macro8

dateError:
    MsgBox ("Error:Wrong input")

End Sub

Sub Macro1()
'
' Macro1 Macro
'

'

ThisWorkbook.Worksheets("Balance Sheet").Select


    Sheets("Balance Sheet").Range("A3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
     Sheets("Balance Sheet").Range("B3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
     Sheets("Balance Sheet").Range("C3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
     Sheets("Balance Sheet").Range("D3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
     Sheets("Balance Sheet").Range("A3").Select
    ActiveCell.FormulaR1C1 = "DATE"
    With ActiveCell.Characters(Start:=1, Length:=4).Font
        .Name = "Arial"
        .FontStyle = "Regular"
        .Size = 10
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .ThemeFont = xlThemeFontNone
    End With
     Sheets("Balance Sheet").Range("B3").Select
    ActiveCell.FormulaR1C1 = "CREDIT"
    With ActiveCell.Characters(Start:=1, Length:=6).Font
        .Name = "Arial"
        .FontStyle = "Regular"
        .Size = 10
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .ThemeFont = xlThemeFontNone
    End With
     Sheets("Balance Sheet").Range("C3").Select
    ActiveCell.FormulaR1C1 = "DEBIT"
    With ActiveCell.Characters(Start:=1, Length:=5).Font
        .Name = "Arial"
        .FontStyle = "Regular"
        .Size = 10
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .ThemeFont = xlThemeFontNone
    End With
     Sheets("Balance Sheet").Range("D3").Select
    ActiveCell.FormulaR1C1 = "BALANCE"
    With ActiveCell.Characters(Start:=1, Length:=7).Font
        .Name = "Arial"
        .FontStyle = "Regular"
        .Size = 10
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .ThemeFont = xlThemeFontNone
    End With
     Sheets("Balance Sheet").Range("A3").Select
    Selection.Font.Bold = True
     Sheets("Balance Sheet").Range("B3").Select
    Selection.Font.Bold = True
     Sheets("Balance Sheet").Range("C3").Select
    Selection.Font.Bold = True
     Sheets("Balance Sheet").Range("D3").Select
    Selection.Font.Bold = True
    
    
     Sheets("Balance Sheet").Columns("D:D").Select
    Selection.NumberFormat = "#,##0.00"
     Sheets("Balance Sheet").Columns("C:C").Select
    Selection.NumberFormat = "#,##0.00"
     Sheets("Balance Sheet").Columns("B:B").Select
    Selection.NumberFormat = "#,##0.00"
    
End Sub

Sub getClientSheet(clientName As String, startDate As Date, endDate As Date, wrkSheet As Worksheet)

Dim firstRow As Integer
Dim lastRow As Long
Dim varDate As Date
Dim varName As String
Dim varCredit As Long
Dim VarDebit As Long
Dim varBalance As Long
Dim balanceSheet As Worksheet
Dim daySheet As Worksheet



Set daySheet = ThisWorkbook.Worksheets(wrkSheet.Name)
Set balanceSheet = ThisWorkbook.Worksheets("Balance Sheet")

firstRow = 4

lastRow = daySheet.Cells(daySheet.Rows.Count, "A").End(xlUp).Row

While (firstRow <= lastRow)
     varDate = daySheet.Range("A" & CStr(firstRow)).Value
     varName = LCase(Trim(daySheet.Range("B" & CStr(firstRow)).Value))
    If (clientName = varName) And (varDate >= startDate And varDate <= endDate) Then
    
    varCredit = daySheet.Range("C" & CStr(firstRow)).Value
    VarDebit = daySheet.Range("D" & CStr(firstRow)).Value
    balanceSheet.Range("A" & CStr(varRowBalanceSheet)).Value = varDate
    balanceSheet.Range("B" & CStr(varRowBalanceSheet)).Value = varCredit
    balanceSheet.Range("C" & CStr(varRowBalanceSheet)).Value = VarDebit
    balanceSheet.Range("D" & CStr(varRowBalanceSheet)).Value = varCredit - VarDebit
    netBalance = netBalance + varCredit - VarDebit
    varRowBalanceSheet = varRowBalanceSheet + 1
    End If
firstRow = firstRow + 1

Wend

End Sub

Sub Macro8()
'
' Macro8 Macro
' date format
'

'
    Sheets("Balance Sheet").Select
    Columns("A:A").Select
    Selection.NumberFormat = "m/d/yyyy"
    Range("D7").Select
End Sub


Sub AddNameNewSheet2()
    Dim CurrentSheetName As String

'Remember where we started
'Not needed if you don't want to return
'to where you started but want to stay
'on the New Sheet

    CurrentSheetName = ActiveSheet.Name

'Add New Sheet
    Sheets.Add

'Make sure the name is valid
    On Error Resume Next

'Get the new name
     ActiveSheet.Name = InputBox("Name for new worksheet?")

'Keep asking for name if name is invalid
    Do Until Err.Number = 0
        Err.Clear
        ActiveSheet.Name = InputBox("Try Again!" _
          & vbCrLf & "Invalid Name or Name Already Exists" _
          & vbCrLf & "Please name the New Sheet")
    Loop
    On Error GoTo 0

'Go back to where you started
'Not needed if you don't want to return
'to where you started but want to stay
'on the New Sheet
    Call Macro10(ActiveSheet.Name)
    ActiveSheet.Move after:=Worksheets(Worksheets.Count)
    Sheets(CurrentSheetName).Select


End Sub

Sub Macro10(sheetName As String)
'
' Macro10 Macro
'

'
    Sheets(sheetName).Select
    Sheets(sheetName).Range("B3").Select
    Selection.Font.Bold = True
    ActiveCell.FormulaR1C1 = "CLIENT NAME"
    Sheets(sheetName).Range("C3").Select
    Selection.Font.Bold = True
    ActiveCell.FormulaR1C1 = "CREDIT"
    Sheets(sheetName).Range("D3").Select
    Selection.Font.Bold = True
    ActiveCell.FormulaR1C1 = "DEBIT"
    Sheets(sheetName).Range("E3").Select
    Selection.Font.Bold = True
    ActiveCell.FormulaR1C1 = "NET"
    Sheets(sheetName).Range("A3").Select
    Selection.Font.Bold = True
    ActiveCell.FormulaR1C1 = "DATE"
    Sheets(sheetName).Columns("A:A").Select
    Selection.NumberFormat = "m/d/yyyy"
End Sub


Function isCoreSheets(sheetName As String) As Boolean
    isCoreSheets = (StrComp(sheetName, "Balance Sheet", vbTextCompare) <> 0) And (StrComp(sheetName, "Controls", vbTextCompare))
End Function

