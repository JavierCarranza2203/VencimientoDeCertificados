<?php

require_once '../Models/Usuario.php';

class UsuarioService
{
    public function BuscarUsuario($nu)
    {
        $miUsuario = new Usuario($nu);

        return $miUsuario;
    }

    public function ValidarUsuarioLogeado()
    {
    }

    public function AgregarUsuario($nuevoUsuario)
    {
    }

    public function EliminarUsuario($antiguoUsuario)
    {
    }

    public function CerrarSesion()
    {
        return session_destroy();
    }

    public function IniciarSesion($nu, $pw)
    {
    }
}
?>