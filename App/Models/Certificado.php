<?php

abstract class Certificado
{
    /*========== Propiedades ==========*/

    //Ruta del archivo
    private string $Ruta;
    //Nombre del archivo
    private string $Nombre;
    //Fecha de tramite
    public mixed $FechaInicio;
    //Fecha de vencimiento
    public mixed $FechaFin;
    //Si está vigente o no
    public bool $Status;

    //Constructor
    public function __construct(string $r)
    {
        $this->Ruta = $r;
        $this->Nombre = $r;
        $this->FechaInicio = "Desconocida";
        $this->FechaFin = "Desconocida";
        $this->Status = false;
    }

    //Accesor para la ruta
    public function GetRuta()
    {
        return $this->Ruta;
    }

    public function SubirArchivo()
    {

    }
}

?>