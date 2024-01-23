<?php
require_once "../Services/ClienteService.php";
require_once "../Models/Cliente.php";

    try {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

        $ClienteService = new ClienteService();
        $Operacion = $_GET['Operacion'];

        //Este switch sirve de router para correr el método del servicio que se requiere
        switch($Operacion) {
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
                    $datosRecibidos = file_get_contents('php://input');

                    // Convierte el contenido del cuerpo de la solicitud (request body) en un objeto PHP
                    $datosDelCliente = json_decode($datosRecibidos);

                    //Crea una nueva instancia del cliente
                    $NuevoCliente = new Cliente($datosDelCliente->_strNombre, 
                                                $datosDelCliente->_strRfc, 
                                                $datosDelCliente->_chrGrupo, 
                                                $datosDelCliente->Sello->_dtmFechaVencimiento,
                                                $datosDelCliente->Sello->_blnStatus,
                                                $datosDelCliente->Firma->_dtmFechaVencimiento,
                                                $datosDelCliente->Firma->_blnStatus);

                    //Manda a llamar el método de agregar cliente
                    echo json_encode($ClienteService->AgregarCliente($NuevoCliente));
                break;
            case 'delete':
                    echo json_encode($ClienteService->EliminarCliente($_GET["rfc"], 00175));
                break;
            case 'update':
                    $Rfc = $_POST['Rfc'];
                    $CertificadoFirma = null;
                    $CertificadoSello = null;

                    if(isset($_FILES['CertificadoSello']['tmp_name'])){ $CertificadoSello = file_get_contents($_FILES['CertificadoSello']['tmp_name']); }
                    if(isset($_FILES['CertificadoFirma']['tmp_name'])){ $CertificadoFirma = file_get_contents($_FILES['CertificadoFirma']['tmp_name']); }

                    $GrupoClientes = $_POST['GrupoClientes'];
                    
                    echo $ClienteService->EditarCliente($Rfc, $CertificadoSello, $CertificadoFirma, $GrupoClientes);
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