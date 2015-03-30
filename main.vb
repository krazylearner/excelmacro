Dim varRowBalanceSheet As Integer
Dim netBalance As Long
Dim d As Object



Sub prepareBalanceSheet()

Dim wrkSheet As Worksheet

Set d = CreateObject("scripting.dictionary")

For Each wrkSheet In Excel.ThisWorkbook.Worksheets

If (StrComp(wrkSheet.name, "Balance Sheet", vbTextCompare) <> 0) Then
   
   
   Call selectDistinct(wrkSheet)

End If

Next

Call getBalanceSheet

Call Macro2

End Sub

Sub selectDistinct(wrkSheet As Worksheet)

    Dim daySheet As Worksheet
    Dim firstRow As Integer
    Dim lastRow As Integer
    
    firstRow = 4
    
    Dim k As Variant
    Dim varBalance As Long
    
    Dim tmp As String
    
    Set daySheet = ThisWorkbook.Worksheets(wrkSheet.name)
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

Sub prepareClientSheet()

Dim startDate As Date
Dim endDate As Date
Dim wrkSheet As Worksheet
Dim clientName As String

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

If (StrComp(wrkSheet.name, "Balance Sheet", vbTextCompare) <> 0) Then
   
   Call getClientSheet(clientName, startDate, endDate, wrkSheet)

End If

Next

ThisWorkbook.Worksheets("Balance Sheet").Range("D" & CStr(varRowBalanceSheet + 1)).Value = netBalance
ThisWorkbook.Worksheets("Balance Sheet").Range("C" & CStr(varRowBalanceSheet + 1)).FormulaR1C1 = "NET BALANCE"
ThisWorkbook.Worksheets("Balance Sheet").Range("B1").FormulaR1C1 = UCase(clientName)
ThisWorkbook.Worksheets("Balance Sheet").Range("B2").FormulaR1C1 = CStr(Format(startDate, "d MMM, yyyy")) & " To " & CStr(Format(endDate, "d MMM, yyyy"))



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
End Sub

Sub Macro1()
'
' Macro1 Macro
'

'

ThisWorkbook.Worksheets("Balance Sheet").Select


    Range("A3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
    Range("B3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
    Range("C3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
    Range("D3").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
    Range("A3").Select
    ActiveCell.FormulaR1C1 = "DATE"
    With ActiveCell.Characters(Start:=1, Length:=4).Font
        .name = "Arial"
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
    Range("B3").Select
    ActiveCell.FormulaR1C1 = "CREDIT"
    With ActiveCell.Characters(Start:=1, Length:=6).Font
        .name = "Arial"
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
    Range("C3").Select
    ActiveCell.FormulaR1C1 = "DEBIT"
    With ActiveCell.Characters(Start:=1, Length:=5).Font
        .name = "Arial"
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
    Range("D3").Select
    ActiveCell.FormulaR1C1 = "BALANCE"
    With ActiveCell.Characters(Start:=1, Length:=7).Font
        .name = "Arial"
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
    Range("A3").Select
    Selection.Font.Bold = True
    Range("B3").Select
    Selection.Font.Bold = True
    Range("C3").Select
    Selection.Font.Bold = True
    Range("D3").Select
    Selection.Font.Bold = True
End Sub



Sub getClientSheet(clientName As String, startDate As Date, endDate As Date, wrkSheet As Worksheet)

Dim firstRow As Integer
Dim lastRow As Long
Dim varDate As Date
Dim varName As String
Dim varCredit As Long
Dim varDebit As Long
Dim varBalance As Long
Dim balanceSheet As Worksheet
Dim daySheet As Worksheet



Set daySheet = ThisWorkbook.Worksheets(wrkSheet.name)
Set balanceSheet = ThisWorkbook.Worksheets("Balance Sheet")

firstRow = 4

lastRow = daySheet.Cells(daySheet.Rows.Count, "A").End(xlUp).Row

While (firstRow <= lastRow)
     varDate = daySheet.Range("A" & CStr(firstRow)).Value
     varName = LCase(Trim(daySheet.Range("B" & CStr(firstRow)).Value))
    If (clientName = varName) And (varDate >= startDate And varDate <= endDate) Then
    
    varCredit = daySheet.Range("C" & CStr(firstRow)).Value
    varDebit = daySheet.Range("D" & CStr(firstRow)).Value
    balanceSheet.Range("A" & CStr(varRowBalanceSheet)).Value = varDate
    balanceSheet.Range("B" & CStr(varRowBalanceSheet)).Value = varCredit
    balanceSheet.Range("C" & CStr(varRowBalanceSheet)).Value = varDebit
    balanceSheet.Range("D" & CStr(varRowBalanceSheet)).Value = varCredit - varDebit
    netBalance = netBalance + varCredit - varDebit
    varRowBalanceSheet = varRowBalanceSheet + 1
    End If
firstRow = firstRow + 1

Wend

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
Dim daySheet As Worksheet

If (StrComp(wrkSheet.name, "Balance Sheet", vbTextCompare) <> 0) Then

Set daySheet = ThisWorkbook.Worksheets(wrkSheet.name)

firstRow = 4

lastRow = daySheet.Cells(daySheet.Rows.Count, "A").End(xlUp).Row

While (firstRow <= lastRow)

Excel.Sheets(daySheet.name).Range("E" & firstRow).Formula = "=SUM(C" & firstRow & ")-SUM(D" & firstRow & ")"

firstRow = firstRow + 1

Wend

End If

End Sub

