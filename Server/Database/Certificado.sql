CREATE TABLE certificado(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fecha_fin DATE,
    estatus BOOLEAN,
    id_cliente VARCHAR(15),
    FOREIGN KEY (id_cliente) REFERENCES cliente(rfc) ON DELETE CASCADE
);