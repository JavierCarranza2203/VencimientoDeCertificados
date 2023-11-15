<?php

    class Cliente
    {
        /*========== Propiedades ==========*/

        //Nombre del titular del certificado
        public string $Nombre;
        //Nombre del emisor del certificado
        public string $RFC;
        //Fecha en la que se tramitó el certificado
        public string $FechaInicio;
        //Fecha en la que vence el certificado
        public string $FechaFin;
        //Status del certificado (Vigente / Vencido)
        public bool $Status;

        //Constructor
        public function __construct()
        {
            $this->Nombre = "Desconocido";
            $this->RFC = "Desconocido";
            $this->FechaInicio = null;
            $this->FechaFin = null;
            $this->Status = false;
        }
    }

?>