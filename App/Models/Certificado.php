<?php

abstract class Certificado
{
    private $Ruta;
    public $FechaInicio;
    public $FechaFin;
    public $Status;

    public function __construct($r)
    {
        $this->Ruta = $r;
    }

    public function GetRuta()
    {
        return $this->Ruta;
    }
}

?>