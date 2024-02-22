import { LeerArchivoDeExcel } from "../../Functions/Peticiones.js";
import { Relacion } from "../../Classes/Factura.js";
import { FormatearCadena } from "../../Functions/MetodosSinPeticion.js";
import { GenerarExcelRelaciones, LlenarTabla } from "../../Functions/MetodosGenerarExcelRelaciones.js";

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
    try {
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

        miRelacion = new Relacion(await LeerArchivoDeExcel(archivoGastos, 'id'));

        Swal.fire({
            title: "¡Los datos se han procesado!",
            text: "Ya puede generar su relación de gastos",
            icon: "success",
            confirmButtonText: "OK",
        });

        table = LlenarTabla(tableContainer, miRelacion);

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
    try {
        const elemento = event.target;
        if (elemento.classList.contains('chkNoConsiderar')) {
            const row = elemento.parentElement.parentElement.parentElement.parentElement;

            if(elemento.checked) {
                miRelacion.RestarCantidad(row.cells[0].textContent);
                row.classList.add("row--elimated")
            }
            else {
                miRelacion.RestaurarCantidad(row.cells[0].textContent);
                row.classList.remove("row--elimated")
            }

            MostrarSumatorias();
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
});

document.getElementById("btnGenerarExcel").addEventListener("click", async ()=>{
    GenerarExcelRelaciones(miRelacion, `generar_relacion_de_ingresos`, 'RELACION DE INGRESOS', tableContainer);
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