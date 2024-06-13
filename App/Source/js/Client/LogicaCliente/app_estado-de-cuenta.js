import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";

const contenedorPagos = document.getElementById("tablaPagos");
const contenedorContraRecibos = document.getElementById("tablaContraRecibos");
const lblRfc = document.getElementById("lblCustomerId");
const lblNombre = document.getElementById("lblCustomerName");
const lblDomicilio = document.getElementById("lblCustomerHome");
const lblCiudad = document.getElementById("lblCustomerCity");
const lblSaldoActual = document.getElementById("lblCustomerBalance");
const lblContraRecibos = document.getElementById("lblCustomerTickets");
const lblPagos = document.getElementById("lblCustomerPayments");


window.addEventListener("load", async ()=> {
    PermitirAcceso().then(()=>{
        const urlParams = new URLSearchParams(window.location.search);
        const rfc = urlParams.get('cliente');

        LlenarInformacion(rfc);
        LlenarTablaContreRecibos(rfc);
        LlenarTablaPagos(rfc);
    });
});

async function LlenarInformacion(idCliente) {
    const response = await fetch('../Controllers/ClienteController.php?Operacion=viewTicketsInfoByCustomerId&Rfc=' + idCliente);

    if(response.ok) {
        const data = await response.json();

        lblRfc.textContent = data[0][0];
        lblNombre.textContent = data[0][1];
        lblDomicilio.textContent = data[0][2];
        lblCiudad.textContent = data[0][3];
        lblSaldoActual.textContent = '$' + data[0][6] + '.00';
        lblContraRecibos.textContent = data[0][4];
        lblPagos.textContent = data[0][5];
    }
}

async function LlenarTablaContreRecibos(rfc) {
    const url = '../Controllers/ClienteController.php?Operacion=viewTicketsByCustomerId&Rfc=' + rfc

    new gridjs.Grid({
        columns: ["Folio", "Fecha de timbrado", "Hora", "Concepto", "Importe"],
        server: {
            url: url,
            then: data => data.map(pago => [pago[0], pago[1], pago[2], pago[3], "$" + pago[4] + ".00"])
        },
        pagination: {
            limit: 5
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(contenedorContraRecibos);
}

async function LlenarTablaPagos(rfc) {
    const url = '../Controllers/ClienteController.php?Operacion=viewPaymentsByCustomerId&Rfc=' + rfc

    new gridjs.Grid({
        columns: ["Id", "Fecha", "Hora", "Importe"],
        server: {
            url: url,
            then: data => data.map(pago => [pago[0], pago[1], pago[2], "$" + pago[3] + ".00"])
        },
        pagination: {
            limit: 5
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            },
            'No matching records found' : 'Hubo un error mostrando los pagos. Es posible que no existan'
        }
    }).render(contenedorPagos);
}
