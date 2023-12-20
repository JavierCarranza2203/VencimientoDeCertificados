<?php

//Importa el servicio de auto update
require_once "../Services/AutoUpdateService.php";

    try
    {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

        //Crea la instancia del servicio
        $AUS = new AutoUpdateService();

        //Obtiene el status mandado por método GET
        $status = $_GET["status"];
        $grupo = $_GET["grupo"];
        //Si el status es "run"
        if($status == "run"){
            //Corre el servicio de Auto Update Service (AUS)
            echo json_encode($AUS->AgregarClientes($grupo));
        }
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($e->getMessage());
    }
?>