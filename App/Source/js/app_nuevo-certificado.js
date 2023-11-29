import { ObtenerDatosDelCertificado } from "./Metodos/Peticiones.js";
import { PermitirAcceso } from "./Metodos/MetodosSinPeticion.js";
import { Cliente } from "./Clases/Cliente.js";

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

let grupo, bandera = false;
window.addEventListener("load", ()=>{
    PermitirAcceso().then(res=> {
        grupo = res["GrupoClientes"];

        if(res["Rol"] == "admin")
        {
            bandera = true;
        }
    });
});

/**********************************************************/
/* Llamando al método para permitir el acceso a la página */
/**********************************************************/

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

//Contenedores de las secciones del formulario
const contenedorFirma = document.getElementById("DatosFirmaE");
const contenedorSello = document.getElementById("DatosSello");

//Controles para el formulario del certificado de la firme-e
const frmValidarCertificadoFirma = document.getElementById("frmValidarCertificadoFirma");

const txtNombreEnFirma = document.getElementById("txtNombreEnFirma");
const txtRfcEnFirma = document.getElementById("txtRfcEnFirma");
const txtFechaInicioEnFirma = document.getElementById("txtFechaInicioEnFirma");
const txtFechaFinEnFirma = document.getElementById("txtFechaFinEnFirma");
const statusFirma = document.getElementById("StatusFirma");

//Controles para el formulario del certificado del sello
const frmValidarCertificadoSello = document.getElementById("frmValidarCertificadoSello");

const txtNombreEnSello = document.getElementById("txtNombreEnSello");
const txtRfcEnSello = document.getElementById("txtRfcEnSello");
const txtFechaInicioEnSello = document.getElementById("txtFechaInicioEnSello");
const txtFechaFinEnSello = document.getElementById("txtFechaFinEnSello");
const statusSello = document.getElementById("StatusSello");

//Controles para indicar en que nivel se encuentra el usuario
const nivel2 = document.getElementById("level3");

//Contador de clicks para el funcionamiento del formulario
let numeroClicks = 0;

let NuevoCliente = new Cliente();

/*************************************************************/
/* Declaracion de variables y obtiene los elementos del html */
/*************************************************************/

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

