import { GenerarRelacionDeGastos } from "./Metodos/Peticiones.js";
import { Relacion } from "./Clases/Factura.js";

let tableContainer = document.getElementById("table");
let table;
let miRelacion;

document.getElementById("frmGenerarRelacionDeGastos").addEventListener("submit", async(e) => {
    e.preventDefault();

    const archivoGastos = document.getElementById("archivoGastos").files[0];

    if(!archivoGastos){ throw new Error("Ingrese un archivo"); }
    
    miRelacion = new Relacion(await GenerarRelacionDeGastos(archivoGastos));

    console.log(miRelacion.Datos[3]);

    table = new gridjs.Grid({
        columns: ["Número", "Fecha", "RFC Emisor", "Nombre Emisor", "Sub Total", "Ret. ISR", "Ret.IVA", "IEPS", "IVA 8%", "IVA 16%", "Total", "Concepto", , {
                name: 'No considerar',
                formatter: (cell, row) => {
                    const eliminarIcono = `<i class="fas fa-trash"></i>`;

                    return gridjs.html(`<div class="acciones">${eliminarIcono}</div>`);
                }
            },
        ],
        data: miRelacion.Datos.map(dato => [dato.Numero, dato.Fecha, dato.RfcEmisor, dato.NombreEmisor, dato.SubTotal, dato.RetIsr, dato.RetIva, dato.Ieps, dato.Iva8, dato.Iva16, dato.Total, dato.Concepto]),
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(tableContainer);
});