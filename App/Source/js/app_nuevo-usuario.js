import { PermitirAcceso, ValidarCampos } from "./Metodos/MetodosSinPeticion.js";
import { AgregarNuevoUsuario} from "./Metodos/Peticiones.js";

const txtNombreCompleto = document.getElementById("txtNombreCompleto");
const txtNombreUsuario = document.getElementById("txtNombreUsuario");
const txtContrasenia = document.getElementById("txtPassword");
const ArrayInputs = [txtNombreCompleto, txtNombreUsuario, txtContrasenia];

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

window.addEventListener("load", ()=>{
    const acceso = window.location.search;

    if(!acceso)
    {
        PermitirAcceso();
    }
    else
    {
        document.getElementById("blocker").classList.add("content-blocker--hidden");
    }
});

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

document.getElementById("btnAgregarUsuario").addEventListener("click", async ()=>{
    try
    {
        ValidarCampos(ArrayInputs);

        let data = await AgregarNuevoUsuario(
            txtNombreCompleto.value,
            txtNombreUsuario.value,
            txtContrasenia.value,
            document.getElementById("cmbGrupoClientes").value,
            document.getElementById("cmbRol").value
        );
        
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: data,
            icon: "success",
            confirmButtonText: "OK",
        });

        document.getElementById("txtNombreCompleto").value = "";
        document.getElementById("txtNombreUsuario").value = "";
        document.getElementById("txtPassword").value = "";
        document.getElementById("cmbGrupoClientes").value = "";
        document.getElementById("cmbRol").value = "";
    }
    catch(error)
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si el sistema sigue fallando, llame al administrador de sistemas.</label>'
        });
    }
});

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/