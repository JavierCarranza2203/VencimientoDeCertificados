<?php

require_once 'Certificado.php';

//La clase "Sello" recibe herencia de la clase "Certificado" y ejecuta su constructor al momento de ser instanciada
class Sello extends Certificado
{
    public function __construct()
    {
        parent::__construct();
    }
}

?>