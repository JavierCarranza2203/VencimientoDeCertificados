-- Active: 1696360839993@@127.0.0.1@3306@despacho_contable
CREATE VIEW clientes_certificados
AS
WITH CertificadosNumerados AS (
    SELECT 
        cliente.rfc,
        cliente.nombre,
        certificado.id,
        certificado.estatus,
        certificado.fecha_fin,
        ROW_NUMBER() OVER (PARTITION BY cliente.rfc ORDER BY certificado.id) AS NumeroDeCertificado
    FROM 
        cliente
    LEFT JOIN
        certificado ON cliente.rfc = certificado.id_cliente
)
SELECT 
    rfc,
    nombre,
    MAX(CASE WHEN NumeroDeCertificado = 1 THEN estatus END) AS status_firma,
    MAX(CASE WHEN NumeroDeCertificado = 1 THEN fecha_fin END) AS fecha_vencimiento_firma,
    MAX(CASE WHEN NumeroDeCertificado = 2 THEN estatus END) AS status_sello,
    MAX(CASE WHEN NumeroDeCertificado = 2 THEN fecha_fin END) AS fecha_vencimiento_sello
FROM 
    CertificadosNumerados
GROUP BY
    rfc, nombre;