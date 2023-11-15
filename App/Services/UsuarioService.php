<?php

require_once '../Models/Usuario.php';

class UsuarioService
{
    public function IniciarSesion($nu, $pw)
    {
        $miUsuario = $this->BuscarUsuario($nu);
    }

    public function CerrarSesion()
    {
        return session_destroy();
    }

    public function ValidarUsuarioLogeado()
    {
        return true;
    }

    public function AgregarUsuario($nuevoUsuario)
    {
        return true;
    }

    public function EliminarUsuario($antiguoUsuario)
    {
        return true;
    }

    private function BuscarUsuario($nu)
    {
        $miUsuario = new Usuario($nu);

        return $miUsuario;
    }

    public function ObtenerTodosLosUsuarios()
    {
        $miUsuario = new Usuario("Desconocida");
    }
}
?>