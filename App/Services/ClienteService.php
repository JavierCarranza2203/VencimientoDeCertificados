<?php

require_once '../Models/Cliente.php';
require_once '../Libraries/Connection.php';
require_once '../Services/CertificadoService.php';

class ClienteService extends Connection
{
    //Código de acceso (Se requiere para operaciones críticas como borrar usuarios)
    private int $codigoDeAccesso = 00175;

/*********************************************************/
/*             Métodos para agregar clientes             */
/*********************************************************/

    //Método que agrega al nuevo cliente
    public function AgregarCliente(Cliente $c) : string {
        //Llama al método para buscar si la RFC del cliente existe
        if($this->BuscarCliente($c->RFC)) {
            throw new Exception("El cliente ya existe");
        }
        else {
            //Prepara la consulta
            $stmt = $this->db_conection->prepare("INSERT INTO cliente (rfc, nombre, grupo_clientes) VALUES (?, ?, ?)");

            //Asigna los parametros al stament
            $stmt->bind_param("sss", $c->RFC, $c->Nombre, $c->GrupoClientes);

            //Ejecuta el stmt
            if($stmt->execute()) {
                //Llama al método para agregar el certificado y si regresa falso, elimina el cliente y genera una excepción
                if(!$this->AgregarCertificado($c->Firma->FechaFin, $c->Firma->Status, $c->RFC, "Firma"))
                {
                    $this->EliminarCliente($c->RFC, $this->codigoDeAccesso);
                    throw new Exception("Hubo un error al agregar la firma");
                }
                else if(!$this->AgregarCertificado($c->Sello->FechaFin, $c->Sello->Status, $c->RFC, "Sello"))
                {
                    $this->EliminarCliente($c->RFC, $this->codigoDeAccesso);
                    throw new Exception("Hubo un error al agregar el sello");
                }
                else
                {
                    return("El cliente se ha agregado correctamente"); //Regresa un mensaje de éxito
                }
            }
            else {
                throw new Exception("Hubo un error al agregar el cliente"); //En caso de que el stmt no se ejecute, regresa un error
            }
        }
    }

    //Método para agregar los certificados. Es privado ya que se manda a llamar desde AgregarCliente
    private function AgregarCertificado(string $fechaVencimiento, bool $status, string $rfcCliente, string $tipo) : bool {
        //Prepara la consulta
        $stmt = $this->db_conection->prepare("INSERT INTO certificado (fecha_fin, estatus, tipo, id_cliente) VALUES (?, ?, ?, ?)");

        //Asigna los parametros para insertar en la db
        $stmt->bind_param("ssss", $fechaVencimiento, $status, $tipo, $rfcCliente);

        //Ejecuta el stmt y como el método "execute" regresa un bool, regresamos ese valor
        return $stmt->execute();
    }

/*********************************************************/
/*             Métodos para agregar clientes             */
/*********************************************************/

/***********************************************************/
/*             Métodos de consulta de clientes             */
/***********************************************************/

    //Este método sirve para buscar los clientes por grupoo 
    public function ObtenerTodosLosClientes(string $grupoClientes) : array {
        //Prepara la consulta
        $stmt = $this->db_conection->prepare("SELECT * FROM clientes_certificados WHERE grupo_clientes = ? OR grupo_clientes = ?");

        $grupoGenerico = "S";
        //Asigna los valores que van a ser utilizados en la consulta
        $stmt->bind_param("ss", $grupoClientes, $grupoGenerico);

        return $this->EjecutarStamentDeQuerySelect($stmt);
    }

    //Este método es para regresar TODOS los clientes sin importar el grupo al que pertenecen
    public function ObtenerTodosLosClientes_Admin() : array {
        //Prepara la consulta
        $stmt = $this->db_conection->prepare("SELECT * FROM clientes_certificados");

        return $this->EjecutarStamentDeQuerySelect($stmt);
    }

    public function ObtenerTodosLosContrarecibosDeTodosLosClientes() : array {
        $stmt = $this->db_conection->prepare("SELECT * FROM contrarecibos_timbrados ORDER BY folio");

        return $this->EjecutarStamentDeQueryCall($stmt);
    }

    public function ObtenerInformacionDeTimbradoDeClientes() : array {
        $stmt = $this->db_conection->prepare("SELECT * FROM informacion_timbrado_clientes");

        return $this->EjecutarStamentDeQuerySelect($stmt);
    }