frmValidarCertificadoFirma.addEventListener("submit", async (e) => {
    try 
    {
        //Cancela el evento submit del formulario para validar el sello
        e.preventDefault();

        // Obtener el archivo del input
        const certificado = document.getElementById("certificadoFirma").files[0];

        if(!certificado){ throw new Error("Ingrese un archivo"); }

        let data = await ObtenerDatosDelCertificado(certificado);

        //Llama al metodo para mostrar los datos en los inputs y recibe como parametro la funcion para obtener los datos
        MostrarDatos(
            txtNombreEnFirma, 
            txtRfcEnFirma, 
            txtFechaInicioEnFirma, 
            txtFechaFinEnFirma, 
            statusFirma, 
            data
        );
    } 
    catch (error) //En caso de que sea un error no esperado, muestra el mensaje en consola
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

frmValidarCertificadoSello.addEventListener("submit", async (e) => {
    try 
    {
        //Cancela el evento submit del formulario para validar el sello
        e.preventDefault();

        // Obtener el archivo del input
        const certificado = document.getElementById("certificadoSello").files[0];

        if(!certificado){ throw new Error("Ingrese un archivo"); }
        
        let data = await ObtenerDatosDelCertificado(certificado);

        //Llama al metodo para mostrar los datos en los inputs y recibe como parametro los datos
        MostrarDatos(
            txtNombreEnSello, 
            txtRfcEnSello, 
            txtFechaInicioEnSello, 
            txtFechaFinEnSello, 
            statusSello, 
            data 
        );
    } 
    catch (error) //En caso de que sea un error no esperado, muestra el mensaje en consola
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

document.getElementById("btnSiguiente").addEventListener("click", async()=>{
    try
    {
        numeroClicks++;

        switch(numeroClicks)
        {
            case 1:
                CambiarPaginaFormulario(statusFirma, contenedorFirma, nivel2);

                NuevoCliente._strNombre = txtNombreEnFirma.value;
                NuevoCliente._strRfc = txtRfcEnFirma.value;
                NuevoCliente.Firma._dtmFechaVencimiento = txtFechaFinEnFirma.value;
                NuevoCliente.Firma._blnStatus = statusFirma.textContent;
                break;
            case 2:
                if(NuevoCliente.Nombre != txtNombreEnSello.value || NuevoCliente.Rfc != txtRfcEnSello.value)
                {
                    throw new Error("Los certificados no son de la misma persona");
                }
                else
                {
                    CambiarPaginaFormulario(statusSello);

                    if(bandera == true)
                    {
                        Swal.fire({
                            title: "Ingrese el grupo de clientes al que pertenece",
                            input: "text",
                            showCancelButton: true,
                            confirmButtonText: "Aceptar",
                            showLoaderOnConfirm: true,
                            preConfirm: (group)=>
                            {
                                grupo = group;
                            }
                        });
                    }

                    NuevoCliente.Sello._dtmFechaVencimiento = txtFechaFinEnSello.value;
                    NuevoCliente.Sello._blnStatus = statusSello.textContent;
                    NuevoCliente._chrGrupo = grupo;

                    let jsonCliente = JSON.stringify(NuevoCliente);

                    const response = await fetch("../Controllers/ClienteController.php?Operacion=add",
                    {
                        method:"POST",
                        body: jsonCliente
                    });

                    let data = await response.json()
                    if(response.ok)
                    {
                        Swal.fire({
                            title: "¡Tarea realizada con éxito!",
                            text: data,
                            icon: "success",
                            confirmButtonText: "OK",
                        }).then(()=>{
                            location.href("pagina-principal.html");
                        });
                    }
                    else
                    {
                        throw new Error("El Cliente ya existe")
                    }
                }
                break;
            default:
                numeroClicks--;
                break;
        }
    }
    catch(error)
    {
        numeroClicks--;
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});

document.getElementById("btnAnterior").addEventListener("click", ()=> {
    if(numeroClicks == 1){
        contenedorFirma.classList.remove("double-form-container__form--next");
        nivel2.classList.remove("progress-bar__levels-container-level--complete");
    }
    else if(numeroClicks == 2){
        contenedorSello.classList.remove("double-form-container__form--next");
        nivel3.classList.remove("progress-bar__levels-container-level--complete");
    }
    else{
        numeroClicks++;
    }
    
    numeroClicks--;
});

/*************************************************************/
/*             Eventos de los controles del html             */
/*************************************************************/

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/

//Recibe los inputs para poner los datos del array recibido por parametro
function MostrarDatos(nombre, rfc, fechaTramite, fechaVencimiento, status, data)
{
    nombre.value = data['NombreCliente'];
    rfc.value = data['RfcCliente'];
    fechaTramite.value = data['FechaDeTramite'];
    fechaVencimiento.value = data['FechaDeVencimiento'];

    //Limpiar el contenedor de status
    status.innerHTML = "";

    //Crea un icono en forma de circulo
    const icon = document.createElement('i');
    icon.classList.add("fa-solid");
    icon.classList.add("fa-circle");

    //Dependiendo si el status es true o false, agrega los datos correspondientes
    if (data['Status']) 
    {
        icon.classList.add("double-form-container__form-status--active");
        status.appendChild(icon);
        status.appendChild(document.createTextNode(" Vigente"));
    } 
    else 
    {
        icon.classList.add("double-form-container__form-status--inactive");
        status.appendChild(icon);
        status.appendChild(document.createTextNode(" Vencido"));
    }
}

function CambiarPaginaFormulario(status, contenedorActual = null, siguienteNivel = null)
{
    if(status.textContent == ""){ throw new Error('Ingrese un archivo o haga click en "Ver datos"'); }
    else if(status.textContent !== " Vigente"){ throw new Error("Ingrese un certificado vigente"); }

    if(siguienteNivel != null)
    {
        contenedorActual.classList.add("double-form-container__form--next");
        siguienteNivel.classList.add("progress-bar__levels-container-level--complete");
    }
}

/**************************************************************/
/*             Métodos implementados en la página             */
/**************************************************************/