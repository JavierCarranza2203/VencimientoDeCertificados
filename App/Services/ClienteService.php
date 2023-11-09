<?php

require_once "../Models/Cliente.php";

class ClienteService 
{
    public function ObtenerDatosCertificado($rcContent)
    {
        try 
        {
            //Convierte el contenido del archivo a binario
            $encoded = "-----BEGIN CERTIFICATE-----\n".base64_encode($rcContent)."\n-----END CERTIFICATE-----";

            //Obtiene las propiedades del certificado
            $cert_info = openssl_x509_parse($encoded);

            $miUsuario = new Cliente();
            $miUsuario->Nombre = ($cert_info['subject']['CN']);
            $miUsuario->FechaInicio = (date('Y-m-d H:i:s', $cert_info['validFrom_time_t']));
            $miUsuario->FechaFin = (date('Y-m-d H:i:s', $cert_info['validTo_time_t']));
            $miUsuario->Emisor = $cert_info['issuer']['CN'];
            $miUsuario->Status = $miUsuario->FechaFin > time();

            //Regresa el JSON
            $jsonUsuario = json_encode($miUsuario); 

            return $jsonUsuario;
        } 
        catch (Exception $e) 
        {
            echo "Error al analizar el certificado: " . $e->getMessage();
        }
    }

}

?>