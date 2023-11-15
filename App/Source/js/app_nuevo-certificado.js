import { ObtenerDatosDelCertificado } from "./Peticiones.js";

// let frmValidarCertificadoFirma = document.getElementById("frmValidarCertificadoFirma");

// const txtNombreEnFirma = document.getElementById("txtNombreEnFirma");
// const txtRfcEnFirma = document.getElementById("txtRfcEnFirma");
// const txtFechaInicioEnFirma = document.getElementById("txtFechaInicioEnFirma");
// const txtFechaFinEnFirma = document.getElementById("txtFechaFinEnFirma");

let frmValidarCertificadoSello = document.getElementById("frmValidarCertificadoSello");

const txtNombreEnSello = document.getElementById("txtNombreEnSello");
const txtRfcEnSello = document.getElementById("txtRfcEnSello");
const txtFechaInicioEnSello = document.getElementById("txtFechaInicioEnSello");
const txtFechaFinEnSello = document.getElementById("txtFechaFinEnSello");
const statusSello = document.getElementById("StatusSello");


// frmValidarCertificadoFirma.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     // Obtener el formulario y crear un objeto FormData
//     const formData = new FormData(frmValidarCertificadoFirma);
//     const inputCertificado = document.getElementById("certificadoFirma");

//     // Obtener el archivo del input
//     const certificado = inputCertificado.files[0];
//     // Hacer el append del archivo al FormData
//     formData.append("Certificado", certificado);

//     try 
//     {
//         // Realiza la solicitud usando fetch con el método POST
//         const response = await fetch("../Controllers/ClienteController.php", {
//             method: "POST",
//             body: formData,
//         });

//         // Verifica si la respuesta fue exitosa (código 200)
//         if (response.ok)
//         {
//             // Obtiene los datos de la respuesta como un objeto JSON
//             const data = await response.json();

//             //Carga la información en los txt   
            
//             document.getElementById("txtNombreEnFirma").value = data.Nombre;
//             document.getElementById("txtRfcEnFirma").value = data.RFC; 
//             document.getElementById("txtFechaInicioEnFirma").value = data.FechaInicio;
//             document.getElementById("txtFechaFinEnFirma").value = data.FechaFin;
            
//             let status = document.getElementById("StatusFirma");
//             status.innerHTML = "";

//             let icon = document.createElement('i');
//             icon.classList.add("fa-solid");
//             icon.classList.add("fa-circle");

//             if(data.Status)
//             {
//                 icon.classList.add("double-form-container__form-status--active");
//                 status.appendChild(icon);
//                 status.appendChild(document.createTextNode(" Vigente"))
//             }
//             else
//             {
//                 icon.classList.add("double-form-container__form-status--inactive");
//                 status.appendChild(icon);
//                 status.appendChild(document.createTextNode(" Vencido"))
//             }
//         } 
//         else //Si hay error, muestra un mensaje
//         {
//             console.error("Hubo un error. Estado de la respuesta: " + response.status + ", Texto de la respuesta: " + await response.text());
//             alert('Error en la petición');
//         }
//     } 
//     catch (error) //En caso de que sea un error no esperado, muestra el mensaje en consola
//     {
//         alert("Error")
//         console.error('Error en la petición:', error);
//     }
// });

frmValidarCertificadoSello.addEventListener("submit", async (e) => {
    try 
    {
        e.preventDefault();

        // Obtener el archivo del input
        const certificado = document.getElementById("certificadoSello").files[0];
        
        MostrarDatos
        (
            txtNombreEnSello, 
            txtRfcEnSello, 
            txtFechaInicioEnSello, 
            txtFechaFinEnSello, 
            statusSello, 
            await ObtenerDatosDelCertificado(certificado)
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

function MostrarDatos(nombre, rfc, fechaTramite, fechaVencimiento, status, data)
{
    nombre.value = data.Nombre;
    rfc.value = data.RFC;
    fechaTramite.value = data.FechaInicio;
    fechaVencimiento.value = data.FechaFin;

    status.innerHTML = "";

    const icon = document.createElement('i');
    icon.classList.add("fa-solid");
    icon.classList.add("fa-circle");

    if (data.Status) 
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