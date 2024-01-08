-- Active: 1701900326404@@127.0.0.1@3306@db_despacho_contable
CREATE VIEW clientes_certificados
AS
WITH CertificadosNumerados AS (
    SELECT 
        cliente.rfc,
        cliente.nombre,
        cliente.grupo_clientes,
        cliente.clave_regimen,
        certificado.id,
        certificado.estatus,
        certificado.fecha_fin,
        clave_ciec.contrasenia,
        regimen_fiscal.clave,
        regimen_fiscal.regimen,
        ROW_NUMBER() OVER (PARTITION BY cliente.rfc ORDER BY certificado.id) AS NumeroDeCertificado
    FROM 
        cliente
    LEFT JOIN
        certificado ON cliente.rfc = certificado.id_cliente
    LEFT JOIN
        clave_ciec ON cliente.id_clave_ciec = clave_ciec.id
    LEFT JOIN
        regimen_fiscal ON cliente.clave_regimen = regimen_fiscal.clave
)
SELECT 
    rfc,
    nombre,
    grupo_clientes,
    contrasenia,
    MAX(CASE WHEN NumeroDeCertificado = 1 THEN estatus END) AS status_firma,
    MAX(CASE WHEN NumeroDeCertificado = 1 THEN fecha_fin END) AS fecha_vencimiento_firma,
    MAX(CASE WHEN NumeroDeCertificado = 2 THEN estatus END) AS status_sello,
    MAX(CASE WHEN NumeroDeCertificado = 2 THEN fecha_fin END) AS fecha_vencimiento_sello,
    regimen
FROM 
    CertificadosNumerados
GROUP BY
    rfc, nombre;