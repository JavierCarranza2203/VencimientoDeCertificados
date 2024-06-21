-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-06-2024 a las 01:03:39
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `db_despacho_contable`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CancelarContraRecibo` (IN `p_folio` VARCHAR(20))   BEGIN
    DECLARE v_vigente BOOLEAN;

	START TRANSACTION;
    
    SELECT vigente INTO v_vigente FROM contrarecibos WHERE folio = p_folio;
   	
    IF v_vigente IS NULL THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay un contra recibo con ese folio';
    END IF;
    
    IF v_vigente = FALSE THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El contrarecibo ya está cancelado';
    ELSE
    	UPDATE contrarecibos SET vigente = false WHERE folio = p_folio;
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `DejarDeTimbrarCliente` (IN `p_rfc` VARCHAR(80))   BEGIN
	DECLARE v_timbraNominas BOOLEAN;
    DECLARE v_saldo DOUBLE;
    
    START TRANSACTION;
    
    SELECT timbraNominas INTO v_timbraNominas FROM cliente WHERE rfc = p_rfc;
    
    IF V_timbraNominas IS NULL THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No existe un cliente con ese RFC';
    END IF;
    
    IF V_timbraNominas IS FALSE THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente ya no está activo';
    END IF;
    
    SELECT total INTO v_saldo FROM saldos WHERE idCliente = p_rfc;
    
    IF v_saldo > 0 THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente tiene saldo pendiente';
   	END IF;
    
    UPDATE cliente SET timbraNominas = FALSE WHERE rfc = p_rfc;
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `EditarDatosDeContraRecibos` (IN `p_rfc` VARCHAR(80), IN `p_calle` VARCHAR(100), IN `p_numero` VARCHAR(8), IN `p_ciudad` VARCHAR(100), IN `p_estado` VARCHAR(100), IN `p_codigoPostal` VARCHAR(7), IN `p_tarifaMensual` DOUBLE)   BEGIN
	START TRANSACTION;
    
    IF(p_tarifaMensual <= 0 OR p_calle = "" OR p_numero = "" OR p_ciudad = "" OR p_estado = "" OR p_codigoPostal = "") THEN
    	ROLLBACK;
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Todos los campos deben estar llenos';
    END IF;
    
    UPDATE cliente SET calle = p_calle, numero = p_numero, municipio = p_ciudad, estado = p_estado, codigoPostal = p_codigoPostal WHERE rfc = p_rfc;
	UPDATE tarifas SET tarifaMensual = p_tarifaMensual WHERE idCliente = p_rfc;
    
   	COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerContrarecibosPorCliente` (IN `p_idCliente` VARCHAR(80))   BEGIN
	SELECT 
    	folio, 
        fecha, 
        hora, 
        concepto,
        tarifaMensual AS importe,
        vigente
    FROM 
    	contrarecibos_timbrados 
    WHERE 
    	rfc = p_idCliente;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerEstadoDeCuentaDelCliente` (IN `p_idCliente` VARCHAR(80))   BEGIN
	DECLARE v_idCliente VARCHAR(80);
    DECLARE v_cantidadPagos INT;
    DECLARE v_cantidadContraRecibos INT;
    
    SELECT rfc INTO v_idCliente FROM cliente WHERE rfc = p_idCliente;
    
    IF v_idCliente IS NULL THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe.';
    ELSE
    	SELECT COUNT(idCliente) INTO v_cantidadPagos FROM pagos WHERE idCliente = v_idCliente;
    	
        IF v_cantidadPagos IS NULL THEN 
        	SET v_cantidadPagos = 0; 
        END IF;
        
        SELECT COUNT(rfc) INTO v_cantidadContraRecibos FROM contrarecibos_timbrados WHERE rfc = p_idCliente;

        IF v_cantidadContraRecibos IS NULL THEN
       		SET v_cantidadPagos = 0;
        END IF;

    	SELECT 
            rfc, 
            nombre,
            CONCAT(calle, ' NO.', numero, ', COLONIA ', colonia) AS domicilio,
            CONCAT(municipio, ', ', estado, 'C.P. ', codigoPostal) AS ciudad,
            v_cantidadContraRecibos AS cantidadContraRecibosTimbrados,
            v_cantidadPagos AS cantidadPagosRealizados,
            total AS saldoActual
        FROM 
            cliente C
            JOIN saldos ON (C.rfc = saldos.idCliente)
        WHERE 
        	rfc = p_idCliente;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ObtenerPagosRealizadosPorCliente` (IN `p_idCliente` VARCHAR(80))   BEGIN
	SELECT
id,
        fecha, 
        hora,
        importe
    FROM 
    	pagos
    WHERE 
    	idCliente = p_idCliente;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RealizarPago` (IN `p_idCliente` VARCHAR(80), IN `p_monto` DOUBLE)   BEGIN
	DECLARE v_idCliente VARCHAR(80);

    START TRANSACTION;
    
    SELECT rfc INTO v_idCliente FROM cliente WHERE rfc = p_idCliente;
    
    IF v_idCliente IS NULL THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe.';
    ELSE
    	INSERT INTO pagos(importe, idCliente, fecha, hora) VALUES (p_monto, p_idCliente, CURRENT_DATE, CURRENT_TIME);
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `TimbrarContraRecibo` (IN `p_idCliente` VARCHAR(80), IN `p_concepto` VARCHAR(255))   BEGIN
    DECLARE v_folio VARCHAR(20);
    DECLARE v_idCliente VARCHAR(80);
    DECLARE v_activo BOOLEAN;
    DECLARE v_numeroOperacion INT;
    DECLARE v_contraRecibosTimbrados VARCHAR(8);
    
    SELECT folio INTO v_contraRecibosTimbrados FROM contrarecibos WHERE idCliente = p_idCliente AND concepto = p_concepto;
    
    IF v_contraRecibosTimbrados IS NOT NULL THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente ya cuenta con un contrarecibo con este concepto';
    END IF;
    
   	SELECT rfc INTO v_idCliente FROM cliente WHERE rfc = p_idCliente;

    IF v_idCliente IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no encontrado';
    END IF;
    
    SELECT timbraNominas INTO v_activo FROM cliente WHERE rfc = p_idCliente;
    
    IF v_activo = FALSE THEN
    	ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente ya no está activo';
    END IF;
     
    SELECT COUNT(DISTINCT folio) INTO v_numeroOperacion FROM contrarecibos WHERE fecha = CURRENT_DATE;

    IF v_numeroOperacion IS NULL THEN 
    	SET v_numeroOperacion = 0;
    END IF;

    SET v_numeroOperacion = v_numeroOperacion + 1;

    IF LENGTH(v_numeroOperacion) <= 1 THEN 
    	SET v_folio = CONCAT(YEAR(CURRENT_DATE), DAY(CURRENT_DATE), '0', v_numeroOperacion);
    ELSE
        SET v_folio = CONCAT(YEAR(CURRENT_DATE), DAY(CURRENT_DATE), v_numeroOperacion);
    END IF;

    INSERT INTO contrarecibos(folio, idCliente, fecha, concepto, hora, vigente) VALUES (v_folio, p_idCliente, CURRENT_DATE, p_concepto, CURRENT_TIME, true);

    SELECT * FROM contrarecibos_timbrados WHERE folio = v_folio;
    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificado`
--

