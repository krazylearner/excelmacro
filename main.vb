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

		Set daySheet = Excel.ThisWorkbook.Worksheets(wrkSheet.name)

		firstRow = 4

		lastRow = daySheet.Cells(daySheet.Rows.Count, "A").End(xlUp).Row

		While (firstRow <= lastRow)

			Excel.Sheets(daySheet.name).Range("E" & firstRow).Formula = "=SUM(C" & firstRow & ")-SUM(D" & firstRow & ")"

				firstRow = firstRow + 1

		Wend

	End If

End Sub

