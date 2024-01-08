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
    let fechaActual = new Date();

    data.forEach(row => {
        if(row['grupo_clientes'] == group)
        {
            let newRow = {
                rfc: row["rfc"],
                nombre: row["nombre"],
                grupo_clientes: row["grupo_clientes"],
                status_firma: row["status_firma"]? "Vigente" : "Vencida",
                fecha_vencimiento_firma: row["fecha_vencimiento_firma"],
                status_sello: row["status_firma"]? "Vigente" : "Vencido",
                fecha_vencimiento_sello: row["fecha_vencimiento_firma"]
            };

            console.log(newRow);

            let segmentosFirma = row['fecha_vencimiento_firma'].split("-");
            let segmentosSellos = row['fecha_vencimiento_sello'].split("-");

            if(segmentosFirma[0] >= fechaActual.getDay() && segmentosFirma[0] <= fechaActual.getDay() + 7 && segmentosFirma[1] == fechaActual.getMonth())
            {
                newRow["status_firma"] = "Por vencer";
            }
            
            if(segmentosSellos[0] >= fechaActual.getDay() && segmentosSellos[0] <= fechaActual.getDate() + 7 && segmentosSellos[1] == fechaActual.getMonth())
            {
                newRow["status_sello"] = "Por vencer";
            }

            console.log(newRow);

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

function FormatearCadena(cadena) {
    if(cadena != 0 || cadena != '0') {
        return cadena.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            thousand: '.', 
            decimal: ','
        });
    }
    else {
        throw new Error("Debe tener un valor");
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

module.exports.AgregarEncabezados = AgregarEncabezados;
module.exports.AgregarRenglones = AgregarRenglones;
module.exports.AgregarRenglonesPorGrupoDeClientes = AgregarRenglonesPorGrupoDeClientes;
module.exports.FormatearCadena = FormatearCadena;
module.exports.AsignarAnchoACeldas = AsignarAnchoACeldas;
module.exports.CalcularSubTotal = CalcularSubTotal;
module.exports.CalcularValorParaMostrar = CalcularValorParaMostrar;