<?php

require_once '../Models/Usuario.php';
require_once '../Libraries/Connection.php';

class UsuarioService extends Connection
{
    public function __construct()
    {
        parent::__construct();
    }

    public function IniciarSesion($nu, $pw) : void
    {
        $miUsuario = $this->BuscarUsuario($nu);

        if($miUsuario->CompararPassword($pw))
        {
            
        }
    }

    public function CerrarSesion() : bool
    {
        session_start();
        return session_destroy();
    }

    public function ValidarUsuarioLogeado() : bool
    {
        return true;
    }

    public function AgregarUsuario($nuevoUsuario) : bool
    {
        return true;
    }

    public function EliminarUsuario($antiguoUsuario) : bool
    {
        return true;
    }

    private function BuscarUsuario($nu) : Usuario
    {
        $stmt = $this->db_conection->prepare("SELECT * FROM usuario WHERE nombre_usuario = ?");

        $stmt->bind_param("s", $nu);

        $resultado = $stmt->execute()->get_result();

        if($resultado->num_rows > 0)
        {
            $usuarioVirtual = $resultado->fetch_assoc();

            $miUsuario = new Usuario($usuarioVirtual["contrasenia"]);

            $miUsuario->NombreCompleto = $usuarioVirtual["nombre_completo"];
            $miUsuario->NombreUsuario = $usuarioVirtual["nombre_usuario"];
            $miUsuario->Rol = $usuarioVirtual["id_rol"];

            return $miUsuario;
        }
        else
        {
            throw new UnexpectedValueException("El usuario no se encuentra en la base de datos");
        }
    }

    public function ObtenerTodosLosUsuarios()
    {
        $miUsuario = new Usuario("Desconocida");
    }
}
?>