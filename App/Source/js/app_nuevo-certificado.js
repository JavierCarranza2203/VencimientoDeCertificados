import { ObtenerDatosDelCertificado } from "./Peticiones.js";

let frmValidarCertificadoFirma = document.getElementById("frmValidarCertificadoFirma");

const txtNombreEnFirma = document.getElementById("txtNombreEnFirma");
const txtRfcEnFirma = document.getElementById("txtRfcEnFirma");
const txtFechaInicioEnFirma = document.getElementById("txtFechaInicioEnFirma");
const txtFechaFinEnFirma = document.getElementById("txtFechaFinEnFirma");

let frmValidarCertificadoSello = document.getElementById("frmValidarCertificadoSello");

const txtNombreEnSello = document.getElementById("txtNombreEnSello");
const txtRfcEnSello = document.getElementById("txtRfcEnSello");
const txtFechaInicioEnSello = document.getElementById("txtFechaInicioEnSello");
const txtFechaFinEnSello = document.getElementById("txtFechaFinEnSello");
const statusSello = document.getElementById("StatusSello");


frmValidarCertificadoFirma.addEventListener("submit", async (e) => {
    try 
    {
        //Cancela el evento submit del formulario para validar el sello
        e.preventDefault();

        // Obtener el archivo del input
        const certificado = document.getElementById("certificadoFirma").files[0];

        //Llama al metodo para mostrar los datos en los inputs y recibe como parametro la funcion para obtener los datos
        MostrarDatos(
            txtNombreEnFirma, 
            txtRfcEnFirma, 
            txtFechaInicioEnFirma, 
            txtFechaFinEnFirma, 
            statusSello, 
            await ObtenerDatosDelCertificado(certificado) //Aqui recibe la funcion para sacar los datos del certificado
        );
    } 
    catch (error) //En caso de que sea un error no esperado, muestra el mensaje en consola
    {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: "Intente de nuevo más tarde",
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });

        console.error('Error en la petición:', error);
    }
});

frmValidarCertificadoSello.addEventListener("submit", async (e) => {
    try 
    {
        //Cancela el evento submit del formulario para validar el sello
        e.preventDefault();

        // Obtener el archivo del input
        const certificado = document.getElementById("certificadoSello").files[0];
        
        //Llama al metodo para mostrar los datos en los inputs y recibe como parametro la funcion para obtener los datos
        MostrarDatos(
            txtNombreEnSello, 
            txtRfcEnSello, 
            txtFechaInicioEnSello, 
            txtFechaFinEnSello, 
            statusSello, 
            await ObtenerDatosDelCertificado(certificado) //Aqui recibe la funcion para sacar los datos del certificado
        );
    } 
    catch (error) //En caso de que sea un error no esperado, muestra el mensaje en consola
    {
        Swal.fire({
                icon: "error",
                title: "¡Hubo un error inesperado!",
                text: "Intente de nuevo más tarde",
                footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
            });

        console.error('Error en la petición:', error);
    }
});

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