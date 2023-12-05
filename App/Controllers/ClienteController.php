<?php

require_once "../Services/ClienteService.php";
require_once "../Models/Cliente.php";

    try
    {
        $ClienteService = new ClienteService();
        $Operacion = $_GET['Operacion'];

        switch($Operacion)
        {
            case 'view':
                    //Manda a llamar el método de obtener todos los clientes por grupo
                    echo json_encode($ClienteService->ObtenerTodosLosClientes($_GET['Grupo']));
                break;
            case 'viewAll':
                    //Manda a llamar el método de obtener todos los clientes
                    echo json_encode($ClienteService->ObtenerTodosLosClientes_Admin());
                break;
            case 'add':
                    // Obtén el contenido del cuerpo de la solicitud (request body)
                    $data = file_get_contents('php://input');

                    // Convierte el contenido del cuerpo de la solicitud (request body) en un objeto PHP
                    $requestObj = json_decode($data);

                    //Crea una nueva instancia del cliente
                    $NuevoCliente = new Cliente();
                    $NuevoCliente->Nombre = $requestObj->_strNombre;
                    $NuevoCliente->GrupoClientes = $requestObj->_chrGrupo;
                    $NuevoCliente->RFC = $requestObj->_strRfc;

                    $NuevoCliente->Sello->FechaFin = $requestObj->Sello->_dtmFechaVencimiento;
                    $NuevoCliente->Sello->Status = $requestObj->Sello->_blnStatus;

                    $NuevoCliente->Firma->FechaFin = $requestObj->Firma->_dtmFechaVencimiento;
                    $NuevoCliente->Firma->Status = $requestObj->Firma->_blnStatus;

                    //Manda a llamar el método de agregar cliente
                    echo json_encode($ClienteService->AgregarCliente($NuevoCliente));
                break;
            case 'delete':
                    echo json_encode($ClienteService->EliminarCliente($_GET["rfc"], 00175));
                break;
            default:
                throw new Exception("La operación no es válida");
        }
    }
    catch(Exception $e)
    {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($e->getMessage());
    }

?>