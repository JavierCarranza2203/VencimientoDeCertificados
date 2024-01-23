<?php

class Usuario
{
    //Propiedades
    public string $NombreCompleto;
    public string $NombreUsuario;
    private string $Password;
    public string $Rol;
    public string $GrupoClientes;

    //Iniciamos el constructor recibiendo por parametro la contraseña del usuario para mantener la encapsulación
    public function __construct(string $nombreCompleto = "", string $nombreUsuario = "", string $pw = "", string $rol = "", string $grupoClientes = "")
    {   
        $this->NombreCompleto = $nombreCompleto;
        $this->NombreUsuario = $nombreUsuario;
        $this->Password = $pw;
        $this->Rol = $rol;
        $this->GrupoClientes = $grupoClientes;
    }

    //Método que funciona como la interfaz Equals
    public function CompararPassword(string $pw) : bool
    {
        return $this->Password === $pw;
    }
}

?>