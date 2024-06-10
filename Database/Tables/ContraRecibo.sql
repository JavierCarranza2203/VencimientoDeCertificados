-- Active: 1701900326404@@127.0.0.1@3306
CREATE TABLE tarifas(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    idCliente VARCHAR(80) NOT NULL,
    tarifaMensual DOUBLE NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES cliente(rfc)
);

CREATE TABLE contrarecibos(
    folio INT PRIMARY KEY NOT NULL,
    idCliente VARCHAR(80) NOT NULL,
    fecha DATETIME NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES cliente(rfc)
);

CREATE TABLE saldos(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    total DOUBLE NOT NULL,
    idCliente VARCHAR(80) NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES cliente(rfc)
);

CREATE TABLE pagos(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    importe DOUBLE,
    idCliente VARCHAR(80) NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (idCliente) REFERENCES cliente(rfc)
);