<?php

require_once 'Firma.php';
require_once 'Sello.php';


    class Cliente
    {
        /*========== Propiedades ==========*/

        //Nombre del titular del certificado
        public string $Nombre;
        public string $RFC;
        public string $GrupoClientes;

        //Sello y firma del cliente
        public Sello $Sello;
        public Firma $Firma;

        //Constructor
        public function __construct()
        {
            $this->Nombre = "Desconocido";
            $this->RFC = "Desconocido";
            $this->Sello = new Sello();
            $this->Firma = new Firma();
        }
    }

?>