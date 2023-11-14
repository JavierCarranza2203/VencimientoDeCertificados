CREATE TABLE certificado(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    ruta VARCHAR (70),
    fecha_inicio DATE,
    fecha_fin DATE,
    estatus BOOLEAN,
    -- Llave foranea para la tabla cliente
    id_cliente INT
);