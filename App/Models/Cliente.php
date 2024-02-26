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
        public function __construct(string $nombre = "", string $rfc = "", string $grupoClientes = "", string $fechaFinSello = "", bool $statusSello = false, string $fechaFinFirma = "", bool $statusFirma = false)
        {
            $this->Nombre = $nombre;
            $this->RFC = $rfc;
            $this->Sello = new Sello($fechaFinSello, $statusSello);
            $this->Firma = new Firma($fechaFinFirma, $statusFirma);
            $this->GrupoClientes = $grupoClientes;
        }

        
    }

?>