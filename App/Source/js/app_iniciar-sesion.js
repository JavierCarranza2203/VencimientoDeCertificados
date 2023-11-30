import { IniciarSesion } from "./Metodos/Peticiones.js";

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

const txtPassword = document.getElementById("txtPassword");
const btnShowPassword = document.getElementById("btnShowPassword");
let muestraContrasenia = false;

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

//Captura el evento submit del formulario
document.getElementById("frmIniciarSesion").addEventListener("submit", async (e)=>{
    try
    {
        //Cancela el evento submit
        e.preventDefault();

        //Obtiene el nombre de usuario y la contraseña
        let NombreDeUsuario = document.getElementById("txtUserName").value;
        let Contrasenia = txtPassword.value;

        //Si ambas variables están vacías, genera un error
        if(NombreDeUsuario == "" || Contrasenia == "")
        {
            throw new Error("Por favor, llene los campos");
        }

        const data = await IniciarSesion(NombreDeUsuario, Contrasenia);
        
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: data,
            icon: "success",
            confirmButtonText: "OK",
        })

        setTimeout(()=>{
            location.href = "App/Views/pagina-principal.html"
        }, 1000)
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

//Asignacion del evento click
btnShowPassword.addEventListener("click", ()=>{
    muestraContrasenia = !muestraContrasenia;

    if(muestraContrasenia)
    {
        txtPassword.type = "text";
        btnShowPassword.classList.remove("fa-eye");
        btnShowPassword.classList.add("fa-eye-slash");
    }
    else
    {
        txtPassword.type = "password";
        btnShowPassword.classList.add("fa-eye");
        btnShowPassword.classList.remove("fa-eye-slash");
    }
});

//Asignacion del evento click del btn para crear una nueva cuenta
document.getElementById("btnCrearCuenta").addEventListener("click", ()=>{
    Swal.fire({
        title: "Ingrese el código de acceso",
        input: "password",
        showCancelButton: true,
        confirmButtonText: "Validar código",
        showLoaderOnConfirm: true,
        preConfirm: (code)=>
        {
            if(code === "RG2023")
            {
                location.href = "App/Views/nuevo-usuario.html?access_code=true";
            }
            else
            {
                Swal.showValidationMessage(`
                    El código es incorrecto
                `);
            }
        }
    },);
});

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/