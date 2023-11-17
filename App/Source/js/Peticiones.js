export async function ObtenerDatosDelCertificado(certificado) {
    const formData = new FormData();
    formData.append("Certificado", certificado);

    const response = await fetch("../Controllers/CertificadoController.php", {
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

export async function IniciarSesion(NombreDeUsuario, Contrasenia) {
    const credentials = new FormData();

    //Agrega las variables al formData creado
    credentials.append("Operacion", "login");
    credentials.append("NombreDeUsuario", NombreDeUsuario);
    credentials.append("Contrasenia", Contrasenia);

    //Hace una petición HTTP usando el método POST y mandando las credenciales
    const response = await fetch("App/Controllers/UsuarioController.php", {
        method: "POST",
        body: credentials,
    });

    if (response.ok) 
    {
        const data = await response.json();
        return data;
    } 
    else //Si no, genera un error
    {
        console.error("Hubo un error. Estado de la respuesta: " + response.status + ", Texto de la respuesta: " + await response.text());
        throw new Error('No se puede iniciar sesión. Intente más tarde');
    }
}