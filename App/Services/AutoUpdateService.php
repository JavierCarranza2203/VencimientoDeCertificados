<?php

require_once "../Services/CertificadoService.php";
require_once "../Services/ClienteService.php";
require_once "../Models/Cliente.php";

class AutoUpdateService {
    //Rutas e instancias necesarias para correr el servicio
    private string $FolderRoute = "C:\\xampp\\htdocs\\Test\\";
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
    public function AgregarClientes(string $grupo)
    {
        //Obtiene una lista de todos los directorios que hay dentro de la ruta de certificados
        $Firmas = scandir($this->RutaDeLaFirma);                                              
        unset($Firmas[0]);                                                                    
        unset($Firmas[1]);

        //Obtiene una lista de todos los directorios que hay dentro de la ruta de sellos
        $Sellos = scandir($this->RutaDelSello);
        unset($Sellos[0]);
        unset($Sellos[1]);

        //Verifica si hay diferencia en la cantidad de sellos y firmas
        //Para elegir el modo de recorrido y evitar certificados no evaluados
        if(count($Firmas) >= count($Sellos))
        {
            return $this->RecorrerCarpetas($Firmas, $Sellos, $this->RutaDeLaFirma, $this->RutaDelSello, $grupo, true);
        }
        else
        {
            return $this->RecorrerCarpetas($Sellos, $Firmas, $this->RutaDelSello, $this->RutaDeLaFirma, $grupo, false);
        }
    }

