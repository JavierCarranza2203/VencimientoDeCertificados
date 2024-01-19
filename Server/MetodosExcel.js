const clase = require('./Factura.js');

function AgregarEncabezados(ArraySheet) {
    ArraySheet.forEach(sheet => {
        sheet.columns = [
            { header: "RFC", key: "rfc", width: 40 },
            { header: "Nombre completo", key: "nombre", width: 45 },
            { header: "Grupo de clientes", key: "grupo_clientes", width: 17 },
            { header: "Estatus de la firma", key: "status_firma", width: 20 },
            { header: "Fecha de expiración de la firma", key: "fecha_vencimiento_firma", width: 30},
            { header: "Estatus del sello", key: "status_sello", width: 20 },
            { header: "Fecha de expiración del sello", key: "fecha_vencimiento_sello", width: 30}
        ];

        DarEstilosAEncabezados(sheet);
    });
}

function DarEstilosAEncabezados(sheet) {
    const columnas = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];

    columnas.forEach(columna => {
        sheet.getCell(columna).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
        sheet.getCell(columna).font = { name: 'Arial', size: 10, color: { argb: 'FFFFFF'} };
    });
}

function AgregarRenglones(sheet, data) {
    data.forEach(row => {
        sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'] == 1? "Vigente" : "Vencido",
            row['fecha_vencimiento_firma'], row['status_sello'] == 1? "Vigente" : "Vencido", row['fecha_vencimiento_sello'],]);
    });

    DarEstilosARenglones(sheet, data);
}

function AgregarRenglonesPorGrupoDeClientes(sheet, data, group) {
    data.forEach(row => {
        if(row['grupo_clientes'] == group)
        {
            let newRow = {
                rfc: row["rfc"],
                nombre: row["nombre"],
                grupo_clientes: row["grupo_clientes"],
                status_firma: row["status_firma"],
                fecha_vencimiento_firma: row["fecha_vencimiento_firma"],
                status_sello: row["status_sello"],
                fecha_vencimiento_sello: row["fecha_vencimiento_sello"]
            };

            sheet.addRow([newRow['rfc'], newRow['nombre'], newRow['grupo_clientes'], newRow['status_firma'],
                newRow['fecha_vencimiento_firma'], newRow['status_sello'], newRow['fecha_vencimiento_sello']]);
        }
    });

    DarEstilosARenglones(sheet, data);
}

function DarEstilosARenglones(sheet, data) {
    for(let i = 2; i <= data.length + 1; i++) {                
        // Asignar colores alternados a las filas pares e impares
        if(i % 2 === 0) {
            sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }; // color claro
        } else {
            sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // color oscuro
        }
    }
}

function AsignarAnchoACeldas(sheet){
    sheet.getColumn('A').width = 2;
    sheet.getColumn('B').width = 0;
    sheet.getColumn('C').width = 11;
    sheet.getColumn('D').width = 6;
    sheet.getColumn('E').width = 7;
    sheet.getColumn('F').width = 16.29;
    sheet.getColumn('G').width = 49;
    sheet.getColumn('H').width = 13;
    sheet.getColumn('I').width = 13;
    sheet.getColumn('J').width = 13;
    sheet.getColumn('K').width = 13;
    sheet.getColumn('L').width = 13;
    sheet.getColumn('M').width = 13;
    sheet.getColumn('N').width = 13;
}

function CalcularSubTotal(tipo, subtotal, descuento){
    if(tipo == "Factura"){
        return subtotal - descuento
    }
    else if(tipo == ""){
        return 0;
    }
    else{
        return descuento - subtotal;
    }
}

function CalcularValorParaMostrar(tipo, valor){
    if(tipo == "Factura"){
        return valor;
    }
    else if(tipo == ""){
        return 0;
    }
    else{
        return valor * -1;
    }
}

function FormatearCadena(cadena) {
    return cadena.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        thousand: '.', 
        decimal: ','
    });
}

