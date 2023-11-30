import { PermitirAcceso } from "./Metodos/MetodosSinPeticion.js";

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

const btnNewUser = document.getElementById("btnNewUser");
const btnAllUsers = document.getElementById("btnAllUsers");

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

window.addEventListener("load", async()=>{
    await PermitirAcceso().then(res =>{
        if(res["Rol"] != "admin")
        {
            btnNewUser.classList.add("content-blocker--hidden");
            btnAllUsers.classList.add("content-blocker--hidden");
        }
        else
        {
            btnNewUser.addEventListener("click", ()=>{
                location.href = "nuevo-usuario.html";
            });
            
            btnAllUsers.addEventListener("click", ()=>{
                location.href = "ver-usuarios.html";
            });
        }
    });
});

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

document.getElementById("btnNewCustomer").addEventListener("click", ()=>{
    location.href = "nuevo-certificado.html";
});

document.getElementById("btnAllCustomers").addEventListener("click", ()=>{
    location.href = "ver-clientes.html";
});

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/