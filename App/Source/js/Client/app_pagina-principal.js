import { PermitirAcceso } from "../Functions/MetodosSinPeticion.js";
import { RunAutoUpdateService } from "../Functions/Peticiones.js";

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

const btnModuloUsuarios = document.getElementById("btnModuloUsuarios");
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
            btnModuloUsuarios.addEventListener("click", ()=>{
                location.href = "usuarios.html";
            });

            btnAutoUpdateService.classList.add("content-blocker--hidden");
        }
        else if(res["Rol"] == "dev") {
            btnModuloUsuarios.addEventListener("click", ()=>{
                location.href = "usuarios.html";
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
            btnModuloUsuarios.classList.add("content-blocker--hidden");
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

document.getElementById("btnModuloClientes").addEventListener("click", ()=>{
    location.href = "clientes.html";
});

document.getElementById("btnModuloCSDyFiel").addEventListener("click", ()=>{
    location.href = "firmas-y-sellos.html";
});

document.getElementById("btnModuloContrarecibos").addEventListener("click", ()=>{
    location.href = "contrarecibos.html";
});

document.getElementById("btnModuloGastosIngresos").addEventListener("click", ()=> {
    location.href = "generar-relacion-gastos.html";
});

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/