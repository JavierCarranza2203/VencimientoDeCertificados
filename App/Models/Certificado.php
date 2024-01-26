<?php

abstract class Certificado
{
    /*========== Propiedades ==========*/

    //Fecha de vencimiento
    public string $FechaFin;
    //Si está vigente o no
    public bool $Status;

    //Constructor
    public function __construct(string $fechaFin, bool $status)
    {
        $this->FechaFin = $fechaFin;
        $this->Status = $status;
    }
}

?>