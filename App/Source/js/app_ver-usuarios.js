import {PermitirAcceso} from "./Metodos/MetodosSinPeticion.js";

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(() => {
        new gridjs.Grid({
            search: true,
            columns: ["ID", "Nombre completo", "Nombre de usuario", "Grupo de clientes", "Rol"],
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
        }).render(document.getElementById("wrapper"));
    });
});