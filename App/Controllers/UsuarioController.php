<?php

require_once "../Services/UsuarioService.php";

    try
    {
        $Operacion = $_POST['Operacion'];
        $UsuarioService = new UsuarioService();

        switch($Operacion)
        {
            case 'login': 
                echo json_encode($UsuarioService->IniciarSesion($_POST['NombreDeUsuario'], $_POST['Contrasenia']));
            break;
        }
    }
    catch(Error $e)
    {
        echo json_encode($e->getMessage());
    }

?>