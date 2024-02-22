export class InvoicesReportExcelDocument {
    //Private attributes
    WoorkBook;
    //Private attributes to set woorksheets
    SummarySheet;
    ReceivedInvoicesSheet;
    DiotSheet; //Default value is null, will be assigned in the constructor
    //Private attributes to use as constants
    _strCellFormat = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
    _strMainColumnsArray = ['H', 'I', 'J', 'K', 'L', 'M', 'N'];
    //Constructor
    constructor(workBook) {
        this.WoorkBook = workBook;
        this.SummarySheet = this.WoorkBook.addWorksheet('RESUMEN');
        this.ReceivedInvoicesSheet = this.WoorkBook.addWorksheet('GASTOS');
    }
    //This method allows to fill workbook sheets and must be use it in FillSummarySheet and FillReceivedInvoicesSheet
    FillInvoicesReportSheet(sheet, invoicesReport, name, SumatoryFlag = false) {
        const myInvoicesReport = invoicesReport;
        let currentDate = new Date().getFullYear();
        sheet.mergeCells('A1:N1');
        sheet.mergeCells('A2:N2');
        sheet.getCell('A2').value = name + " " + currentDate;
        sheet.getCell('A2').font = { bold: true };
        sheet.getCell('B2').alignment = { horizontal: 'center' };
        sheet.addRow('');
        sheet.addRow(['', '', 'Fecha', 'Serie', 'Folio', 'RFC Emisor', 'Nombre Emisor', 'Sub Total', 'Ret. ISR', 'Ret. IVA', 'IEPS', 'IVA 8%', 'IVA 16%', 'Total', '', "Concepto"]);
        sheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });
        sheet.getColumn('A').width = 2;
        sheet.getColumn('B').width = 0;
        sheet.getColumn('C').width = 11;
        sheet.getColumn('D').width = 6;
        sheet.getColumn('E').width = 7;
        sheet.getColumn('F').width = 16.29;
        sheet.getColumn('G').width = 49;
        sheet.getColumn('C').alignment = { horizontal: 'center' };
        sheet.getColumn('D').alignment = { horizontal: 'center' };
        sheet.getColumn('E').alignment = { horizontal: 'center' };
        sheet.getColumn('F').alignment = { horizontal: 'center' };
        this.SetColumnsWidth(sheet, this._strMainColumnsArray, 13);
        myInvoicesReport.InvoicesList.forEach(row => {
            sheet.addRow(['', '', row.Date, row.Serie, row.Folio, row.SenderRfc, row.SenderName, row.SubTotal, row.IsrRet, row.IvaRet,
                row.Ieps, row.IvaAtEightPercent, row.IvaAtSixteenPercent, row.Total, '', row.Description]);
            this._strMainColumnsArray.forEach(col => {
                let cell = sheet.getCell(col + sheet.lastRow.number);
                cell.numFmt = this._strCellFormat;
            });
        });
        const number = sheet.lastRow.number;
        if (SumatoryFlag) {
            sheet.addRow(['', '', '', '', '', '', 'TOTAL DE GASTOS:', { formula: `SUM(H5:${"H" + number})` },
                { formula: `SUM(I5:${"I" + number})` }, { formula: `SUM(J5:${"J" + number})` }, { formula: `SUM(K5:${"K" + number})` },
                { formula: `SUM(L5:${"L" + number})` }, { formula: `SUM(M5:${"M" + number})` }, { formula: `SUM(N5:${"N" + number})` }]);
            let i = 1;
            sheet.getRow(number).eachCell(cell => {
                if (i == 7) {
                    cell.font = { bold: true };
                    cell.alignment = { horizontal: 'right' };
                    cell.border = {
                        top: { style: 'double', color: { argb: '00000000' } },
                        bottom: { style: 'double', color: { argb: '00000000' } }
                    };
                    cell.numFmt = this._strCellFormat;
                }
                else {
                    i++;
                }
            });
        }
    }
    //This method is responsable to fill SummarySheet
    FillSummarySheet(invoicesReport, name) {
        try {
            this.FillInvoicesReportSheet(this.SummarySheet, invoicesReport, name);
        }
        catch (error) {
            console.log('Error in FillSummarySheet(): ' + error);
            throw new Error("Hubo un error al llenar la hoja: " + name);
        }
    }
    //This method is responsable to fill ReceivedInvoicesSheet
    FillReceivedInvoicesSheet(invoicesReport, name) {
        try {
            this.FillInvoicesReportSheet(this.ReceivedInvoicesSheet, invoicesReport, name, true);
        }
        catch (error) {
            console.log('Error in FillReceivedInvoicesSheet(): ' + error);
            throw new Error('Hubo un error al llenar la hoja: ' + name);
        }
    }
    //This method is responsabe to add an extra workbook sheet called "DIOT"
    AddDiotSheet() {
        try {
            this.DiotSheet = this.WoorkBook.addWorksheet("DIOT");
            //Asigna el tamaño de las columnas
            this.DiotSheet.getColumn('A').width = 3;
            this.DiotSheet.getColumn('B').width = 25.14;
            this.SetColumnsWidth(this.DiotSheet, ['C', 'D', 'E', 'F', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'V', 'W', 'X'], 0);
            this.SetColumnsWidth(this.DiotSheet, ['AB', 'AC'], 5);
            this.SetColumnsWidth(this.DiotSheet, ['Y', 'Z', 'AA', 'AD'], 13);
            this.SetColumnsWidth(this.DiotSheet, ['G', 'L', 'T', 'U'], 20);
            //Combina las celdas
            this.DiotSheet.mergeCells('B1:AD1');
            this.DiotSheet.mergeCells('B2:AD2');
            //Asigna el texto a las celdas para que sirvan como encabezados
            this.DiotSheet.getCell('B4').value = "RFC EMISOR";
            this.DiotSheet.getCell('G4').value = "SUBTOTAL 16%";
            this.DiotSheet.getCell('L4').value = "SUBTOTAL 8%";
            this.DiotSheet.getCell('T4').value = "SUBTOTAL 0%";
            this.DiotSheet.getCell('U4').value = "SUBTOTAL GASTOS";
            this.DiotSheet.getCell('Y4').value = "IVA 8%";
            this.DiotSheet.getCell('Z4').value = "IVA 16%";
            this.DiotSheet.getCell('AA4').value = "RET. IVA";
            this.DiotSheet.getCell('AD4').value = "DIFERENCIAS";
            //Array con la letras de las columnas de los headers
            const columnasDiot = ['B', 'G', 'L', 'T', 'U', 'Y', 'Z', 'AA', 'AD'];
            for (let i = 0; i < columnasDiot.length; i++) {
                this.DiotSheet.getCell(columnasDiot[i] + '4').font = { bold: true };
                this.DiotSheet.getCell(columnasDiot[i] + '4').alignment = { horizontal: 'center' };
            }
            //Array con las columnas que llevan información
            const arrayColumnas = ['B', 'G', 'L', 'T', 'AD', 'U', 'Y', 'Z', 'AA', 'AB', 'AC'];
            let columnaEncontrada = true;
            let celda;
            //Ciclo para recorrer las 78 filas que manejan los contadores
            for (let i = 5; i <= 78; i++) {
                arrayColumnas.forEach(columna => {
                    celda = this.DiotSheet.getCell(columna + i);
                    columna == 'B' ? this.FillDiotFormulas(celda, '', true, '') :
                        columna == 'G' ? this.FillDiotFormulas(celda, `+ROUND(${'Z' + i} / ${0.16}, 0)`) :
                            columna == 'L' ? this.FillDiotFormulas(celda, `+ROUND(${'Y' + i} / ${0.08}, 0)`) :
                                columna == 'T' ? this.FillDiotFormulas(celda, `+ROUND(${'U' + i} - ${'G' + i} - ${'L' + i}, 0)`) :
                                    columna == 'AD' ? this.FillDiotFormulas(celda, `=+${'U' + i}-${'G' + i} - ${'L' + i}-${'T' + i}`) : columnaEncontrada = false;
                    if (!columnaEncontrada) {
                        this.FillDiotFormulas(celda, '', true);
                    }
                    columnaEncontrada = true;
                });
            }
            for (let i = 1; i <= arrayColumnas.length - 3; i++) {
                celda = this.DiotSheet.getCell(arrayColumnas[i] + 79);
                this.FillDiotFormulas(celda, `SUM(${arrayColumnas[i] + 5} : ${arrayColumnas[i] + 78})`, true);
                celda.border = {
                    top: { style: 'thin', color: { argb: '00000000' } },
                    bottom: { style: 'double', color: { argb: '00000000' } }
                };
            }
            this.SetSummatoriesDiotSheet(this.DiotSheet.getCell('G81'), this.DiotSheet.getCell('L81'), "TOTAL SUBTOTAL", `SUM(G79:T79)`);
            this.SetSummatoriesDiotSheet(this.DiotSheet.getCell('T81'), this.DiotSheet.getCell('U81'), "TOTAL IVA", `SUM(Y79:Z79)`);
            this.SetSummatoriesDiotSheet(this.DiotSheet.getCell('Y81'), this.DiotSheet.getCell('Z81'), "TOTAL RET.", `=+AA79`);
        }
        catch (error) {
            console.log('Error in AddDiotSheet()' + error);
            throw new Error('Hubo un error al agregar la hoja "DIOT"');
        }
    }
    //Method to give set width to a specific range of columns the worksheet
    SetColumnsWidth(sheet, columnsArray, widthValue) {
        columnsArray.forEach(col => {
            sheet.getColumn(col).width = widthValue;
        });
    }
    //Method to set formulas in a cell
    FillDiotFormulas(cell, value, isBold = false, cellFormat = this._strCellFormat) {
        cell.value = { formula: value };
        cell.numFmt = cellFormat;
        cell.font = { bold: isBold };
    }
    //Methos to add summatories in cells
    SetSummatoriesDiotSheet(textCell, valueCell, textValueCell, formulaCell) {
        textCell.value = textValueCell;
        textCell.font = { bold: true };
        textCell.alignment = { horizontal: 'right' };
        valueCell.value = { formula: formulaCell };
        valueCell.border = {
            top: { style: 'thin', color: { argb: '00000000' } },
            bottom: { style: 'double', color: { argb: '00000000' } }
        };
        valueCell.font = { bold: true };
        valueCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '00FF00' },
        };
        valueCell.numFmt = this._strCellFormat;
    }
}
