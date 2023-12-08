import { PermitirAcceso } from "./Metodos/MetodosSinPeticion.js";
import { EliminarUsuario } from "./Metodos/Peticiones.js";

let table;
let tableContainer = document.getElementById("wrapper");

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

//NOTA: Además, aquí se cargan los usuarios en la tabla usando grid.js
window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        if(res["Rol"] == "admin"){
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
            // const rfc = row.cells[0].textContent;
            // const nombre = row.cells[0].textContent;
            // const grupo = row.cells[2].textContent;
            // const vencimientoSello = row.cells[3].textContent;

            // EditarUsuario(grupo);
            ActualizarTablaUsuarios();
        }
        else if (event.target.classList.contains('fa-trash')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;

            const nombreUsuario = row.cells[2].textContent;

            await EliminarUsuario(nombreUsuario);
            ActualizarTablaUsuarios();
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

function ActualizarTablaUsuarios(){
    table.updateConfig({
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
        }
    }).forceRender();
}

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/