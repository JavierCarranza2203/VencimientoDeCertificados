<?php
require_once "../Services/ClienteService.php";

$ClienteService = new ClienteService();

if (isset($_FILES['Certificado']['tmp_name'])) {

    $contenidoCertificado = file_get_contents($_FILES['Certificado']['tmp_name']);
    
    echo $ClienteService->ObtenerDatosCertificado($contenidoCertificado);
} else {
    // Manejo de error si no se recibió el archivo
    echo "No se recibió el archivo Certificado.";
}

?>