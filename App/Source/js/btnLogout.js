import { CerrarSesion } from "./Metodos/Peticiones.js";

document.getElementById("btnLogout").addEventListener("click", async ()=>{
    if(await CerrarSesion())
    {
        location.href = "../../index.html";
    }
    else{
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: "Intente de nuevo, por favor",
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});