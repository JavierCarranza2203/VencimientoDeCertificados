<?php

require_once "../Services/UsuarioService.php";

    try
    {
        $Operacion = $_GET['Operacion'];
        $UsuarioService = new UsuarioService();

        switch($Operacion)
        {
            case 'login': 
                echo json_encode($UsuarioService->IniciarSesion($_POST['NombreDeUsuario'], $_POST['Contrasenia']));
            break;
            case 'userLogged':
                echo json_encode($UsuarioService->ObtenerUsuarioLogeado(00175));
                break;
        }
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 401");
        echo json_encode($e->getMessage());
    }

?>