-- Active: 1701900326404@@127.0.0.1@3306@db_despacho_contable
CREATE TABLE certificado(
    id INT PRIMARY KEY NOT NULL,
    fecha_fin DATE NOT NULL,
    estatus BOOLEAN NOT NULL,
    tipo VARCHAR(15) NOT NULL,
    id_cliente VARCHAR(80) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(rfc) ON DELETE CASCADE
);

