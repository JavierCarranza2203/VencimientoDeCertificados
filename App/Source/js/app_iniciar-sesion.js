// import { IniciarSesion } from "./Peticiones";

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

        const credentials = new FormData();

        //Agrega las variables al formData creado
        credentials.append("NombreDeUsuario", NombreDeUsuario);
        credentials.append("Contrasenia", Contrasenia);

        //Hace una petición HTTP usando el método POST y mandando las credenciales
        const response = await fetch("App/Controllers/UsuarioController.php?Operacion=login", {
            method: "POST",
            body: credentials,
        });

        if (response.ok) 
        {
            const data = await response.json();
            
            Swal.fire({
                title: "¡Tarea realizada con éxito!",
                text: data,
                icon: "success",
                confirmButtonText: "OK"
            }).then((result) => {

                if(result.isConfirmed)
                {
                    location.href = "App/Views/nuevo-certificado.html";
                }
            });
        } 
        else //Si no, genera un error
        {
            throw new Error(await response.text());
        }
    }
    catch(error) //Aqui captura los errores y muestra un mensaje al usuario
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si no funciona, llame al administrador de sistemas</label>'
        });
    }
});