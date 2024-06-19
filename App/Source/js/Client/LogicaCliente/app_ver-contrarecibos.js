import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";
import { GenerarReporteDeContraRecibosTimbrados } from "../../Functions/Peticiones.js";

const tableContainer = document.getElementById("wrapper");
let table;

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla();
    });
});

function InicializarTabla() {
    const url = '../Controllers/ClienteController.php?Operacion=viewRecibos';

    table = new gridjs.Grid({
        search: true,
        columns: ["Folio", "Fecha y hora", "Cliente", "Concepto", "Importe", "Estatus", {
            name: '',
            formatter: (cell, row) => {
                const timbrarIcono = `<i class="fa-solid fa-trash" aria-hidden="true" title="Cancelar Contra Recibo"></i>`;

                return gridjs.html(`<div class="acciones">${timbrarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(recibo => [recibo[0], recibo[1] + " " + recibo[2], recibo[3], 
                recibo[7], "$" + recibo[8] + ".00", recibo[9]])
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

document.getElementById("btnGenerarExcel").addEventListener('click', async ()=> {
    try {
        GenerarReporteDeContraRecibosTimbrados();
    }
    catch(error) {  
        console.log(error);
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: "Intente de nuevo, por favor",
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

document.addEventListener('click', async function(event) {
    try {
        if (event.target.classList.contains('fa-trash')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;
            const folio = row.cells[0].textContent;

            
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