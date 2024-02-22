export function RegresarRegistrosPorVencer(results) {
    let data = [];
    let segmentosFirma, segmentosSellos, fechaFirma, fechaSello, fechaActual = new Date(), bandera;
    results.forEach(row => {
        bandera = false; //Sirve para saber si podemos meter el registro al arreglo "data"
        if (row['fecha_vencimiento_firma'] != "" && row['fecha_vencimiento_firma'] != null) {
            segmentosFirma = row['fecha_vencimiento_firma'].split("-");
            fechaFirma = new Date(segmentosFirma[2], segmentosFirma[1] - 1, segmentosFirma[0]);
            if (fechaFirma.getFullYear() == fechaActual.getFullYear()) {
                bandera = true;
            }
        }
        if (row['fecha_vencimiento_sello'] != "" && row['fecha_vencimiento_sello'] != null) {
            segmentosSellos = row['fecha_vencimiento_sello'].split("-");
            fechaSello = new Date(segmentosSellos[2], segmentosSellos[1] - 1, segmentosSellos[0]);
            if (fechaSello.getFullYear() == fechaActual.getFullYear()) {
                bandera = true;
            }
        }
        if (bandera) {
            data.push(row);
        }
    });
    return data;
}
export function FiltarRegistroPorVencerEnLaSemana(results) {
    let virtualData = [], data = [], fechaActual = new Date(), fechaActualMasDosSemanas = new Date(), segmentosFirma, segmentosSellos, bandera = false;
    fechaActualMasDosSemanas.setDate(fechaActualMasDosSemanas.getDate() + 14);
    virtualData = RegresarRegistrosPorVencer(results);
    virtualData.forEach(row => {
        bandera = false;
        if (row['fecha_vencimiento_firma'] != "" && row['fecha_vencimiento_firma'] != null) {
            segmentosFirma = row['fecha_vencimiento_firma'].split("-");
            let fechaVencimientoFirma = new Date(segmentosFirma[2], segmentosFirma[1] - 1, segmentosFirma[0]);
            if (fechaVencimientoFirma >= fechaActual && fechaVencimientoFirma <= fechaActualMasDosSemanas) {
                row['status_firma'] = "Por vencer";
                bandera = true;
            }
            else {
                row['status_firma'] = "Vigente";
            }
        }
        if (row['fecha_vencimiento_sello'] != "" && row['fecha_vencimiento_sello'] != null) {
            segmentosSellos = row['fecha_vencimiento_sello'].split("-");
            let fechaVencimientoSello = new Date(segmentosSellos[2], segmentosSellos[1] - 1, segmentosSellos[0]);
            if (fechaVencimientoSello >= fechaActual && fechaVencimientoSello <= fechaActualMasDosSemanas) {
                row['status_sello'] = "Por vencer";
                bandera = true;
            }
            else {
                row['status_sello'] = "Vigente";
            }
        }
        if (bandera) {
            data.push(row);
        }
    });
    return data;
}
