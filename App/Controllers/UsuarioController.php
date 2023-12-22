<?php

require_once "../Services/UsuarioService.php";

    try
    {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

        //Obtiene la variable de operación enviada por el método GET
        $Operacion = $_GET['Operacion'];
        //Crea una instancia del servicio de usuarios
        $UsuarioService = new UsuarioService();

        //Switch para evaluar la operación
        switch($Operacion)
        {
            case 'login': 
                    //Manda a llamar el método para inciar sesións
                    echo json_encode($UsuarioService->IniciarSesion($_POST['NombreDeUsuario'], $_POST['Contrasenia']));
                break;
            case 'userLogged':
                    //Manda a llamar el método para obtener los datos de un usuario loggeado
                    echo json_encode($UsuarioService->ObtenerUsuarioLogeado());
                break;
            case 'add':
                    //Crea una instancia del usuario
                    $nuevoUsuario = new Usuario("Desconocida");
                    $nuevoUsuario->NombreCompleto = $_POST['NombreCompleto'];
                    $nuevoUsuario->NombreUsuario = $_POST['NombreDeUsuario'];
                    $nuevoUsuario->Rol = $_POST['Rol'];
                    $nuevoUsuario->GrupoClientes = $_POST['GrupoDeClientes'];

                    //Manda a llamar el método para agregar el usuario
                    echo json_encode(($UsuarioService->AgregarUsuario($nuevoUsuario, $_POST['Contrasenia'])));
                break;
            case 'logout':
                    //Manda a llamar el método para cerrar la sesión
                    echo json_encode($UsuarioService->CerrarSesion());
                break;
            case 'view':
                    //Manda a llamar el método para obtener todos los usuarios
                    echo json_encode($UsuarioService->ObtenerTodosLosUsuarios());
                break;
            case 'delete':
                    echo json_encode($UsuarioService->EliminarUsuario($_GET["nombreUsuario"], 00175));
                break;
            case 'update':
                    $data = file_get_contents('php://input');

                    // Convierte el contenido del cuerpo de la solicitud (request body) en un objeto PHP
                    $requestObj = json_decode($data);

                    echo json_encode($UsuarioService->ActualizarUsuario($requestObj->id, 
                                                                        $requestObj->nombre, 
                                                                        $requestObj->usuario, 
                                                                        $requestObj->grupoClientes, 
                                                                        $requestObj->rol));
                break;
            default:
                throw new Exception("La operación no es válida");
        }
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode($e->getMessage());
    }

?>