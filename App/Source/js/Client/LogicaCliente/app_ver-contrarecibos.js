import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";

const tableContainer = document.getElementById("wrapper");
let table;

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla();
    });
});

function InicializarTabla() {
    const url = '../Controllers/ClienteController.php?Operacion=viewRecibos';

    table = new gridjs.Grid({
        search: true,
        columns: ["Folio", "Fecha y hora", "Cliente", "RFC", "Concepto", "Importe"],
        server: {
            url: url,
            then: data => data.map(recibo => [recibo[0], recibo[1] + " " + recibo[2], recibo[3], 
                recibo[6], recibo[7], "$" + recibo[8] + ".00"])
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

