import { PermitirAcceso } from "./Metodos/MetodosSinPeticion.js";
/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

const UsuarioLoggeado = PermitirAcceso();

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

window.addEventListener("load", ()=>{
    new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma"],
        server: {
            url: 'http://localhost/VencimientoDeCertificados/App/Controllers/ClienteController.php',
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], MostrarVigencia(cliente[3]), cliente[6], MostrarVigencia(cliente[5])])
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(document.getElementById("wrapper"));
})

function MostrarVigencia(bitBooleano)
{
    if(bitBooleano == 1){
        return "Vigente";
    }
    else{
        return "Vencido";
    }
}