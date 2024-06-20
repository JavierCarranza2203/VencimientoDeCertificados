<?php
require_once "../Services/ClienteService.php";
require_once "../Models/Cliente.php";

    try {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

        //Esta es la instancia del servicio de clientes
        $ClienteService = new ClienteService();

        $Operacion = $_GET['Operacion'];

        //Este switch sirve de "router" para correr el método del servicio que se requiere
        switch($Operacion) {
            case 'viewAll':
                //Manda a llamar el método de obtener todos los clientes
                echo json_encode($ClienteService->ObtenerTodosLosClientes_Admin());
            break;
            case 'view':
                //Manda a llamar el método de obtener todos los clientes por grupo
                echo json_encode($ClienteService->ObtenerTodosLosClientes($_GET['Grupo']));
            break;
            case 'viewRecibos':
                echo json_encode($ClienteService->ObtenerTodosLosContrarecibosDeTodosLosClientes());
            break;
            case 'viewPayments':
                echo json_encode($ClienteService->ObtenerPagosRegistradosDeTodosLosClientes());
            break;
            case 'viewInfoTimbrado':
                echo json_encode($ClienteService->ObtenerInformacionDeTimbradoDeClientes());
            break;
            case 'viewTicketsInfoByCustomerId':
                $Rfc = $_GET['Rfc'];

                echo json_encode($ClienteService->ObtenerInformacionDeTimbradoPorCliente($Rfc));
            break;
            case 'getCustomersWithTickets':
                echo json_encode($ClienteService->ObtenerClientesQueTimbranContraRecibos());
            break;
            case 'viewTicketsByCustomerId':
                $Rfc = $_GET['Rfc'];

                echo json_encode($ClienteService->ObtenerContraRecibosTimbradosPorCliente($Rfc));
            break;
            case 'viewPaymentsByCustomerId':
                $Rfc = $_GET['Rfc'];

                echo json_encode($ClienteService->ObtenerPagosRealizadosPorCliente($Rfc));
            break;
            case 'stampAllTickets':
                $concepto = $_POST['concepto'];

                echo json_encode($ClienteService->TimbrarTodosLosContraRecibos($concepto));
            break;
            case 'stampTicket':
                $concepto = $_POST['concepto'];
                $rfc = $_POST['rfc'];
                
                echo json_encode($ClienteService->TimbrarContraRecibo($rfc, $concepto));
            break;
            case 'pay':
                $rfc = $_POST['rfc'];
                $monto = $_POST['monto'];

                echo json_encode($ClienteService->RealizarPago($rfc, $monto));
            break;
            case 'updateCertificates':
                $Rfc = $_POST['Rfc'];
                $CertificadoFirma = null;
                $CertificadoSello = null;

                if(isset($_FILES['CertificadoSello']['tmp_name'])){ $CertificadoSello = $_FILES['CertificadoSello']['tmp_name']; }
                if(isset($_FILES['CertificadoFirma']['tmp_name'])){ $CertificadoFirma = $_FILES['CertificadoFirma']['tmp_name']; }

                echo $ClienteService->EditarCertificados($Rfc, $CertificadoSello, $CertificadoFirma);
            break;
            case 'updateInformation':
                $Rfc = $_POST['Rfc'];
                $ClaveCiec = $_POST['ClaveCiec'];
                $GrupoClientes = $_POST['GrupoClientes'];
                $RegimenFiscal = $_POST['RegimenFiscal'];

                echo $ClienteService->EditarDatosCliente($Rfc, $GrupoClientes, $ClaveCiec, $RegimenFiscal);
            break;
            case 'updateTicketsInfo':
                $Rfc = $_POST['rfc'];
                $Calle = $_POST['calle'];
                $Numero = $_POST['numero'];
                $Ciudad = $_POST['ciudad'];
                $Estado = $_POST['estado'];
                $CodigoPostal = $_POST['codigoPostal'];
                $TarifaMensal = $_POST['tarifaMensual'];

                echo $ClienteService->EditarDatosDeTimbradoDeContraRecibos($Rfc, $Calle, $Numero, $Ciudad, $Estado, $CodigoPostal, $TarifaMensal);
            break;
            case 'cancelTicket':
                $folio = $_GET['folio'];

                echo json_encode($ClienteService->CancelarContraRecibo($folio));
            break;
            case 'cancelCustomer':
                $rfc = $_GET['rfc'];

                echo json_encode($ClienteService->DejarDeTimbrarContraRecibos($rfc));
            break;
            case 'add':
                // Obtén el contenido del cuerpo de la solicitud (request body)
                $datosRecibidos = file_get_contents('php://input');

                // Convierte el contenido del cuerpo de la solicitud (request body) en un objeto PHP
                $datosDelCliente = json_decode($datosRecibidos);

                //Crea una nueva instancia del cliente
                $NuevoCliente = new Cliente($datosDelCliente->Nombre, 
                                            $datosDelCliente->Rfc, 
                                            $datosDelCliente->Grupo, 
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
            default:
                throw new Exception("La operación no es válida");
        }
    }
    catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        echo json_encode($e->getMessage());
    }

?>