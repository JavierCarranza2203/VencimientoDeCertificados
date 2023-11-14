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
    e.preventDefault();

    // Obtener el formulario y crear un objeto FormData
    const formData = new FormData(frmValidarCertificadoSello);
    const inputCertificado = document.getElementById("certificadoSello");

    // Obtener el archivo del input
    const certificado = inputCertificado.files[0];
    // Hacer el append del archivo al FormData
    formData.append("Certificado", certificado);

    try 
    {
        // Realiza la solicitud usando fetch con el método POST
        const response = await fetch("../Controllers/ClienteController.php", {
            method: "POST",
            body: formData,
        });

        // Verifica si la respuesta fue exitosa (código 200)
        if (response.ok)
        {
            // Obtiene los datos de la respuesta como un objeto JSON
            const data = await response.json();

            //Carga la información en los txt   
            
            document.getElementById("txtNombreEnSello").value = data.Nombre;
            document.getElementById("txtRfcEnSello").value = data.RFC; 
            document.getElementById("txtFechaInicioEnSello").value = data.FechaInicio;
            document.getElementById("txtFechaFinEnSello").value = data.FechaFin;
            
            let status = document.getElementById("StatusSello");
            status.innerHTML = "";

            let icon = document.createElement('i');
            icon.classList.add("fa-solid");
            icon.classList.add("fa-circle");

            if(data.Status)
            {
                icon.classList.add("double-form-container__form-status--active");
                status.appendChild(icon);
                status.appendChild(document.createTextNode(" Vigente"))
            }
            else
            {
                icon.classList.add("double-form-container__form-status--inactive");
                status.appendChild(icon);
                status.appendChild(document.createTextNode(" Vencido"))
            }
        } 
        else //Si hay error, muestra un mensaje
        {
            console.error("Hubo un error. Estado de la respuesta: " + response.status + ", Texto de la respuesta: " + await response.text());
            alert('Error en la petición');
        }
    } 
    catch (error) //En caso de que sea un error no esperado, muestra el mensaje en consola
    {
        alert("Error")
        console.error('Error en la petición:', error);
    }
});