CREATE TABLE `certificado` (
  `id` int(11) NOT NULL,
  `fecha_fin` varchar(30) DEFAULT NULL,
  `estatus` tinyint(1) DEFAULT NULL,
  `tipo` varchar(15) DEFAULT NULL,
  `id_cliente` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `certificado`
--

INSERT INTO `certificado` (`id`, `fecha_fin`, `estatus`, `tipo`, `id_cliente`) VALUES
(1, '21-04-2024', 1, 'Firma', 'GAPG910722CGA'),
(2, '10-04-2028', 1, 'Sello', 'GAPG910722CGA'),
(3, '02-02-2028', 1, 'Firma', 'CORL960305MC1'),
(4, '02-02-2028', 1, 'Sello', 'CORL960305MC1'),
(5, '18-05-2024', 1, 'Firma', 'COLC621201MG3'),
(6, '16-11-2025', 1, 'Sello', 'COLC621201MG3'),
(7, '13-07-2024', 1, 'Firma', 'MERM671219NY7'),
(8, '03-09-2024', 1, 'Sello', 'MERM671219NY7'),
(9, '28-07-2024', 1, 'Firma', 'LOFC950118D57'),
(10, '14-09-2026', 1, 'Sello', 'LOFC950118D57'),
(11, '18-09-2024', 1, 'Firma', 'RORA980202NR2'),
(12, '23-12-2025', 1, 'Sello', 'RORA980202NR2'),
(13, '20-11-2024', 1, 'Firma', 'HEGM870709D39'),
(14, '10-04-2028', 1, 'Sello', 'HEGM870709D39'),
(15, '04-12-2024', 1, 'Firma', 'HEPF560627D62'),
(16, '12-06-2027', 1, 'Sello', 'HEPF560627D62'),
(17, '15-12-2024', 1, 'Firma', 'AACP7009254V4'),
(18, '17-03-2025', 1, 'Sello', 'AACP7009254V4'),
(19, '22-03-2025', 1, 'Firma', 'AALF6708197T2'),
(20, '18-04-2026', 1, 'Sello', 'AALF6708197T2'),
(21, '12-04-2025', 1, 'Firma', 'AACS681023H34'),
(22, '17-03-2025', 1, 'Sello', 'AACS681023H34'),
(23, '23-04-2025', 1, 'Firma', 'SACF830105CW9'),
(24, '21-07-2025', 1, 'Sello', 'SACF830105CW9'),
(25, '30-04-2025', 1, 'Firma', 'OINA761211I29'),
(26, '30-08-2025', 1, 'Sello', 'OINA761211I29'),
(27, '21-07-2025', 1, 'Firma', 'JACA861105KU6'),
(28, '24-11-2025', 1, 'Sello', 'JACA861105KU6'),
(29, '07-10-2025', 1, 'Firma', 'TOLA730206JN7'),
(30, '18-01-2026', 1, 'Sello', 'TOLA730206JN7'),
(31, '08-10-2025', 1, 'Firma', 'RETG5706199C3'),
(32, '29-11-2025', 1, 'Sello', 'RETG5706199C3'),
(33, '08-10-2025', 1, 'Firma', 'RAAH650728535'),
(34, '06-12-2025', 1, 'Sello', 'RAAH650728535'),
(35, '08-10-2025', 1, 'Firma', 'MOAY740103IS5'),
(36, '06-12-2025', 1, 'Sello', 'MOAY740103IS5'),
(37, '12-10-2025', 1, 'Firma', 'ROCM711213M50'),
(38, '23-12-2026', 1, 'Sello', 'ROCM711213M50'),
(39, '12-10-2025', 1, 'Firma', 'SAAJ860920FF0'),
(40, '06-12-2025', 1, 'Sello', 'SAAJ860920FF0'),
(41, '12-10-2025', 1, 'Firma', 'AARL810403AG0'),
(42, '15-12-2025', 1, 'Sello', 'AARL810403AG0'),
(43, '22-12-2025', 1, 'Firma', 'MEAF471114CY0'),
(44, '03-01-2026', 1, 'Sello', 'MEAF471114CY0'),
(45, '22-12-2025', 1, 'Firma', 'VIMJ690830EJ9'),
(46, '23-12-2025', 1, 'Sello', 'VIMJ690830EJ9'),
(47, '22-12-2025', 1, 'Firma', 'GALC780921EG9'),
(48, '15-02-2026', 1, 'Sello', 'GALC780921EG9'),
(49, '18-01-2026', 1, 'Firma', 'BADA750123QT3'),
(50, '14-02-2026', 1, 'Sello', 'BADA750123QT3'),
(51, '14-02-2026', 1, 'Firma', 'MAMF730614TR1'),
(52, '15-02-2026', 1, 'Sello', 'MAMF730614TR1'),
(53, '17-02-2026', 1, 'Firma', 'CAMA570128VD2'),
(54, '12-08-2026', 1, 'Sello', 'CAMA570128VD2'),
(55, '08-03-2026', 1, 'Firma', 'TEOJ750103NF0'),
(56, '05-03-2025', 1, 'Sello', 'TEOJ750103NF0'),
(57, '08-03-2026', 1, 'Firma', 'EANI000723IW5'),
(58, '13-06-2026', 1, 'Sello', 'EANI000723IW5'),
(59, '09-03-2026', 1, 'Firma', 'TEOR781202QX3'),
(60, '23-08-2026', 1, 'Sello', 'TEOR781202QX3'),
(61, '09-03-2026', 1, 'Firma', 'RUDD910205S63'),
(62, '23-08-2026', 1, 'Sello', 'RUDD910205S63'),
(63, '30-03-2026', 1, 'Firma', 'GAMA750304UB2'),
(64, '13-09-2026', 1, 'Sello', 'GAMA750304UB2'),
(65, '31-03-2026', 1, 'Firma', 'GIGJ910605EF5'),
(66, '31-03-2026', 1, 'Sello', 'GIGJ910605EF5'),
(67, '20-06-2026', 1, 'Firma', 'LERO770515M12'),
(68, '19-06-2024', 1, 'Sello', 'LERO770515M12'),
(69, '22-12-2026', 1, 'Firma', 'AEMA721001QZ8'),
(70, '16-10-2025', 1, 'Sello', 'AEMA721001QZ8'),
(71, '22-12-2026', 1, 'Firma', 'CACV790702UQ7'),
(72, '14-01-2027', 1, 'Sello', 'CACV790702UQ7'),
(73, '23-12-2026', 1, 'Firma', 'VEHL7211217T9'),
(74, '18-01-2027', 1, 'Sello', 'VEHL7211217T9'),
(75, '23-12-2026', 1, 'Firma', 'GOVJ801206B79'),
(76, '17-06-2024', 1, 'Sello', 'GOVJ801206B79'),
(77, '16-01-2027', 1, 'Firma', 'SOLL740826577'),
(78, '08-06-2026', 1, 'Sello', 'SOLL740826577'),
(79, '20-01-2027', 1, 'Firma', 'MATE840101PN8'),
(80, '26-02-2028', 1, 'Sello', 'MATE840101PN8'),
(81, '21-01-2027', 1, 'Firma', 'REGR7112127S7'),
(82, '18-01-2027', 1, 'Sello', 'REGR7112127S7'),
(83, '21-01-2027', 1, 'Firma', 'TOLG8312154T5'),
(84, '18-01-2027', 1, 'Sello', 'TOLG8312154T5'),
(85, '21-03-2027', 1, 'Firma', 'COMM860523DK8'),
(86, '15-09-2026', 1, 'Sello', 'COMM860523DK8'),
(87, '21-07-2027', 1, 'Firma', 'GTR180424UVA / AULS641101TK9'),
(88, '17-11-2027', 1, 'Sello', 'GTR180424UVA / AULS641101TK9'),
(89, '22-01-2025', 1, 'Firma', 'BAAM881214NV0'),
(90, '27-01-2025', 1, 'Sello', 'BAAM881214NV0'),
(91, '21-04-2027', 1, 'Firma', 'BAGA680128QQ7'),
(92, '12-06-2027', 1, 'Sello', 'BAGA680128QQ7'),
(93, '27-05-2026', 1, 'Firma', 'BEPA800824TH1'),
(94, '15-09-2026', 1, 'Sello', 'BEPA800824TH1'),
(95, '05-03-2028', 1, 'Firma', 'CACC920926CBA'),
(96, '14-09-2025', 1, 'Sello', 'CACC920926CBA'),
(97, '28-10-2024', 1, 'Firma', 'CAJK890628QG3'),
(98, '05-03-2025', 1, 'Sello', 'CAJK890628QG3'),
(99, '12-10-2024', 1, 'Firma', 'CARK9608196C1'),
(100, '15-10-2024', 1, 'Sello', 'CARK9608196C1'),
(101, '10-01-2026', 1, 'Firma', 'CURB950314LT3'),
(102, '09-05-2026', 1, 'Sello', 'CURB950314LT3'),
(103, '26-05-2024', 1, 'Firma', 'CURF841101HH7'),
(104, '08-03-2025', 1, 'Sello', 'CURF841101HH7'),
(105, '27-07-2025', 1, 'Firma', 'EAHI800513LT2'),
(106, '18-07-2027', 1, 'Sello', 'EAHI800513LT2'),
(107, '31-08-2024', 1, 'Firma', 'EAHM8912139LA'),
(108, '18-09-2024', 1, 'Sello', 'EAHM8912139LA'),
(109, '06-07-2026', 1, 'Firma', 'GAAE990131CE5'),
(110, '19-12-2027', 1, 'Sello', 'GAAE990131CE5'),
(111, '10-08-2026', 1, 'Firma', 'GAMG811003JQ6'),
(112, '26-06-2027', 1, 'Sello', 'GAMG811003JQ6'),
(113, '23-10-2027', 1, 'Firma', 'GAPJ810702LZ9'),
(114, '17-11-2027', 1, 'Sello', 'GAPJ810702LZ9'),
(115, '22-02-2025', 1, 'Firma', 'GAZP710922LW9'),
(116, '13-06-2027', 1, 'Sello', 'GAZP710922LW9'),
(117, '05-02-2025', 1, 'Firma', 'GOGX951111C90'),
(118, '12-01-2027', 1, 'Sello', 'GOGX951111C90'),
(119, '13-07-2027', 1, 'Firma', 'GORJ0307296Z2'),
(120, '07-11-2027', 1, 'Sello', 'GORJ0307296Z2'),
(121, '22-02-2026', 1, 'Firma', 'HEJC770402QX5'),
(122, '02-03-2026', 1, 'Sello', 'HEJC770402QX5'),
(123, '28-06-2026', 1, 'Firma', 'HESI9105215E3'),
(124, '12-06-2027', 1, 'Sello', 'HESI9105215E3'),
(125, '02-03-2025', 1, 'Firma', 'LOLJ7807076I9'),
(126, '24-08-2025', 1, 'Sello', 'LOLJ7807076I9'),
(127, '17-07-2024', 1, 'Firma', 'MACS571002KN6'),
(128, '05-03-2025', 1, 'Sello', 'MACS571002KN6'),
(129, '15-12-2024', 1, 'Firma', 'MACS860916UI6'),
(130, '05-03-2025', 1, 'Sello', 'MACS860916UI6'),
(131, '27-04-2024', 1, 'Firma', 'PATM660115N35'),
(132, '30-05-2027', 1, 'Sello', 'PATM660115N35'),
(133, '27-07-2025', 1, 'Firma', 'RITJ7502239P4'),
(134, '06-08-2025', 1, 'Sello', 'RITJ7502239P4'),
(135, '07-10-2025', 1, 'Firma', 'SAAV841221UW9'),
(136, '12-06-2027', 1, 'Sello', 'SAAV841221UW9'),
(137, '23-07-2025', 1, 'Firma', 'TELA910408RS1'),
(138, '17-01-2027', 1, 'Sello', 'TELA910408RS1'),
(139, '02-08-2025', 1, 'Firma', 'TORE720303P9A'),
(140, '10-09-2025', 1, 'Sello', 'TORE720303P9A'),
(141, '20-07-2026', 1, 'Firma', 'VECO8108204A8'),
(142, '17-11-2027', 1, 'Sello', 'VECO8108204A8'),
(143, '28-02-2028', 1, 'Firma', 'VIAG830120PF0'),
(144, '20-01-2027', 1, 'Sello', 'VIAG830120PF0'),
(145, '04-06-2024', 1, 'Firma', 'GAPR600903EA2'),
(146, '23-08-2026', 1, 'Sello', 'GAPR600903EA2'),
(147, '01-07-2024', 1, 'Firma', 'GOGL500403I21'),
(148, '27-07-2025', 1, 'Sello', 'GOGL500403I21'),
(149, '18-08-2024', 1, 'Firma', 'MATR851022EY0'),
(150, '18-01-2027', 1, 'Sello', 'MATR851022EY0'),
(151, '09-11-2024', 1, 'Firma', 'MAMD8309238K9'),
(152, '17-01-2027', 1, 'Sello', 'MAMD8309238K9'),
(153, '07-04-2025', 1, 'Firma', 'MEDB7010241U1'),
(154, '25-03-2026', 1, 'Sello', 'MEDB7010241U1'),
(155, '28-04-2025', 1, 'Firma', 'RIEL6505312V9'),
(156, '28-04-2025', 1, 'Sello', 'RIEL6505312V9'),
(157, '28-04-2025', 1, 'Firma', 'BEAH790324124'),
(158, '28-04-2025', 1, 'Sello', 'BEAH790324124'),
(159, '10-09-2025', 1, 'Firma', 'VALA920229680'),
(160, '10-09-2025', 1, 'Sello', 'VALA920229680'),
(161, '06-10-2025', 1, 'Firma', 'CUFR650302HB0'),
(162, '22-11-2025', 1, 'Sello', 'CUFR650302HB0'),
(163, '07-10-2025', 1, 'Firma', 'MEDI7109046K3'),
(164, '23-12-2025', 1, 'Sello', 'MEDI7109046K3'),
(165, '12-10-2025', 1, 'Firma', 'EICA540906SW8'),
(166, '22-11-2025', 1, 'Sello', 'EICA540906SW8'),
(167, '14-10-2025', 1, 'Firma', 'JAPM6106198R8'),
(168, '19-11-2025', 1, 'Sello', 'JAPM6106198R8'),
(169, '14-10-2025', 1, 'Firma', 'JILS680630H30'),
(170, '28-02-2028', 1, 'Sello', 'JILS680630H30'),
(171, '22-12-2025', 1, 'Firma', 'MOBI6512133R7'),
(172, '23-12-2025', 1, 'Sello', 'MOBI6512133R7'),
(173, '22-12-2025', 1, 'Firma', 'CUME820212LX1'),
(174, '11-01-2026', 1, 'Sello', 'CUME820212LX1'),
(175, '18-01-2026', 1, 'Firma', 'AAML660130QQ8'),
(176, '03-10-2027', 1, 'Sello', 'AAML660130QQ8'),
(177, '18-01-2026', 1, 'Firma', 'IMP891113T43 / AAML660130QQ8'),
(178, '12-10-2024', 1, 'Sello', 'IMP891113T43 / AAML660130QQ8'),
(179, '10-02-2026', 1, 'Firma', 'VIPJ6902137R2'),
(180, '29-03-2027', 1, 'Sello', 'VIPJ6902137R2'),
(181, '14-02-2026', 1, 'Firma', 'IIDJ580220NM7'),
(182, '15-02-2026', 1, 'Sello', 'IIDJ580220NM7'),
(183, '14-02-2026', 1, 'Firma', 'AILR690920GEA'),
(184, '28-02-2026', 1, 'Sello', 'AILR690920GEA'),
(185, '07-03-2026', 1, 'Firma', 'FICA710504SL2'),
(186, '23-08-2026', 1, 'Sello', 'FICA710504SL2'),
(187, '07-03-2026', 1, 'Firma', 'PUVR820709L88'),
(188, '18-04-2026', 1, 'Sello', 'PUVR820709L88'),
(189, '09-03-2026', 1, 'Firma', 'VAPI560128QAA'),
(190, '11-11-2025', 1, 'Sello', 'VAPI560128QAA'),
(191, '16-03-2026', 1, 'Firma', 'VEFL841126RU9'),
(192, '26-09-2026', 1, 'Sello', 'VEFL841126RU9'),
(193, '25-10-2026', 1, 'Firma', 'PEOE8206202X4'),
(194, '08-08-2027', 1, 'Sello', 'PEOE8206202X4'),
(195, '22-12-2026', 1, 'Firma', 'MAPM660315BV1'),
(196, '18-01-2027', 1, 'Sello', 'MAPM660315BV1'),
(197, '22-12-2026', 1, 'Firma', 'OIVI740617U52'),
(198, '30-08-2025', 1, 'Sello', 'OIVI740617U52'),
(199, '22-12-2026', 1, 'Firma', 'PEVL870114AM1'),
(200, '24-11-2025', 1, 'Sello', 'PEVL870114AM1'),
(201, '23-12-2026', 1, 'Firma', 'SOLE730731EN3'),
(202, '20-01-2026', 1, 'Sello', 'SOLE730731EN3'),
(203, '18-01-2027', 1, 'Firma', 'GAGP7401258ZA'),
(204, '12-01-2025', 1, 'Sello', 'GAGP7401258ZA'),
(205, '19-01-2027', 1, 'Firma', 'FASG680805Q57'),
(206, '18-01-2027', 1, 'Sello', 'FASG680805Q57'),
(207, '19-01-2027', 1, 'Firma', 'SACR8907276V6'),
(208, '17-01-2027', 1, 'Sello', 'SACR8907276V6'),
(209, '19-01-2027', 1, 'Firma', 'HEZY8010134U4'),
(210, '30-03-2027', 1, 'Sello', 'HEZY8010134U4'),
(211, '26-01-2027', 1, 'Firma', 'MACJ861206TF1'),
(212, '15-01-2028', 1, 'Sello', 'MACJ861206TF1'),
(213, '26-01-2027', 1, 'Firma', 'VAMR780824170'),
(214, '11-03-2028', 1, 'Sello', 'VAMR780824170'),
(215, '22-09-2025', 1, 'Firma', 'CAGN910225PQ1'),
(216, '01-02-2026', 1, 'Sello', 'CAGN910225PQ1'),
(217, '17-11-2025', 1, 'Firma', 'CAMD671112970'),
(218, '01-12-2025', 1, 'Sello', 'CAMD671112970'),
(219, '01-06-2027', 1, 'Firma', 'CAOA891113ICA'),
(220, '15-06-2027', 1, 'Sello', 'CAOA891113ICA'),
(221, '22-10-2025', 1, 'Firma', 'CEGA7101022E7'),
(222, '18-11-2025', 1, 'Sello', 'CEGA7101022E7'),
(223, '28-07-2025', 1, 'Firma', 'CULL8203277V1'),
(224, '01-09-2025', 1, 'Sello', 'CULL8203277V1'),
(225, '30-04-2026', 1, 'Firma', 'EULA730319429'),
(226, '26-09-2026', 1, 'Sello', 'EULA730319429'),
(227, '09-09-2025', 1, 'Firma', 'FUOP7809265F2'),
(228, '15-06-2027', 1, 'Sello', 'FUOP7809265F2'),
(229, '26-06-2024', 1, 'Firma', 'GORD871122AP1'),
(230, '30-08-2025', 1, 'Sello', 'GORD871122AP1'),
(231, '12-09-2026', 1, 'Firma', 'JICS740304J15'),
(232, '15-06-2027', 1, 'Sello', 'JICS740304J15'),
(233, '02-08-2026', 1, 'Firma', 'LEVA890315TA9'),
(234, '17-01-2027', 1, 'Sello', 'LEVA890315TA9'),
(235, '30-05-2026', 1, 'Firma', 'MAAH800910L78'),
(236, '15-06-2027', 1, 'Sello', 'MAAH800910L78'),
(237, '02-03-2025', 1, 'Firma', 'MAAJ8409309A9'),
(238, '13-09-2025', 1, 'Sello', 'MAAJ8409309A9'),
(241, '18-10-2025', 1, 'Firma', 'MOEF770617AM3'),
(242, '22-12-2025', 1, 'Sello', 'MOEF770617AM3'),
(243, '02-12-2024', 1, 'Firma', 'MOGE730819R98'),
(244, '17-11-2025', 1, 'Sello', 'MOGE730819R98'),
(245, '21-06-2027', 1, 'Firma', 'MORY840706T62'),
(246, '25-09-2027', 1, 'Sello', 'MORY840706T62'),
(247, '28-11-2026', 1, 'Firma', 'NAGE950106U78'),
(248, '15-06-2027', 1, 'Sello', 'NAGE950106U78'),
(249, '26-05-2024', 1, 'Firma', 'NIFJ7705258F8'),
(250, '23-11-2025', 1, 'Sello', 'NIFJ7705258F8'),
(251, '04-08-2026', 1, 'Firma', 'RIEL000803T22'),
(252, '05-08-2026', 1, 'Sello', 'RIEL000803T22'),
(253, '03-06-2026', 1, 'Firma', 'SASA661206DP3'),
(254, '13-06-2026', 1, 'Sello', 'SASA661206DP3'),
(255, '22-01-2028', 1, 'Firma', 'SEHV761225N49'),
(256, '01-09-2025', 1, 'Sello', 'SEHV761225N49'),
(257, '06-01-2026', 1, 'Firma', 'VAMG750703JS0'),
(258, '26-09-2026', 1, 'Sello', 'VAMG750703JS0'),
(259, '30-01-2028', 1, 'Firma', 'OIGA630531SP6'),
(260, '30-01-2028', 1, 'Sello', 'OIGA630531SP6'),
(261, '29-01-2028', 1, 'Firma', 'TOAR010105SM9'),
(262, '22-01-2028', 1, 'Sello', 'TOAR010105SM9'),
(263, '12-04-2025', 1, 'Firma', 'LULJ7310256D9'),
(264, '14-03-2028', 1, 'Sello', 'LULJ7310256D9'),
(265, '26-02-2028', 1, 'Firma', 'SPT160322HM3 / TUMG660906B76'),
(266, '06-06-2024', 1, 'Sello', 'SPT160322HM3 / TUMG660906B76'),
(267, '27-07-2024', 1, 'Firma', 'AGR1608015Z1 / GARR670124610'),
(268, '03-08-2024', 1, 'Sello', 'AGR1608015Z1 / GARR670124610'),
(269, '22-12-2026', 1, 'Firma', 'PSM020129J30 / PIRG6611251W7'),
(270, '14-08-2024', 1, 'Sello', 'PSM020129J30 / PIRG6611251W7'),
(271, '23-09-2024', 1, 'Firma', 'TOGG541013BH5'),
(272, '01-10-2024', 1, 'Sello', 'TOGG541013BH5'),
(273, '13-10-2024', 1, 'Firma', 'GOQO640528SS6'),
(274, '13-10-2024', 1, 'Sello', 'GOQO640528SS6'),
(275, '20-01-2027', 1, 'Firma', 'VAAA670925NR2'),
(276, '05-01-2025', 1, 'Sello', 'VAAA670925NR2'),
(277, '22-12-2026', 1, 'Firma', 'GARI690911PD2'),
(278, '07-01-2025', 1, 'Sello', 'GARI690911PD2'),
(279, '25-01-2025', 1, 'Firma', 'TIN130201J19 / CEGJ711126GT8'),
(280, '25-01-2025', 1, 'Sello', 'TIN130201J19 / CEGJ711126GT8'),
(281, '18-09-2024', 1, 'Firma', 'VIM200811170 / VIGH740428722'),
(282, '28-05-2025', 1, 'Sello', 'VIM200811170 / VIGH740428722'),
(283, '11-08-2025', 1, 'Firma', 'MISR680818439'),
(284, '01-09-2025', 1, 'Sello', 'MISR680818439'),
(287, '20-01-2027', 1, 'Firma', 'LUPM690528L4A'),
(288, '18-10-2025', 1, 'Sello', 'LUPM690528L4A'),
(289, '26-02-2028', 1, 'Firma', 'VAPS610823P25'),
(290, '18-10-2025', 1, 'Sello', 'VAPS610823P25'),
(291, '14-01-2027', 1, 'Firma', 'BERR731102B3A'),
(292, '26-10-2025', 1, 'Sello', 'BERR731102B3A'),
(293, '20-01-2027', 1, 'Firma', 'MASM670306EA7'),
(294, '27-10-2025', 1, 'Sello', 'MASM670306EA7'),
(295, '20-01-2027', 1, 'Firma', 'MEHR790217T91'),
(296, '27-10-2025', 1, 'Sello', 'MEHR790217T91'),
(297, '23-09-2024', 1, 'Firma', 'AARL360910MHA'),
(298, '29-10-2025', 1, 'Sello', 'AARL360910MHA'),
(299, '20-01-2027', 1, 'Firma', 'OIOG520111S48'),
(300, '29-10-2025', 1, 'Sello', 'OIOG520111S48'),
(301, '08-03-2026', 1, 'Firma', 'PETJ570812IL3'),
(302, '29-10-2025', 1, 'Sello', 'PETJ570812IL3'),
(303, '01-12-2024', 1, 'Firma', 'SUDC780517938'),
(304, '11-11-2025', 1, 'Sello', 'SUDC780517938'),
(305, '26-02-2028', 1, 'Firma', 'TUMG660906B76'),
(306, '16-11-2025', 1, 'Sello', 'TUMG660906B76'),
(307, '07-10-2025', 1, 'Firma', 'VEGP500629JB6'),
(308, '09-12-2025', 1, 'Sello', 'VEGP500629JB6'),
(309, '20-01-2027', 1, 'Firma', 'JUGH620427CL2'),
(310, '23-12-2025', 1, 'Sello', 'JUGH620427CL2'),
(311, '18-01-2026', 1, 'Firma', 'UGA180102LC6 / PETJ570812IL3'),
(312, '24-01-2026', 1, 'Sello', 'UGA180102LC6 / PETJ570812IL3'),
(313, '08-03-2026', 1, 'Firma', 'FVN140825DY3 / GOVJ801206B79'),
(314, '08-03-2026', 1, 'Sello', 'FVN140825DY3 / GOVJ801206B79'),
(315, '08-03-2026', 1, 'Firma', 'RAVO8611265P0'),
(316, '15-03-2026', 1, 'Sello', 'RAVO8611265P0'),
(317, '07-03-2026', 1, 'Firma', 'OIOE650814534'),
(318, '18-04-2026', 1, 'Sello', 'OIOE650814534'),
(319, '09-04-2026', 1, 'Firma', 'CAMB640710Q3A'),
(320, '18-04-2026', 1, 'Sello', 'CAMB640710Q3A'),
(321, '08-01-2025', 1, 'Firma', 'GAVV9205275K1'),
(322, '18-04-2026', 1, 'Sello', 'GAVV9205275K1'),
(323, '07-03-2026', 1, 'Firma', 'CETA560102GI1'),
(324, '11-05-2026', 1, 'Sello', 'CETA560102GI1'),
(325, '10-05-2026', 1, 'Firma', 'FHE210327IS6 / SASG680608MH3'),
(326, '11-05-2026', 1, 'Sello', 'FHE210327IS6 / SASG680608MH3'),
(327, '07-10-2025', 1, 'Firma', 'GADS700930JJ2'),
(328, '25-05-2026', 1, 'Sello', 'GADS700930JJ2'),
(329, '07-05-2025', 1, 'Firma', 'SIN130708159 / BERR731102B3A'),
(330, '08-06-2026', 1, 'Sello', 'SIN130708159 / BERR731102B3A'),
(331, '08-03-2026', 1, 'Firma', 'RUPL720118336'),
(332, '23-08-2026', 1, 'Sello', 'RUPL720118336'),
(333, '09-03-2026', 1, 'Firma', 'SMA140901DHA / PEFF760124NQ2'),
(334, '23-08-2026', 1, 'Sello', 'SMA140901DHA / PEFF760124NQ2'),
(335, '23-09-2026', 1, 'Firma', 'CFM1810265L7 / RIPM790501PL0'),
(336, '23-09-2026', 1, 'Sello', 'CFM1810265L7 / RIPM790501PL0'),
(337, '03-06-2026', 1, 'Firma', 'TNL180426T98 / LONG830512JM6'),
(338, '07-11-2026', 1, 'Sello', 'TNL180426T98 / LONG830512JM6'),
(339, '22-01-2028', 1, 'Firma', 'PELJ8205095G5'),
(340, '22-12-2026', 1, 'Sello', 'PELJ8205095G5'),
(341, '01-07-2025', 1, 'Firma', 'HEVN7310151Z1'),
(342, '18-01-2027', 1, 'Sello', 'HEVN7310151Z1'),
(343, '20-01-2027', 1, 'Firma', 'MISR710508V95'),
(344, '18-01-2027', 1, 'Sello', 'MISR710508V95'),
(345, '08-10-2026', 1, 'Firma', 'GOPL6010023I4'),
(346, '18-01-2027', 1, 'Sello', 'GOPL6010023I4'),
(347, '10-02-2025', 1, 'Firma', 'YSO180903RM1 / HEZY8010134U4'),
(348, '18-01-2027', 1, 'Sello', 'YSO180903RM1 / HEZY8010134U4'),
(349, '24-06-2025', 1, 'Firma', 'VICE630428AG1'),
(350, '18-01-2027', 1, 'Sello', 'VICE630428AG1'),
(351, '08-08-2027', 1, 'Firma', 'HIM150911EN6 / HICA7710233U3'),
(352, '18-01-2027', 1, 'Sello', 'HIM150911EN6 / HICA7710233U3'),
(353, '12-09-2024', 1, 'Firma', 'CID0809082M2 / RAIR8812024M7'),
(354, '20-01-2027', 1, 'Sello', 'CID0809082M2 / RAIR8812024M7'),
(355, '06-12-2026', 1, 'Firma', 'GGC140911QH0 / GOPL6010023I4'),
(356, '13-02-2027', 1, 'Sello', 'GGC140911QH0 / GOPL6010023I4'),
(357, '06-04-2026', 1, 'Firma', 'GAVM9602139M4'),
(358, '01-03-2027', 1, 'Sello', 'GAVM9602139M4'),
(359, '25-01-2025', 1, 'Firma', 'TAN000725BF4 / CEGJ711126GT8'),
(360, '26-06-2027', 1, 'Sello', 'TAN000725BF4 / CEGJ711126GT8'),
(361, '30-05-2027', 1, 'Firma', 'LTR2305161L7 / GOGJ0307023N9'),
(362, '28-08-2027', 1, 'Sello', 'LTR2305161L7 / GOGJ0307023N9'),
(363, '28-07-2027', 1, 'Firma', 'VIAE010118FS9'),
(364, '19-12-2027', 1, 'Sello', 'VIAE010118FS9'),
(367, '17-02-2025', 1, 'Firma', 'AAHM510802NV3'),
(368, '10-09-2025', 1, 'Sello', 'AAHM510802NV3'),
(369, '22-12-2027', 1, 'Firma', 'RORD941107EV2'),
(370, '03-01-2028', 1, 'Sello', 'RORD941107EV2'),
(371, '05-11-2025', 1, 'Firma', 'PIRG6611251W7'),
(372, '18-01-2028', 1, 'Sello', 'PIRG6611251W7'),
(375, '17-02-2027', 1, 'Firma', 'NAGF6211245E5'),
(376, '18-01-2028', 1, 'Sello', 'NAGF6211245E5'),
(377, '19-01-2027', 1, 'Firma', 'FOSG6603291Q2'),
(378, '01-12-2027', 1, 'Firma', 'CLI1609029T1 / MEHI840917U73'),
(379, '05-08-2026', 1, 'Firma', 'GAAK920229MS7'),
(380, '18-01-2028', 1, 'Firma', 'GOVJ720103SD5'),
(381, '18-10-2025', 1, 'Sello', 'GOVJ720103SD5'),
(382, '30-11-2027', 1, 'Firma', 'ILO150227EE6 / MEHI840917U73'),
(383, '21-06-2027', 1, 'Firma', 'MIC220720MZ0 / OEOC8512135B5'),
(384, '07-11-2027', 1, 'Firma', 'MAM231024QU5 / RUPL720118336'),
(386, '23-08-2026', 1, 'A', 'SLM080103EF7 / TOHJ621114RI7'),
(387, '18-01-2027', 1, 'Sello', 'VAG1510212R9 / VICJ710309QZ0'),
(388, '09-02-2028', 1, 'Sello', 'FOSG6603291Q2'),
(389, '14-03-2028', 1, 'Sello', 'GAAK920229MS7'),
(390, '14-03-2028', 1, 'Sello', 'ILO150227EE6 / MEHI840917U73'),
(391, '25-01-2028', 1, 'Sello', 'MAM231024QU5 / RUPL720118336'),
(392, '15-03-2028', 1, 'Sello', 'MIC220720MZ0 / OEOC8512135B5'),
(393, '14-11-2027', 1, 'Firma', 'TEL200818E54'),
(394, '15-03-2028', 1, 'Sello', 'SLM080103EF7 / TOHJ621114RI7'),
(395, '12-08-2026', 1, 'Firma', 'VEMF981204UC3'),
(396, '15-03-2028', 1, 'Sello', 'VEMF981204UC3'),
(397, '14-07-2025', 1, 'Firma', 'AABH950725A81'),
(398, '13-09-2025', 1, 'Sello', 'AABH950725A81'),
(401, '02-04-2028', 1, 'Firma', 'GARR670124610'),
(402, '', 0, 'Sello', 'GARR670124610'),
(403, '12-04-2028', 1, 'Firma', 'AUAL681215QN0'),
(404, '', 0, 'Sello', 'AUAL681215QN0'),
(405, '06-07-2026', 1, 'Firma', 'AUAG870930KL7'),
(406, '', 0, 'Sello', 'AUAG870930KL7'),
(407, '06-04-2026', 1, 'Firma', 'AEMF660801HA9'),
(408, '', 0, 'Sello', 'AEMF660801HA9'),
(409, '29-06-2027', 1, 'Firma', 'AAGJ650723MY3'),
(410, '', 0, 'Sello', 'AAGJ650723MY3'),
(411, '18-08-2025', 1, 'Firma', 'AAMJ661225QT5'),
(412, '', 0, 'Sello', 'AAMJ661225QT5'),
(413, '29-02-2028', 1, 'Firma', 'AAML650712PKA'),
(414, '', 0, 'Sello', 'AAML650712PKA'),
(415, '29-06-2027', 1, 'Firma', 'AARL741213E21'),
(416, '29-06-2027', 1, 'Sello', 'AARL741213E21'),
(417, '19-02-2028', 1, 'Firma', 'CAPH620613JZ6'),
(418, '', 0, 'Sello', 'CAPH620613JZ6'),
(419, '28-03-2028', 1, 'Firma', 'CARM8201081A4'),
(420, '', 0, 'Sello', 'CARM8201081A4'),
(421, '12-10-2026', 1, 'Firma', 'CALC760910NS0'),
(422, '', 0, 'Sello', 'CALC760910NS0'),
(423, '20-04-2027', 1, 'Firma', 'CANJ510413S96'),
(424, '', 0, 'Sello', 'CANJ510413S96'),
(425, '10-10-2026', 1, 'Firma', 'CAPM760107H87'),
(426, '', 0, 'Sello', 'CAPM760107H87'),
(427, '15-08-2027', 1, 'Firma', 'CAIV840508FZ1'),
(428, '', 0, 'Sello', 'CAIV840508FZ1'),
(429, '30-03-2026', 1, 'Firma', 'CTL1404112GA / AIIM8801012AA'),
(430, '17-01-2027', 1, 'Sello', 'CTL1404112GA / AIIM8801012AA'),
(431, '02-04-2028', 1, 'Firma', 'EICA840429JC6'),
(432, '', 0, 'Sello', 'EICA840429JC6'),
(433, '03-04-2028', 1, 'Firma', 'GALM730211HG9'),
(434, '', 0, 'Sello', 'GALM730211HG9'),
(435, '21-08-2027', 1, 'Firma', 'GALN711210K29'),
(436, '', 0, 'Sello', 'GALN711210K29'),
(437, '25-01-2027', 1, 'Firma', 'GAOR960912JW8'),
(438, '', 0, 'Sello', 'GAOR960912JW8'),
(439, '02-04-2028', 1, 'Firma', 'GASI900520K63'),
(440, '', 0, 'Sello', 'GASI900520K63'),
(441, '10-06-2026', 1, 'Firma', 'GOGL750104FQ4'),
(442, '', 0, 'Sello', 'GOGL750104FQ4'),
(443, '16-05-2027', 1, 'Firma', 'GOGJ0307023N9'),
(444, '', 0, 'Sello', 'GOGJ0307023N9'),
(445, '14-07-2027', 1, 'Firma', 'GOLD0206054N2'),
(446, '', 0, 'Sello', 'GOLD0206054N2'),
(447, '16-03-2027', 1, 'Firma', 'GOLM0003247T5'),
(448, '', 0, 'Sello', 'GOLM0003247T5'),
(449, '23-07-2024', 1, 'Firma', 'GOLP050419SR7 / GOVJ720103SD5'),
(450, '', 0, 'Sello', 'GOLP050419SR7 / GOVJ720103SD5'),
(451, '04-10-2026', 1, 'Firma', 'GOMM671021TS5'),
(452, '', 0, 'Sello', 'GOMM671021TS5'),
(453, '13-02-2028', 1, 'Firma', 'GACC690610B44'),
(454, '', 0, 'Sello', 'GACC690610B44'),
(455, '08-02-2026', 1, 'Firma', 'GUGG550417BJ4'),
(456, '', 0, 'Sello', 'GUGG550417BJ4'),
(457, '24-04-2027', 1, 'Firma', 'GUVC590411DB2'),
(458, '', 0, 'Sello', 'GUVC590411DB2'),
(459, '31-05-2025', 1, 'Firma', 'HEGO580811U12'),
(460, '', 0, 'Sello', 'HEGO580811U12'),
(461, '30-04-2028', 1, 'Firma', 'EEUY520823PP7'),
(462, '', 0, 'Sello', 'EEUY520823PP7'),
(463, '22-04-2028', 1, 'Firma', 'GODJ620719N8A'),
(464, '', 0, 'Sello', 'GODJ620719N8A'),
(465, '20-01-2025', 1, 'Firma', 'GOGV730103PB1'),
(466, '', 0, 'Sello', 'GOGV730103PB1'),
(467, '27-07-2027', 1, 'Firma', 'AUHN931014TT8'),
(468, '18-01-2028', 1, 'Sello', 'AUHN931014TT8'),
(469, '28-03-2028', 1, 'Firma', 'JUVP9408261NA'),
(470, '', 0, 'Sello', 'JUVP9408261NA'),
(471, '16-11-2027', 1, 'Firma', 'MOLT380115TU6'),
(472, '', 0, 'Sello', 'MOLT380115TU6'),
(473, '08-03-2028', 1, 'Firma', 'MUUS010129MP7'),
(474, '21-03-2028', 1, 'Sello', 'MUUS010129MP7'),
(475, '29-02-2028', 1, 'Firma', 'SAFJ940722G56'),
(476, '', 0, 'Sello', 'SAFJ940722G56'),
(477, '30-11-2027', 1, 'Firma', 'VELL560901P86'),
(478, '05-12-2027', 1, 'Sello', 'VELL560901P86');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clave_ciec`
--

CREATE TABLE `clave_ciec` (
  `id` int(11) NOT NULL,
  `contrasenia` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `clave_ciec`
--

INSERT INTO `clave_ciec` (`id`, `contrasenia`) VALUES
(1, 'Conta090'),
(2, 'Matias73'),
(3, 'Conta123'),
(4, 'GAPG9107'),
(5, 'coco3009'),
(6, '01Camilo'),
(7, 'ALFONSO7'),
(8, 'BERE9503'),
(9, 'Fco47149'),
(10, 'A1beto94'),
(11, 'veronica'),
(12, 'LERO7705'),
(13, 'JAVIER83'),
(14, 'G8P9A3E4'),
(15, 'Negro861'),
(16, 'AALF6708'),
(17, 'Resend57'),
(18, 'aacp7009'),
(19, 'Abeltran'),
(20, 'Kvnrdz96'),
(21, 'CORL9601'),
(22, 'JAVIER10'),
(23, 'REGR7112'),
(24, 'RORA9802'),
(25, '20042009'),
(26, 'TOLA7302'),
(27, 'cufr6503'),
(28, 'Heag8421'),
(29, 'HEZY8010'),
(30, 'SLIJ6086'),
(31, 'aleciram'),
(32, 'moge7308'),
(33, 'Valeria1'),
(34, 'VIAG1871'),
(35, 'aracely7'),
(36, 'NAMOUR01'),
(37, '1962FONG'),
(38, 'Riel0308'),
(39, '12345ABC'),
(40, 'leva8903'),
(41, 'MACJ8612'),
(42, '25HE705a'),
(43, 'camaleon'),
(44, 'MOCJ7411'),
(45, 'AABH9507'),
(46, '4605Mode'),
(47, 'LOGCOM19'),
(48, 'jigp3614'),
(49, 'GGC14091'),
(50, 'HICA1977'),
(51, 'LOGIRM17'),
(52, 'Jupiter7'),
(53, 'abp3179a'),
(54, 'RO261486'),
(55, 'SPT16032'),
(56, 'vaaa6709'),
(57, 'Conta109');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `rfc` varchar(80) NOT NULL,
  `nombre` varchar(80) DEFAULT NULL,
  `grupo_clientes` char(1) DEFAULT NULL,
  `id_clave_ciec` int(11) DEFAULT NULL,
  `clave_regimen` int(11) DEFAULT NULL,
  `nombre_por_apellidos` varchar(90) NOT NULL,
  `calle` varchar(100) NOT NULL,
  `numero` varchar(8) NOT NULL,
  `colonia` varchar(100) NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `codigoPostal` varchar(7) NOT NULL,
  `timbraNominas` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`rfc`, `nombre`, `grupo_clientes`, `id_clave_ciec`, `clave_regimen`, `nombre_por_apellidos`, `calle`, `numero`, `colonia`, `municipio`, `estado`, `codigoPostal`, `timbraNominas`) VALUES
('AABH950725A81', 'HECTOR ELIUD ALVAREZ BERMUDEZ', 'A', NULL, NULL, 'ALVAREZ BERMUDEZ HECTOR ELIUD', '', '', '', '', '', '', 0),
('AACP7009254V4', 'PEDRO ALFARO CEDILLO', 'B', 18, 621, 'ALFARO CEDILLO PEDRO', 'PERÚ', '4505', 'MATAMOROS', 'NUEVO LAREDO', 'TAMAULIPAS', '88210', 0),
('AACS681023H34', 'SERVANDO ALFARO CEDILLO', 'B', 1, 612, 'ALFARO CEDILLO SERVANDO', 'AVENIDA OCAMPO', '1919', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('AAGJ650723MY3', 'JUANA ELSA ALVARADO GUIZAR', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AAHM510802NV3', 'MARINA AMPARAN HOLGUIN', 'C', NULL, NULL, 'AMPARAN HOLGUIN MARINA', '', '', '', '', '', '', 0),
('AALF6708197T2', 'FERNANDO JAVIER AMADOR DE LA LLAVE', 'B', 16, 626, 'AMADOR DE LA LLAVE FERNANDO JAVIER', 'SAN LUIS POTOSI', '1050', 'LOS ÁLAMOS', 'NUEVO LAREDO', 'TAMAULIPAS', '88270', 1),
('AAMJ661225QT5', 'JOSE DE JESUS ALVARADO MORALES', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AAML650712PKA', 'JOSE LUIS ALVARADO MORALES', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AAML660130QQ8', 'LUZ MARIA DE MONSERRAT ARAUJO MENDOZA', 'C', NULL, 612, 'ARAUJO MENDOZA LUZ MARIA DE MONSERRAT', 'AVENIDA 20 DE NOVIEMBRE', '2106', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('AARL360910MHA', 'JOSE LUIS ALVARADO DE LA ROSA', 'A', 1, 612, 'ALVARADO DE LA ROSA JOSE LUIS', 'HIDALGO', '3004', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('AARL741213E21', 'LUIS EDUARDO ALVARADO REYES', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AARL810403AG0', 'LAURA YOLANDA ALVARADO REYES', 'B', 1, 612, 'ALVARADO REYES LAURA YOLANDA', '', '', '', '', '', '', 0),
('AEMA721001QZ8', 'ANA GUADALUPE ARTEAGA MENDEZ', 'B', 1, 626, 'ARTEAGA MENDEZ ANA GUADALUPE', 'HIDALGO', '5550', 'ROMA', 'NUEVO LAREDO', 'TAMAULIPAS', '88150', 1),
('AEMF660801HA9', 'FERNANDO ALEMAN MARROQUIN', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AGR1608015Z1 / GARR670124610', 'ASESORIA GARCIA REYES Y ASOCIADOS SC', 'A', 2, 626, 'ASESORIA GARCIA REYES Y ASOCIADOS', '', '', '', '', '', '', 0),
('AILR690920GEA', 'ROBERTO CARLOS ANIMAS LUIS', 'C', 2, 626, 'ANIMAS LUIS ROBERTO CARLOS', 'TAMAULIPAS', '440', 'ENRIQUE CÁRDENAS GONZÁLEZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88295', 1),
('AUAG870930KL7', 'JOSE GUADALUPE AGUIÑAGA ABUNDIZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AUAL681215QN0', 'LUCIO AGUILAR AMAYA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('AUHN931014TT8', 'NANCY VERONICA AGUILERA HERNANDEZ', 'C', NULL, NULL, '', '', '', '', '', '', '', 0),
('BAAM881214NV0', 'MARCO ANTONIO BALCAZAR ALATORRE', 'B', 1, 612, 'BALCAZAR ALATORRE MARCO ANTONIO', 'RIO FUERTE', '4546', 'RIO BRAVO', 'NUEVO LAREDO', 'TAMAULIPAS', '88274', 0),
('BADA750123QT3', 'ALEJANDRO BLANCO DIEGO', 'B', 2, 612, 'BLANCO DIEGO ALEJANDRO', 'COCIJO', '813', 'GUERREROS DEL SOL', 'NUEVO LAREDO', 'TAMAULIPAS', '88123', 1),
('BAGA680128QQ7', 'ABIEL EDGARDO BARRIENTOS GONZALEZ', 'B', 1, 626, 'BARRIENTOS GONZALEZ ABIEL EDGARDO', '', '', '', '', '', '', 0),
('BEAH790324124', 'HECTOR MANUEL BELTRAN AVALOS', 'C', 2, 612, 'BELTRAN AVALOS HECTOR MANUEL', 'CALLE TAMAULIPAS', '3325', 'JUAREZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88209', 1),
('BEPA800824TH1', 'ALEJANDRO BELTRAN PEÑA', 'B', 19, 621, 'BELTRAN PEÑA ALEJANDRO', 'GUTIERREZ', '8901', 'LA SANDIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88179', 1),
('BERR731102B3A', 'ROSA IDALIA BERMUDEZ ROJO', 'A', 1, 612, 'BERMUDEZ ROJO ROSA IDALIA', 'PALMERA', '5523', 'EL NOGAL', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 0),
('CACC920926CBA', 'CRISTIAN MICHEL CASTILLO CASTAÑEDA', 'B', 1, 621, 'CASTILLO CASTAÑEDA CRISTIAN MICHEL', '', '', '', '', '', '', 0),
('CACV790702UQ7', 'VERONICA CHAVEZ CASTILLO', 'B', 11, 612, 'CHAVEZ CASTILLO VERONICA', '', '', '', '', '', '', 0),
('CAGN910225PQ1', 'NYDIA NALLELY CASTILLO GUERRA', 'C', 1, 626, 'CASTILLO GUERRA NYDIA NALLELY', 'TAMAULIPAS', '1507', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('CAIV840508FZ1', 'VICTOR MANUEL CASTRO IRIGOYEN', 'B', NULL, NULL, 'CASTRO IRIGOYEN VICTOR MANUEL', 'ISABEL MUZQUIZ', '03', 'INFONAVIT', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('CAJK890628QG3', 'KARLA MARIA CHAVEZ JUAREZ', 'B', 2, 621, 'CHAVEZ JUAREZ KARLA MARIA', 'GUTIERREZ', '5203', 'HIDALGO', 'NUEVO LAREDO', 'TAMAULIPAS', '88160', 1),
('CALC760910NS0', 'CESAR CARBALLO LEYVA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('CAMA570128VD2', 'AURORA CHAVARRIA MARTINEZ', 'B', 1, 626, 'CHAVARRIA MARTINEZ AURORA', 'CALLE NUEVO LEON', '6313', 'HIPÓDROMO', 'NUEVO LAREDO', 'TAMAULIPAS', '88170', 1),
('CAMB640710Q3A', 'BEATRIZ CARDENAS MEDELLIN', 'A', 1, 612, 'CARDENAS MEDELLIN BEATRIZ', '', '', '', '', '', '', 0),
('CAMD671112970', 'DAVID CARRILLO MEDINA', 'C', 1, 612, 'CARRILLO MEDINA DAVID', '', '', '', '', '', '', 0),
('CANJ510413S96', 'JESUS LAURO CARDOZA NAJERA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('CAOA891113ICA', 'ARACELY ELIZABETH CASTILLO OJEDA', 'C', 35, 626, 'CASTILLO OJEDA ARACELY ELIZABETH', 'CUENCA DE BURGOS', '10613', 'NUEVA VICTORIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88177', 1),
('CAPH620613JZ6', 'HECTOR MANUEL CABALLERO PEREZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('CAPM760107H87', 'MONICA CARIELO PEREZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('CARK9608196C1', 'KEVIN CANDIA RODRIGUEZ', 'B', 20, 621, 'CANDIA RODRIGUEZ KEVIN', '', '', '', '', '', '', 0),
('CARM8201081A4', 'MAGALY CABECERA REYES', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('CEGA7101022E7', 'JOSE ANTONIO CERRILLO GARZA', 'C', 1, 626, 'CERRILLO GARZA JOSE ANTONIO', 'VENUSTIANO CARRANZA', '3524', 'JUAREZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88209', 1),
('CETA560102GI1', 'ANGELICA CERVANTES TELLO', 'A', 1, 606, 'CERVANTES TELLO ANGELICA', '', '', '', '', '', '', 0),
('CFM1810265L7 / RIPM790501PL0', 'CBI FREIGHT MEXICO SA DE CV', 'A', 46, 601, 'CBI FREIGHT MEXICO, S.A DE C.V', '', '', '', '', '', '', 0),
('CID0809082M2 / RAIR8812024M7', 'COMERCIALIZADORA INTERNACIONAL LOS DOS LAREDOS SA DE CV', 'A', 1, 601, 'COM. INT\'L LOS DOS LAREDOS, S.A', '', '', '', '', '', '', 0),
('CLI1609029T1 / MEHI840917U73', 'COMERCIALIZADORA Y  LOGISTICA I & R.M.H. SA DE CV', 'A', 47, 601, 'COMER Y LOGISTICS I & R.M.H., SA CV', '', '', '', '', '', '', 0),
('COLC621201MG3', 'CECILIO CONTRERAS LOMAS', 'B', 10, 612, 'CONTRERAS LOMAS CECILIO', 'AV. FRANCISCO VILLA NORTE', '601', 'DEL MAESTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88110', 1),
('COMM860523DK8', 'MIGUEL MARTIN CORONADO MATA', 'B', 2, 612, 'CORONADO MATA MIGUEL MARTIN', '', '', '', '', '', '', 0),
('CORL960305MC1', 'LIZETH CORTINAS RUIZ', 'B', 21, 621, 'CORTINAS RUIZ LIZETH', '', '', '', '', '', '', 0),
('CTL1404112GA / AIIM8801012AA', 'CIPREX TRANSPORTES Y LOGISTICA SA DE CV', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('CUFR650302HB0', 'ROSENDO DE LA CRUZ FAUSTINO', 'C', 27, 612, 'DE LA CRUZ FAUSTINO ROSENDO', 'ING. ROLANDO MONTANTE', '9905', 'INDEPENDENCIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88020', 1),
('CULL8203277V1', 'MARIA DE LOURDES DE LA CRUZ LOPEZ', 'C', 2, 621, 'DE LA CRUZ LOPEZ MARIA DE LOURDES', 'BOULEVARD SAN MIGUEL', '319', 'VILLAS DE SAN MIGUEL', 'NUEVO LAREDO', 'TAMAULIPAS', '88283', 1),
('CUME820212LX1', 'EULALIO DE LA CRUZ MARTINEZ', 'C', 2, 621, 'DE LA CRUZ MARTINEZ EULALIO', 'CASANDRA', '113', 'EJIDO EL PROGRESO', 'NUEVO LAREDO', 'TAMAULIPAS', '88123', 1),
('CURB950314LT3', 'BERENICE DE LA CRUZ RAMIREZ', 'B', 8, 612, 'DE LA CRUZ RAMIREZ BERENICE', 'HIDALGO', '3724', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('CURF841101HH7', 'FRANCISCO JAVIER CUETARA RAMIREZ', 'B', 22, 621, 'CUETARA RAMIREZ FRANCISCO JAVIER', 'AV. PERU', '3810', 'JUÁREZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88209', 1),
('EAHI800513LT2', 'IVAN VERCINGETORIGE ESTRADA HERRERA', 'B', 1, 626, 'ESTRADA HERRERA IVAN VERCINGETORIGE', 'LOMA REAL', '46-1', 'BENITO JUÁREZ FOVISSSTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88274', 1),
('EAHM8912139LA', 'MIGUEL AGUSTIN ESTRADA HERRERA', 'B', 1, 621, 'ESTRADA HERRERA MIGUEL AGUSTIN', 'PINO SUAREZ', '6521', 'MILITAR', 'NUEVO LAREDO', 'TAMAULIPAS', '88289', 1),
('EANI000723IW5', 'IVANNA ESTRADA NAVA', 'B', 1, 621, 'ESTRADA NAVA IVANNA ', 'PROLONGACIÓN MONTERREY', '5044', 'LOS ENCINOS', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 1),
('EEUY520823PP7', 'YARA ECHEVERRIA URRUTIA', 'A', NULL, NULL, '', '', '', '', '', '', '', 0),
('EICA540906SW8', 'ARMANDO ESPINOSA CASTILLO', 'C', 28, 612, 'ESPINOSA CASTILLO ARMANDO', '', '', '', '', '', '', 0),
('EICA840429JC6', 'ALMA DELIA ESPINOSA CAMPOS', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('EULA730319429', 'JOSE ALFREDO ESQUIVEL LARA', 'C', 1, 626, 'ESQUIVEL LARA JOSE ALFREDO', 'TAMPICO', '6315', 'LAS TORRES', 'NUEVO LAREDO', 'TAMAULIPAS', '88184', 1),
('FASG680805Q57', 'GONZALO PRISCILIANO FARIAS SALINAS', 'C', 2, 626, 'FARIAS SALINAS GONZALO PRISCILIANO', '', '', '', '', '', '', 0),
('FHE210327IS6 / SASG680608MH3', 'FLETES HUNTER EXPRESS DE MEXICO SA DE CV', 'A', 2, 601, 'FLETES HUNTER EXPRESS', '', '', '', '', '', '', 0),
('FICA710504SL2', 'ANA LAURA FIGUEROA CHAVEZ', 'C', NULL, 612, 'FIGUEROA CHAVEZ ANA LAURA', 'AV. MENDOZA', '1211', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('FOSG6603291Q2', 'GILBERTO FLORES SOLIS', 'C', 1, 626, 'FLORES SOLIS GILBERTO', '', '', '', '', '', '', 0),
('FUOP7809265F2', 'PABLO SERGIO FUENTES OCHOA', 'C', 2, 612, 'FUENTES OCHOA PABLO SERGIO', '', '', '', '', '', '', 0),
('FVN140825DY3 / GOVJ801206B79', 'FRUTAS Y VERDURAS DE NUEVO LAREDO SA DE CV', 'A', 1, 601, 'FRUTAS Y VERDURAS DE NVO LDO SA CV', 'LADO DE CHAPALA', '6180', 'FRACC. VILLAS DEL SOL', 'NUEVO LAREDO', 'TAMAULIPAS', '88250', 1),
('GAAE990131CE5', 'EZEQUIEL GARCIA ANTONIO', 'B', 2, 625, 'GARCIA ANTONIO EZEQUIEL', '', '', '', '', '', '', 0),
('GAAK920229MS7', 'KAREN GALVAN ALCORTA', 'A', 2, 612, 'GALVAN ALCORTA KAREN', '', '', '', '', '', '', 0),
('GACC690610B44', 'CRUZ GREGORIO GRAJEDA CASTRO', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GADS700930JJ2', 'MARIA DEL SOCORRO GALLEGOS DELGADILLO', 'A', 1, 626, '0.00 CLIENTES DINORAH/GALLEGOS DELGADILLO MARIA DEL SOCORRO', '', '', '', '', '', '', 0),
('GAGP7401258ZA', 'PABLO RENE GARCIA GARCIA', 'C', 39, 621, 'GARCIA GARCIA PABLO RENE', 'CALLE GASPAR DE SANDOVAL', '6603', 'LOS VIRREYES', 'NUEVO LAREDO', 'TAMAULIPAS', '88145', 1),
('GALC780921EG9', 'CYNTHIA JANETH GARCIA LOPEZ', 'B', 1, 621, 'GARCIA LOPEZ CYNTHIA JANETH', 'ZARAGOZA', '5515', 'HIPÓDROMO', 'NUEVO LAREDO', 'TAMAULIPAS', '88170', 1),
('GALM730211HG9', 'MANUELA LOURDES GARCIA LOPEZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GALN711210K29', 'NICOLASA GUADALUPE GARCIA LOPEZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GAMA750304UB2', 'MARIA ADRIANA GARCIA MUÑOZ', 'B', 2, 626, 'GARCIA MUÑOZ MARIA ADRIANA', 'AMÉRICA', '2921', 'SAN RAFAEL', 'NUEVO LAREDO', 'TAMAULIPAS', '88200', 1),
('GAMG811003JQ6', 'GRICELDA GARCIA MORENO', 'B', 2, 612, 'GARCIA MORENO GRICELDA', '', '', '', '', '', '', 0),
('GAOR960912JW8', 'RODRIGO FELIPE GARCIA ORTIZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GAPG910722CGA', 'GISELA ESMERALDA GALINDO PACHECO', 'B', 4, 612, 'GALINDO PACHECO GISELA ESMERALDA', 'MORALEÑOS', '14', 'MIER Y TERÁN', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('GAPJ810702LZ9', 'JULIO CESAR GAYTAN PALOMO', 'B', 2, 626, 'GAYTAN PALOMO JULIO CESAR', '', '', '', '', '', '', 0),
('GAPR600903EA2', 'ROSALVA GAYTAN PALOMO', 'C', 2, 612, 'GAYTAN PALOMO ROSALVA', '', '', '', '', '', '', 0),
('GARI690911PD2', 'ISIS LISSETT GARCIA RODRIGUEZ', 'A', 1, 612, 'GARCIA RODRIGUEZ ISIS LISSETT', '', '', '', '', '', '', 0),
('GARR670124610', 'RAMON GARCIA REYES', 'S', NULL, NULL, 'GARCIA REYES RAMON', '', '', '', '', '', '', 0),
('GASI900520K63', 'ISAAC GARZA SAUCEDO', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GAVM9602139M4', 'MARIANA DEL PILAR GARZA VILA', 'A', 2, 626, 'GARZA VILA MARIANA DEL PILAR', '', '', '', '', '', '', 0),
('GAVV9205275K1', 'VALERIA ALEJANDRA GARZA VILA', 'A', 2, 612, 'GARZA VILA VALERIA ALEJANDRA', '', '', '', '', '', '', 0),
('GAZP710922LW9', 'PATSY ELIZABETH GARCIA ZARATE', 'B', 1, 612, 'GARCIA ZARATE PATSY ELIZABETH', '', '', '', '', '', '', 0),
('GGC140911QH0 / GOPL6010023I4', 'GP GROUP COMERCIALIZADORA ADUANAL S DE RL DE CV', 'A', 49, 601, 'GP GROUP COMERCIALIZADORA ADUANAL', '', '', '', '', '', '', 0),
('GIGJ910605EF5', 'JUAN ANTONIO GIL GONZALEZ', 'B', 2, 612, 'GIL GONZALEZ JUAN ANTONIO', 'PRIVADA APACHES', '27', 'MIER Y TERÁN', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('GODJ620719N8A', 'JAVIER HUGO GONZALEZ DIAZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOGJ0307023N9', 'JAVIER ALDAHIR GONZALEZ GONZALEZ', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOGL500403I21', 'MA. DE LA LUZ GOMEZ GUZMAN', 'C', 2, 612, 'GOMEZ GUZMAN MA DE LA LUZ', 'ALDAMA', '1729', 'JUÁREZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88209', 1),
('GOGL750104FQ4', 'LUZ MARIA GONZALEZ GARCIA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOGV730103PB1', 'VERONICA GENOVEVA GONZALEZ GUERRA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOGX951111C90', 'XITLALY XOCHITHQUETZALY GONZALEZ GONZALEZ', 'B', 1, 621, 'GONZALEZ GONZALEZ XITLALY XOCHITHQUETZALY', 'CAMPECHE', '1518', 'MADERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88270', 1),
('GOLD0206054N2', 'DIEGO GONZALEZ LUEVANO', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOLM0003247T5', 'MARIANA GONZALEZ LUEVANO', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOLP050419SR7 / GOVJ720103SD5', 'PAOLA GONZALEZ LUEVANO', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOMM671021TS5', 'MARILINDA GONZALEZ MATA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GOPL6010023I4', 'JOSE LUIS GOMEZ PEÑA', 'A', 48, 612, 'GOMEZ PEÑA JOSE LUIS', 'ARTEAGA', '3547', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('GOQO640528SS6', 'OSCAR MANUEL GOMEZ QUIÑONES', 'A', 1, 612, 'GOMEZ QUIÑONES OSCAR MANUEL', '', '', '', '', '', '', 0),
('GORD871122AP1', 'DANIEL GONZALEZ RODRIGUEZ', 'C', 1, 621, 'GONZALEZ RODRIGUEZ DANIEL', '', '', '', '', '', '', 0),
('GORJ0307296Z2', 'JUAN DAVID GONZALEZ RIOS', 'B', 2, 626, 'GONZALEZ RIOS JUAN DAVID', 'LAGO DE CHAPALA', '6180', 'FRACC. VILLAS DEL SOL', 'NUEVO LAREDO', 'TAMAULIPAS', '88250', 1),
('GOVJ720103SD5', 'JUAN ANTONIO GONZALEZ VAZQUEZ', 'A', 57, 612, 'GONZALEZ VAZQUEZ JUAN ANTONIO', '', '', '', '', '', '', 0),
('GOVJ801206B79', 'JUAN ISIDRO GONZALEZ VALDIVIA', 'B', 1, 612, 'GONZALEZ VALDIVIA JUAN ISIDRO', '', '', '', '', '', '', 0),
('GTR180424UVA / AULS641101TK9', 'GONZAGAR TRANSPORT SA DE CV', 'B', 2, 601, 'GONZAGAR TRANSPORT, S.A. DE C.V', '', '', '', '', '', '', 0),
('GUGG550417BJ4', 'GUSTAVO GUERRA GUERRA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('GUVC590411DB2', 'CARLOS ALBERTO GUERRERO VILLA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('HEGM870709D39', 'MAITE IRASEMA HERNANDEZ GUERRA', 'B', 2, 626, 'HERNANDEZ GUERRA MAITE IRASEMA', 'PERÚ', '3804', 'JUÁREZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88209', 1),
('HEGO580811U12', 'OSCAR JAVIER HERNANDEZ GARZA', 'S', NULL, NULL, '', '', '', '', '', '', '', 0),
('HEJC770402QX5', 'CANDELARIO HERNANDEZ JARAMILLO', 'B', 1, 612, 'HERNANDEZ JARAMILLO CANDELARIO', '', '', '', '', '', '', 0),
('HEPF560627D62', 'FERNANDO HERNANDEZ PINEDA', 'B', 2, 612, 'HERNANDEZ PINEDA FERNANDO', '', '', '', '', '', '', 0),
('HESI9105215E3', 'ISELA GUADALUPE HERNANDEZ SOLIS', 'B', 1, 626, 'HERNANDEZ SOLIS ISELA GUADALUPE', '', '', '', '', '', '', 0),
('HEVN7310151Z1', 'NOEL HERNANDEZ VALDIVIA', 'A', 1, 612, 'HERNANDEZ VALDIVIA NOEL', 'AMÉRICA', '2850', 'ANÁHUAC', 'NUEVO LAREDO', 'TAMAULIPAS', '88260', 1),
('HEZY8010134U4', 'YASSER EDUARDO HERNANDEZ ZAPATA', 'C', 29, 612, 'HERNANDEZ ZAPATA YASSER EDUARDO', 'CALLE ORQUÍDEA', '531', 'TULIPANES', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 1),
('HIM150911EN6 / HICA7710233U3', 'HICAVISE IMPORTACIONES SA DE CV', 'A', 50, 601, 'HICAVISE IMPORTACIONES SA DE CV', '', '', '', '', '', '', 0),
('IIDJ580220NM7', 'JUANA IPIÑA DUQUE', 'C', 1, 606, 'IPIÑA DUQUE JUANA', '', '', '', '', '', '', 0),
('ILO150227EE6 / MEHI840917U73', 'IRM LOGISTIC SA DE CV', 'A', 51, 601, 'IRM LOGISTIC SA DE CV', '', '', '', '', '', '', 0),
('IMP891113T43 / AAML660130QQ8', 'IMPLECSA SA DE CV', 'C', 1, 601, 'I M P L E C S A', '', '', '', '', '', '', 0),
('JACA861105KU6', 'JOSE ALEJANDRO JASSO DEL CARMEN', 'B', 15, 612, 'JASSO DEL CARMEN JOSE ALEJANDRO', 'ARTEAGA', '7327', 'BUENAVISTA', 'NUEVO LAREDO', 'TAMAULIPAS', '88120', 1),
('JAPM6106198R8', 'JOSE MARCELINO JASSO PIÑEIRO', 'C', 1, 626, 'JASSO PIÑEIRO JOSE MARCELINO', 'ARTEAGA', '7327', 'BUENAVISTA', 'NUEVO LAREDO', 'TAMAULIPAS', '88120', 1),
('JICS740304J15', 'SANDRA LUZ JIMENEZ DE LA CRUZ', 'C', 1, 626, 'JIMENEZ DE LA CRUZ SANDRA LUZ', 'CALLE MIAHUATLAN', '37', 'BENITO JUAREZ FOVISSSTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88274', 1),
('JILS680630H30', 'SANJUANA ADRIANA JIMENEZ LOPEZ', 'C', 30, 612, 'JIMENEZ LOPEZ SANJUANA ADRIANA', 'AVENIDA GUERRERO', '1812', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('JUGH620427CL2', 'HECTOR JUAN Y SEVA GARCIA', 'A', 1, 626, 'JUAN Y SEVA GARCIA HECTOR', 'PARICUTÍN', '2615', 'MADERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88270', 1),
('JUVP9408261NA', 'MARIA DE LA PAZ JUAREZ VAZQUEZ', 'B', NULL, 612, 'JUAREZ VAZQUEZ MARIA DE LA PAZ', 'BOULEVARD REA', '626', 'RESERVAS TERRITORIALES', 'NUEVO LAREDO', 'TAMAULIPAS', '88177', 1),
('LERO770515M12', 'OLGA CECILIA DE LEON REYES', 'B', 12, 612, 'DE LEON REYES OLGA CECILIA', 'CERRO DE LA ENCANTADA', '464', 'COLINAS DEL SUR PONIENTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88296', 1),
('LEVA890315TA9', 'ADRIANA LERMA VALDEZ', 'C', 40, 621, 'LERMA VALDEZ ADRIANA', 'AV. LERDO DE TEJADA', '2712', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('LOFC950118D57', 'CHRISTIAN LOPEZ FLORES', 'B', 2, 612, 'LOPEZ FLORES CHRISTIAN', '', '', '', '', '', '', 0),
('LOLJ7807076I9', 'JULIO CESAR LOPEZ LOZANO', 'B', 2, 612, 'LOPEZ LOZANO JULIO CESAR', 'INSURGENTES', '112', 'MIRADOR', 'NUEVO LAREDO', 'TAMAULIPAS', '88190', 1),
('LTR2305161L7 / GOGJ0307023N9', 'LOBOS TRA-MEX SA DE CV', 'A', 2, 601, 'LOBOS TRA-MEX SA DE CV', '', '', '', '', '', '', 0),
('LULJ7310256D9', 'JUPITER BENJAMIN LUJAN LOERA', 'A', 52, 612, 'LUJAN LOERA JUPITER BENJAMIN', '', '', '', '', '', '', 0),
('LUPM690528L4A', 'MARTHA PATRICIA LUEVANO PONCE', 'A', 1, 612, 'LUEVANO PONCE MARTHA PATRICIA', '', '', '', '', '', '', 0),
('MAAH800910L78', 'HAYDEE MARTINEZ AGUIRRE', 'C', 1, 626, 'MARTINEZ AGUIRRE HAYDEE', 'CANALES', '2710', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('MAAJ8409309A9', 'JOSE MARTINEZ AGUIRRE', 'C', 2, 612, 'MARTINEZ AGUIRRE JOSE', 'ARTEAGA', '7725', 'ALIANZA PARA LA PRODUCCIÓN', 'NUEVO LAREDO', 'TAMAULIPAS', '88124', 1),
('MACJ861206TF1', 'JONATHAN ALEXIS MARTINEZ CASTAÑEDA', 'C', 41, 621, 'MARTINEZ CASTAÑEDA JONATHAN ALEXIS', '', '', '', '', '', '', 0),
('MACS571002KN6', 'SOCORRO MACIAS CORONA', 'B', 5, 612, 'MACIAS CORONA SOCORRO', 'PEDRO PEREZ IBARRA', '94', 'INFONAVIT', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('MACS860916UI6', 'SONIA MARTINEZ CASTILLO', 'B', 1, 612, 'MARTINEZ CASTILLO SONIA', 'PERU', '4501', 'SAN RAFAEL', 'NUEVO LAREDO', 'TAMAULIPAS', '88200', 1),
('MAM231024QU5 / RUPL720118336', 'MISGIESA AUTOMATIZACION Y MAQUINADOS INDUSTRIALES SA DE CV', 'A', 2, 601, 'MISGIESA AUTOMATIZACION Y MAQUINADOS INDUSTRIALES', '', '', '', '', '', '', 0),
('MAMD8309238K9', 'DANIELA MARTINEZ MENDOZA', 'C', 2, 612, 'MARTINEZ MENDOZA DANIELA', 'NUEVO LEON', '1704', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('MAMF730614TR1', 'FERNANDO MARTINEZ MONTALVO', 'B', 1, 626, 'MARTINEZ MONTALVO FERNANDO', 'TAMAULIPAS', '1504', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('MAPM660315BV1', 'MARICELA MARTINEZ PUENTE', 'C', 31, 612, 'MARTINEZ PUENTE MARICELA', '', '', '', '', '', '', 0),
('MASM670306EA7', 'MANUEL ANTONIO MADRIGAL SERNA', 'A', 1, 612, 'MADRIGAL SERNA MANUEL ANTONIO', 'DOCTOR MIER', '8676', 'LA JOYA', 'NUEVO LAREDO', 'TAMAULIPAS', '88125', 1),
('MATE840101PN8', 'EMMANUEL MARQUEZ TAPIA', 'B', 6, 612, 'MARQUEZ TAPIA EMMANUEL', '', '', '', '', '', '', 0),
('MATR851022EY0', 'RENE JOSE MAYA TORRES', 'C', 2, 612, 'MAYA TORRES RENE JOSE', 'ESMERALDA', '25', 'BONANZA RESIDENCIAL', 'NUEVO LAREDO', 'TAMAULIPAS', '88276', 1),
('MEAF471114CY0', 'FRANCISCO MEDINA ALVEAR', 'B', 9, 612, 'MEDINA ALVEAR FRANCISCO', '5 DE MAYO', '2415', 'CAMPESTRE', 'NUEVO LAREDO', 'TAMAULIPAS', '88278', 1),
('MEDB7010241U1', 'BLANCA ESTELA MENCHACA DELGADO', 'C', 1, 626, 'MENCHACA DELGADO BLANCA ESTELA', 'PROLONGACIÓN GUERRERO', '4525', 'CAMPESTRE', 'NUEVO LAREDO', 'TAMAULIPAS', '88278', 1),
('MEDI7109046K3', 'ISAAC RAYMUNDO MENCHACA DELGADO', 'C', 1, 621, 'MENCHACA DELGADO ISAAC RAYMUNDO', 'AV. DEGOLLADO', '2209', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('MEHR790217T91', 'RAFAEL MELGAREJO HERRERA', 'A', 2, 601, 'MELGAREJO HERRERA RAFAEL', 'PERÚ', '1950', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('MERM671219NY7', 'MARTHA MENDEZ RODRIGUEZ', 'B', 1, 612, 'MENDEZ RODRIGUEZ MARTHA', '', '', '', '', '', '', 0),
('MIC220720MZ0 / OEOC8512135B5', 'MCA INTERNACIONAL CARRIERS SA DE CV', 'A', 1, 601, 'MCA INTERNATIONAL CARRIERS, S.A.C.V', '', '', '', '', '', '', 0),
('MISR680818439', 'RAFAEL MIRELES SALINAS', 'A', 2, 612, 'MIRELES SALINAS RAFAEL', '', '', '', '', '', '', 0),
('MISR710508V95', 'RAUL MIRELES SALINAS', 'A', 1, 612, 'MIRELES SALINAS RAUL', '', '', '', '', '', '', 0),
('MOAY740103IS5', 'YOANNA MONARREZ ALVAREZ', 'B', 3, 612, 'MONARREZ ALVAREZ YOANNA', 'PORFIRIO DÍAZ', '605', 'VICTORIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88030', 1),
('MOBI6512133R7', 'ISAAC MORENO Y BASTIAN', 'C', 1, 621, 'MORENO Y BASTIAN ISAAC', '', '', '', '', '', '', 0),
('MOEF770617AM3', 'FELIPE DE JESUS MOGUEL ECHEVERRIA', 'C', 1, 612, 'MOGUEL ECHEVERRIA FELIPE DE JESUS', 'PRIVADA SAUCE', '9', 'PRIVANZAS SECTOR ALAMEDA', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('MOGE730819R98', 'EDUARDO JESUS MONZON GUAJARDO', 'C', 32, 612, 'MONZON GUAJARDO EDUARDO JESUS', 'PRIVADA NUEVO LEÓN', '6124', 'VICTORIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88030', 1),
('MOLT380115TU6', 'MARIA TERESA MORALES LOERA', 'A', NULL, 606, 'MORALES LOERA MARIA TERESA', 'HIDALGO', '3425', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('MORY840706T62', 'YURIKO ANAHI MOLINA ROQUE', 'C', NULL, 626, 'MOLINA ROQUE YURIKO ANAHI', 'CHETUMAL', '406', 'FRACC. LOS FRESNOS', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 1),
('MUUS010129MP7', 'SAUL ALEJANDRO MUÑIZ UBALDO', 'C', NULL, NULL, 'MUÑIZ UBALDO SAUL', 'BAMBU', '5627', 'EL NOGAL', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 1),
('NAGE950106U78', 'ELIZABETH NAMOUR GONZALEZ', 'C', 36, 626, 'NAMOUR GONZALEZ ELIZABETH', '', '', '', '', '', '', 0),
('NAGF6211245E5', 'FLOR OFELIA NADAL GARCIA', 'C', NULL, NULL, 'NADAL GARCIA FLOR OFELIA', 'MATIAS GUERRA', '02', 'INFONAVIT', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('NIFJ7705258F8', 'JESUS EMMANUEL NIETO FLORES', 'C', 42, 621, 'NIETO FLORES JESUS EMMANUEL', 'YUCATÁN', '2108', 'MATAMOROS', 'NUEVO LAREDO', 'TAMAULIPAS', '88210', 1),
('OIGA630531SP6', 'MARIA DE LOS ANGELES ORTIZ GLORIA', 'A', 1, 612, 'ORTIZ GLORIA MARIA DE LOS ANGELES', '', '', '', '', '', '', 0),
('OINA761211I29', 'JOSE ALEJANDRO OVIEDO NAVA', 'B', 1, 621, 'OVIEDO NAVA JOSE ALEJANDRO', '', '', '', '', '', '', 0),
('OIOE650814534', 'EDITH ORTIZ OBREGON', 'A', 1, 612, 'ORTIZ OBREGON EDITH', '', '', '', '', '', '', 0),
('OIOG520111S48', 'JOSE GABRIEL ORTIZ OBREGON', 'A', 1, 621, 'ORTIZ OBREGON JOSE GABRIEL', '', '', '', '', '', '', 0),
('OIVI740617U52', 'ISMAEL ORTIZ VICENTE', 'C', 1, 612, 'ORTIZ VICENTE ISMAEL', '', '', '', '', '', '', 0),
('PATM660115N35', 'MARCO ANTONIO PACHECO TORRES', 'B', 2, 612, 'PACHECO TORRES MARCO ANTONIO', 'LERDO DE TEJADA', '2850', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('PELJ8205095G5', 'JUANA MARIA PEDRAZA LARA', 'A', 53, 612, 'PEDRAZA LARA JUANA MARIA', '', '', '', '', '', '', 0),
('PEOE8206202X4', 'EDNA EDITH PERALES OBREGON', 'C', NULL, 626, 'PERALES OBREGON EDNA EDITH', 'AVESTRUZ', '422', 'VILLAS DEL PARAÍSO', 'NUEVO LAREDO', 'TAMAULIPAS', '88293', 1),
('PETJ570812IL3', 'JOSE JAIME PEREZ TOBAR', 'A', 1, 1218, 'PEREZ TOBAR JOSE JAIME', 'ARTÍCULO 123', '835', 'HIDALGO', 'NUEVO LAREDO', 'TAMAULIPAS', '88160', 1),
('PEVL870114AM1', 'LUIS EVARISTO PEREZ VELAZQUEZ', 'C', 1, 626, 'PEREZ VELAZQUEZ LUIS EVARISTO', '', '', '', '', '', '', 0),
('PIRG6611251W7', 'GABRIEL PRICE RAMIREZ WIELLA', 'C', NULL, NULL, 'RAMIREZ WIELLA GABRIEL PRICE', 'SENDA DE LA ALEGRÍA', '5918A', 'VILLA LAS FUENTES', 'MONTERREY', 'NUEVO LEÓN', '64890', 1),
('PSM020129J30 / PIRG6611251W7', 'PRICE SALES DE MEXICO SA DE CV', 'A', 1, 601, 'PRICE SALES DE MEXICO, S.A. DE C.V', '', '', '', '', '', '', 0),
('PUVR820709L88', 'ROBERTO CARLOS PUGA VAZQUEZ', 'C', 1, 612, 'PUGA VAZQUEZ ROBERTO CARLOS', 'CHETUMAL', '317', 'LOS FRESNOS', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 1),
('RAAH650728535', 'HERMINIO RAMIREZ AGUILAR', 'B', 1, 621, 'RAMIREZ AGUILAR HERMINIO', 'LORENZO LUNA CURIEL', '517', 'NUEVA ERA', 'NUEVO LAREDO', 'TAMAULIPAS', '88136', 1),
('RAVO8611265P0', 'OSCAR JAVIER RAMIREZ VELA', 'A', 54, 612, 'RAMIREZ VELA OSCAR JAVIER', '', '', '', '', '', '', 0),
('REGR7112127S7', 'ROSA MARIA REYES GOMEZ', 'B', 23, 621, 'REYES GOMEZ ROSA MARIA', '', '', '', '', '', '', 0),
('RETG5706199C3', 'GAUDENCIO RESENDIZ TREJO', 'B', 17, 626, 'RESENDIZ TREJO GAUDENCIO', 'SANTIAGO TAPIA', '86', 'BENITO JUÁREZ FOVISSSTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88274', 1),
('RIEL000803T22', 'LUCIA RIOS ESCOBEDO', 'C', 38, 626, 'RIOS ESCOBEDO LUCIA', '', '', '', '', '', '', 0),
('RIEL6505312V9', 'LUCIO RIOS ESTRADA', 'C', 2, 612, 'RIOS ESTRADA LUCIO', 'CERRO DEL TOPOCHICO', '836', 'COLINAS DEL SUR PONINTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88296', 1),
('RITJ7502239P4', 'JOEL RICO TREJO', 'B', 2, 612, 'RICO TREJO JOEL', '', '', '', '', '', '', 0),
('ROCM711213M50', 'JOSE MIGUEL ROMERO CORTES', 'B', 1, 621, 'ROMERO CORTES JOSE MIGUEL', 'MAGNOLIAS', '170', 'FRACCIONAMIENTO JARDINES DE LA HA', 'NUEVO LAREDO', 'TAMAULIPAS', '88277', 1),
('RORA980202NR2', 'JOSE ANGEL PERSEO ROMERO RODRIGUEZ', 'B', 24, 621, 'ROMERO RODRIGUEZ JOSE ANGEL PERSEO', 'ANAHUAC', '3411A', 'CAMPESTRE', 'NUEVO LAREDO', 'TAMAULIPAS', '88278', 1),
('RORD941107EV2', 'DANIELA BERENYCE RODRIGUEZ RODRIGUEZ', 'B', 2, 626, 'RODRIGUEZ RODRIGUEZ DANIELA BERENYCE', '', '', '', '', '', '', 0),
('RUDD910205S63', 'DIANA ANGELICA RUIZ DIAZ', 'B', 1, 621, 'RUIZ DIAZ DIANA ANGELICA', 'LEANDRO VALLE', '4419', 'CAMPESTRE', 'NUEVO LAREDO', 'TAMAULIPAS', '88278', 1),
('RUPL720118336', 'LUIS IGNACIO RUIZ PEREZ', 'A', 1, 612, 'RUIZ PEREZ LUIS IGNACIO', '', '', '', '', '', '', 0),
('SAAJ860920FF0', 'JESUS ROBERTO SALINAS ALVARADO', 'B', 1, 612, 'SALINAS ALVARADO JESUS ROBERTO', 'LEANDRO VALLE', '3030', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('SAAV841221UW9', 'VIVIANA GUADALUPE SALAS ARREDONDO', 'B', 2, 612, 'SALAS ARREDONDO VIVIANA GUADALUPE', '', '', '', '', '', '', 0),
('SACF830105CW9', 'FRANCISCO JAVIER SANCHEZ CAMPA', 'B', 13, 612, 'SANCHEZ CAMPA FRANCISCO JAVIER', 'AVENIDA BERLÍN', '1207', 'DEL MAESTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88110', 1),
('SACR8907276V6', 'RUBEN FAID SANTOS COSS', 'C', 43, 621, 'SANTOS COSS RUBEN FAID', 'CUENCA DE BURGOS', '10613', 'RESERVAS TERRITORIALES', 'NUEVO LAREDO', 'TAMAULIPAS', '88177', 1),
('SAFJ940722G56', 'JUAN MANUEL SALINAS FUENTES', 'B', NULL, NULL, 'SALINAS FUENTES JUAN MANUEL', 'ORQUÍDEA', '307', 'GRANJAS ECONÓMICAS 2', 'NUEVO LAREDO', 'TAMAULIPAS', '88295', 1),
('SASA661206DP3', 'ABDIEL JONHATAN SALAS SALAS', 'C', 1, 626, 'SALAS SALAS ABDIEL JONHATAN', '', '', '', '', '', '', 0),
('SEHV761225N49', 'VIDAL ABDENAGO SERRANO HURTADO', 'C', 3, 621, 'VIDAL ABDENAGO SERRANO HURTADO', 'FCO. VILLA', '304', 'LA CONCORDIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88298', 1),
('SIN130708159 / BERR731102B3A', 'SERVICIOS INDUSTRIALES NSI SA DE CV', 'A', 1, 601, 'SERVICIOS INDUSTRIALES NSI, S.A. DE C.V', '', '', '', '', '', '', 0),
('SLM080103EF7 / TOHJ621114RI7', 'SERVICIOS LOGISTICOS MAT SC', 'A', 2, 601, 'SERVICIOS LOGISTICOS MAT, S.C', '', '', '', '', '', '', 0),
('SMA140901DHA / PEFF760124NQ2', 'SERVICIO DE MANTENIMIENTO AUTOMATIZACION Y SOPORTE SA DE CV', 'A', 1, 601, 'S.M.A', '', '', '', '', '', '', 0),
('SOLE730731EN3', 'EDUARDO ANGEL SOTO DE LEON', 'C', 1, 626, 'SOTO DE LEON EDUARDO ANGEL', 'CALLE MADERO', '2427', 'OJO CALIENTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88040', 1),
('SOLL740826577', 'LILIANA AIDE SOTO DE LEON', 'B', 2, 612, 'SOTO DE LEON LILIANA AIDE', '', '', '', '', '', '', 0),
('SPT160322HM3 / TUMG660906B76', 'SERVICIOS PROFESIONALES TUEGA SC', 'A', 55, 601, 'SERVICIOS PROFESIONALES TUEGA, S.C', '', '', '', '', '', '', 0),
('SUDC780517938', 'CESAR AUGUSTO SUAREZ DELFIN', 'A', 1, 612, 'SUAREZ DELFIN CESAR AUGUSTO', '', '', '', '', '', '', 0),
('TAN000725BF4 / CEGJ711126GT8', 'TRANS AUTO DE NUEVO LAREDO SA DE CV', 'A', 2, 601, 'TRANS AUTO DE NUEVO LAREDO', '', '', '', '', '', '', 0),
('TEL200818E54', 'TRANSPORTES ELRO SA DE CV', 'A', 2, 601, 'TRANSPORTES ELRO, S.A. DE C.V', '', '', '', '', '', '', 0),
('TELA910408RS1', 'ANA MELISSA TREVIÑO LUIS', 'B', 1, 626, 'TREVIÑO LUIS ANA MELISSA', '', '', '', '', '', '', 0),
('TEOJ750103NF0', 'JUAN MANUEL TERRAZAS ORTIZ', 'B', 1, 612, 'TERRAZAS ORTIZ JUAN MANUEL', '', '', '', '', '', '', 0),
('TEOR781202QX3', 'RICARDO TERRAZAS ORTIZ', 'B', 14, 626, 'TERRAZAS ORTIZ RICARDO', '', '', '', '', '', '', 0),
('TIN130201J19 / CEGJ711126GT8', 'TRANSMIPARTES INTERNACIONALES SA DE CV', 'A', 2, 601, 'TRANSMIPARTES INTERNACIONALES', '', '', '', '', '', '', 0),
('TNL180426T98 / LONG830512JM6', 'TRANSMIPARTES DE NUEVO LAREDO SA DE CV', 'A', 2, 601, 'TRANSMIPARTES DE NUEVO LAREDO', '', '', '', '', '', '', 0),
('TOAR010105SM9', 'REYNA ESMERALDA TORRES ARAUJO', 'A', 1, 606, 'TORRES ARAUJO REYNA ESMERALDA', '20 DE NOVIEMBRE', '2106', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('TOGG541013BH5', 'MARIA GUADALUPE TOBIAS GALINDO', 'A', 1, 621, 'TOBIAS GALINDO MARIA GUADALUPE', '', '', '', '', '', '', 0),
('TOLA730206JN7', 'ANGELICA MARIA TORRES LOPEZ', 'B', 26, 621, 'TORRES LOPEZ ANGELICA MARIA', '5 DE FEBRERO', '6407 B', 'HIPODROMO', 'NUEVO LAREDO', 'TAMAULIPAS', '88170', 1),
('TOLG8312154T5', 'GUILLERMINA TOLENTINO LEMUS', 'B', 25, 621, 'TOLENTINO LEMUS GUILLERMINA', 'COLIBRI', '2115', 'LOMAS DEL RIO', 'NUEVO LAREDO', 'TAMAULIPAS', '88179', 1),
('TORE720303P9A', 'EMETERIO TORRES RODRIGUEZ', 'B', 2, 621, 'TORRES RODRIGUEZ EMETERIO', 'GUERRERO', '13118', 'PALMARES', 'NUEVO LAREDO', 'TAMAULIPAS', '88295', 1),
('TUMG660906B76', 'GUADALUPE TUEME MENDEZ', 'A', 1, 1218, 'TUEME MENDEZ GUADALUPE', '', '', '', '', '', '', 0),
('UGA180102LC6 / PETJ570812IL3', 'UNITEX GRUPO ADUANAL SC', 'A', 1, 603, 'UNITEX GRUPO ADUANAL, S.C', '', '', '', '', '', '', 0),
('VAAA670925NR2', 'AMELIA VALDEZ DEL ANGEL', 'A', 56, 612, 'VALDEZ DEL ANGEL AMELIA', '', '', '', '', '', '', 0),
('VAG1510212R9 / VICJ710309QZ0', 'VIRLAR AUTOMOTIVE GROUP SA DE CV', 'A', 1, 601, 'VIRLAR AUTOMOTIVE GROUP SA DE CV', 'AV. AQUILES SERDAN', '1920', 'JUÁREZ', 'NUEVO LAREDO', 'TAMAULIPAS', '88209', 1),
('VALA920229680', 'ANDREA VALADEZ LOPEZ', 'C', 1, 621, 'VALADEZ LOPEZ ANDREA', 'PRIVADA COAHUILA', '1630', 'GUERRERO', 'NUEVO LAREDO', 'TAMAULIPAS', '88240', 1),
('VAMG750703JS0', 'GERARDO VAZQUEZ MENDEZ', 'C', 33, 612, 'VAZQUEZ MENDEZ GERARDO', 'ANDADOR 15', '33', 'BENITO JUÁREZ FOVISSSTE', 'NUEVO LAREDO', 'TAMAULIPAS', '88274', 1),
('VAMR780824170', 'ROBERTO VIVIANO VAZQUEZ MACIAS', 'C', 2, 621, 'VAZQUEZ MACIAS ROBERTO VIVIANO', 'PEDRO PEREZ IBARRA', '92', 'INFONAVIT FUNDADORES', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('VAPI560128QAA', 'IRMA ANGELINA VALDIVIA PIZARRO', 'C', 1, 606, 'VALDIVIA PIZARRO IRMA ANGELINA', '', '', '', '', '', '', 0),
('VAPS610823P25', 'SERGIO VAZQUEZ PEÑA', 'A', 1, 621, 'VAZQUEZ PEÑA SERGIO', '', '', '', '', '', '', 0),
('VECO8108204A8', 'OSCAR OSVALDO VELAZQUEZ CISNEROS', 'B', 2, 626, 'VELAZQUEZ CISNEROS OSCAR OSVALDO', 'CANALES', '2213', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('VEFL841126RU9', 'JOSE LUIS VELIZ FELIX', 'C', 1, 612, 'VELIZ FELIX JOSE LUIS', 'BOULEVARD SAN MIGUEL', '319', 'VILLAS DE SAN MIGUEL', 'NUEVO LAREDO', 'TAMAULIPAS', '88293', 1),
('VEGP500629JB6', 'PAULINA VELA GARCIA', 'A', 1, 612, 'VELA GARCIA PAULINA', 'MATÍAS GUERRA', '37', 'INFONAVIT', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('VEHL7211217T9', 'LUIS ALFONSO VELAZCO HERNANDEZ', 'B', 7, 612, 'VELAZCO HERNANDEZ LUIS ALFONSO', '', '', '', '', '', '', 0),
('VELL560901P86', 'LETICIA DEL CARMEN VELAZQUEZ LIMON', 'C', NULL, NULL, '', 'LAZARO ESCAMILLA', '04', 'INFONAVIT', 'NUEVO LAREDO', 'TAMAULIPAS', '88275', 1),
('VEMF981204UC3', 'FRIDA ALEJANDRA VELA MENDOZA', 'A', NULL, 601, 'VELA MENDOZA FRIDA ALEJANDRA', '', '', '', '', '', '', 0),
('VIAE010118FS9', 'ELIAS VILLANUEVA ATILANO', 'B', NULL, 621, 'VILLANUEVA ATILANO ELIAS', 'MEDELLIN', '8603', 'LA SANDIA', 'NUEVO LAREDO', 'TAMAULIPAS', '88179', 1),
('VIAG830120PF0', 'GUILLERMO VILLA ANDRADE', 'C', 34, 612, 'VILLA ANDRADE GUILLERMO', 'CALLE JALISCO', '701', 'LOS AGAVES', 'NUEVO LAREDO', 'TAMAULIPAS', '88296', 1),
('VICE630428AG1', 'EMILIA MONZERRAT VILA CRUZ', 'A', 2, 621, 'VILA CRUZ EMILIA MONZERRAT', '', '', '', '', '', '', 0),
('VIM200811170 / VIGH740428722', 'VIVE IMPORTACIONES S DE RL DE CV', 'A', 2, 601, 'VIVE IMPORTACIONES, S. DE R.L. DE C.V', '', '', '', '', '', '', 0),
('VIMJ690830EJ9', 'JUAN RAMON VILLANUEVA MIGONI', 'B', 1, 612, 'VILLANUEVA MIGONI JUAN RAMON', 'MORELOS', '1504-2', 'NUEVO LAREDO CENTRO', 'NUEVO LAREDO', 'TAMAULIPAS', '88000', 1),
('VIPJ6902137R2', 'JORGE ARMANDO VILLANUEVA POLENDO', 'C', 1, 612, 'VILLANUEVA POLENDO JORGE ARMANDO', 'REVOLUCION', '1452', 'BELLAVISTA', 'NUEVO LAREDO', 'TAMAULIPAS', '88179', 1),
('YSO180903RM1 / HEZY8010134U4', 'YHAX SOLUTIONS SA DE CV', 'A', 2, 601, 'YHAX SOLUTIONS, S.A. DE C.V', 'ORQUÍDEA', '531', 'TULIPANES', 'NUEVO LAREDO', 'TAMAULIPAS', '88290', 1);

--
-- Disparadores `cliente`
--
DELIMITER $$
CREATE TRIGGER `CrearSaldo` BEFORE UPDATE ON `cliente` FOR EACH ROW BEGIN
	DECLARE v_idSaldo INT;
    
    IF NEW.timbraNominas = 1 THEN
    	SELECT id INTO v_idSaldo FROM saldos WHERE idCliente = NEW.rfc;

        IF v_idSaldo IS NULL THEN
            INSERT INTO saldos(total, idCliente) VALUES (0, NEW.rfc);
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `clientes_certificados`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `clientes_certificados` (
`rfc` varchar(80)
,`nombre` varchar(80)
,`grupo_clientes` char(1)
,`contrasenia` varchar(10)
,`status_firma` bigint(4)
,`fecha_vencimiento_firma` varchar(30)
,`status_sello` bigint(4)
,`fecha_vencimiento_sello` varchar(30)
,`regimen` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contrarecibos`
--

CREATE TABLE `contrarecibos` (
  `folio` bigint(20) NOT NULL,
  `idCliente` varchar(80) NOT NULL,
  `fecha` date NOT NULL,
  `concepto` varchar(255) NOT NULL,
  `hora` time NOT NULL,
  `vigente` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `contrarecibos`
--

INSERT INTO `contrarecibos` (`folio`, `idCliente`, `fecha`, `concepto`, `hora`, `vigente`) VALUES
(20242001, 'AACP7009254V4', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 0),
(20242002, 'AACS681023H34', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242003, 'AARL360910MHA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242004, 'AALF6708197T2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242005, 'AILR690920GEA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242006, 'AAML660130QQ8', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242007, 'AEMA721001QZ8', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242008, 'BAAM881214NV0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242009, 'BEAH790324124', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242010, 'BEPA800824TH1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242011, 'BERR731102B3A', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242012, 'BADA750123QT3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242013, 'CAGN910225PQ1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242014, 'CAOA891113ICA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242015, 'CAIV840508FZ1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242016, 'CEGA7101022E7', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242017, 'CAJK890628QG3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242018, 'CAMA570128VD2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242019, 'COLC621201MG3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242020, 'CURF841101HH7', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242021, 'CUFR650302HB0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242022, 'CULL8203277V1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242023, 'CUME820212LX1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242024, 'CURB950314LT3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242025, 'LERO770515M12', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242026, 'EULA730319429', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242027, 'EAHI800513LT2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242028, 'EAHM8912139LA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242029, 'EANI000723IW5', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242030, 'FICA710504SL2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242031, 'FVN140825DY3 / GOVJ801206B79', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242032, 'GAPG910722CGA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242033, 'GAGP7401258ZA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242034, 'GALC780921EG9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242035, 'GAMA750304UB2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242036, 'GIGJ910605EF5', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242037, 'GOPL6010023I4', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242038, 'GOGX951111C90', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242039, 'GORJ0307296Z2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242040, 'HEGM870709D39', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242041, 'HEVN7310151Z1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242042, 'HEZY8010134U4', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242043, 'JACA861105KU6', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242044, 'JAPM6106198R8', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242045, 'JICS740304J15', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242046, 'JILS680630H30', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242047, 'JUGH620427CL2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242048, 'JUVP9408261NA', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242049, 'LEVA890315TA9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242050, 'LOLJ7807076I9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242051, 'MACS571002KN6', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242052, 'MASM670306EA7', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242053, 'MAAH800910L78', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242054, 'MAAJ8409309A9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242055, 'MACS860916UI6', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242056, 'MAMD8309238K9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242057, 'MAMF730614TR1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242058, 'MATR851022EY0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242059, 'MEAF471114CY0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242060, 'MEHR790217T91', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242061, 'MEDB7010241U1', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242062, 'MEDI7109046K3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242063, 'MOEF770617AM3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242064, 'MOAY740103IS5', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242065, 'MOGE730819R98', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242066, 'MOLT380115TU6', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242067, 'MUUS010129MP7', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242068, 'NAGF6211245E5', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242069, 'NIFJ7705258F8', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242070, 'PATM660115N35', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242071, 'PEOE8206202X4', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242072, 'PETJ570812IL3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242073, 'PIRG6611251W7', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242074, 'PUVR820709L88', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242075, 'RAAH650728535', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242076, 'RETG5706199C3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242077, 'ROCM711213M50', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242078, 'RORA980202NR2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242079, 'RIEL6505312V9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242080, 'RUDD910205S63', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242081, 'SAAJ860920FF0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242082, 'SAFJ940722G56', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242083, 'SACF830105CW9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242084, 'SACR8907276V6', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242085, 'SEHV761225N49', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242086, 'SOLE730731EN3', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242087, 'TOLG8312154T5', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242088, 'TOAR010105SM9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242089, 'TOLA730206JN7', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242090, 'TORE720303P9A', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242091, 'VALA920229680', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242092, 'VAMR780824170', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242093, 'VAMG750703JS0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242094, 'VEGP500629JB6', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242095, 'VECO8108204A8', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242096, 'VELL560901P86', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242097, 'VEFL841126RU9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242098, 'VIAG830120PF0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242099, 'VIAE010118FS9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(20242101, 'AACP7009254V4', '2024-06-21', 'HONORARIOS DEL MES DE MARZO', '12:38:10', 0),
(20242102, 'AACP7009254V4', '2024-06-21', 'HONORARIOS DEL MES DE ABRIL', '12:40:18', 0),
(202420100, 'VIMJ690830EJ9', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(202420101, 'VIPJ6902137R2', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(202420102, 'VAG1510212R9 / VICJ710309QZ0', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(202420103, 'YSO180903RM1 / HEZY8010134U4', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1),
(202420104, 'GOGL500403I21', '2024-06-20', 'HONORARIOS DEL MES DE ENERO 2024', '16:46:46', 1);

--
-- Disparadores `contrarecibos`
--
DELIMITER $$
CREATE TRIGGER `SumarSaldo` BEFORE INSERT ON `contrarecibos` FOR EACH ROW BEGIN
	DECLARE v_tarifa DOUBLE;
    DECLARE v_saldoActual DOUBLE;
    DECLARE v_cantidadRegistros INT;

    SELECT COUNT(rfc) INTO v_cantidadRegistros FROM cliente WHERE rfc = NEW.idCliente GROUP BY rfc;
    
    IF v_cantidadRegistros IS NULL THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe.';
    ELSE
        SELECT tarifaMensual INTO v_tarifa FROM tarifas WHERE idCliente = NEW.idCliente;

        IF v_tarifa IS NULL THEN
    		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no cuenta con una tarifa definida.';
    	ELSE
    		SELECT total INTO v_saldoActual FROM saldos WHERE idCliente = NEW.idCliente;
        
        	IF v_saldoActual IS NULL THEN
        		INSERT INTO saldos(total, idCliente) VALUES (v_tarifa, NEW.idCliente);
            ELSE
            	UPDATE saldos SET total = v_saldoActual + v_tarifa WHERE idCliente = NEW.idCliente;
            END IF;
        END IF;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `TCancelarRecibo` BEFORE UPDATE ON `contrarecibos` FOR EACH ROW BEGIN
	DECLARE v_saldo DOUBLE;
    DECLARE v_nuevoSaldo DOUBLE;
    DECLARE v_tarifa DOUBLE;
    
	IF NEW.vigente = FALSE THEN
    	SELECT tarifaMensual INTO v_tarifa FROM tarifas WHERE idCliente = NEW.idCliente;
        
        SELECT total INTO v_saldo FROM saldos WHERE idCliente = NEW.idCliente;
        SET v_nuevoSaldo = v_saldo - v_tarifa;
        
        UPDATE saldos SET total = v_nuevoSaldo WHERE idCliente = NEW.idCliente;
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `contrarecibos_timbrados`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `contrarecibos_timbrados` (
`folio` bigint(20)
,`fecha` date
,`hora` time
,`nombre` varchar(80)
,`domicilio` varchar(223)
,`ciudad` varchar(216)
,`rfc` varchar(80)
,`concepto` varchar(255)
,`tarifaMensual` double
,`vigente` varchar(9)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `informacion_timbrado_clientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `informacion_timbrado_clientes` (
`rfc` varchar(80)
,`nombre` varchar(80)
,`calle` varchar(100)
,`numero` varchar(8)
,`colonia` varchar(100)
,`municipio` varchar(100)
,`estado` varchar(100)
,`codigoPostal` varchar(7)
,`timbraNominas` varchar(2)
,`saldoActual` double
,`tarifaMensual` double
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `importe` double DEFAULT NULL,
  `idCliente` varchar(80) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Disparadores `pagos`
--
DELIMITER $$
CREATE TRIGGER `RestarSaldo` BEFORE INSERT ON `pagos` FOR EACH ROW BEGIN
	DECLARE v_idCliente VARCHAR(80);
    DECLARE v_saldoActual DOUBLE;
    DECLARE v_saldoNuevo DOUBLE;
    
    SELECT rfc INTO v_idCliente FROM cliente WHERE rfc = NEW.idCliente;
    
    IF v_idCliente IS NULL THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe.';
    ELSE
    	SELECT total INTO v_saldoActual FROM saldos WHERE idCliente = NEW.idCliente;
        
        IF v_saldoActual IS NULL THEN
        	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no cuenta con un saldo.';
        ELSE
        	SET v_saldoNuevo = v_saldoActual - NEW.importe;
            
            IF v_saldoNuevo < 0 THEN
            	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El saldo no puede quedar negativo.';
            ELSE
        		UPDATE saldos SET total = v_saldoActual - NEW.importe WHERE idCliente = NEW.idCliente;
            END IF;
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `pagos_registrados`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `pagos_registrados` (
`rfc` varchar(80)
,`nombre` varchar(80)
,`grupo_clientes` char(1)
,`fechaPago` varchar(21)
,`importe` double
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regimen_fiscal`
--

CREATE TABLE `regimen_fiscal` (
  `clave` int(11) NOT NULL,
  `regimen` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `regimen_fiscal`
--

INSERT INTO `regimen_fiscal` (`clave`, `regimen`) VALUES
(601, 'General de Ley Personas Morales'),
(603, 'Personas Morales con Fines no Lucrativos'),
(605, 'Sueldos y Salarios e Ingresos Asimilados a Salarios'),
(606, 'Arrendamiento'),
(607, 'Régimen de Enajenación o Adquisición de Bienes'),
(608, 'Demás ingresos'),
(609, 'Consolidación'),
(610, 'Residentes en el Extranjero sin Establecimiento Permanente en México'),
(611, 'Ingresos por Dividendos (socios y accionistas)'),
(612, 'Personas Físicas con Actividades Empresariales y Profesionales'),
(614, 'Ingresos por intereses'),
(615, 'Régimen de los ingresos por obtención de premios'),
(616, 'Sin obligaciones fiscales'),
(620, 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos'),
(621, 'Régimen de Incorporación Fiscal'),
(622, 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras'),
(623, 'Opcional para Grupo de Sociedades'),
(624, 'Coordinados'),
(625, 'Régimen de las Actividades Empresariales con ingresos a tráves de Plataformas Tenológicas'),
(626, 'Régimen Simplificado de Confianza'),
(628, 'Hidrocarburos'),
(629, 'De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales'),
(630, 'Enajenación de acciones en bolsa de valores'),
(1218, 'Arrendamiento y Actividades Empresariales Profesionales');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `saldos`
--

CREATE TABLE `saldos` (
  `id` int(11) NOT NULL,
  `total` double NOT NULL,
  `idCliente` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `saldos`
--

INSERT INTO `saldos` (`id`, `total`, `idCliente`) VALUES
(1, 0, 'AACP7009254V4'),
(2, 2376, 'AACS681023H34'),
(3, 2000, 'AALF6708197T2'),
(4, 7020, 'AAML660130QQ8'),
(5, 6048, 'AARL360910MHA'),
(6, 3888, 'AEMA721001QZ8'),
(7, 2376, 'AILR690920GEA'),
(8, 2200, 'BAAM881214NV0'),
(9, 2000, 'BADA750123QT3'),
(10, 2600, 'BEAH790324124'),
(11, 2800, 'BEPA800824TH1'),
(12, 6800, 'BERR731102B3A'),
(13, 2400, 'CAGN910225PQ1'),
(14, 2000, 'CAIV840508FZ1'),
(15, 1600, 'CAJK890628QG3'),
(16, 2200, 'CAMA570128VD2'),
(17, 1800, 'CAOA891113ICA'),
(18, 3000, 'CEGA7101022E7'),
(19, 3200, 'COLC621201MG3'),
(20, 4400, 'CUFR650302HB0'),
(21, 2200, 'CULL8203277V1'),
(22, 2800, 'CUME820212LX1'),
(23, 2600, 'CURB950314LT3'),
(24, 2900, 'CURF841101HH7'),
(25, 3000, 'EAHI800513LT2'),
(26, 2600, 'EAHM8912139LA'),
(27, 2600, 'EANI000723IW5'),
(28, 1800, 'EULA730319429'),
(29, 3024, 'FICA710504SL2'),
(30, 10368, 'FVN140825DY3 / GOVJ801206B79'),
(31, 1000, 'GAGP7401258ZA'),
(32, 3600, 'GALC780921EG9'),
(33, 2600, 'GAMA750304UB2'),
(34, 3200, 'GAPG910722CGA'),
(35, 2400, 'GIGJ910605EF5'),
(36, 3024, 'GOGL500403I21'),
(37, 2808, 'GOGX951111C90'),
(38, 2600, 'GOPL6010023I4'),
(39, 5000, 'GORJ0307296Z2'),
(40, 2800, 'HEGM870709D39'),
(41, 6600, 'HEVN7310151Z1'),
(42, 1728, 'HEZY8010134U4'),
(43, 1600, 'JACA861105KU6'),
(44, 2200, 'JAPM6106198R8'),
(45, 2160, 'JICS740304J15'),
(46, 2000, 'JILS680630H30'),
(47, 4400, 'JUGH620427CL2'),
(48, 2000, 'JUVP9408261NA'),
(49, 4400, 'LERO770515M12'),
(50, 1600, 'LEVA890315TA9'),
(51, 2000, 'LOLJ7807076I9'),
(52, 1600, 'MAAH800910L78'),
(53, 1728, 'MAAJ8409309A9'),
(54, 2000, 'MACS571002KN6'),
(55, 2000, 'MACS860916UI6'),
(56, 3000, 'MAMD8309238K9'),
(57, 1600, 'MAMF730614TR1'),
(58, 3400, 'MASM670306EA7'),
(59, 1600, 'MATR851022EY0'),
(60, 2000, 'MEAF471114CY0'),
(61, 2200, 'MEDB7010241U1'),
(62, 2000, 'MEDI7109046K3'),
(63, 4320, 'MEHR790217T91'),
(64, 3800, 'MOAY740103IS5'),
(65, 2000, 'MOEF770617AM3'),
(66, 4600, 'MOGE730819R98'),
(67, 1600, 'MOLT380115TU6'),
(68, 0, 'MORY840706T62'),
(69, 1600, 'MUUS010129MP7'),
(70, 1600, 'NAGF6211245E5'),
(71, 2000, 'NIFJ7705258F8'),
(72, 2000, 'PATM660115N35'),
(73, 3000, 'PEOE8206202X4'),
(74, 4200, 'PETJ570812IL3'),
(75, 1700, 'PIRG6611251W7'),
(76, 1800, 'PUVR820709L88'),
(77, 2900, 'RAAH650728535'),
(78, 3200, 'RETG5706199C3'),
(79, 1600, 'RIEL6505312V9'),
(80, 1728, 'ROCM711213M50'),
(81, 2000, 'RORA980202NR2'),
(82, 2100, 'RUDD910205S63'),
(83, 3800, 'SAAJ860920FF0'),
(84, 1800, 'SACF830105CW9'),
(85, 2000, 'SACR8907276V6'),
(86, 2400, 'SAFJ940722G56'),
(87, 1296, 'SEHV761225N49'),
(88, 1800, 'SOLE730731EN3'),
(89, 2160, 'TOAR010105SM9'),
(90, 1800, 'TOLA730206JN7'),
(91, 2000, 'TOLG8312154T5'),
(92, 2000, 'TORE720303P9A'),
(93, 6000, 'VAG1510212R9 / VICJ710309QZ0'),
(94, 1800, 'VALA920229680'),
(95, 1600, 'VAMG750703JS0'),
(96, 1296, 'VAMR780824170'),
(97, 2000, 'VECO8108204A8'),
(98, 2000, 'VEFL841126RU9'),
(99, 4000, 'VEGP500629JB6'),
(100, 2400, 'VELL560901P86'),
(101, 2200, 'VIAE010118FS9'),
(102, 1400, 'VIAG830120PF0'),
(103, 3000, 'VIMJ690830EJ9'),
(104, 1600, 'VIPJ6902137R2'),
(105, 2160, 'YSO180903RM1 / HEZY8010134U4');

--
-- Disparadores `saldos`
--
DELIMITER $$
CREATE TRIGGER `ValidarSaldo` BEFORE INSERT ON `saldos` FOR EACH ROW BEGIN
	IF NEW.total < 0 THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El saldo no puede ser negativo.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifas`
--

CREATE TABLE `tarifas` (
  `id` int(11) NOT NULL,
  `idCliente` varchar(80) NOT NULL,
  `tarifaMensual` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `tarifas`
--

INSERT INTO `tarifas` (`id`, `idCliente`, `tarifaMensual`) VALUES
(1, 'AACP7009254V4', 1188),
(2, 'AACS681023H34', 1188),
(3, 'AARL360910MHA', 3024),
(4, 'AALF6708197T2', 1000),
(5, 'AILR690920GEA', 1188),
(6, 'AAML660130QQ8', 3510),
(7, 'AEMA721001QZ8', 1944),
(8, 'BAAM881214NV0', 1100),
(9, 'BEAH790324124', 1300),
(10, 'BEPA800824TH1', 1400),
(11, 'BERR731102B3A', 3400),
(12, 'BADA750123QT3', 1000),
(13, 'CAGN910225PQ1', 1200),
(14, 'CAOA891113ICA', 900),
(15, 'CAIV840508FZ1', 1000),
(16, 'CEGA7101022E7', 1500),
(17, 'CAJK890628QG3', 800),
(18, 'CAMA570128VD2', 1100),
(19, 'COLC621201MG3', 1600),
(20, 'CURF841101HH7', 1450),
(21, 'CUFR650302HB0', 2200),
(22, 'CULL8203277V1', 1100),
(23, 'CUME820212LX1', 1400),
(24, 'CURB950314LT3', 1300),
(25, 'LERO770515M12', 2200),
(26, 'EULA730319429', 900),
(27, 'EAHI800513LT2', 1500),
(28, 'EAHM8912139LA', 1300),
(29, 'EANI000723IW5', 1300),
(30, 'FICA710504SL2', 1512),
(31, 'FVN140825DY3 / GOVJ801206B79', 5184),
(32, 'GAPG910722CGA', 1600),
(33, 'GAGP7401258ZA', 500),
(34, 'GALC780921EG9', 1800),
(35, 'GAMA750304UB2', 1300),
(36, 'GIGJ910605EF5', 1200),
(37, 'GOPL6010023I4', 1300),
(38, 'GOGX951111C90', 1404),
(39, 'GORJ0307296Z2', 2500),
(40, 'HEGM870709D39', 1400),
(41, 'HEVN7310151Z1', 3300),
(42, 'HEZY8010134U4', 864),
(43, 'JACA861105KU6', 800),
(44, 'JAPM6106198R8', 1100),
(45, 'JICS740304J15', 1080),
(46, 'JILS680630H30', 1000),
(47, 'JUGH620427CL2', 2200),
(48, 'JUVP9408261NA', 1000),
(49, 'LEVA890315TA9', 800),
(50, 'LOLJ7807076I9', 1000),
(51, 'MACS571002KN6', 1000),
(52, 'MASM670306EA7', 1700),
(53, 'MAAH800910L78', 800),
(54, 'MAAJ8409309A9', 864),
(55, 'MACS860916UI6', 1000),
(56, 'MAMD8309238K9', 1500),
(57, 'MAMF730614TR1', 800),
(58, 'MATR851022EY0', 800),
(59, 'MEAF471114CY0', 1000),
(60, 'MEHR790217T91', 2160),
(61, 'MEDB7010241U1', 1100),
(62, 'MEDI7109046K3', 1000),
(63, 'MOEF770617AM3', 1000),
(64, 'MOAY740103IS5', 1900),
(65, 'MOGE730819R98', 2300),
(66, 'MOLT380115TU6', 800),
(67, 'MUUS010129MP7', 800),
(68, 'NAGF6211245E5', 800),
(69, 'NIFJ7705258F8', 1000),
(70, 'PATM660115N35', 1000),
(71, 'PEOE8206202X4', 1500),
(72, 'PETJ570812IL3', 2100),
(73, 'PIRG6611251W7', 850),
(74, 'PUVR820709L88', 900),
(75, 'RAAH650728535', 1450),
(76, 'RETG5706199C3', 1600),
(77, 'ROCM711213M50', 864),
(78, 'RORA980202NR2', 1000),
(79, 'RIEL6505312V9', 800),
(80, 'RUDD910205S63', 1050),
(81, 'SAAJ860920FF0', 1900),
(82, 'SAFJ940722G56', 1200),
(83, 'SACF830105CW9', 900),
(84, 'SACR8907276V6', 1000),
(85, 'SEHV761225N49', 648),
(86, 'SOLE730731EN3', 900),
(87, 'TOLG8312154T5', 1000),
(88, 'TOAR010105SM9', 1080),
(89, 'TOLA730206JN7', 900),
(90, 'TORE720303P9A', 1000),
(91, 'VALA920229680', 900),
(92, 'VAMR780824170', 648),
(93, 'VAMG750703JS0', 800),
(94, 'VEGP500629JB6', 2000),
(95, 'VECO8108204A8', 1000),
(96, 'VELL560901P86', 1200),
(97, 'VEFL841126RU9', 1000),
(98, 'VIAG830120PF0', 700),
(99, 'VIAE010118FS9', 1100),
(100, 'VIMJ690830EJ9', 1500),
(101, 'VIPJ6902137R2', 800),
(102, 'VAG1510212R9 / VICJ710309QZ0', 3000),
(103, 'YSO180903RM1 / HEZY8010134U4', 1080),
(104, 'GOGL500403I21', 1512);

--
-- Disparadores `tarifas`
--
DELIMITER $$
CREATE TRIGGER `validarTarifas` BEFORE INSERT ON `tarifas` FOR EACH ROW BEGIN
	DECLARE v_idCliente VARCHAR(80);
    
    SELECT rfc INTO v_idCliente FROM cliente WHERE rfc = NEW.idCliente;
    
    IF v_idCliente IS NULL THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe.';
    END IF;
    
    IF NEW.tarifaMensual IS NULL OR NEW.tarifaMensual <= 0 THEN
    	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La tarifa mensual debe ser mayor a 0.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre_completo` varchar(80) DEFAULT NULL,
  `nombre_usuario` varchar(25) DEFAULT NULL,
  `contrasenia` varchar(15) DEFAULT NULL,
  `grupo_clientes` char(1) DEFAULT NULL,
  `rol` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre_completo`, `nombre_usuario`, `contrasenia`, `grupo_clientes`, `rol`) VALUES
(1, 'Desarrollo de Software', 'Sistemas Garcia Reyes', '21100175', 'S', 'dev'),
(2, 'Administracion Clientes A', 'Clientes A', 'RGCA2023', 'A', 'empleado'),
(3, 'Administracion Clientes B', 'Clientes B', 'RGCB2023', 'B', 'empleado'),
(4, 'Administracion Clientes C', 'Clientes C', 'RGCC2023', 'C', 'empleado'),
(5, 'Administracion Garcia Reyes', 'Administracion RG', 'RG6701', 'S', 'admin');

-- --------------------------------------------------------

--
-- Estructura para la vista `clientes_certificados`
--
DROP TABLE IF EXISTS `clientes_certificados`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `clientes_certificados`  AS WITH CertificadosNumerados AS (SELECT `cliente`.`rfc` AS `rfc`, `cliente`.`nombre` AS `nombre`, `cliente`.`grupo_clientes` AS `grupo_clientes`, `cliente`.`clave_regimen` AS `clave_regimen`, `certificado`.`id` AS `id`, `certificado`.`estatus` AS `estatus`, `certificado`.`fecha_fin` AS `fecha_fin`, `clave_ciec`.`contrasenia` AS `contrasenia`, `regimen_fiscal`.`clave` AS `clave`, `regimen_fiscal`.`regimen` AS `regimen`, row_number() over ( partition by `cliente`.`rfc` order by `certificado`.`id`) AS `NumeroDeCertificado` FROM (((`cliente` left join `certificado` on(`cliente`.`rfc` = `certificado`.`id_cliente`)) left join `clave_ciec` on(`cliente`.`id_clave_ciec` = `clave_ciec`.`id`)) left join `regimen_fiscal` on(`cliente`.`clave_regimen` = `regimen_fiscal`.`clave`))) SELECT `certificadosnumerados`.`rfc` AS `rfc`, `certificadosnumerados`.`nombre` AS `nombre`, `certificadosnumerados`.`grupo_clientes` AS `grupo_clientes`, `certificadosnumerados`.`contrasenia` AS `contrasenia`, max(case when `certificadosnumerados`.`NumeroDeCertificado` = 1 then `certificadosnumerados`.`estatus` end) AS `status_firma`, max(case when `certificadosnumerados`.`NumeroDeCertificado` = 1 then `certificadosnumerados`.`fecha_fin` end) AS `fecha_vencimiento_firma`, max(case when `certificadosnumerados`.`NumeroDeCertificado` = 2 then `certificadosnumerados`.`estatus` end) AS `status_sello`, max(case when `certificadosnumerados`.`NumeroDeCertificado` = 2 then `certificadosnumerados`.`fecha_fin` end) AS `fecha_vencimiento_sello`, `certificadosnumerados`.`regimen` AS `regimen` FROM `certificadosnumerados` GROUP BY `certificadosnumerados`.`rfc`, `certificadosnumerados`.`nombre``nombre`  ;

-- --------------------------------------------------------

--
-- Estructura para la vista `contrarecibos_timbrados`
--
DROP TABLE IF EXISTS `contrarecibos_timbrados`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `contrarecibos_timbrados`  AS SELECT `contrarecibos`.`folio` AS `folio`, `contrarecibos`.`fecha` AS `fecha`, `contrarecibos`.`hora` AS `hora`, `cliente`.`nombre` AS `nombre`, concat(`cliente`.`calle`,' NO. ',`cliente`.`numero`,', COLONIA ',`cliente`.`colonia`) AS `domicilio`, concat(`cliente`.`municipio`,', ',`cliente`.`estado`,', C.P. ',`cliente`.`codigoPostal`) AS `ciudad`, `cliente`.`rfc` AS `rfc`, `contrarecibos`.`concepto` AS `concepto`, CASE WHEN `contrarecibos`.`vigente` = 1 THEN `tarifas`.`tarifaMensual` ELSE `tarifas`.`tarifaMensual`* -1 END AS `tarifaMensual`, CASE `contrarecibos`.`vigente` WHEN 1 THEN 'VIGENTE' ELSE 'CANCELADO' END AS `vigente` FROM ((`contrarecibos` join `cliente` on(`contrarecibos`.`idCliente` = `cliente`.`rfc`)) join `tarifas` on(`contrarecibos`.`idCliente` = `tarifas`.`idCliente`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `informacion_timbrado_clientes`
--
DROP TABLE IF EXISTS `informacion_timbrado_clientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `informacion_timbrado_clientes`  AS SELECT DISTINCT `cliente`.`rfc` AS `rfc`, `cliente`.`nombre` AS `nombre`, `cliente`.`calle` AS `calle`, `cliente`.`numero` AS `numero`, `cliente`.`colonia` AS `colonia`, `cliente`.`municipio` AS `municipio`, `cliente`.`estado` AS `estado`, `cliente`.`codigoPostal` AS `codigoPostal`, CASE `cliente`.`timbraNominas` WHEN 1 THEN 'SI' ELSE 'NO' END AS `timbraNominas`, `saldos`.`total` AS `saldoActual`, `tarifas`.`tarifaMensual` AS `tarifaMensual` FROM ((`cliente` join `saldos` on(`cliente`.`rfc` = `saldos`.`idCliente`)) join `tarifas` on(`cliente`.`rfc` = `tarifas`.`idCliente`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `pagos_registrados`
--
DROP TABLE IF EXISTS `pagos_registrados`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `pagos_registrados`  AS SELECT `cliente`.`rfc` AS `rfc`, `cliente`.`nombre` AS `nombre`, `cliente`.`grupo_clientes` AS `grupo_clientes`, concat(`pagos`.`fecha`,' ',`pagos`.`hora`) AS `fechaPago`, `pagos`.`importe` AS `importe` FROM (`pagos` join `cliente` on(`cliente`.`rfc` = `pagos`.`idCliente`)) ORDER BY `pagos`.`fecha` ASC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `clave_ciec`
--
ALTER TABLE `clave_ciec`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`rfc`),
  ADD KEY `clave_regimen` (`clave_regimen`),
  ADD KEY `id_clave_ciec` (`id_clave_ciec`);

--
-- Indices de la tabla `contrarecibos`
--
ALTER TABLE `contrarecibos`
  ADD PRIMARY KEY (`folio`),
  ADD KEY `idCliente` (`idCliente`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCliente` (`idCliente`);

--
-- Indices de la tabla `regimen_fiscal`
--
ALTER TABLE `regimen_fiscal`
  ADD PRIMARY KEY (`clave`);

--
-- Indices de la tabla `saldos`
--
ALTER TABLE `saldos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCliente` (`idCliente`);

--
-- Indices de la tabla `tarifas`
--
ALTER TABLE `tarifas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCliente` (`idCliente`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `certificado`
--
ALTER TABLE `certificado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=479;

--
-- AUTO_INCREMENT de la tabla `clave_ciec`
--
ALTER TABLE `clave_ciec`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `saldos`
--
ALTER TABLE `saldos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT de la tabla `tarifas`
--
ALTER TABLE `tarifas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD CONSTRAINT `certificado_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`rfc`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`clave_regimen`) REFERENCES `regimen_fiscal` (`clave`) ON DELETE CASCADE,
  ADD CONSTRAINT `cliente_ibfk_2` FOREIGN KEY (`id_clave_ciec`) REFERENCES `clave_ciec` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `contrarecibos`
--
ALTER TABLE `contrarecibos`
  ADD CONSTRAINT `contrarecibos_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`rfc`);

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`rfc`);

--
-- Filtros para la tabla `saldos`
--
ALTER TABLE `saldos`
  ADD CONSTRAINT `saldos_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`rfc`);

--
-- Filtros para la tabla `tarifas`
--
ALTER TABLE `tarifas`
  ADD CONSTRAINT `tarifas_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`rfc`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
