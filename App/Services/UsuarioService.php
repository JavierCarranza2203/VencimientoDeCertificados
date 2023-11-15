<?php

require_once '../Models/Usuario.php';
require_once '../Libraries/Connection.php';

class UsuarioService extends Connection
{
    private int $codigoDeAccesso = 00175;

    public function __construct()
    {
        parent::__construct();
    }

    public function IniciarSesion(string $nu, string $pw) : string
    {
        $miUsuario = $this->BuscarUsuario($nu);

        if($miUsuario->CompararPassword($pw))
        {
            session_start();

            $_SESSION['nombre_usuario'] = $miUsuario->NombreUsuario;
            $_SESSION['rol_usuario'] = $miUsuario->Rol;
            $_SESSION['grupo_cliente_usuario'] = $miUsuario->GrupoClientes;

            return "La sesión ha sido iniciada correctamente";
        }
        else
        {
            throw new Error("La contraseña no es correcta");
        }
    }

    public function CerrarSesion() : bool
    {
        session_start();
        return session_destroy();
    }

    public function ObtenerUsuarioLogeado() : Usuario
    {
        session_start();
        if($_SESSION['usuario'] != null)
        {
            $miUsuario = new Usuario("Desconocida");

            $miUsuario->NombreUsuario = $_SESSION['nombre_usuario'];
            $miUsuario->Rol = $_SESSION['rol_usuario'];
            $miUsuario->GrupoClientes = $_SESSION['grupo_clientes_usuario'];

            return $miUsuario;
        }
        else
        {
            throw new Error("Por favor inicie sesión");
        }
    }

    public function AgregarUsuario(Usuario $nuevoUsuario, string $password) : string
    {
        if($this->BuscarUsuario($nuevoUsuario->NombreUsuario) != null)
        {
            throw new Error("El usuario ya existe");
        }
        else
        {
            $stmt = $this->db_conection->prepare("INSERT INTO usuario (nombre_completo, nombre_usuario, contrasenia, grupo_clientes, rol) VALUES (?, ?, ?, ?, ?)");

            $stmt->bind_param("s", $nuevoUsuario->NombreCompleto, $nuevoUsuario->NombreUsuario, $password, $nuevoUsuario->GrupoClientes, $nuevoUsuario->Rol);

            if($stmt->execute())
            {
                return "El usuario se ha agregado correctamente";
            }
            else
            {
                throw new Error("Hubo un error al agregar los datos");
            }
        }
    }

    public function EliminarUsuario(string $nombre_antiguo_usuario, int $codigoDeAccesso) : string
    {
        if($codigoDeAccesso == $this->codigoDeAccesso)
        {
            if($this->BuscarUsuario($nombre_antiguo_usuario) != null)
            {
                $stmt = $this->db_conection->prepare("DELETE FROM usuario WHERE nombre_usuario = ?");
                $stmt->bind_param("s", $nombre_antiguo_usuario);


                return "Se ha eliminado a " . $nombre_antiguo_usuario;
            }
            else
            {
                throw new Error("El usuario no se encuentra");
            }
        }
        else
        {
            throw new Error("Código de acceso incorrecto");
        }
    }

    private function BuscarUsuario(string $nu) : ?Usuario
    {
        $stmt = $this->db_conection->prepare("SELECT * FROM usuario WHERE nombre_usuario = ?");

        $stmt->bind_param("s", $nu);

        $resultado = $stmt->execute();
        $resultado = $stmt->get_result();

        if($resultado->num_rows > 0)
        {
            $usuarioVirtual = $resultado->fetch_assoc();

            $miUsuario = new Usuario($usuarioVirtual["contrasenia"]);

            $miUsuario->NombreCompleto = $usuarioVirtual["nombre_completo"];
            $miUsuario->NombreUsuario = $usuarioVirtual["nombre_usuario"];

            $usuarioVirtual = null;

            return $miUsuario;
        }
        else
        {
            return null;
        }
    }

    public function ObtenerTodosLosUsuarios()
    {
        $miUsuario = new Usuario("Desconocida");
    }
}
?>