-- Active: 1701900326404@@127.0.0.1@3306@db_despacho_contable
CREATE TABLE usuario(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nombre_completo VARCHAR(80),
    nombre_usuario VARCHAR(25),
    contrasenia VARCHAR(15),
    grupo_clientes CHAR,
    rol VARCHAR(10)
);