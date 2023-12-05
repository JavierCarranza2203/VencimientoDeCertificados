import {PermitirAcceso} from "./Metodos/MetodosSinPeticion.js";
import { Usuario } from "./Clases/Usuario.js";
// import { EliminarCliente } from "./Metodos/Peticiones.js";

const tableContainer = document.getElementById("wrapper");
let table;
let url;

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

//NOTA: Ademas, aqui se cargan los clientes en la tabla usando grid.js
window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla(res["Rol"]);
    });
});

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/

function MostrarVigencia(bitBooleano)
{
    if(bitBooleano == 1){
        return "Vigente";
    }
    else{
        return "Vencido";
    }
}

function InicializarTabla(rol)
{
    url = 'http://localhost/VencimientoDeCertificados/App/Controllers/ClienteController.php?Operacion=';

    if(rol === "admin")
    {
        url += "viewAll";
    }
    else
    {
        url += "view" + "&Grupo=" + res['GrupoClientes'];
    }

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit" onclick="EditarUsuario(${row.cells[0].data}, '${row.cells[1].data}', '${row.cells[2].data}', '${row.cells[3].data}')"></i>`;
                const eliminarIcono = `<i class="fas fa-trash" onclick="eliminarRegistro(${row.cells[0].data})"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], MostrarVigencia(cliente[3]), cliente[6], MostrarVigencia(cliente[5])])
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


function eliminarRegistro(id){
    Swal.fire({
        title: "¿Está seguro de borrar el cliente?",
        text: "No se podrá recuperar la información",
        icon: "warning",
        showCancelButton: true, 
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, estoy seguro!"
    }).then(async (result) => {
        if (result.isConfirmed) {

            let request = await fetch('../Controllers/ClienteController.php?Operacion=delete&&rfc=' + rfc, {
                method: 'DELETE'
            });

            if(request.ok)
            {
                Swal.fire({
                    title: "¡Acción realizada con éxito!",
                    text: "¡El usuario se ha borrado!",
                    icon: "success"
                });

                ActualizarTabla();
            }
        }
    });
}

function ActualizarTabla()
{
    table.updateConfig({
        server: {
            url: url,
            then: data => data.map( user => [user.id, user.nombre, user.apellido, user.rfc])
        }
    }).forceRender();
}

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/