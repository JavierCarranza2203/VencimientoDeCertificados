<?php

require_once 'Certificado.php';

//La clase "Firma" recibe herencia de la clase "Certificado" y ejecuta su constructor al momento de ser instanciada
class Firma extends Certificado
{
    public function __construct()
    {
        parent::__construct();
    }
}

?>