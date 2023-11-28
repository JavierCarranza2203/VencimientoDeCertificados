export async function ObtenerDatosDelCertificado(certificado) 
{
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
        throw new Error(await response.json());
    }
}

export async function IniciarSesion(NombreDeUsuario, Contrasenia) 
{
    const credentials = new FormData();

    // Agrega las variables al formData creado
    credentials.append("NombreDeUsuario", NombreDeUsuario);
    credentials.append("Contrasenia", Contrasenia);

    const response = await fetch("App/Controllers/UsuarioController.php?Operacion=login", {
        method: "POST",
        body: credentials,
    });

    if (response.ok) 
    {
        const data = await response.json();
        return data;
    } 
    else //Si no responde con un codigo 200
    {
        throw new Error(await response.json());
    }
}

export async function ValidarUsuarioLogeado()
{
    const response = await fetch("../Controllers/UsuarioController.php?Operacion=userLogged",{method:"GET"})

    if (response.ok) 
    {
        return await response.json();
    } 
    else 
    {
        throw new Error(await response.json());
    }
}

export async function AgregarNuevoUsuario(nombreCompleto, nombreUsuario, contrasenia, grupoClientes, rol)
{
    const formData = new FormData();
    formData.append('NombreCompleto', nombreCompleto);
    formData.append('NombreDeUsuario', nombreUsuario);
    formData.append('Contrasenia', contrasenia);
    formData.append('GrupoDeClientes', grupoClientes);
    formData.append('Rol', rol);

    const response = await fetch("../Controllers/UsuarioController.php?Operacion=add", {
        method: "POST",
        body: formData
    });

    if(response.ok)
    {
        const data = await response.json();
        return data;
    }
    else
    {
        throw new Error(await response.json());
    }
}

export async function CerrarSesion()
{
    const response = await fetch("../Controllers/UsuarioController.php?Operacion=logout");

    if(response.ok)
    {
        return await response.json();
    }
    else
    {
        throw new Error(await response.json);
    }
}

export async function AgregarCliente(){
    
}