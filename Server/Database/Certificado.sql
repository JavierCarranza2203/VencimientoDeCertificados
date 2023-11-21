-- Active: 1700088529553@@127.0.0.1@3306@despacho_contable
CREATE TABLE certificado(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fecha_fin DATE,
    estatus BOOLEAN,
    tipo VARCHAR(15),
    id_cliente VARCHAR(15),
    FOREIGN KEY (id_cliente) REFERENCES cliente(rfc) ON DELETE CASCADE
);