import { PermitirAcceso, MostrarVigencia } from "../../Functions/MetodosSinPeticion.js";

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

function InicializarTabla(rol, grupoClientes = null)
{
    url = 'http://localhost:8082/clientes_por_vencer';

    if(rol != "admin" && rol != "dev") {
        url += "?grupo=" + grupoClientes;
    }

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma"],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente["rfc"], cliente["nombre"], cliente["grupo_clientes"], cliente["fecha_vencimiento_sello"], MostrarVigencia(cliente["status_sello"]), cliente["fecha_vencimiento_firma"], MostrarVigencia(cliente["status_firma"])])
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