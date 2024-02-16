import { FormatearCadena, ConvertirNumeroDeMesALetra } from "./MetodosSinPeticion.js";

export async function GenerarExcelRelaciones(miRelacion, endPoint, nombreArchivo, tableContainer, nombreCliente) {
    tableContainer.innerHTML = "";

    try{
        Swal.fire({
        title: "El archivo se está generando",
        text: "Espere por favor",
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }}).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log("Cerrado por el timer");
            }
        });

        let Datos = [miRelacion.Respaldo, miRelacion.Datos];

        let response = await fetch(`http://localhost:8082/` + endPoint, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Datos)
        });

        if(response.ok) {
            let blob = await response.blob();
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            let fechaActual = new Date()
            a.download = nombreArchivo + ' ' + ConvertirNumeroDeMesALetra(fechaActual.getMonth()) + ' ' + fechaActual.getFullYear() + ' - ' + nombreCliente.toUpperCase();
            a.click();

            Swal.fire({
                title: "¡El archivo se ha generado!",
                text: "Puede encontrarlo en la carpeta de descargas",
                icon: "success",
                confirmButtonText: "OK",
            });
        }
        else {
            let mensaje = await response.json();
            throw new Error(mensaje['message']);
        }
    }
    catch(error) {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
}

export async function LlenarTabla(tableContainer, miRelacion) {
    return new gridjs.Grid({
        columns: [{ name: "Número" }, "Fecha", "RFC Emisor", "Nombre Emisor", "Sub Total", "Ret. ISR", "Ret. IVA", "IEPS", "IVA 8%", "IVA 16%", "Total", "Concepto", {
                name: 'No considerar',
                formatter: (cell, row) => {
                    const eliminarIcono = `<input type="checkbox" name="chkNoConsiderar" id="chkNoConsiderar" class="chkNoConsiderar">`;

                    return gridjs.html(`<div class="acciones">${ eliminarIcono }</div>`);
                }
            },
        ],
        data: miRelacion.Datos.map(dato => [dato.Numero, dato.Fecha, dato.RfcEmisor, dato.NombreEmisor, FormatearCadena(dato.SubTotal), FormatearCadena(dato.RetIsr), FormatearCadena(dato.RetIva), FormatearCadena(dato.Ieps), FormatearCadena(dato.Iva8), FormatearCadena(dato.Iva16), FormatearCadena(dato.Total), dato.Concepto]),
        pagination: {
            limit: 10
        },
        height: '480px',
        fixedHeader: true,
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(tableContainer);  
}