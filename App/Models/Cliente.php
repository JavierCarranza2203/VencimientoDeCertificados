<?php

    class Cliente
    {
        /*========== Propiedades ==========*/

        //Nombre del titular del certificado
        public $Nombre;
        //Nombre del emisor del certificado
        public $RFC;
        //Fecha en la que se tramitó el certificado
        public $FechaInicio;
        //Fecha en la que vence el certificado
        public $FechaFin;
        //Status del certificado (Vigente / Vencido)
        public $Status;

        //Constructor
        public function __construct()
        {
            $this->Nombre = "Desconocido";
            $this->RFC = "Desconocido";
            $this->FechaInicio = null;
            $this->FechaFin = null;
        }
    }

?>