-- Active: 1701900326404@@127.0.0.1@3306@db_despacho_contable
CREATE TABLE cliente(
    rfc VARCHAR(80) PRIMARY KEY NOT NULL,
    nombre VARCHAR(80),
    grupo_clientes CHAR(1),
    id_clave_ciec INT,
    clave_regimen INT,
    ruta_constancia VARCHAR(20),
    FOREIGN KEY (clave_regimen) REFERENCES regimen_fiscal(clave) ON DELETE CASCADE,
    FOREIGN KEY (id_clave_ciec) REFERENCES clave_ciec(id) ON DELETE CASCADE
);