import { PermitirAcceso} from "./Metodos/MetodosSinPeticion.js";
import { Usuario } from "./Clases/Usuario.js";
import { EliminarCliente } from "./Metodos/Peticiones.js";
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
        InicializarTabla(res["Rol"], res["GrupoClientes"]);
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

function EditarUsuario(grupo)
{
    alert("EDITADO");
}

function InicializarTabla(rol, grupoClientes = null)
{
    url = 'http://localhost/VencimientoDeCertificados/App/Controllers/ClienteController.php?Operacion=';

    if(rol === "admin")
    {
        url += "viewAll";
    }
    else
    {
        url += "view" + "&Grupo=" + grupoClientes;
    }

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

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


document.addEventListener('click', async function(event) {
    const row = event.target.parentElement.parentElement.parentElement.parentElement;

    if (event.target.classList.contains('fa-edit')) 
    {
        const rfc = row.cells[0].textContent;
        const nombre = row.cells[0].textContent;
        const grupo = row.cells[2].textContent;
        const vencimientoSello = row.cells[3].textContent;

        EditarUsuario(grupo);
        ActualizarTablaClientes();
    }
    else if (event.target.classList.contains('fa-trash')) {
        const rfc = row.cells[0].textContent;

        await EliminarCliente(rfc);
        ActualizarTablaClientes();
    }
});

function ActualizarTablaClientes()
{
    table.updateConfig({
        columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], MostrarVigencia(cliente[3]), cliente[6], MostrarVigencia(cliente[5])])
        }
    }).forceRender();
}

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/