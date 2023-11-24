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
        columns: ["RFC", "Nombre", "Grupo de clientes", "Vencimiento del sello", "Estatus del sello", "Vencimiento de la firma", "Estatus de la firma"],
        server: {
            url: 'http://localhost/VencimientoDeCertificados/App/Controllers/ClienteController.php',
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[3], cliente[4], cliente[6], cliente[5]])
        }
    }).render(document.getElementById("wrapper"));
})