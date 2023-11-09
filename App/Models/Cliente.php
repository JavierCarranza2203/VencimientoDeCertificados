<?php

    class Cliente
    {
        /*========== Propiedades ==========*/

        //Nombre del titular del certificado
        public $Nombre;
        //Nombre del emisor del certificado
        public $Emisor;
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
            $this->Emisor = "Desconocido";
            $this->FechaInicio = null;
            $this->FechaFin = null;
            $this->_blnStatus = false;
        }
    }

?>