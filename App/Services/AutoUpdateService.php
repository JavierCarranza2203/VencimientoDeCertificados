<?php

require_once "../Services/CertificadoService.php";
require_once "../Services/ClienteService.php";
require_once "../Models/Cliente.php";

class AutoUpdateService
{
    //Rutas e instancias necesarias para correr el servicio
    private string $FolderRoute = "C:\\xampp\\htdocs\\VencimientoDeCertificados\\Test\\";
    private string $RutaDelSello;
    private string $RutaDeLaFirma;
    private CertificadoService $CertificadoService;
    private ClienteService $ClienteService;

    //Constructor del servicio
    public function __construct()
    {
        //Crea la instancias del servicio de clientes y certificados
        $this->ClienteService = new ClienteService();
        $this->CertificadoService = new CertificadoService();
        $this->RutaDelSello = $this->FolderRoute . "Sellos\\";
        $this->RutaDeLaFirma = $this->FolderRoute . "Certificados\\";
    }

    //Metodo para agregar los clientes
    public function AgregarClientes()
    {
        //Obtiene una lista de todos los directorios que hay dentro de la ruta de certificados
        $Firmas = scandir($this->RutaDeLaFirma);
        unset($Firmas[0]);
        unset($Firmas[1]);

        //Obtiene una lista de todos los directorios que hay dentro de la ruta de sellos
        $Sellos = scandir($this->RutaDelSello);
        unset($Sellos[0]);
        unset($Sellos[1]);

        //Verifica si hay diferencia en la cantidad de sellos y firmas para así realizar el modo de recorrido
        if(count($Firmas) >= count($Sellos))
        {
            return $this->RecorrerCarpetas($Firmas, $Sellos, $this->RutaDeLaFirma, $this->RutaDelSello, 'A', true);
        }
        else
        {
            return $this->RecorrerCarpetas($Sellos, $Firmas, $this->RutaDelSello, $this->RutaDeLaFirma, 'A', false);
        }
    }

    //Metodo para recorrer las carpetas y archivos
    private function RecorrerCarpetas($Principal, $Secundaria, string $RutaPrincipal, string $RutaSecundaria, string $GrupoClientes, bool $FirmaPrimero)
    {
        $contadorExitos = 0;
        $contadorErrores = 0;
        $IndicesEliminadosPrincipal = [];
        $IndicesEliminadosSecundaria = [];


        //Ciclo para recorrer los certificados (Comienza en 2 porque a partir de ahí comienzan los archivos)
        for($i = 2; $i < count($Principal) + 2; $i++)
        {
            //Crea la instancia del cliente
            $Cliente = new Cliente();

            //Corre el servicio del certificado para obtener los datos
            $datos1 = json_decode($this->CertificadoService->ObtenerDatosCertificado(file_get_contents($RutaPrincipal . $Principal[$i])));

            //Asigna los valores al cliente
            $Cliente->Nombre = $datos1->NombreCliente;
            $Cliente->RFC = $datos1->RfcCliente;
            $Cliente->GrupoClientes = $GrupoClientes;

            //Ciclo para recorrer los sellos
            for($j = 2; $j < count($Secundaria) + 2; $j++)
            {
                if(isset($IndicesEliminadosSecundaria[$j])){ $j++; }

                if($j < count($Secundaria) + 2)
                {
                    //Corre el servicio para obtener la información del sello
                    $datos = json_decode($this->CertificadoService->ObtenerDatosCertificado(file_get_contents($RutaSecundaria . $Secundaria[$j])));

                    //Si la rfc del cliente es igual a la del sello, significa que se puede agregar
                    if($Cliente->RFC == $datos->RfcCliente)
                    {
                        //Agrega los datos al sello
                        if($FirmaPrimero)
                        {
                            $Cliente->Firma->FechaFin = $datos1->FechaDeVencimiento;
                            $Cliente->Firma->Status = $datos1->Status;
                            $Cliente->Sello->FechaFin = $datos->FechaDeVencimiento;
                            $Cliente->Sello->Status = $datos->Status;
                        }
                        else
                        {
                            $Cliente->Sello->FechaFin = $datos1->FechaDeVencimiento;
                            $Cliente->Sello->Status = $datos1->Status;
                            $Cliente->Firma->FechaFin = $datos->FechaDeVencimiento;
                            $Cliente->Firma->Status = $datos->Status;
                        }

                        try {
                            //Corre el servicio del cliente para agregarlo
                            $this->ClienteService->AgregarCliente($Cliente);

                            $contadorExitos++;

                            array_push($IndicesEliminadosPrincipal, $i);
                            array_push($IndicesEliminadosSecundaria, $j);
                        }
                        catch(Exception $e)
                        {
                            array_push($IndicesEliminadosPrincipal, $i);
                            array_push($IndicesEliminadosSecundaria, $j);
                        }
                    }
                }
            }
        }

        $c1 = $this->EliminarElementos($IndicesEliminadosPrincipal, $Principal);
        $c2 = $this->EliminarElementos($IndicesEliminadosSecundaria, $Secundaria);

        $contadorErrores = count($c1) + count($c2);

        $data = [
            "Agregados" => $contadorExitos,
            "Con Errores" => $contadorErrores,
            "Mensaje" => "Se han agregado los clientes",
        ];

        return $data;
    }

    private function EliminarElementos($ArrayIndices, $ArrayAEliminar)
    {
        $ArrayElementos = [];
        $TamanioArray = count($ArrayAEliminar);

        for($i = 2; $i < $TamanioArray + 2; $i++)
        {
            if(in_array($i, $ArrayIndices)) 
            {
                unset($ArrayAEliminar[$i]);
            }
            else 
            {
                array_push($ArrayElementos, $ArrayAEliminar[$i]);
            }
        }

        return $ArrayElementos;
    }
}
?>