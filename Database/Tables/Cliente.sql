-- Active: 1701900326404@@127.0.0.1@3306@db_despacho_contable
CREATE TABLE cliente(
    rfc VARCHAR(80) PRIMARY KEY NOT NULL,
    nombre VARCHAR(80),
    grupo_clientes CHAR(1)
);