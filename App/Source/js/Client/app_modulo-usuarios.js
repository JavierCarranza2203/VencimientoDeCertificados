import { PermitirAcceso } from "../Functions/MetodosSinPeticion.js";

window.addEventListener("load", ()=>{
    PermitirAcceso();
});

document.getElementById('btnAllUsers').addEventListener('click', ()=>{
    location.href = "ver-usuarios.html";
});

document.getElementById('btnNewUser').addEventListener('click', ()=>{
    location.href = "nuevo-usuario.html";
});