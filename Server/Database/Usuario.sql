CREATE TABLE usuario(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nombre_completo VARCHAR(80),
    nombre_usuario VARCHAR(25),
    contrasenia VARCHAR(10),
    -- Llave foranea para la tabla de rol
    id_rol INT
);