import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";
import { EditarCertificadosDelCliente } from "../../Functions/Peticiones.js";

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
    try{
        if (event.target.classList.contains('fa-edit')) 
        {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;
            const rfc = row.cells[0].textContent;

            EditarCertificadosDelCliente(rfc, table, url);
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

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/

function InicializarTabla(rol, grupoClientes = null)
{
    url = '../Controllers/ClienteController.php?Operacion=';

    if(rol == "admin" || rol == "dev") {
        url += "viewAll";
    }
    else {
        url += "view" + "&Grupo=" + grupoClientes;
    }

    table = new gridjs.Grid({
        search: true,
        columns: ["Nombre del cliente", "Grupo", "Vigencia del sello", "Vigencia de la firma", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[1], cliente[2], cliente[7], cliente[5]])
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