BEGIN
    IF NEW.vigente = FALSE THEN
        DECLARE v_tarifa DOUBLE;
        DECLARE v_viejoSaldo DOUBLE;
        DECLARE v_nuevoSaldo DOUBLE;

        SELECT tarifa INTO v_tarifa FROM tarifas WHERE idCliente = OLD.idClient;

        SELECT total INTO v_viejoSaldo FROM saldos WHERE idCliente = OLD.idCliente;

        SET v_nuevoSaldo = v_viejoSaldo - v_tarifa;

        UPDATE saldos SET total = v_nuevoSaldo WHERE idCliente = OLD.idCliente;
    END IF
END