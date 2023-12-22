<?php

require_once '../Config/config.php';

class Connection
{
    //Variable protegida para la conección
    protected $db_conection;

    //En el constructor de la clase, inicializa la conexión a la base de datos
    public function __construct()
    {
        //Hace la conexión con las constantes definidas en el archivo "config.php"
        $this->db_conection = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

        //Genera un error si algo salió mal
        if ($this->db_conection->connect_error)
        {
            throw new Exception("Hubo un error al conectar al servidor: " . $this->db_conection->connect_error);
        }

        //Manda el código de caractéres
        $this->db_conection->set_charset(DB_CHARSET);
    }
}

?>