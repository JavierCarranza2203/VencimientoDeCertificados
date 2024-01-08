function RegresarRegistrosPorVencer(results)
{
    let data = [];

    results.forEach(row => {
        let segmentosFirma = row['fecha_vencimiento_firma'].split("-");
        let segmentosSellos = row['fecha_vencimiento_sello'].split("-");

        let fechaFirma = new Date(segmentosFirma[2], segmentosFirma[1] - 1, segmentosFirma[0]);
        let fechaSello = new Date(segmentosSellos[2], segmentosSellos[1] - 1, segmentosSellos[0]);
        let fechaActual = new Date();

        if(fechaFirma.getFullYear() == fechaActual.getFullYear() || fechaSello.getFullYear() == fechaActual.getFullYear())
        {
            data.push(row);
        }
    });

    return data;
}

function FiltarRegistroPorVencerEnLaSemana(results)
{
    let virtualData = [];
    let data = [];
    let fechaActual = new Date();

    virtualData = RegresarRegistrosPorVencer(results);

    virtualData.forEach(row => {
        let segmentosFirma = row['fecha_vencimiento_firma'].split("-");
        let segmentosSellos = row['fecha_vencimiento_sello'].split("-");

        if(segmentosFirma[0] >= fechaActual.getDay() && segmentosFirma[0] <= fechaActual.getDay() + 7 && segmentosFirma[1] == fechaActual.getMonth())
        {
            data.push(row);
        }
        else if(segmentosSellos[0] >= fechaActual.getDay() && segmentosSellos[0] <= fechaActual.getDate() + 7 && segmentosSellos[1] == fechaActual.getMonth())
        {
            data.push(row);
        }
    });

    return data;
}

module.exports.RegresarRegistrosPorVencer = RegresarRegistrosPorVencer;
module.exports.FiltarRegistroPorVencerEnLaSemana = FiltarRegistroPorVencerEnLaSemana;