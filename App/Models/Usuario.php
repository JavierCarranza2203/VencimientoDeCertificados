<?php

class Usuario
{
    public $NombreCompleto;
    public $NombreUsuario;
    public $Password;
    public $Rol;

    public function __construct()
    {   
        $this->NombreCompleto = "Desconocido";
        $this->NombreUsuario = "Desconocido";
        $this->Password = "Desconocida";
        $this->Rol = "Desconocido";
    }
}

?>