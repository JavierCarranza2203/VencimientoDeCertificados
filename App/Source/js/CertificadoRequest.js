let frmValidarCertificado = document.getElementById("frmValidarCertificado");


frmValidarCertificado.addEventListener("submit", (e)=>{
    e.preventDefault();

    const datosFormulario = new FormData(frmValidarCertificado); // Crea un objeto FormData con los datos del formulario

    const httpRequest = new XMLHttpRequest(); // Crea una instancia de XMLHttpRequest

    httpRequest.open("POST", "../Controllers/ClienteController.php"); // Establece la URL y el método de la petición

    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                let respuesta = JSON.parse(httpRequest.responseText);
                console.log(respuesta.Nombre);
            } 
            else {
                // Hubo un error en la petición
                alert("Hubo un error");
                console.error('Error en la petición');
            }
        }
    };

    const inputCertificado = document.getElementById("certificadoFirma");
    const certificado = inputCertificado.files[0];
    datosFormulario.append("Certificado", certificado);

    httpRequest.send(datosFormulario);
});

    // fetch("../Controllers/ClienteController.php")
    //     .then(response => response.json())
    //         .then(datosJson =>{
    //             let newRow = document.createElement('tr');

    //             let cell = document.createElement('td');
    //             cell.textContent = datosJson.Nombre;

    //             newRow.appendChild(cell);

    //             let cell2 = document.createElement('td');
    //             cell2.textContent = datosJson.FechaInicio;

    //             newRow.appendChild(cell2);

    //             let cell3 = document.createElement('td');
    //             cell3.textContent = datosJson.FechaFin;

    //             newRow.appendChild(cell3);

    //             let cell4 = document.createElement('td');
    //             cell4.textContent = datosJson.Emisor;

    //             newRow.appendChild(cell4);

    //             container.appendChild(newRow);
    //     });