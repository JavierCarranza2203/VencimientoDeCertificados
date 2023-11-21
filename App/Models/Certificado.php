<?php

abstract class Certificado
{
    /*========== Propiedades ==========*/

    //Fecha de vencimiento
    public DateTime $FechaFin;
    //Si está vigente o no
    public bool $Status;

    //Constructor
    public function __construct()
    {
        $this->FechaFin = new DateTime();
        $this->Status = false;
    }
}

?>