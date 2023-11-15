<?php

class Connection
{
    protected $db_conection;

    public function __construct()
    {
        $this->db_conection = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

        if ($this->db_conection->connect_error) 
        {
            throw new Exception("Hubo un error al conectar al servidor: " . $this->db_conection->connect_error);
        }
        
        $this->db_conection->set_charset(DB_CHARSET);
    }
}

?>