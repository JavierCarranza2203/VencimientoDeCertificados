export async function ObtenerDatosDelCertificado(certificado) {
    const formData = new FormData();
    formData.append("Certificado", certificado);

    const response = await fetch("../Controllers/ClienteController.php", {
        method: "POST",
        body: formData,
    });

    if (response.ok) 
    {
        const data = await response.json();
        return data;
    } 
    else 
    {
        console.error("Hubo un error. Estado de la respuesta: " + response.status + ", Texto de la respuesta: " + await response.text());
        throw new Error('Error en la petición');
    }
}