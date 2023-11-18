<?php

require_once '../Models/Usuario.php';
require_once '../Libraries/Connection.php';

class UsuarioService extends Connection
{
    //Código de acceso (Se requiere para operaciones críticas como borrar usuarios)
    private int $codigoDeAccesso = 00175;

    //Constructor para inicializar la conexién a la base de datos
    public function __construct()
    {
        parent::__construct();
    }

    //Método para iniciar sesion
    public function IniciarSesion(string $nu, string $pw) : string
    {
        $miUsuario = $this->BuscarUsuario($nu);

        if($miUsuario == null)
        {
            throw new Exception("El nombre de usuario no es correcto");
        }

        if($miUsuario->CompararPassword($pw))
        {
            session_start();

            $_SESSION['nombre_completo'] = $miUsuario->NombreCompleto;
            $_SESSION['nombre_usuario'] = $miUsuario->NombreUsuario;
            $_SESSION['rol_usuario'] = $miUsuario->Rol;
            $_SESSION['grupo_clientes_usuario'] = $miUsuario->GrupoClientes;

            return "Se ha iniciado sesión";
        }
        else
        {
            throw new Exception("La contraseña no es correcta");
        }
    }

    //Método para cerrar sesión
    public function CerrarSesion() : bool
    {
        session_start();
        return session_destroy();
    }

    //Método para obtener el usuario actual en sesión
    public function ObtenerUsuarioLogeado(int $codigoDeAccesso) : Usuario
    {
        session_start();
        if($_SESSION['nombre_usuario'] != null)
        {
            $miUsuario = new Usuario("Desconocida");

            $miUsuario->NombreUsuario = $_SESSION['nombre_usuario'];
            $miUsuario->Rol = $_SESSION['rol_usuario'];
            $miUsuario->GrupoClientes = $_SESSION['grupo_clientes_usuario'];

            return $miUsuario;
        }
        else
        {
            throw new Exception("Por favor inicie sesión");
        }
    }

    //Método para agregar usuarios
    public function AgregarUsuario(Usuario $nuevoUsuario, int $codigoDeAccesso) : string
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

    //Método para eliminar usuarios
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

    //Método para buscar un usuario (solo se usa dentro de la clase)
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
            $miUsuario->Rol = $usuarioVirtual["rol"];
            $miUsuario->GrupoClientes = $usuarioVirtual["grupo_clientes"];

            $usuarioVirtual = null;

            return $miUsuario;
        }
        else
        {
            return null;
        }
    }

    //Método para obtener todos los usuarios
    public function ObtenerTodosLosUsuarios(int $codigoDeAccesso)
    {
        $miUsuario = new Usuario("Desconocida");
    }
}
?>