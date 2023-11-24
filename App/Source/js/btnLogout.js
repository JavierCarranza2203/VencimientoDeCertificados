import { CerrarSesion } from "./Metodos/Peticiones.js";

document.getElementById("btnLogout").addEventListener("click", async ()=>{
    if(CerrarSesion())
    {
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: "La sesión se ha cerrado",
            icon: "success",
            confirmButtonText: "OK",
        });
    }
});