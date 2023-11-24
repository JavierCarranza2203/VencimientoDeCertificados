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
            case 'add':
                $nuevoUsuario = new Usuario("Desconocida");
                $nuevoUsuario->NombreCompleto = $_POST['NombreCompleto'];
                $nuevoUsuario->NombreUsuario = $_POST['NombreDeUsuario'];
                $nuevoUsuario->Rol = $_POST['Rol'];
                $nuevoUsuario->GrupoClientes = $_POST['GrupoDeClientes'];

                echo json_encode(($UsuarioService->AgregarUsuario($nuevoUsuario, $_POST['Contrasenia'])));
                break;
            case 'logout':
                echo json_encode($UsuarioService->CerrarSesion());
                break;
        }
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode($e->getMessage());
    }

?>