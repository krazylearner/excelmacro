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
    
    'Start search in row 4
    LSearchRow = 4
    
    'Start copying data to row 2 in sheetName (row counter variable)
    LCopyToRow = 2
    
    While Len(Range("A" & CStr(LSearchRow)).Value) > 0
        
        'If value in column E = "Mail Box", copy entire row to Sheet2
        If Range("A" & CStr(LSearchRow)).Value = myValue Then
            
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
    
    MsgBox "All matching data has been copied."
    
    Exit Sub
    
Err_Execute:
    MsgBox "An error occurred."
    
End Sub

Sub formatCell()
'
' Macro5 Macro
'

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
    
    ' Total sum of column C - total sum of column D in Balance sheet
     Excel.Sheets("Balance Sheet").Range("I11").Formula = "=Sum(C:C)-Sum(D:D)"
     
End Sub
