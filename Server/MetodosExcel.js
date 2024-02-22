import { InvoicesReport } from './InvoicesReport';

export function AddHeaders(SheetsArray) {
    SheetsArray.forEach(sheet => {
        sheet.columns = [
            { header: "RFC", key: "rfc", width: 40 },
            { header: "Nombre completo", key: "nombre", width: 45 },
            { header: "Grupo de clientes", key: "grupo_clientes", width: 17 },
            { header: "Estatus de la firma", key: "status_firma", width: 20 },
            { header: "Fecha de expiración de la firma", key: "fecha_vencimiento_firma", width: 30 },
            { header: "Estatus del sello", key: "status_sello", width: 20 },
            { header: "Fecha de expiración del sello", key: "fecha_vencimiento_sello", width: 30 }
        ];

        SetHeaderStyles(sheet);
    });
}

export function SetHeaderStyles(sheet) {
    const cells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];

    cells.forEach(cel => {
        sheet.getCell(cel).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
        sheet.getCell(cel).font = { name: 'Arial', size: 10, color: { argb: 'FFFFFF' } };
    });
}

export function AgregarRenglones(sheet, data) {
    data.forEach(row => {
        sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'] == 1? "Vigente" : "Vencido",
            row['fecha_vencimiento_firma'], row['status_sello'] == 1? "Vigente" : "Vencido", row['fecha_vencimiento_sello'],]);
    });

    SetHeaderStyles(sheet, data);
}

export function AddRowsByClientGroup(sheet, data, group) {
    data.forEach(row => {
        if(row['grupo_clientes'] === group)
        {
            sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'],
                row['fecha_vencimiento_firma'], row['status_sello'], row['fecha_vencimiento_sello']]);
        }
    });

    SetHeaderStyles(sheet, data);
}

export function SetRowStyle(sheet, data) {
    for(let i = 2; i <= data.length + 1; i++) {
        // Asignar colores alternados a las filas pares e impares
        if(i % 2 === 0) {
            sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }; // color claro
        } else {
            sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // color oscuro
        }
    }
}

export function SetCellFormat(sheet, lastRowNumber) {
    const columnsArray = ['H', 'I', 'J', 'K', 'L', 'M', 'N'];

    columnsArray.forEach(col => {
        let cell = sheet.getCell(col + lastRowNumber);
        cell.numFmt = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
    });
}

export function FillInvoicesReportSheet(sheet, data, name, SumatoryFlag = false) {
    const myInvoicesReport = new InvoicesReport(data);

    let currentDate = new Date().getFullYear();

    sheet.mergeCells('A1:N1');
    sheet.mergeCells('A2:N2');
    sheet.getCell('A2').value = name + " " + currentDate;
    sheet.getCell('A2').font = { bold: true };
    sheet.getCell('B2').alignment = { horizontal: 'center' };
    sheet.addRow();

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
    SetColumnsWidth(hoja, ['H', 'I', 'J', 'K', 'L', 'M', 'N'], 13);

    myInvoicesReport.Data.forEach(row => {
        SetCellFormat(sheet, sheet.lastRow.number);

        sheet.addRow(['', '', row.Date, row.Serie, row.Folio, row.EmitterRfc, row.EmitterName, row.SubTotal, row.IsrRet, row.IvaRet,
            row.Ieps, row.IvaAtEightPercent, row.IvaAtSixteenPercent, row.Total, '', row.Concept]);
    });

    const number = sheet.lastRow.number;

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

export function FillDiotFormulas(cell, value, isBold = false, cellFormat = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-') {
    cell.value = value;
    cell.numFmt = cellFormat;
    cell.font = { bold: isBold }
}

export function SetTotalsDiot(textCell, valueCell, textValueCell, formulaCell){
    textCell.value = textValueCell;
    textCell.font = { bold: true };
    textCell.alignment = { horizontal: 'right' };
    valueCell.value = formulaCell;
    valueCell.border = {
        top: { style: 'thin', color: { argb:'00000000' } },
        bottom: { style: 'double', color: { argb:'00000000' } }
    };

    valueCell.font = { bold: true };
    valueCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb:'00FF00' },
    };

    valueCell.numFmt = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
}

export function SetColumnsWidth(sheet, columnsArray, width){
    columnsArray.forEach(col => {
        sheet.getColumn(col).width = width;
    });
}