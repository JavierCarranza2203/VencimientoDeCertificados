<?php

require_once "../Services/ClienteService.php";

$ClienteService = new ClienteService();

    // Responder con datos en formato JSON
    echo $ClienteService->ObtenerDatosCertificado();

?>