    //Metodo para recorrer las carpetas y archivos
    private function RecorrerCarpetas(array $Principal, array $Secundaria, string $RutaPrincipal, string $RutaSecundaria, string $GrupoClientes, bool $FirmaPrimero) {
        //Contadores
        $contadorExitos = 0;
        $contadorErrores = 0;
        $contadorConfusiones = 0;
        //Esta bandera sirve para saber si se metió un mismo certificado como sello y firma
        $banderaConfusion = false;
        //Sirve para saber los indices de los certificados que ya existen o ya se agregaron
        $IndicesEliminadosPrincipal = [];
        $IndicesEliminadosSecundaria = [];

        $Cliente = null;
        $fechaFinSello = "";
        $statusSello = false;
        $fechaFinFirma = "";
        $statusFirma = false;

        //Ciclo para recorrer los certificados (Comienza en 2 porque a partir de ahí comienzan los archivos)
        for($i = 2; $i < count($Principal) + 2; $i++) {

            //Corre el servicio del certificado para obtener los datos
            $datosDelCertificadoPrincipal = json_decode($this->CertificadoService->ObtenerDatosCertificado($RutaPrincipal . $Principal[$i]));

            //Ciclo para recorrer los sellos
            for($j = 2; $j < count($Secundaria) + 2; $j++) {
                //Busca el indice en el array secundario, si se encuentra, se pasa al siguiente elemento
                if(array_search($j, $IndicesEliminadosSecundaria)){ $j++; }
                
                if($j < count($Secundaria) + 2) {
                    //Corre el servicio para obtener la información del sello
                    $datosDelCertificadoSecundario = json_decode($this->CertificadoService->ObtenerDatosCertificado($RutaSecundaria . $Secundaria[$j]));

                    if(!$datosDelCertificadoSecundario->Status || !$datosDelCertificadoPrincipal->Status){ throw new Exception("Uno de los certificados está vencido"); }

                    //Si la rfc del cliente es igual a la del sello, significa que se puede agregar
                    if($datosDelCertificadoPrincipal->RfcCliente == $datosDelCertificadoSecundario->RfcCliente) {
                        //Agrega los datos al sello evaluando si no hubo confusiones
                        if($FirmaPrimero && $datosDelCertificadoPrincipal->Tipo == "Firma" && $datosDelCertificadoSecundario->Tipo == "Sello") 
                        {
                            $fechaFinFirma = $datosDelCertificadoPrincipal->FechaDeVencimiento;
                            $statusFirma = $datosDelCertificadoPrincipal->Status;
                            $fechaFinSello = $datosDelCertificadoSecundario->Status;
                            $statusSello = $datosDelCertificadoSecundario->FechaDeVencimiento;
                        }
                        else if(!$FirmaPrimero && $datosDelCertificadoPrincipal->Tipo == "Sello" && $datosDelCertificadoSecundario->Tipo == "Firma")
                        {
                            $fechaFinFirma = $datosDelCertificadoSecundario->FechaDeVencimiento;
                            $statusFirma = $datosDelCertificadoSecundario->Status;
                            $fechaFinSello = $datosDelCertificadoPrincipal->Status;
                            $statusSello = $datosDelCertificadoPrincipal->FechaDeVencimiento;
                        }
                        else {
                            $banderaConfusion = true;
                            $contadorConfusiones++;
                        }

                        //Si no hubo confusiones...
                        if(!$banderaConfusion) {
                            try {
                                //Crea la instancia del cliente
                                $Cliente = new Cliente($datosDelCertificadoPrincipal->NombreCliente, 
                                                    $datosDelCertificadoPrincipal->RfcCliente,
                                                    $GrupoClientes, 
                                                    $fechaFinSello,
                                                    $statusSello,
                                                    $fechaFinFirma,
                                                    $statusFirma);

                                //Corre el servicio del cliente para agregarlo
                                $this->ClienteService->AgregarCliente($Cliente);

                                //Incrementa el contador de exitos
                                $contadorExitos++;

                                //E ingresa los indices de los certificados al array de indices
                                array_push($IndicesEliminadosPrincipal, $i);
                                array_push($IndicesEliminadosSecundaria, $j);
                            }
                            catch(Exception $e) {
                                if($e->getMessage() == "El cliente ya existe") {

                                    array_push($IndicesEliminadosPrincipal, $i);
                                    array_push($IndicesEliminadosSecundaria, $j);
                                }
                                else {
                                    echo $e->getMessage();
                                }
                            }
                        }

                        $banderaConfusion = false;
                    }
                }
            }
        }

        //Manda a llamar los métodos para eliminar los certificados de la carpeta de donde se leen y dejar solo aquellos
        //que por alguna razón no se pudieron agregar.
        $c1 = $this->EliminarElementos($IndicesEliminadosPrincipal, $Principal, $RutaPrincipal);
        $c2 = $this->EliminarElementos($IndicesEliminadosSecundaria, $Secundaria, $RutaSecundaria);

        //Suma los elementos que haya en cada uno de los arrays resultantes para sacar el número de errores
        $contadorErrores = count($c1) + count($c2);

        //Formamos la estructura con la información necesaria
        $data = [
            "Agregados" => $contadorExitos,
            "Con Errores" => $contadorErrores,
            "Confusiones" => $contadorConfusiones,
            "Mensaje" => "Se han agregado los clientes",
        ];

        return $data;
    }

    //Método para eliminar certificados de la carpeta
    private function EliminarElementos(array $ArrayIndices, array $ArrayAEliminar, string $Ruta)
    {
        //Array para guardar los elementos que no se van a eliminar
        $ArrayElementos = [];
        //Obtiene el tamaño del array de donde vamos a eliminar los elementos
        $TamanioArray = count($ArrayAEliminar);

        //Ciclo para recorrer el array para eliminar los certificados
        for($i = 2; $i < $TamanioArray + 2; $i++) {
            //Busca si existe el indice $i en el array de los indices
            if(in_array($i, $ArrayIndices)) {
                //En caso de que si, elimina el certificado de la carpeta y del array de elementos
                unlink($Ruta . $ArrayAEliminar[$i]);
                unset($ArrayAEliminar[$i]);
            }
            else //En caso de que no, agrega el certificado al array de elementos que no se agregaron previamente a la base de datos
            {
                array_push($ArrayElementos, $ArrayAEliminar[$i]);
            }
        }

        return $ArrayElementos;
    }
}
?>