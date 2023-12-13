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
            sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'] == 1? "Vigente" : "Vencido",
                row['fecha_vencimiento_firma'], row['status_sello'] == 1? "Vigente" : "Vencido", row['fecha_vencimiento_sello'],]);
        }
    });

    DarEstilosARenglones(sheet, data);
}

function AgregarRenglonesPorGrupoDeClientesYFechaMaximaDeUnaSemana(sheet, data, group) {
    data.forEach(row => {
        if(row['grupo_clientes'] == group)
        {
            sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'] == 1? "Vigente" : "Vencido",
                row['fecha_vencimiento_firma'], row['status_sello'] == 1? "Vigente" : "Vencido", row['fecha_vencimiento_sello'],]);
        }
    });
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

module.exports.AgregarEncabezados = AgregarEncabezados;
module.exports.AgregarRenglones = AgregarRenglones;
module.exports.AgregarRenglonesPorGrupoDeClientes = AgregarRenglonesPorGrupoDeClientes;
module.exports.AgregarRenglonesPorGrupoDeClientesYFechaMaximaDeUnaSemana = AgregarRenglonesPorGrupoDeClientesYFechaMaximaDeUnaSemana;