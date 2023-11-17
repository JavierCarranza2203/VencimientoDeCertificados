<?php

require_once 'Certificado.php';

class Firma extends Certificado
{
    public function __construct(string $r)
    {
        parent::__construct($r);
    }
}

?>