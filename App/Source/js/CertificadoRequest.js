let container = document.getElementById("Contenedor");

document.getElementById("btnVerDatos").addEventListener("click", ()=>{
    fetch("../Controllers/ClienteController.php")
        .then(response => response.json())
            .then(datosJson =>{
                let newRow = document.createElement('tr');

                let cell = document.createElement('td');
                cell.textContent = datosJson.Nombre;

                newRow.appendChild(cell);

                let cell2 = document.createElement('td');
                cell2.textContent = datosJson.FechaInicio;

                newRow.appendChild(cell2);

                let cell3 = document.createElement('td');
                cell3.textContent = datosJson.FechaFin;

                newRow.appendChild(cell3);

                let cell4 = document.createElement('td');
                cell4.textContent = datosJson.Emisor;

                newRow.appendChild(cell4);

                container.appendChild(newRow);
        });
});