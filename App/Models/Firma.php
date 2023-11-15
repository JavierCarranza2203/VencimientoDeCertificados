<?php

require_once 'Certificado.php';

class Firma extends Certificado
{
    public function __construct($r)
    {
        parent::__construct($r);
    }
}

?>