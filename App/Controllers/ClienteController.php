<?php

require_once "../Services/ClienteService.php";
    try
    {
        $ClienteService = new ClienteService();

        echo json_encode($ClienteService->ObtenerTodosLosClientes("A"));
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($e->getMessage());
    }

?>