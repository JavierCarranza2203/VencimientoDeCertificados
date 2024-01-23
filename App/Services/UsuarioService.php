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
    public function ObtenerUsuarioLogeado() : Usuario
    {
        session_start();
        if(isset($_SESSION['nombre_usuario']) && $_SESSION['nombre_usuario'] != null)
        {
            $miUsuario = new Usuario();

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
    public function AgregarUsuario(Usuario $nuevoUsuario, string $password) : string
    {
        if($this->BuscarUsuario($nuevoUsuario->NombreUsuario) != null)
        {
            throw new Exception("El usuario ya existe");
        }
        else
        {
            $stmt = $this->db_conection->prepare("INSERT INTO usuario(nombre_completo, nombre_usuario, contrasenia, grupo_clientes, rol) VALUES(?, ?, ?, ?, ?)");

            $stmt->bind_param("sssss", $nuevoUsuario->NombreCompleto, $nuevoUsuario->NombreUsuario, $password, $nuevoUsuario->GrupoClientes, $nuevoUsuario->Rol);

            if($stmt->execute())
            {
                return "El usuario se ha agregado correctamente";
            }
            else
            {
                throw new Exception("Hubo un error al agregar los datos");
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

                if($stmt->execute()) 
                {
                    return "Se ha eliminado a " . $nombre_antiguo_usuario;
                }
                else 
                {
                    throw new Exception("Hubo un error al eliminar el usuario");
                }
            }
            else
            {
                throw new Exception("El usuario no se encuentra");
            }
        }
        else
        {
            throw new Exception("Código de acceso incorrecto");
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

            $miUsuario = new Usuario($usuarioVirtual["nombre_completo"], $usuarioVirtual["nombre_usuario"], $usuarioVirtual["contrasenia"], $usuarioVirtual["rol"], $usuarioVirtual["grupo_clientes"]);

            $usuarioVirtual = null;

            return $miUsuario;
        }
        else 
        {
            return null;
        }
    }

    //Método para obtener todos los usuarios
    public function ObtenerTodosLosUsuarios()
    {
        $stmt = $this->db_conection->prepare("SELECT id, nombre_completo, nombre_usuario, grupo_clientes, rol FROM usuario");

        $stmt->execute();

        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) 
        {

            $resultado = $resultado->fetch_all();

            return $resultado;
        } 
        else 
        {
            throw new Exception("No hay registros"); 
        }
    }

    public function ActualizarUsuario(int $id, string $nombre, string $usuario, string $grupo, string $rol)
    {
        $stmt = $this->db_conection->prepare("UPDATE usuario SET 
                    nombre_completo = ?,
                    nombre_usuario = ?,
                    grupo_clientes = ?,
                    rol = ? 
                WHERE id = " . $id);
        
        $stmt->bind_param("ssss", $nombre, $usuario, $grupo, $rol);

        if($stmt->execute())
        {
            return "Se actualizó el usuario correctamente";
        }
        else
        {
            throw new Exception("No se pudo actualizar el usuario");
        }
    }
}
?>