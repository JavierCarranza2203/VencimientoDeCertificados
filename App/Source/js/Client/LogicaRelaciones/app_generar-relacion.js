import { LeerArchivoDeExcel } from "../../Metodos/Peticiones.js";
import { Relacion } from "../../Clases/Factura.js";
import { FormatearCadena } from "../../Metodos/MetodosSinPeticion.js";

let tableContainer = document.getElementById("table");
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

        Swal.fire({
            title: "¡El archivo se ha subido!",
            text: "Espere mientras se procesan los datos",
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }}).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    console.log("Cerrado por el timer");
                }
            });
        
        miRelacion = new Relacion(await LeerArchivoDeExcel(archivoGastos));

        Swal.fire({
            title: "¡Los datos se han procesado!",
            text: "Ya puede generar su relación de gastos",
            icon: "success",
            confirmButtonText: "OK",
        });

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
        tableContainer.innerHTML = "";

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
        
        let response = await fetch(`http://localhost:8082/generar_relacion_de_gastos`, 
        { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Datos)
        });

        if(response.ok)
        {
            let blob = await response.blob();
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = 'RELACION DE GASTOS';
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
            console.log(mensaje)
            throw new Error(mensaje.error);
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

function MostrarSumatorias() {
    lblSubTotal.textContent = "Sub Total: $" + FormatearCadena(miRelacion.CalcularSubTotal());
    lblRetIsr.textContent = "Ret. ISR: $" + FormatearCadena(miRelacion.CalcularSumaRetencionIsr());
    lblRetIva.textContent = "Ret. IVA: $" + FormatearCadena(miRelacion.CalcularSumaRetIva());
    lblIeps.textContent = "IEPS: $" + FormatearCadena(miRelacion.CalcularSumaIeps());
    lblIva8.textContent = "IVA 8%: $" + FormatearCadena(miRelacion.CalcularSumaIva8());
    lblIva16.textContent = "IVA 16%: $" + FormatearCadena(miRelacion.CalcularSumaIva16());
    lblTotal.textContent = "Total: $" + FormatearCadena(miRelacion.CalcularSumaTotal());
}