import { PermitirAcceso } from "../Functions/MetodosSinPeticion.js";

window.addEventListener("load", ()=>{
    PermitirAcceso();
});

document.getElementById('btnDocumentControl').addEventListener('click', ()=>{
    location.href = "control-de-certificados.html";
});

document.getElementById('btnWarningCustomers').addEventListener('click', ()=>{
    location.href = "clientes-por-vencer.html";
});