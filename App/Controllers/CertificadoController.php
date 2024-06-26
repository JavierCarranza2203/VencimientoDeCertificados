<?php
require_once "../Services/CertificadoService.php";

    try {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

        //Obtiene la extensión del certificado
        $fileExtension = pathinfo($_FILES['Certificado']['name'], PATHINFO_EXTENSION);

        //Valida si la extención del archivo es .cer
        if (strtolower($fileExtension) !== 'cer') {
            throw new Exception("Por favor ingrese un archivo con extensión .cer");
        }

        //Crea una instancia del servicio de certificado
        $CertificadoService = new CertificadoService();

        //Asigna un nombre temporal al certificado recibido del formulario
        if (isset($_FILES['Certificado']['tmp_name'])) {
            //Llama al método para obtener los datos del certificado
            echo $CertificadoService->ObtenerDatosCertificado($_FILES['Certificado']['tmp_name']);
        } 
        else {
            // Manejo de error si no se recibió el archivo
            throw new Exception("No se recibió el archivo");
        }
    }
    catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($e->getMessage());
    }
?>