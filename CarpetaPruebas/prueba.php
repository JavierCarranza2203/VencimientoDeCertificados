<?php
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

        //Asigna las propiedaes necesarias al objeto
        $usuario = array(
            'Sujeto' => $cert_info['subject']['CN'],
            'Emisor' => $cert_info['issuer']['CN'],
            'FechaInicioValidez' => date('Y-m-d H:i:s', $cert_info['validFrom_time_t']),
            'FechaFinValidez' => date('Y-m-d H:i:s', $cert_info['validTo_time_t'])
        );

        $dominioPermitido = "http://127.0.0.1:5500";

        // Verifica si la solicitud incluye el encabezado "Origin" para determinar si es una solicitud CORS
        if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] == $dominioPermitido) {
            header("Access-Control-Allow-Origin: " . $dominioPermitido);
            header("Access-Control-Allow-Headers: Content-Type");
            header("Access-Control-Allow-Methods: OPTIONS, GET, PUT, POST, DELETE");

            // Convierte el objeto a JSON
            $jsonUsuario = json_encode($usuario);
        } else {
            // Si la solicitud no es permitida, responde con un error CORS
            header("HTTP/1.1 403 Forbidden");
            echo "Acceso denegado.";
        }

        //Regresa el JSON
        echo $jsonUsuario;
    } 
    catch (Exception $e) 
    {
        echo "Error al analizar el certificado: " . $e->getMessage();
    }
?>