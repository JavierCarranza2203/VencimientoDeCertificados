<?php

class Usuario
{
    public string $NombreCompleto;
    public string $NombreUsuario;
    private string $Password;
    public string $Rol;
    public string $GrupoClientes;

    public function __construct(string $pw)
    {   
        $this->NombreCompleto = "Desconocido";
        $this->NombreUsuario = "Desconocido";
        $this->Password = $pw;
        $this->Rol = "Desconocido";
    }

    public function CompararPassword(string $pw) : bool
    {
        return $this->Password === $pw;
    }
}

?>