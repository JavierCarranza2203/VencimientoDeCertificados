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
        sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'] == 1 ? "Vigente" : "Vencido",
            row['fecha_vencimiento_firma'], row['status_sello'] == 1 ? "Vigente" : "Vencido", row['fecha_vencimiento_sello'],]);
    });
    SetHeaderStyles(sheet, data);
}
export function AddRowsByClientGroup(sheet, data, group) {
    data.forEach(row => {
        if (row['grupo_clientes'] === group) {
            sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'],
                row['fecha_vencimiento_firma'], row['status_sello'], row['fecha_vencimiento_sello']]);
        }
    });
    SetHeaderStyles(sheet, data);
}
export function SetRowStyle(sheet, data) {
    for (let i = 2; i <= data.length + 1; i++) {
        // Asignar colores alternados a las filas pares e impares
        if (i % 2 === 0) {
            sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }; // color claro
        }
        else {
            sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // color oscuro
        }
    }
}
