CREATE TABLE firma(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    id_certificado INT,
    FOREIGN KEY (id_certificado) REFERENCES certificado(id) ON DELETE CASCADE
);