    public function ObtenerPagosRegistradosDeTodosLosClientes() : array {
        $stmt = $this->db_conection->prepare("SELECT * FROM pagos_registrados");

        return $this->EjecutarStamentDeQueryCall($stmt);

    }

    public function ObtenerInformacionDeTimbradoPorCliente(string $rfc) : array {
        $stmt = $this->db_conection->prepare("CALL ObtenerEstadoDeCuentaDelCliente(?)");

        $stmt->bind_param("s", $rfc);

        return $this->EjecutarStamentDeQuerySelect($stmt);
    }

    public function ObtenerContraRecibosTimbradosPorCliente(string $rfc) : array {
        $stmt = $this->db_conection->prepare("CALL ObtenerContrarecibosPorCliente(?)");

        $stmt->bind_param("s", $rfc);

        return $this->EjecutarStamentDeQueryCall($stmt);
    }

    public function ObtenerPagosRealizadosPorCliente(string $rfc) : array {
        $stmt = $this->db_conection->prepare("CALL ObtenerPagosRealizadosPorCliente(?)");

        $stmt->bind_param("s", $rfc);

        return $this->EjecutarStamentDeQueryCall($stmt);
    }

    public function ObtenerClientesQueTimbranContraRecibos() : array {
        $stmt = $this->db_conection->prepare("SELECT 
                                                rfc,
                                                nombre,
                                                grupo_clientes,
                                                CONCAT('$', tarifaMensual, '.00') AS tarifa
                                            FROM 
                                                cliente
                                            JOIN
                                                tarifas ON cliente.rfc = tarifas.idCliente
                                            WHERE timbraNominas = TRUE");

        return $this->EjecutarStamentDeQuerySelect($stmt);
    }

    //Ejecuta las consultas SELECT y regresa el resultado
    private function EjecutarStamentDeQuerySelect(mysqli_stmt $stmt) : array {
        //Ejecuta la consulta
        $stmt->execute();

        //Obtiene el resultado
        $resultado = $stmt->get_result();

        //Evalua si el resultado es mayor a 0
        if($resultado->num_rows > 0) {
            $resultado = $resultado->fetch_all();

            return $resultado;
        } 
        else {
            throw new Exception("No hay registros"); 
        }
    }

    private function EjecutarStamentDeQueryCall(mysqli_stmt $stmt) {
        $stmt->execute();

        //Obtiene el resultado
        $resultado = $stmt->get_result();

        $resultado = $resultado->fetch_all();

        return $resultado;
    }

/***********************************************************/
/*             Métodos de consulta de clientes             */
/***********************************************************/

/*******************************************************/
/*             Métodos para editar clientes            */
/*******************************************************/

    //Método para editar los clientes
    public function EditarDatosCliente(string $rfc, string $grupo, string $claveCiec, string $regimenFiscal) : string {
        if(isset($rfc) && is_string($rfc))
        {
            if(isset($claveCiec)) {
                $stmtCliente = $this->db_conection->prepare("SELECT * FROM `clave_ciec` WHERE `contrasenia` = ?");

                $stmtCliente->bind_param("s", $claveCiec);

                if(!$stmtCliente->execute()){ throw new Exception("Hubo un error al actualizar el cliente"); }
                if($stmtCliente->get_result()->num_rows == 0) {
                    $stmtClaveCiec = $this->db_conection->prepare("INSERT INTO clave_ciec (contrasenia) VALUE (?)");
                    $stmtClaveCiec->bind_param("s", $claveCiec);
                    $stmtClaveCiec->execute();
                }
            }

            $this->EditarCampoCliente($grupo, $rfc, "UPDATE `cliente` SET `grupo_clientes` = ? WHERE `rfc` = ?");
            $this->EditarCampoCliente($claveCiec, $rfc, "UPDATE `cliente` SET `grupo_clientes` = ? WHERE `id_clave_ciec` = ?");
            $this->EditarCampoCliente($regimenFiscal, $rfc, "UPDATE `cliente` SET `clave_regimen` = ? WHERE `rfc` = ?");

            return "Se ha actualizado al cliente con RFC: " + $rfc;
        }
        else {
            throw new Exception('El rfc debe ser una cadena de texto');
        }
    }

    //Método para editar 1 campo
    private function EditarCampoCliente(string $nuevoValor, string $rfc, string $consulta) : void {
        if(isset($nuevoValor) && (is_string($nuevoValor) || is_int($nuevoValor))) {
            $stmtCliente = $this->db_conection->prepare($consulta);

            $stmtCliente->bind_param("ss", $nuevoValor, $rfc);

            if(!$stmtCliente->execute()){ throw new Exception("Hubo un error al actualizar el cliente"); }
        }
        else {
            throw new Exception("Hay un error con los datos");
        }
    }

    //Método que edita los certificados del cliente
    public function EditarCertificados(string $rfc, string | null $certificadoSello, string | null $certificadoFirma) : string {
        $this->EditarCertificado($certificadoSello, "El sello está vencido", $rfc, "El sello pertenece a otra persona", "Hubo un error al actualizar el sello", "Sello");

        $this->EditarCertificado($certificadoFirma, "La firma está vencida", $rfc, "La firma pertenece a otra persona", "Hubo un error al actualizar la firma", "Firma");

        return "Se ha actualizado el cliente con RFC: " . $rfc; 
    }

    //Método que edita 1 certificado
    private function EditarCertificado(string | null $certificado, string $mensajeVencimiento, string $rfc, string $mensajeDeIdentidad, string $mensajeDeErrorAlActualizar, string $tipo = "") : void {
        if(isset($certificado)) {
            $CertificadoService = new CertificadoService();

            $datosDelCertificado = json_decode($CertificadoService->ObtenerDatosCertificado($certificado));

            $bitBooleano = $this->ValidarVigenciaDelCertificado($datosDelCertificado->Status, $mensajeVencimiento);
            $this->ValidarCongruencia($rfc, $datosDelCertificado->RfcCliente, $mensajeDeIdentidad);

            $stmt = $this->db_conection->prepare("UPDATE `certificado` SET `fecha_fin` = ?, `estatus` = ? WHERE `id_cliente` = ? AND `tipo` = ?");

            $stmt->bind_param("siss", $datosDelCertificado->FechaDeVencimiento, $bitBooleano, $rfc, $datosDelCertificado->Tipo);

            if(!$stmt->execute()) { throw new Exception($mensajeDeErrorAlActualizar); }
            else if($stmt->affected_rows === 0) 
            { 
                $this->AgregarCertificado($datosDelCertificado->FechaDeVencimiento, $bitBooleano, $rfc, $tipo);
            }
        }
    }

    public function EditarDatosDeTimbradoDeContraRecibos(string $rfc, string $calle, string $numero, string $ciudad, string $estado, string $codigoPostal, int $tarifaMensual) {
        $stmt = $this->db_conection->prepare("CALL EditarDatosDeContraRecibos(?, ?, ?, ?, ?, ?, ?)");

        $stmt->bind_param("ssssssi", $rfc, $calle, $numero, $ciudad, $estado, $codigoPostal, $tarifaMensual);

        if($stmt->execute()) {
            return "Se ha actualizaco al cliente con RFC: " . $rfc;
        }
        else {
            throw new Exception($stmt->error);
        }
    }

/*******************************************************/
/*             Métodos para editar clientes            */
/*******************************************************/

/**************************************/
/*             Validaciones           */
/**************************************/

    //Método para validar si el certificado es de la persona misma persona
    //NOTA PARA MI: Piensa otro nombre para el método porque este no está tan chido 25/01/2024
    private function ValidarCongruencia(string $RfcPersona, string $RfcPersonaEnCertificado, string $exMessage) : void {
        if($RfcPersona != $RfcPersonaEnCertificado) { throw new Exception($exMessage); }
    }

    //Método para validar si el certificado es vigente
    private function ValidarVigenciaDelCertificado(bool $status, string $exMessage) : int { //NOTA: Recibe el mensaje para distingir si el CSD es el vencido o la FIEL
        if(!$status){ throw new Exception($exMessage); }
        else { return 1; }
    }

/**************************************/
/*             Validaciones           */
/**************************************/

    //Método privado para buscar un cliente
    private function BuscarCliente(string $rfc) : bool {
        //Prepara la consulta
        $stmt = $this->db_conection->prepare("SELECT * FROM cliente WHERE rfc = ?");

        //Asigna el parametro
        $stmt->bind_param("s", $rfc);

        //Ejecuta el stmt
        $stmt->execute();

        //Obtiene el resultado de la consulta
        $resultado = $stmt->get_result();

        //Regresa el resultado de la operación: ¿El número de renglones del resultado es mayor a 0?
        return $resultado->num_rows > 0;
    }

    //Método para eliminar un cliente
    public function EliminarCliente(string $rfc_cliente_antiguo, int $codigoDeAccesso) : string {
        //Evalua si el código proporcioado en el parametro es igual al definido antes
        if($codigoDeAccesso == $this->codigoDeAccesso) {
            //Evalua si el cliente existe
            if($this->BuscarCliente($rfc_cliente_antiguo))
            {
                //Si es asi, prepara la consulta
                $stmt = $this->db_conection->prepare("DELETE FROM cliente WHERE rfc = ?");
                //Asigna los parametros
                $stmt->bind_param("s", $rfc_cliente_antiguo);

                //Y ejecuta el stmt evaluando el valor regresado
                if($stmt->execute()){ return "Se ha eliminado el cliente con el RFC: " . $rfc_cliente_antiguo; }
                else{ throw new Exception("Hubo un error al eliminar el cliente"); }
            }
            else
            {
                throw new Exception("El cliente no existe");
            }
        }
        else {
            throw new Exception("Código de acceso incorrecto");
        }
    }

    public function TimbrarContraRecibo($rfc, $concepto, $nombreCarpeta) {
        $stmt = $this->db_conection->prepare("CALL TimbrarContraRecibo(?, ?)");

        $stmt->bind_param("ss", $rfc, $concepto);

        $infoContraRecibo = $this->EjecutarStamentDeQuerySelect($stmt);

        $curl = curl_init("http://localhost:8082/generar-contrarecibo?folio=" . $infoContraRecibo[0][0] . "&fecha=" . urlencode($infoContraRecibo[0][1]) . "&nombre=" . urlencode($infoContraRecibo[0][3]) . "&domicilio=" . urlencode($infoContraRecibo[0][4]) . "&ciudad=" . urlencode($infoContraRecibo[0][5]) . "&rfc=". urlencode($infoContraRecibo[0][6]) . "&concepto=" . urlencode($infoContraRecibo[0][7]) . "&importe=" . urlencode($infoContraRecibo[0][8]) . "&carpeta=" . urlencode($nombreCarpeta));

        if(!$curl) throw new Exception("Error al intentar conectarse a la API");

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);

        $response = curl_exec($curl);
        
        return "Se ha generado el contra recibo";
    }

