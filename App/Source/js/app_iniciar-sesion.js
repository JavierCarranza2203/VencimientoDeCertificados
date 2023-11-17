import { IniciarSesion } from "./Peticiones";

//Obtiene el formulario para iniciar sesión
const frmIniciarSesion = document.getElementById("frmIniciarSesion");

//Captura el evento submit del formulario
frmIniciarSesion.addEventListener("submit", async (e)=>{
    try
    {
        //Cancela el evento submit
        e.preventDefault();

        //Obtiene el nombre de usuario y la contraseña
        let NombreDeUsuario = document.getElementById("txtUserName").value;
        let Contrasenia = document.getElementById("txtPassword").value;

        //Si ambas variables están vacías, genera un error
        if(NombreDeUsuario == "" && Contrasenia == "")
        {
            throw new Error("Por favor, llene los campos");
        }

        IniciarSesion(NombreDeUsuario, Contrasenia);

        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: "Se ha iniciado sesión",
            icon: "success"
        });
    }
    catch(error) //Aqui captura los errores y muestra un mensaje al usuario
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si no funciona, llame al administrador de sistemas</label>'
        });

        console.error('Error en la petición:', error);
    }
});