BEGIN
	DECLARE v_tarifa DOUBLE
    DECLARE v_anio INT
    DECLARE v_mes INT
    
    START TRANSACTION
        SELECT tarifaMensual INTO v_tarifa FROM tarifas WHERE idCliente = p_idCliente
END