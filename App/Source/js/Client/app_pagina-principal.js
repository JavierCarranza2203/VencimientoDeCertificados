import { PermitirAcceso } from "../Functions/MetodosSinPeticion.js";
import { RunAutoUpdateService } from "../Functions/Peticiones.js";

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

const btnNewUser = document.getElementById("btnNewUser");
const btnAllUsers = document.getElementById("btnAllUsers");
const btnAutoUpdateService = document.getElementById("btnUseAutoUpdateService");

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

window.addEventListener("load", async()=>{
    await PermitirAcceso().then(res =>{
        if(res["Rol"] == "admin")
        {
            btnNewUser.addEventListener("click", ()=>{
                location.href = "nuevo-usuario.html";
            });

            btnAllUsers.addEventListener("click", ()=>{
                location.href = "ver-usuarios.html";
            });

            btnAutoUpdateService.classList.add("content-blocker--hidden");
        }
        else if(res["Rol"] == "dev") {
            btnNewUser.addEventListener("click", ()=> {
                location.href = "nuevo-usuario.html";
            });
            
            btnAllUsers.addEventListener("click", ()=> {
                location.href = "ver-usuarios.html";
            });

            btnAutoUpdateService.addEventListener("click", ()=> {
                try {
                    RunAutoUpdateService();
                }
                catch(error) {
                    Swal.fire({
                        icon: "error",
                        title: "¡Hubo un error inesperado!",
                        text: error,
                        footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
                    });
                }
            });
        }
        else {
            btnNewUser.classList.add("content-blocker--hidden");
            btnAllUsers.classList.add("content-blocker--hidden");
            btnAutoUpdateService.classList.add("content-blocker--hidden");
        }
    });
});

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

document.getElementById("btnWarningCustomers").addEventListener("click", ()=>{
    location.href = "clientes-por-vencer.html";
});

document.getElementById("btnNewCustomer").addEventListener("click", ()=>{
    location.href = "nuevo-cliente.html";
});

document.getElementById("btnAllCustomers").addEventListener("click", ()=>{
    location.href = "ver-clientes.html";
});

document.getElementById("btnDocumentControl").addEventListener("click", ()=> {
    location.href = "control-de-certificados.html";
});

document.getElementById("btnRelacionDeGastos").addEventListener("click", ()=> {
    location.href = "generar-relacion-gastos.html";
});

document.getElementById("btnRelacionDeIngresos").addEventListener("click", ()=> {
    location.href = "generar-relacion-ingresos.html";
});

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/