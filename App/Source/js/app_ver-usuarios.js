import { PermitirAcceso } from "./Metodos/MetodosSinPeticion.js";
import { ActualizarUsuario, EliminarUsuario } from "./Metodos/Peticiones.js";

let table;
let tableContainer = document.getElementById("wrapper");

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

//NOTA: Además, aquí se cargan los usuarios en la tabla usando grid.js
window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        if(res["Rol"] == "admin" || res["Rol"] == "dev"){
            InicializarTabla();
        }
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
            const id = row.cells[0].textContent;
            const nombre = row.cells[1].textContent;
            const nombreUsuario = row.cells[2].textContent;
            const grupo = row.cells[3].textContent;
            const rol = row.cells[4].textContent;

            ActualizarUsuario(id, nombre, nombreUsuario, grupo, rol, table);
        }
        else if (event.target.classList.contains('fa-trash')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;

            const nombreUsuario = row.cells[2].textContent;

            EliminarUsuario(nombreUsuario, table)
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

function InicializarTabla(){
    table = new gridjs.Grid({
        search: true,
        columns: ["ID", "Nombre completo", "Nombre de usuario", "Grupo de clientes", "Rol", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: 'http://localhost/VencimientoDeCertificados/App/Controllers/UsuarioController.php?Operacion=view',
            then: data => data.map(usuario => [usuario[0], usuario[1], usuario[2], usuario[3], usuario[4]])
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