<?php

class Usuario
{
    public $NombreCompleto;
    public $NombreUsuario;
    private $Password;
    public $Rol;

    public function __construct($pw)
    {   
        $this->NombreCompleto = "Desconocido";
        $this->NombreUsuario = "Desconocido";
        $this->Password = $pw;
        $this->Rol = "Desconocido";
    }

    public function CompararPassword($pw)
    {
        return $this->Password === $pw;
    }
}

?>