export async function ObtenerDatosDelCertificado(certificado) 
{
    //Genera una instancia de la clase FormData
    const formData = new FormData();

    //Agrega el campo "Certificado" al formdata y asigna el valor
    formData.append("Certificado", certificado);

    //Realiza la petición al controlador del certificado
    const response = await fetch("../Controllers/CertificadoController.php", {
        method: "POST",
        body: formData,
    });

    //Si la petición responde con estado 200, regresa los datos del certificado
    if (response.ok) 
    {
        const data = await response.json();
        return data;
    } 
    else //Si no, genera un error
    {
        throw new Error(await response.json());
    }
}

export async function IniciarSesion(NombreDeUsuario, Contrasenia) 
{   //Crea una instancia de la clase FormData
    const credentials = new FormData();

    // Agrega las variables al formData creado
    credentials.append("NombreDeUsuario", NombreDeUsuario);
    credentials.append("Contrasenia", Contrasenia);

    //Realiza la petición al controlador del usuario
    const response = await fetch("App/Controllers/UsuarioController.php?Operacion=login", {
        method: "POST",
        body: credentials,
    });

    //Si la petición responde con un estado 200, regresa los datos
    if (response.ok) 
    {
        const data = await response.json();
        return data;
    } 
    else //Si no, genera un error
    {
        throw new Error(await response.json());
    }
}

export async function ValidarUsuarioLogeado()
{
    //Realiza la petición al controlador del usuario
    const response = await fetch("../Controllers/UsuarioController.php?Operacion=userLogged",{method:"GET"})

    //Si responde con un estado 200, regresa los datos. Solo hay dos posibles datos true/false
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
    //Realiza la petición al controlador
    const response = await fetch("../Controllers/UsuarioController.php?Operacion=logout");

    //Si responde con un estado 200, regresa un true
    if(response.ok)
    {
        return await response.json();
    }
    else //Si no, genera un error
    {
        throw new Error(response.json);
    }
}

export async function AgregarCliente(jsonCliente){
    const response = await fetch("../Controllers/ClienteController.php?Operacion=add",
    {
        method:"POST",
        body: jsonCliente
    });

    let data = await response.json()
    if(response.ok)
    {
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: data,
            icon: "success",
            confirmButtonText: "OK",
        }).then(()=>{
            location.href("pagina-principal.html");
        });
    }
    else
    {
        throw new Error(data);
    }
}

export async function EliminarCliente(rfc)
{
    const response = await fetch("../Controllers/ClienteController.php?Operacion=delete&&rfc=" + rfc);

    let data = await response.json();

    if(response.ok)
    {
        Swal.fire({
            title: "¡Tarea realizada con éxito!",
            text: data,
            icon: "success",
            confirmButtonText: "OK",
        });
    }
    else
    {
        throw new Error(data);
    }
}