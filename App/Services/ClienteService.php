<?php

require_once "../Models/Cliente.php";

class ClienteService 
{
    public function ObtenerDatosCertificado($rcContent)
    {
        //Convierte el contenido del archivo a binario
        $encoded = "-----BEGIN CERTIFICATE-----\n".base64_encode($rcContent)."\n-----END CERTIFICATE-----";

        //Obtiene las propiedades del certificado
        $cert_info = openssl_x509_parse($encoded);

        //Instancia de lc clase Cliente
        $miCliente = new Cliente();
        $miCliente->Nombre = ($cert_info['subject']['CN']);
        $miCliente->FechaInicio = (date('d-m-Y', $cert_info['validFrom_time_t']));
        $miCliente->FechaFin = (date('d-m-Y', $cert_info['validTo_time_t']));
        $miCliente->RFC = $cert_info['subject']['x500UniqueIdentifier'];
        $miCliente->Status = strtotime($miCliente->FechaFin) > time();

        //Regresa el JSON
        $jsonCliente = json_encode($miCliente); 

        return $jsonCliente;
    }

}

?>