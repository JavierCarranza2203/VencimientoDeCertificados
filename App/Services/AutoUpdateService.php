<?php

require_once "../Services/CertificadoService.php";
require_once "../Services/ClienteService.php";
require_once "../Models/Cliente.php";

class AutoUpdateService
{
    //Rutas e instancias necesarias para correr el servicio
    private string $FolderRoute = "C:\\xampp\\htdocs\\VencimientoDeCertificados\\Pruebas\\";
    private string $RutaDelSello = "C:\\xampp\\htdocs\\VencimientoDeCertificados\\Pruebas\\Sellos";
    private string $RutaDelCertificado = "C:\\xampp\\htdocs\\VencimientoDeCertificados\\Pruebas\\Certificados";
    private CertificadoService $CertificadoService;
    private ClienteService $ClienteService;

    //Constructor del servicio
    public function __construct()
    {
        //Crea la instancias del servicio de clientes y certificados
        $this->ClienteService = new ClienteService();
        $this->CertificadoService = new CertificadoService();
    }

    //Metodo para agregar los clientes
    public function AgregarClientes()
    {
        //Obtiene una lista de todos los directorios que hay dentro de la ruta de certificados
        $Certificados = scandir($this->RutaDelCertificado);
        //Obtiene una lista de todos los directorios que hay dentro de la ruta de sellos
        $Sellos = scandir($this->RutaDelSello);

        //Define la bandera en false (La bandera sirve para saber si hay un sello para el certificado)
        $bandera = false;

        //Ciclo para recorrer los certificados (Comienza en 2 porque a partir de ahí comienzan los archivos)
        //Para ver de que hablo, descomente la siguiente linea
        // print_r($Certificados);

        for($i = 2; $i <= count($Certificados); $i++)
        {
            //Crea la instancia del cliente
            $Cliente = new Cliente();

            //Corre el servicio del certificado para obtener los datos
            $datos = $this->CertificadoService->ObtenerDatosCertificado(file_get_contents($this->RutaDelCertificado . $Certificados[$i]));

            //Asigna los valores al cliente
            $Cliente->Nombre = $datos["NombreCliente"];
            $Cliente->RFC = $datos["RfcCliente"];
            $Cliente->Firma->FechaFin = $datos["FechaDeVencimiento"];
            $Cliente->Firma->Status = $datos["Status"];

            //Ciclo para recorrer los sellos
            for($i = 2; $i < count($Sellos); $i++)
            {
                //Corre el servicio para obtener la información del sello
                $datos = $this->CertificadoService->ObtenerDatosCertificado($Sellos[$i]);

                //Si la rfc del cliente es igual a la del sello, significa que se puede agregar
                if($Cliente->RFC == $datos["RfcCliente"])
                {
                    //Agrega los datos al sello
                    $Cliente->Sello->FechaFin = $datos["FechaDeVencimiento"];
                    $Cliente->Sello->Status = $datos["Status"];

                    //Corre el servicio del cliente para agregarlo
                    $this->ClienteService->AgregarCliente($Cliente);

                    //Pone la bandera en true para indicar que se cumple con el certificado y el sello
                    $bandera = true;

                    break;
                }
            }

            //Verifica si no hubo coincidencia entre el cliente y el sello, si es así, genera una excepción
            if(!$bandera)
            {
                throw new Exception("No hay un sello para el cliente");
            }
        }

        return "Se han agregado todos los clientes";
    }
}

?>