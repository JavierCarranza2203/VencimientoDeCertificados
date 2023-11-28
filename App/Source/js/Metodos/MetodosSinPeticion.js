import { Usuario } from "../Clases/Usuario.js";
import { ValidarUsuarioLogeado } from "./Peticiones.js";

export async function PermitirAcceso()
{
    try
    {
        const data = await ValidarUsuarioLogeado();

        document.getElementById("blocker").classList.add("content-blocker--hidden");

        return new Usuario(data["NombreUsuario"], data["Rol"], data["GrupoClientes"]);
    }
    catch(error)
    {
        Swal.fire({
            icon: "error",
            title: "¡No tiene autorización!",
            text: error,
            footer: '<label>Si ya lo hizo, intente reiniciar el navegador.</label>',
            confirmButtonText: "Iniciar sesión",
            allowOutsideClick: false
        })
        .then((result)=>{
            if(result.isConfirmed)
            {
                location.href = "../../index.html";
            }
        });
    }
}