<?php

class CertificadoService 
{
    public function ObtenerDatosCertificado(string $rcContent) : string
    {
        //Convierte el contenido del archivo a binario
        $encoded = "-----BEGIN CERTIFICATE-----\n".base64_encode(file_get_contents($rcContent))."\n-----END CERTIFICATE-----";

        //Obtiene las propiedades del certificado
        $cert_info = openssl_x509_parse($encoded);

        //Como el método "openssl_x509_parse" devuelve false en caso de que haya fallado algo, evaluamos ese valor
        if($cert_info === false) {
            throw new Exception("No se ha podido leer el certificado");
        }

        //Pone los datos del certificado en un array asociativo
        $datosCertificado = [
            'NombreCliente' => $cert_info['subject']['CN'],
            'FechaDeTramite' => (date('d-m-Y', $cert_info['validFrom_time_t'])),
            'FechaDeVencimiento' => (date('d-m-Y', $cert_info['validTo_time_t'])),
            'RfcCliente' => $cert_info['subject']['x500UniqueIdentifier'],
            'Status' => (strtotime(date('d-m-Y', $cert_info['validTo_time_t']))) > time(),
            'Tipo' => $this->ValidarCertificado($cert_info)
        ];

        return json_encode($datosCertificado);
    }

    //Método para validar si el certificado es un sello o firma
    private function ValidarCertificado(array $certificado) : string
    {
        if($certificado['extensions']['keyUsage'] === 'Digital Signature, Non Repudiation, Data Encipherment, Key Agreement') { 
            return "Firma"; 
        }
        else if($certificado['extensions']['keyUsage'] === 'Digital Signature, Non Repudiation') { 
            return "Sello"; 
        }
        else { 
            throw new Exception("El certificado no pertenece a un sello o una firma"); 
        }
    }
}

?>