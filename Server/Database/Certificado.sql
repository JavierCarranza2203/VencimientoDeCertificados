-- Active: 1701438251905@@127.0.0.1@3306@db_despacho_contable
CREATE TABLE certificado(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fecha_fin DATE,
    estatus BOOLEAN,
    tipo VARCHAR(15),
    id_cliente VARCHAR(15),
    FOREIGN KEY (id_cliente) REFERENCES cliente(rfc) ON DELETE CASCADE
);