    private function TimbrarContraReciboMasivo($rfc, $concepto) {
        $stmt = $this->db_conection->prepare("CALL TimbrarContraRecibo(?, ?)");

        $stmt->bind_param("ss", $rfc, $concepto);

        return $stmt->execute();
    }

    public function TimbrarTodosLosContraRecibos(string $concepto) {
        $clientes = $this->ObtenerClientesQueTimbranContraRecibos();
        $contadorErrores = 0;
        $contadorExitos = 0;

        for($i = 0; $i < count($clientes); $i++) {
            if($this->TimbrarContraReciboMasivo($clientes[$i][0], $concepto)) {
                $contadorExitos++;
            }
            else {
                $contadorErrores++;
            }
        }

        $data = [
            "Agregados" => $contadorExitos,
            "Con Errores" => $contadorErrores,
            "Mensaje" => "Se han agregado los clientes",
        ];

        return $data;
    }

    public function RealizarPago(string $rfc, int $monto) {
        $stmt = $this->db_conection->prepare("CALL RealizarPago(?, ?)");
        
        $stmt->bind_param("si", $rfc, $monto);

        if($stmt->execute()) {
            return true;
        }
        else {
            throw new Exception($stmt->error);
        }
    }

    public function CancelarContraRecibo(int $folio) {
        $stmt = $this->db_conection->prepare("CALL CancelarContraRecibo(?)");

        $stmt->bind_param("i", $folio);

        if($stmt->execute()) {
            return "El contra recibo con folio " . $folio . " se ha cancelado.";
        }
        else {
            throw new Exception($stmt->error);
        }
    }

    public function DejarDeTimbrarContraRecibos(string $rfc) {
        $stmt = $this->db_conection->prepare("CALL DejarDeTimbrarCliente(?)");

        $stmt->bind_param("s", $rfc);

        if($stmt->execute()) {
            return "El cliente se ha desactivado";
        }
        else {
            throw new Exception($stmt->error);
        }
    }
}
?>