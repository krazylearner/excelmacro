Sub SearchForString()

    Dim LSearchRow As Integer
    Dim LCopyToRow As Integer
    Dim myValue As Variant
    Dim sheetName As Variant
    
    sheetName = "Balance Sheet"
    myValue = InputBox("Give me some input")
    
    On Error GoTo Err_Execute
    
    'Start search in row 4
    LSearchRow = 4
    
    'Start copying data to row 2 in sheetName (row counter variable)
    LCopyToRow = 2
    
    
    'clear clear the contents of an entire sheet 'sheetName'
     
    Sheets(sheetName).Cells.ClearContents
    
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
    
    
    'code for Sum total of column
    
    
    
    'Position on cell A3
    Application.CutCopyMode = False
    Range("A3").Select
    
    'MsgBox (sum2 - sum1)
    MsgBox "All matching data has been copied."
    
    
Err_Execute:
    MsgBox "An error occurred."
    
End Sub