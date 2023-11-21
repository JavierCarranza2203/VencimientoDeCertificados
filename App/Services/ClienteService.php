<?php

require_once '../Models/Cliente.php';
require_once '../Libraries/Connection.php';

class ClienteService extends Connection
{
    public function AgregarCliente(Cliente $c)
    {
        if($this->BuscarCliente($c->RFC))
        {
            throw new Exception("El cliente ya existe");
        }
    }

    private function BuscarCliente(string $rfc) : bool
    {
        $stmt = $this->db_conection->prepare("SELECT * FROM cliente WHERE rfc = ?");

        $stmt->bind_param("s", $rfc);

        $resultado = $stmt->execute();
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
}

?>