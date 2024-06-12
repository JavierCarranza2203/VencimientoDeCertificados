import { PermitirAcceso } from "../Functions/MetodosSinPeticion.js";

window.addEventListener("load", ()=>{
    PermitirAcceso();
});

document.getElementById('btnTimbrarContraRecibos').addEventListener('click', ()=>{
    location.href = "timbrar-contrarecibos.html";
});

document.getElementById('btnVerContraRecibos').addEventListener('click', ()=>{
    location.href = "contrarecibos-timbrados.html";
});

document.getElementById('btnVerPagosRegistrados').addEventListener('click', ()=>{
    location.href = "pagos-registrados.html";
});

document.getElementById('btnVerClientesYSaldos').addEventListener('click', ()=>{
    location.href = "clientes-y-saldos.html";
});