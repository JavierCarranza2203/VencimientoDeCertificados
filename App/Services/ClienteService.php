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
        $miCliente->FechaInicio = (date('Y-m-d H:i:s', $cert_info['validFrom_time_t']));
        $miCliente->FechaFin = (date('Y-m-d H:i:s', $cert_info['validTo_time_t']));
        $miCliente->Emisor = $cert_info['issuer']['CN'];
        $miCliente->Status = $miCliente->FechaFin > time();

        //Regresa el JSON
        $jsonCliente = json_encode($miCliente); 

        return $jsonCliente;
    }

}

?>