function AsignarFormatoDeCelda(hoja, ultimoNumeroDeRenglon) {
    const arrayColumnas = ['H', 'I', 'J', 'K', 'L', 'M', 'N'];

    arrayColumnas.forEach(columna => {
        let cell = hoja.getCell(columna + ultimoNumeroDeRenglon);
        cell.numFmt = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
    })
}

function LlenarHojaDeRelacionDeGastos(hoja, data, banderaSumatorias = false) {
    const Relacion = new clase.Relacion(data);

    AsignarAnchoACeldas(hoja);
    let fechaActual = new Date().getFullYear();

    hoja.mergeCells('A1:N1');
    hoja.mergeCells('A2:N2');
    hoja.getCell('A2').value = "GASTOS MES DE " + fechaActual;
    hoja.getCell('A2').font = { bold:true };
    hoja.getCell('B2').alignment = { horizontal: 'center' };
    hoja.addRow();

    hoja.addRow(['', '', 'Fecha', 'Serie', 'Folio', 'RFC Emisor', 'Nombre Emisor', 'Sub Total', 'Ret. ISR', 'Ret. IVA', 'IEPS', 'IVA 8%', 'IVA 16%', 'Total', '', "Concepto"]);

    hoja.getRow(4).eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
    });

    Relacion.Datos.forEach(row => {
        AsignarFormatoDeCelda(hoja, hoja.lastRow.number);

        hoja.addRow(['', '', row.Fecha, row.Serie, row.Folio, row.RfcEmisor, row.NombreEmisor, row.SubTotal, row.RetIsr, row.RetIva,
            row.Ieps, row.Iva8, row.Iva16, row.Total, '', row.Concepto]);
    });

    const numero = hoja.lastRow.number;

    AsignarFormatoDeCelda(hoja, numero);

    if(banderaSumatorias) {
        hoja.addRow(['', '', '', '', '', '', 'TOTAL DE GASTOS:', { formula: `SUM(H5:${"H" + numero})` }, 
            { formula: `SUM(I5:${"I" + numero})` }, { formula: `SUM(J5:${"J" + numero})`}, {formula: `SUM(K5:${"K" + numero})` },
            { formula: `SUM(L5:${"L" + numero})` }, { formula: `SUM(M5:${"M" + numero})`}, {formula: `SUM(N5:${"N" + numero})` }]);

        let i = 1;
        hoja.getRow(hoja.lastRow.number).eachCell(cell => {
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

function LlenarFormulasDiot(celda, valor, esNegrita = false, formatoDeCelda = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-') {
    celda.value = valor;
    celda.numFmt = formatoDeCelda;
    celda.font = { bold: esNegrita }
}

function AgregarTotalesDiot(celdaTexto, celdaValor, valorCeldaTexto, formulaCeldaValor){
    celdaTexto.value = valorCeldaTexto;
    celdaTexto.font = { bold: true };
    celdaTexto.alignment = { horizontal: 'right' };

    celdaValor.value = formulaCeldaValor;
    celdaValor.border = {
        top: { style:'thin', color: { argb:'00000000' } },
        bottom: { style:'double', color: { argb:'00000000' } }
    };
    celdaValor.font = { bold: true };
    celdaValor.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb:'00FF00' },
    };
    celdaValor.numFmt = '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-';
}

module.exports.AgregarEncabezados = AgregarEncabezados;
module.exports.AgregarRenglones = AgregarRenglones;
module.exports.AgregarRenglonesPorGrupoDeClientes = AgregarRenglonesPorGrupoDeClientes;
module.exports.CalcularSubTotal = CalcularSubTotal;
module.exports.CalcularValorParaMostrar = CalcularValorParaMostrar;
module.exports.FormatearCadena = FormatearCadena;
module.exports.LlenarHojaDeRelacionDeGastos = LlenarHojaDeRelacionDeGastos;
module.exports.LlenarFormulasDiot = LlenarFormulasDiot;
module.exports.AgregarTotalesDiot = AgregarTotalesDiot;