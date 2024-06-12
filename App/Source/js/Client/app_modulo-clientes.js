import { PermitirAcceso } from "../Functions/MetodosSinPeticion.js";

window.addEventListener("load", ()=>{
    PermitirAcceso();
});

document.getElementById('btnNewCustomer').addEventListener('click', ()=>{
    location.href = "nuevo-cliente.html";
});

document.getElementById('btnAllCustomers').addEventListener('click', ()=>{
    location.href = "ver-clientes.html"
});