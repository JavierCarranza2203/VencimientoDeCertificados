-- Active: 1700088529553@@127.0.0.1@3306@despacho_contable
CREATE TABLE usuario(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nombre_completo VARCHAR(80),
    nombre_usuario VARCHAR(25),
    contrasenia VARCHAR(10),
    grupo_clientes CHAR,
    rol VARCHAR(10)
);