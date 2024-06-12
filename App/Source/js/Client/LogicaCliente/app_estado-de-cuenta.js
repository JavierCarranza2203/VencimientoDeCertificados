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
    });
});

async function LlenarInformacion(idCliente) {
    const response = await fetch('../Controllers/ClienteController.php?Operacion=viewTicketsInfoByCustomerId&Rfc=' + idCliente);

    if(response.ok) {
        const data = await response.json();

        lblRfc.textContent = data[0];
        lblNombre.textContent = data[1];
        lblDomicilio.textContent = data[2];
        lblCiudad.textContent = data[3];
        lblSaldoActual.textContent = data[6];
        lblContraRecibos.textContent = data[4];
        lblPagos.textContent = data[5];
    }
}
