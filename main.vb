Public LCopyToRow As Integer

Sub SearchForString()

     Dim LSearchRow As Integer
     Dim LCopyToRow As Integer
     Dim myValue As Variant
     Dim sheetName As Variant
     sheetName = "Balance Sheet"
     myValue = InputBox("Enter client name.")
    
     On Error GoTo Err_Execute
     
    
    'clear clear the contents of an entire sheet 'sheetName'
    Sheets(sheetName).Cells.ClearContents
    Call FormatBalanceSheetHeader("Client Name", "Date", "Credit", "Debit")
    
    Sheets("Sheet1").Select
    
    'Start search in row 4
    LSearchRow = 4
    
    'Start copying data to row 2 in sheetName (row counter variable)
    LCopyToRow = 2
    
    While Len(Range("A" & CStr(LSearchRow)).Value) > 0
        
        'If value in column E = "Mail Box", copy entire row to Sheet2
       If Trim(Range("A" & CStr(LSearchRow)).Value) = Trim(myValue) Then
            
            'Select row in Sheet1 to copy
           Rows(CStr(LSearchRow) & ":" & CStr(LSearchRow)).Select
            Selection.Copy
            
            'Paste row into Sheet2 in next row
            Sheets(sheetName).Select
           Rows(CStr(LCopyToRow) & ":" & CStr(LCopyToRow)).Select
           ActiveSheet.Paste
            
            'Move counter to next row
            LCopyToRow = LCopyToRow + 1
            
            'Go back to Sheet1 to continue searching
            Sheets("Sheet1").Select
            
        End If
        
        LSearchRow = LSearchRow + 1
        
    Wend
    
    ' Add formating to Cell which will contain Balance
    Call formatCell
    
    ' Calculate Balance and put it in cell I11
    Call calculateBalance
    
    'Position on cell A3
    Excel.Sheets("Sheet1").Select
    
    Application.CutCopyMode = False
    Range("A3").Select
    
    MsgBox "Done"
    
    Exit Sub
    
Err_Execute:
    MsgBox "An error occurred."
    
End Sub

Sub formatCell()
'
' Recorded Macro to format Cell
'
    Excel.Sheets("Balance Sheet").Select
    Range("I11").Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThick
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThick
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThick
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = xlAutomatic
        .TintAndShade = 0
        .Weight = xlThick
    End With
    Selection.Borders(xlInsideVertical).LineStyle = xlNone
    Selection.Borders(xlInsideHorizontal).LineStyle = xlNone
End Sub

Sub calculateBalance()
    
    ' Putting string 'Balance' in cell H11
     Excel.Sheets("Balance Sheet").Range("H11").Value = "Balance"
     
     ' Total sum of column C - total sum of column D in Balance sheet
     Excel.Sheets("Balance Sheet").Range("I11").Formula = "=Sum(C:C)-Sum(D:D)"
     
End Sub

Sub calculateBalanceOne()
    
    ' Putting string 'Balance' in cell H11
     Excel.Sheets("Balance Sheet").Range("H11").Value = "Balance"
     
     ' Total sum of column C - total sum of column D in Balance sheet
     Excel.Sheets("Balance Sheet").Range("I11").Formula = "=Sum(D:D)"
     
End Sub


 Sub selectDistinct()

   
    Dim d As Object, c As Range, k, tmp As String
    
    Set c = Range(Range("A4"), Range("A4").End(xlDown))
    
    c.Select
    Set d = CreateObject("scripting.dictionary")
    For Each c In Selection
        tmp = Trim(c.Value)
        If Len(tmp) > 0 Then d(tmp) = d(tmp) + 1
    Next c

    Call clearSheetContents
    Call FormatBalanceSheetHeader("Client Name", "Total Credit", "Total Debit", "Balance")
    'Start copying data to row 2 in sheetName (row counter variable)
    LCopyToRow = 2
    
    For Each k In d.keys
        'MsgBox (k & d(k))
        Call stringSearchOne(k)
    Next k
    
     'Add formating to Cell which will contain Balance
     Call formatCell
     
     'Calculate Balance and put it in cell I11
     Call calculateBalanceOne
     
     MsgBox ("Balance Sheet Prepared")
    
    'Position on cell A3
    Excel.Sheets("Sheet1").Select
    Range("A3").Select
    
    
    
    
End Sub

Sub clearSheetContents()

  Dim sheetName As Variant
  sheetName = "Balance Sheet"

 'clear clear the contents of an entire sheet 'sheetName'
  Sheets(sheetName).Cells.ClearContents


End Sub

Sub stringSearchOne(nameKey As Variant)

     Dim LSearchRow As Integer
     Dim myValue As Variant
     Dim sheetName As Variant
     Dim sumTotalCredit As Integer
     Dim sumTotalDebit As Integer
     
     'Initalizing local variables
     sheetName = "Balance Sheet"
     sumTotalCredit = 0
     sumTotalDebit = 0
     
     myValue = nameKey
    
     On Error GoTo Err_Execute
     
    
    'Start search in row 4
    LSearchRow = 4
    
    'Go back to Sheet1 to continue searching
     Sheets("Sheet1").Select
    
    
    While Len(Range("A" & CStr(LSearchRow)).Value) > 0
        
        'If value in column E = "Mail Box", copy entire row to Sheet2
        If Trim(Range("A" & CStr(LSearchRow)).Value) = Trim(myValue) Then
            ' Sum total Credit values
            sumTotalCredit = sumTotalCredit + Range("C" & CStr(LSearchRow)).Value
            ' Sum total Debit Values
            sumTotalDebit = sumTotalDebit + Range("D" & CStr(LSearchRow)).Value
            
        End If
        
        LSearchRow = LSearchRow + 1
        
    Wend
    
    ' Selecting sheet
    Excel.Sheets(sheetName).Select
    
    ' Putting balance name credit and debit in their respective row
    Range("A" & LCopyToRow).Value = nameKey
    Range("B" & LCopyToRow).Value = sumTotalCredit
    Range("C" & LCopyToRow).Value = sumTotalDebit
    Range("D" & LCopyToRow).Value = sumTotalCredit - sumTotalDebit
    
    'Move counter to next row
     LCopyToRow = LCopyToRow + 1
    
    
    Application.CutCopyMode = False
    
    Exit Sub
    
Err_Execute:
    MsgBox "An error occurred."
    
End Sub

Sub FormatBalanceSheetHeader(aHeader As String, bHeader As String, cHeader As String, dHeader As String)


    ' Select 'Balance Sheet' for formatting
    Excel.Sheets("Balance Sheet").Select
    ' First Remove formatting
    Excel.Columns("A").ClearFormats
    Excel.Columns("B").ClearFormats
    Excel.Columns("C").ClearFormats
    Excel.Columns("D").ClearFormats
    'Select Upper columns for formatting
    Range("A1:E1").Select
    
    'Recorded macro code .Putting Formatting
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = -0.149998474074526
        .PatternTintAndShade = 0
    End With

'Putting names of column headers
Excel.Sheets("Balance Sheet").Range("A1").Value = aHeader
Excel.Sheets("Balance Sheet").Range("B1").Value = bHeader
Excel.Sheets("Balance Sheet").Range("C1").Value = cHeader
Excel.Sheets("Balance Sheet").Range("D1").Value = dHeader

End Sub
