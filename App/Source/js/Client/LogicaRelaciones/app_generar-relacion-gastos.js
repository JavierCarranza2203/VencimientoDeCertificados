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

        miRelacion = new Relacion(await LeerArchivoDeExcel(archivoGastos, 'name'));

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

document.getElementById("btnGenerarExcel").addEventListener("click", async ()=> {
    try {
        Swal.fire({
            title: 'Nueva relación de Excel',
            html:
                '<label for="txtNombreCliente" class="form__label">Ingrese el nombre del cliente:</label>' +
                `<input id="txtNombreCliente" class="double-form-container__form-input" placeholder="Ej. JUAN PEREZ" value=""><br>` +

                '<label for="cmbTipoRelacion" class="form__label">Seleccione el tipo de relación:</label>' +
                '<select name="cmbTipoRelacion" id="cmbTipoRelacion" class="double-form-container__form-combobox">' +
                    '<option value="gastos" selected>Relación de gastos (Facturas recibidas)</option>' +
                    '<option value="ingresos">Relación de ingresos (Facturas emitidas)</option>' +
                '</select><br>',
            showCancelButton: true,
            confirmButtonText: 'Generar relación',
            cancelButtonText: 'Cancelar',
            backdrop: false,
            preConfirm: () => {
                // Obtiene los valores de los campos de entrada
                let NombreCliente = Swal.getPopup().querySelector('#txtNombreCliente').value;
                let TipoRelacion = Swal.getPopup().querySelector('#cmbTipoRelacion').value;

                if(NombreCliente !== null || NombreCliente !== ' ' || NombreCliente !== ''){
                    if(TipoRelacion === '' || TipoRelacion === null){ throw new Error('Selecione el tipo de relación') } 

                    TipoRelacion === "gastos"?
                        GenerarExcelRelaciones(miRelacion, `generar_relacion_de_gastos`, 'RELACION DE GASTOS', tableContainer, NombreCliente)
                    :
                        GenerarExcelRelaciones(miRelacion, `generar_relacion_de_ingresos`, 'RELACION DE INGRESOS', tableContainer, NombreCliente)
                }
                else{
                    throw new Error("Debe ingresar el nombre del cliente");
                }
            }
        });
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

function MostrarSumatorias() {
    lblSubTotal.textContent = "Sub Total: $" + FormatearCadena(miRelacion.CalcularSubTotal());
    lblRetIsr.textContent = "Ret. ISR: $" + FormatearCadena(miRelacion.CalcularSumaRetencionIsr());
    lblRetIva.textContent = "Ret. IVA: $" + FormatearCadena(miRelacion.CalcularSumaRetIva());
    lblIeps.textContent = "IEPS: $" + FormatearCadena(miRelacion.CalcularSumaIeps());
    lblIva8.textContent = "IVA 8%: $" + FormatearCadena(miRelacion.CalcularSumaIva8());
    lblIva16.textContent = "IVA 16%: $" + FormatearCadena(miRelacion.CalcularSumaIva16());
    lblTotal.textContent = "Total: $" + FormatearCadena(miRelacion.CalcularSumaTotal());
}