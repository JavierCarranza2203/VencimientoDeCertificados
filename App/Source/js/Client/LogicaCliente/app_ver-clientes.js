import { PermitirAcceso, MostrarVigencia } from "../../Functions/MetodosSinPeticion.js";
import { EliminarCliente, EditarDatosDelCliente } from "../../Functions/Peticiones.js";

const tableContainer = document.getElementById("wrapper");
let table;
let url;

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

//NOTA: Ademas, aqui se cargan los clientes en la tabla usando grid.js
window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla(res["Rol"], res["GrupoClientes"]);
    });
});

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

document.addEventListener('click', async function(event) {
    try {
        if (event.target.classList.contains('fa-edit')) {
            let row = event.target.parentElement.parentElement.parentElement.parentElement;
            let rfc = row.cells[0].textContent;
            let clave = row.cells[3].textContent;

            EditarDatosDelCliente(rfc, clave, table, url);
        }
        else if (event.target.classList.contains('fa-trash')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;
            const rfc = row.cells[0].textContent;

            EliminarCliente(rfc, table, url);
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

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/

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
        columns: ["RFC", "Nombre", "Grupo", "Clave CIEC", "Régimen fiscal", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[3], 
                cliente[8]])
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

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/