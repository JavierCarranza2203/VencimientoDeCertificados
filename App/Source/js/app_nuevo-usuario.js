import { AgregarNuevoUsuario } from "./Metodos/Peticiones.js";

document.getElementById("btnAgregarUsuario").addEventListener("click", async ()=>{
    try
    {
        let data = await AgregarNuevoUsuario(
                            document.getElementById("txtNombreCompleto").value,
                            document.getElementById("txtNombreUsuario").value,
                            document.getElementById("txtPassword").value,
                            document.getElementById("cmbGrupoClientes").value,
                            document.getElementById("cmbRol").value
                        );
        
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: data,
            icon: "success",
            confirmButtonText: "OK",
        });
    }
    catch(error)
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
})