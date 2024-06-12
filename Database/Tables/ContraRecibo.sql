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

BEGIN
	DECLARE v_idCliente VARCHAR(80);
    DECLARE v_cantidadPagos INT;
    
    SELECT rfc INTO v_idCliente FROM cliente WHERE rfc = p_idCliente;
    
    IF v_idCliente IS NULL THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe.';
    ELSE
    	SELECT COUNT(idCliente) INTO v_cantidadPagos FROM pagos WHERE idCliente = v_idCliente;
    	
        IF v_cantidadPagos IS NULL THEN 
        	SET v_cantidadPagos = 0; 
        END IF;
    
    	SELECT 
            rfc, 
            nombre,
            domicilio,
            ciudad,
            COUNT(DISTINCT C.folio) AS cantidadContraRecibosTimbrados,
            v_cantidadPagos AS cantidadPagosRealizados,
            total AS saldoActual
        FROM 
            contrarecibos_timbrados C
            JOIN contrarecibos ON (C.rfc = contrarecibos.idCliente)
            JOIN saldos ON (C.rfc = saldos.idCliente)
        WHERE 
        	rfc = p_idCliente
        GROUP BY
			rfc;
    END IF;
END