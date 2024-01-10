import { GenerarRelacionDeGastos } from "./Metodos/Peticiones.js";
import { Relacion } from "./Clases/Factura.js";
import { FormatearCadena } from "./Metodos/MetodosSinPeticion.js";

let tableContainer = document.getElementById("table");
let table;
let miRelacion;

const lblSubTotal = document.getElementById("lblSubTotal");
const lblRetIsr = document.getElementById("lblRetIsr");
const lblRetIva = document.getElementById("lblRetIva");
const lblIeps = document.getElementById("lblIeps");
const lblIva8 = document.getElementById("lblIva8");
const lblIva16 = document.getElementById("lblIva16");
const lblTotal = document.getElementById("lblTotal");

document.getElementById("frmGenerarRelacionDeGastos").addEventListener("submit", async(e) => {
    try
    {
        e.preventDefault();

        const archivoGastos = document.getElementById("archivoGastos").files[0];

        if(!archivoGastos){ throw new Error("Ingrese un archivo"); }
        
        miRelacion = new Relacion(await GenerarRelacionDeGastos(archivoGastos));

        table = new gridjs.Grid({
            columns: [{name: "Número"}, "Fecha", "RFC Emisor", "Nombre Emisor", "Sub Total", "Ret. ISR", "Ret. IVA", "IEPS", "IVA 8%", "IVA 16%", "Total", "Concepto", {
                    name: 'No considerar',
                    formatter: (cell, row) => {
                        const eliminarIcono = `<input type="checkbox" name="chkNoConsiderar" id="chkNoConsiderar" class="chkNoConsiderar">`;

                        return gridjs.html(`<div class="acciones">${eliminarIcono}</div>`);
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

        MostrarSumatorias();
    }
    catch(error){
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

document.addEventListener('click', async function(event) {
    try{
        const elemento = event.target;
        if (elemento.classList.contains('chkNoConsiderar')) 
        {
            const row = elemento.parentElement.parentElement.parentElement.parentElement;

            if(elemento.checked)
            {

                miRelacion.RestarCantidad(row.cells[0].textContent);
                row.classList.add("row--elimated")
            }
            else
            {
                miRelacion.RestaurarCantidad(row.cells[0].textContent);
                row.classList.remove("row--elimated")
            }

            MostrarSumatorias();
        }
    }
    catch(error)
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

document.getElementById("btnGenerarExcel").addEventListener("click", async ()=>{
    try
    {
        let response = await fetch(`http://localhost:8082/leer_archivo_excel`, 
        { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(miRelacion.Datos)
        });

        if(response.ok)
        {
            let blob = await response.blob();
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = 'RELACION DE GASTOS';
            a.click();
        }
        else{
            let errorMessage = await response.json();

            throw new Error(errorMessage);
        }
    }
    catch(error){
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

function MostrarSumatorias()
{
    lblSubTotal.textContent = "Sub Total: $" + FormatearCadena(miRelacion.CalcularSubTotal());
    lblRetIsr.textContent = "Ret. ISR: $" + FormatearCadena(miRelacion.CalcularSumaRetencionIsr());
    lblRetIva.textContent = "Ret. IVA: $" + FormatearCadena(miRelacion.CalcularSumaRetIva());
    lblIeps.textContent = "IEPS: $" + FormatearCadena(miRelacion.CalcularSumaIeps());
    lblIva8.textContent = "IVA 8%: $" + FormatearCadena(miRelacion.CalcularSumaIva8());
    lblIva16.textContent = "IVA 16%: $" + FormatearCadena(miRelacion.CalcularSumaIva16());
    lblTotal.textContent = "Total: $" + FormatearCadena(miRelacion.CalcularSumaTotal());
}