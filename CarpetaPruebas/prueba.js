function PeticionHTTP() {
    fetch("https://localhost/VerificadorDeVencimientoDeFirmas/App/Views/prueba.php")
        .then(response => response.json())
            .then(datosJson => console.log(datosJson));
}

PeticionHTTP();