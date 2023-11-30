import {PermitirAcceso} from "./Metodos/MetodosSinPeticion.js";
import { Usuario } from "./Clases/Usuario.js";

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

//NOTA: Ademas, aqui se cargan los clientes en la tabla usando grid.js
window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {

        let url = 'http://localhost/VencimientoDeCertificados/App/Controllers/ClienteController.php?Operacion=';

        if(res['Rol'] === "admin")
        {
            url += "viewAll"
        }
        else
        {
            url += "view" + "&Grupo=" + res['GrupoClientes']
        }

        new gridjs.Grid({
            search: true,
            columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma"],
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
        }).render(document.getElementById("wrapper"));
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

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/