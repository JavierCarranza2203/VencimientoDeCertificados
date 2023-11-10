<?php

require_once "../Services/ClienteService.php";

    try
    {
        //Instancia de los servicios
        $ClienteService = new ClienteService();

        //Asigna un nombre temporal al certificado recibido del formulario
        if (isset($_FILES['Certificado']['tmp_name'])) 
        {    
            echo $ClienteService->ObtenerDatosCertificado(file_get_contents($_FILES['Certificado']['tmp_name']));
        } 
        else 
        {
            // Manejo de error si no se recibió el archivo
            throw new Exception("No se recibió el archivo");
        }
    }
    catch(Exception $ex)
    {
        echo json_encode("Error al analizar el certificado: " . $ex->getMessage());
    }

?>