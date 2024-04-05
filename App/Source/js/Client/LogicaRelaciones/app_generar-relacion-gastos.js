import { LeerArchivoDeExcel } from "../../Functions/Peticiones.js";
import { Relacion } from "../../Classes/Relacion.js";
import { FormatearCadena, PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";
import { GenerarExcelRelaciones, LlenarTabla } from "../../Functions/MetodosGenerarExcelRelaciones.js";

let tableContainer = document.getElementById("table");
let url;

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla(res["Rol"], res["GrupoClientes"]);
    });
});

// document.addEventListener('click', async function(event) {
//     try {
        
//     }
//     catch(error) {
//         Swal.fire({
//             icon: "error",
//             title: "¡Hubo un error inesperado!",
//             text: error,
//             footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
//         });
//     }
// });

// document.getElementById("btnGenerarExcel").addEventListener("click", async ()=> {
//     try {
//         Swal.fire({
//             title: 'Nueva relación de Excel',
//             html:
//                 '<label for="txtNombreCliente" class="form__label">Ingrese el nombre del cliente:</label>' +
//                 `<input id="txtNombreCliente" class="double-form-container__form-input" placeholder="Ej. JUAN PEREZ" value=""><br>` +

//                 '<label for="cmbTipoRelacion" class="form__label">Seleccione el tipo de relación:</label>' +
//                 '<select name="cmbTipoRelacion" id="cmbTipoRelacion" class="double-form-container__form-combobox">' +
//                     '<option value="gastos" selected>Relación de gastos (Facturas recibidas)</option>' +
//                     '<option value="ingresos">Relación de ingresos (Facturas emitidas)</option>' +
//                 '</select><br>',
//             showCancelButton: true,
//             confirmButtonText: 'Generar relación',
//             cancelButtonText: 'Cancelar',
//             backdrop: false,
//             preConfirm: () => {
//                 // Obtiene los valores de los campos de entrada
//                 let NombreCliente = Swal.getPopup().querySelector('#txtNombreCliente').value;
//                 let TipoRelacion = Swal.getPopup().querySelector('#cmbTipoRelacion').value;

//                 if(NombreCliente !== null || NombreCliente !== ' ' || NombreCliente !== ''){
//                     if(TipoRelacion === '' || TipoRelacion === null){ throw new Error('Selecione el tipo de relación') } 

//                     TipoRelacion === "gastos"?
//                         GenerarExcelRelaciones(miRelacion, `generar_relacion_de_gastos`, 'name', 'RELACION DE GASTOS', tableContainer, NombreCliente)
//                     :
//                         GenerarExcelRelaciones(miRelacion, `generar_relacion_de_ingresos`, 'id', 'RELACION DE INGRESOS', tableContainer, NombreCliente)
//                 }
//                 else{
//                     throw new Error("Debe ingresar el nombre del cliente");
//                 }
//             }
//         });
//     }
//     catch(error) {
//         Swal.fire({
//             icon: "error",
//             title: "¡Hubo un error inesperado!",
//             text: error,
//             footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
//         });
//     }
// });

// function MostrarSumatorias() {
//     lblSubTotal.textContent = "Sub Total: $" + FormatearCadena(miRelacion.CalcularSubTotal());
//     lblRetIsr.textContent = "Ret. ISR: $" + FormatearCadena(miRelacion.CalcularSumaRetencionIsr());
//     lblRetIva.textContent = "Ret. IVA: $" + FormatearCadena(miRelacion.CalcularSumaRetIva());
//     lblIeps.textContent = "IEPS: $" + FormatearCadena(miRelacion.CalcularSumaIeps());
//     lblIva8.textContent = "IVA 8%: $" + FormatearCadena(miRelacion.CalcularSumaIva8());
//     lblIva16.textContent = "IVA 16%: $" + FormatearCadena(miRelacion.CalcularSumaIva16());
//     lblTotal.textContent = "Total: $" + FormatearCadena(miRelacion.CalcularSumaTotal());
// }

function InicializarTabla(rol, grupoClientes = null) {
    url = '../Controllers/ClienteController.php?Operacion=';

    if(rol == "admin" || rol == "dev") {
        url += "viewAll";
    }
    else {
        url += "view" + "&Grupo=" + grupoClientes;
    }

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre", "Grupo", {
            name: 'Generar relación de...',
            formatter: (cell, row) => {
                const editarIcono = `<button class="btn">Gastos</button>`;
                const eliminarIcono = `<button class="btn">Ingresos</button>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2]])
        },
        pagination: {
            limit: 10
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(tableContainer);
}