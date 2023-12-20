<?php

class CertificadoService 
{
    public function ObtenerDatosCertificado($rcContent) : string
    {
        //Convierte el contenido del archivo a binario
        $encoded = "-----BEGIN CERTIFICATE-----\n".base64_encode($rcContent)."\n-----END CERTIFICATE-----";

        //Obtiene las propiedades del certificado
        $cert_info = openssl_x509_parse($encoded);

        if($cert_info === false) {
            throw new Exception("No se ha podido leer el certificado");
        }

        // print_r($cert_info);

        //Pone los datos del certificado en un array asociativo
        $datosCertificado = [
            'NombreCliente' => $cert_info['subject']['CN'],
            'FechaDeTramite' => (date('d-m-Y', $cert_info['validFrom_time_t'])),
            'FechaDeVencimiento' => (date('d-m-Y', $cert_info['validTo_time_t'])),
            'RfcCliente' => $cert_info['subject']['x500UniqueIdentifier'],
            'Status' => (strtotime(date('d-m-Y', $cert_info['validTo_time_t']))) > time(),
            'Tipo' => $this->ValidarCertificado($cert_info)? "Firma" : "Sello"
        ];

        //Regresa el JSON
        $jsonDatos = json_encode($datosCertificado); 

        return $jsonDatos;
    }

    public static function GuardarArchivo($grupoCliente, $tipo, $archivo, $urlTemp) : string
    {
        $ruta = "C:\\xampp\\htdocs\\VencimientoDeCertificados\\Pruebas\\Certificados\\" + 
                            strtoupper($tipo) + "\\Clientes" + strtoupper($grupoCliente);

        $url_target = str_replace('\\', '/', $ruta) . '/' . $archivo;

        if (move_uploaded_file($urlTemp, $url_target)) {
            return "El archivo " . htmlspecialchars(basename($archivo)) . " ha sido cargado con éxito.";
        } 
        else {
            throw new Exception("Hubo un error al subir el archivo");
        }
    }

    private function ValidarCertificado($certificado) : bool
    {
        if($this->isFIEL($certificado)) { return true; }
        else if($this->isCSD($certificado)) { return false; }
        else { throw new Exception("El certificado no pertenece a un sello o una firma"); }
    }

    private function isCSD($cert) {
        return $cert['extensions']['keyUsage'] === 'Digital Signature, Non Repudiation';
    }

    private function isFIEL($cert) {
        // return $cert['extensions']['keyUsage'] === 'Digital Signature, Non Repudiation, Data Encipherment, Key Agreement [nsCertType], S/MIME [extendedKeyUsage], TLS Web Client Authentication';
        return $cert['extensions']['keyUsage'] == 'Digital Signature, Non Repudiation, Data Encipherment, Key Agreement';
    }
}

?>