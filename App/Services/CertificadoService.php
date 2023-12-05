<?php

class CertificadoService 
{
    public function ObtenerDatosCertificado($rcContent) : string
    {
        //Convierte el contenido del archivo a binario
        $encoded = "-----BEGIN CERTIFICATE-----\n".base64_encode($rcContent)."\n-----END CERTIFICATE-----";

        //Obtiene las propiedades del certificado
        $cert_info = openssl_x509_parse($encoded);

        //Pone los datos del certificado en un array asociativo
        $datosCertificado = [
            'NombreCliente' => $cert_info['subject']['CN'],
            'FechaDeTramite' => (date('d-m-Y', $cert_info['validFrom_time_t'])),
            'FechaDeVencimiento' => (date('d-m-Y', $cert_info['validTo_time_t'])),
            'RfcCliente' => $cert_info['subject']['x500UniqueIdentifier'],
            'Status' => (strtotime(date('d-m-Y', $cert_info['validTo_time_t']))) > time()
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
}

?>