import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";
import { EditarDetallesDeTimbrado, RegistrarPago, DejarDeTimbrarContraRecibos } from "../../Functions/Peticiones.js";

const tableContainer = document.getElementById("wrapper");
let table;

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla();
    });
});

function InicializarTabla() {
    const url = '../Controllers/ClienteController.php?Operacion=viewInfoTimbrado';

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Cliente", "Calle", "Colonia", "Número", "Ciudad", "Estado", "C.P.", "Tarifa mensual", "Activo", "Saldo actual", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit" aria-hidden="true" title="Editar datos"></i>`;
                const eliminarIcono = `<i class="fas fa-trash" aria-hidden="true" title="Dejar de timbar"></i>`;
                const estadoDeCuenta = `<i class="fa-solid fa-tablet" aria-hidden="true" title="Estado de cuenta"></i>`;
                const agregarPago = `<i class="fa-solid fa-sack-dollar" aria-hidden="true" title="Registrar pago"></i>`

                return gridjs.html(`<div class="acciones">${estadoDeCuenta}${editarIcono}${eliminarIcono}${agregarPago}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], cliente[3], cliente[5], cliente[6], cliente[7], "$" + cliente[10] + ".00", cliente[8], "$" + cliente[9] + ".00"])
        },
        pagination: {
            limit: 6
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(tableContainer);
}

document.addEventListener('click', async function(event) {
    try {
        if (event.target.classList.contains('fa-edit')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;
            const rfc = row.cells[0].textContent;
            const nombre = row.cells[1].textContent;
            const calle = row.cells[2].textContent;
            const colonia = row.cells[3].textContent;
            const numero = row.cells[4].textContent;
            const ciudad = row.cells[5].textContent;
            const estado = row.cells[6].textContent;
            const codigoPostal = row.cells[7].textContent;
            const tarifa = row.cells[8].textContent;
            let tarifaSinSignos = '';

            for(let i = 0; i < tarifa.length; i++){
                if(tarifa[i] === "."){ break; }
                if(tarifa[i] !== "$") {
                    tarifaSinSignos += tarifa[i];
                }
            }

            EditarDetallesDeTimbrado(rfc, nombre, calle, colonia, numero, ciudad, estado, codigoPostal, tarifaSinSignos, table);
        }
        else if (event.target.classList.contains('fa-trash')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;
            const rfc = row.cells[0].textContent;
            const nombre = row.cells[1].textContent;

            DejarDeTimbrarContraRecibos(rfc, table, nombre);
        }
        else if(event.target.classList.contains('fa-tablet')) {
            const rfc = event.target.parentElement.parentElement.parentElement.parentElement.cells[0].textContent;

            this.location.href = "estado-de-cuenta.html?cliente="+rfc;
        }
        else if(event.target.classList.contains('fa-sack-dollar')) {
            const rfc = event.target.parentElement.parentElement.parentElement.parentElement.cells[0].textContent;

            RegistrarPago(rfc, table);
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