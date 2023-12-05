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

async function EliminarCliente(rfc)
{
    const response = await fetch("../Controllers/ClienteController.php?Operacion=delete&&rfc=" + rfc);

    let data = await response.json();

    if(response.ok)
    {
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: data,
            icon: "success",
            confirmButtonText: "OK",
        });
    }
    else
    {
        throw new Error(data);
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
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash" onclick="EliminarCliente(${row.cells[0].data})"></i>`;

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

function ActualizarTabla()
{
    table.updateConfig({
        server: {
            url: url,
            then: data => data.map( user => [user.id, user.nombre, user.apellido, user.rfc])
        }
    }).forceRender();
}

document.getElementById("btnGenerarExcel").addEventListener('click', async ()=>{
    let response = await fetch(`http://localhost:8082/clientes_por_vencer/excel`, { method: "GET" });
    let blob = await response.blob();
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte de firmas y sellos por vencer';
    a.click();
});

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/