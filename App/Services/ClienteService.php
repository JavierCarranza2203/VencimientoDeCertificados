<?php

require_once "../Models/Cliente.php";

class ClienteService 
{
    public function ObtenerDatosCertificado()
    {
        try 
        {
            //Ruta del certificado
            $my_file = 'certificado.cer';
            //Abre el archivo
            $handle = fopen($my_file, 'r');

            //Convierte el archivo a binario
            $data = fread($handle, filesize($my_file));
            $encoded = "-----BEGIN CERTIFICATE-----\n".base64_encode($data)."\n-----END CERTIFICATE-----";

            //Abre el archivo y regresa las propiedades en un JSON
            $cert_info = openssl_x509_parse($encoded);

            $miUsuario = new Cliente();
            $miUsuario->Nombre = ($cert_info['subject']['CN']);
            $miUsuario->FechaInicio = (date('Y-m-d H:i:s', $cert_info['validFrom_time_t']));
            $miUsuario->FechaFin = (date('Y-m-d H:i:s', $cert_info['validTo_time_t']));
            $miUsuario->Emisor = $cert_info['issuer']['CN'];

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