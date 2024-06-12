import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";

const tableContainer = document.getElementById("wrapper");
let table;

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla();
    });
});

function InicializarTabla() {
    const url = '../Controllers/ClienteController.php?Operacion=viewPayments';

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre del cliente", "Grupo de clientes", "Fecha de pago", "Importe"],
        server: {
            url: url,
            then: data => data.map(pago => [pago[0], pago[1], pago[2], pago[3], "$" + pago[4] + ".00"])
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