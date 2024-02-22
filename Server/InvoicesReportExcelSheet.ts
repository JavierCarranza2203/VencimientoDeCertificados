import ExcelJS from 'exceljs';
import { InvoicesReport } from './InvoicesReport';

export class InvoicesReportExcelSheet {
    private WoorkBook : ExcelJS.Workbook;
    private SummarySheet : ExcelJS.Worksheet;
    private ReceivedInvoicesSheet : ExcelJS.Worksheet;
    private DiotSheet : ExcelJS.Worksheet;

    private _strCellFormat : string = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
    private _strMainColumnsArray : string[] = ['H', 'I', 'J', 'K', 'L', 'M', 'N'];

    constructor(workBook : ExcelJS.Workbook) {
        this.WoorkBook = workBook;
        this.SummarySheet = this.WoorkBook.addWorksheet('RESUMEN');
        this.ReceivedInvoicesSheet = this.WoorkBook.addWorksheet('GASTOS');
    }

    private FillInvoicesReportSheet(sheet : ExcelJS.Worksheet, invoicesReport : InvoicesReport, name : string, SumatoryFlag : boolean = false) {
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
                let cell = sheet.getCell(col + sheet.lastRow?.number);
                cell.numFmt = this._strCellFormat;
            });
        });
    
        const number = sheet.lastRow?.number;
    
        AsignarFormatoDeCelda(hoja, number);
    
        if(SumatoryFlag) {
            sheet.addRow(['', '', '', '', '', '', 'TOTAL DE GASTOS:', { formula: `SUM(H5:${"H" + number})` },
                { formula: `SUM(I5:${"I" + number})` }, { formula: `SUM(J5:${"J" + number})`}, {formula: `SUM(K5:${"K" + number})` },
                { formula: `SUM(L5:${"L" + number})` }, { formula: `SUM(M5:${"M" + number})`}, {formula: `SUM(N5:${"N" + number})` }]);
    
            let i = 1;
            sheet.getRow(sheet.lastRow.number).eachCell(cell => {
                if(i == 7) {
                    cell.font = { bold: true };
                    cell.alignment = { horizontal: 'right' };
                    cell.border = {
                        top: { style:'double', color: { argb:'00000000' } },
                        bottom: { style:'double', color: { argb:'00000000' } }
                    };
                    cell.numFmt = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
                }
                else {
                    i++;
                }
            });
        }
    }

    private SetColumnsWidth(sheet, columnsArray, width){
        columnsArray.forEach(col => {
            sheet.getColumn(col).width = width;
        });
    }
}