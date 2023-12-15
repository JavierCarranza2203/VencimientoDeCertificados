<?php

require_once '../Models/Cliente.php';
require_once '../Libraries/Connection.php';
require_once '../Services/CertificadoService.php';

class ClienteService extends Connection
{
    //Código de acceso (Se requiere para operaciones críticas como borrar usuarios)
    private int $codigoDeAccesso = 00175;

    //Método que agrega al nuevo cliente
    public function AgregarCliente(Cliente $c) : string
    {
        if($this->BuscarCliente($c->RFC))
        {
            throw new Exception("El cliente ya existe");
        }
        else
        {
            $stmt = $this->db_conection->prepare("INSERT INTO cliente (rfc, nombre, grupo_clientes) VALUES (?, ?, ?)");

            $stmt->bind_param("sss", $c->RFC, $c->Nombre, $c->GrupoClientes);

            if($stmt->execute())
            {
                if(!$this->AgregarCertificado($c->Firma->FechaFin, $c->Firma->Status, $c->RFC, "Firma"))
                {
                    throw new Exception("Hubo un error al agregar la firma");
                }
                else if(!$this->AgregarCertificado($c->Sello->FechaFin, $c->Sello->Status, $c->RFC, "Sello"))
                {
                    throw new Exception("Hubo un error al agregar el sello");
                }
                else
                {
                    return("El cliente se ha agregado correctamente");
                }
            }
            else
            {
                throw new Exception("Hubo un error al agregar el cliente");
            }
        }
    }

    //Método para agregar los certificados. Es privado ya que se manda a llamar desde AgregarCliente
    private function AgregarCertificado(string $fechaVencimiento, bool $status, string $rfcCliente, string $tipo) : bool
    {
        $stmt = $this->db_conection->prepare("INSERT INTO certificado (fecha_fin, estatus, tipo, id_cliente) VALUES (?, ?, ?, ?)");

        $stmt->bind_param("ssss", $fechaVencimiento, $status, $tipo, $rfcCliente);

        if($stmt->execute())
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    //Método privado para buscar un cliente
    private function BuscarCliente(string $rfc) : bool
    {
        $stmt = $this->db_conection->prepare("SELECT * FROM cliente WHERE rfc = ?");

        $stmt->bind_param("s", $rfc);

        $stmt->execute();

        $resultado = $stmt->get_result();

        if($resultado->num_rows > 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    //Método para eliminar un cliente
    public function EliminarCliente(string $rfc_cliente_antiguo, int $codigoDeAccesso) : string
    {
        if($codigoDeAccesso == $this->codigoDeAccesso)
        {
            if($this->BuscarCliente($rfc_cliente_antiguo) == true)
            {
                $stmt = $this->db_conection->prepare("DELETE FROM cliente WHERE rfc = ?");
                $stmt->bind_param("s", $rfc_cliente_antiguo);

                if($stmt->execute()){ return "Se ha eliminado el cliente con el RFC: " . $rfc_cliente_antiguo; }
                else{ throw new Exception("Hubo un error al eliminar el cliente"); }
            }
            else
            {
                throw new Exception("El cliente no existe");
            }
        }
        else
        {
            throw new Exception("Código de acceso incorrecto");
        }
    }

    //Este método sirve para buscar los clientes por grupoo
    public function ObtenerTodosLosClientes(string $grupoClientes)
    {
        $stmt = $this->db_conection->prepare("SELECT * FROM clientes_certificados WHERE grupo_clientes = ?");

        $stmt->bind_param("s", $grupoClientes);

        $stmt->execute();

        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {

            $resultado = $resultado->fetch_all();

            return $resultado;
        } 
        else 
        {
            throw new Exception("No hay registros"); 
        }
    }

    //Este método es para regresar TODOS los clientes sin importar el grupo al que pertenecen
    public function ObtenerTodosLosClientes_Admin()
    {
        $stmt = $this->db_conection->prepare("SELECT * FROM clientes_certificados");

        $stmt->execute();

        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {

            $resultado = $resultado->fetch_all();

            return $resultado;
        } 
        else 
        {
            throw new Exception("No hay registros"); 
        }
    }

    public function EditarCliente(string $rfc, $certificadoSello, $certificadoFirma, string $grupoClientes)
    {
        //Instancia del servicio de certificados
        $CertificadoService = new CertificadoService();

        $stmtCliente = $this->db_conection->prepare("UPDATE `cliente` SET `grupo_clientes` = ? WHERE `rfc` = ?");
        $stmtCliente->bind_param("ss", $grupoClientes, $rfc);
        if(!$stmtCliente->execute()){ throw new Exception("Hubo un error al actualizar el cliente"); }

        if(isset($certificadoSello))
        {
            //Corre el servicio para obtener los datos del certificado del sello
            $datosDelSello = json_decode($CertificadoService->ObtenerDatosCertificado($certificadoSello));

            $bitBooleano = $this->ValidarVigenciaDelCertificado($datosDelSello->Status, "El sello está vencido");
            $this->ValidarCongruencia($rfc, $datosDelSello->RfcCliente, "El sello pertenece a otra persona");

            $stmtSello = $this->db_conection->prepare("UPDATE `certificado` SET `fecha_fin` = ?, `estatus` = ? WHERE `id_cliente` = ? AND `tipo` = ?");

            $tipo = "Sello";

            //Agrega los parametros
            $stmtSello->bind_param("siss", $datosDelSello->FechaDeVencimiento, $bitBooleano, $rfc, $tipo);
            
            if(!$stmtSello->execute()){ throw new Exception("Hubo un error al actualizar el sello"); }
        }

        if(isset($certificadoFirma))
        {
            //Corre el servicio para obtener los datos del certificado de la firma
            $datosDeLaFirma = json_decode($CertificadoService->ObtenerDatosCertificado($certificadoFirma));

            $bitBooleano = $this->ValidarVigenciaDelCertificado($datosDeLaFirma->Status, "La firma está vencida");
            $this->ValidarCongruencia($rfc, $datosDeLaFirma->RfcCliente, "La firma pertenece a otra persona");

            //Prepara la consulta para actualizar la firma
            $stmtFirma = $this->db_conection->prepare("UPDATE `certificado` SET `fecha_fin` = ?, `estatus` = ? WHERE `id_cliente` = ? AND `tipo` = ?");

            $tipo = "Firma";

            //Agrega los parametros
            $stmtFirma->bind_param("siss", $datosDeLaFirma->FechaDeVencimiento, $bitBooleano, $rfc, $tipo);

            if(!$stmtFirma->execute()){ throw new Exception("Hubo un error al actualizar la firma"); }
        }

        return "Se ha actualizado el cliente con RFC: " . $rfc; 
    }

    private function ValidarCongruencia($NombrePersona, $NombrePersonaEnCertificado, $exMessage) : void
    {
        if($NombrePersona != $NombrePersonaEnCertificado) { throw new Exception($exMessage); }
    }

    private function ValidarVigenciaDelCertificado($status, $exMessage) : int
    {
        if(!$status){ throw new Exception($exMessage); }
        else { return 1; }
    }
}

?>