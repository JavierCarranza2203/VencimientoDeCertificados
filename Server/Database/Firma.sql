CREATE TABLE firma(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    -- Llave foranea para la tabla de certificado
    id_certificado INT
);