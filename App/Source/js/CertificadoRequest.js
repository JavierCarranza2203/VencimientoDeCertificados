let frmValidarCertificado = document.getElementById("frmValidarCertificado");


frmValidarCertificado.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener el formulario y crear un objeto FormData
    const formData = new FormData(document.getElementById("frmValidarCertificado"));
    const inputCertificado = document.getElementById("certificadoFirma");

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
            
            document.getElementById("txtNombre").value = data.Nombre;
            document.getElementById("txtRFC").value = data.RFC; 

            
            document.getElementById("txtFechaInicio").value = data.FechaInicio;
            document.getElementById("txtFechaFin").value = data.FechaFin;

            console.log(data)
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