<?php

require_once "../Services/CertificadoService.php";
    try
    {
        // Verificar que el archivo tiene la extensión .cer
        $fileExtension = pathinfo($_FILES['Certificado']['name'], PATHINFO_EXTENSION);

        if (strtolower($fileExtension) !== 'cer') {
            throw new Exception("Por favor ingrese un archivo con extensión .cer");
        }

        $CertificadoService = new CertificadoService();

        //Asigna un nombre temporal al certificado recibido del formulario
        if (isset($_FILES['Certificado']['tmp_name'])) 
        {    
            echo $CertificadoService->ObtenerDatosCertificado(file_get_contents($_FILES['Certificado']['tmp_name']));
        } 
        else 
        {
            // Manejo de error si no se recibió el archivo
            header("HTTP/1.1 400 Bad Request");
            throw new Exception("No se recibió el archivo");
        }
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($e->getMessage());
    }

?>