/**********************************************************/
/*                   Metodos del certificado              */
/**********************************************************/

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

/**********************************************************/
/*                   Metodos del certificado              */
/**********************************************************/

/**********************************************************/
/*                     Metodos del usuario                */
/**********************************************************/
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

    const data = await response.json();

    if(response.ok)
    {
        return data;
    }
    else
    {
        throw new Error(data);
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

export async function ActualizarUsuario(id, nombre, usuario, grupo, rol, table){
    Swal.fire({
        title: 'Insertar Datos del usuario',
        html:
            '<label for="swal-input1" class="form__label">Ingrese el nombre completo:</label>' +
            `<input id="swal-input1" class="double-form-container__form-input" value="${nombre}" placeholder="Nombre"><br>` +
            '<label for="swal-input2" class="form__label">Ingrese el nombre de usuario:</label>' +
            `<input id="swal-input2" class="double-form-container__form-input" value="${usuario}" placeholder="NombreUsuario"><br>` +
            '<label for="swal-input2" class="form__label">Ingrese el grupo de clientes:</label>' +
            '<select name="cmbGrupoClientes" id="cmbGrupoClientes" class="double-form-container__form-combobox">' +
                '<option value="A">Clientes A</option>' +
                '<option value="B">Clientes B</option>' +
                '<option value="C">Clientes C</option>' +
                '<option value="S">Puede ver todos</option>' +
            '</select><br>' +
            '<label for="swal-input2" class="form__label">Ingrese el rol:</label>' +
            '<select name="cmbRol" id="cmbRol" class="double-form-container__form-combobox">' +
                '<option value="empleado" selected>Empleado</option>' +
                '<option value="admin">Administrador</option>' +
            '</select>',
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const nombre = Swal.getPopup().querySelector('#swal-input1').value;
            const apellido = Swal.getPopup().querySelector('#swal-input2').value;
            const rfc = Swal.getPopup().querySelector('#swal-input3').value;

            fetch('../Controllers/UsuarioController.php?Operacion=update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    nombre: nombre,
                    apellido: apellido,
                    rfc: rfc,
                }),
            })
        }
    }).then((result) => {
        // Maneja la respuesta de la petición AJAX
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Éxito',
                text: 'Datos insertados correctamente.',
                icon: 'success'
            });

            ActualizarTablaUsuarios(table);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al insertar datos.',
                icon: 'error'
            });
        }
    });
}

export function EliminarUsuario(nombreUsuario, tabla){
    Swal.fire({
        title: "¿Está seguro de borrar el cliente?",
        text: "No se podrá recuperar la información",
        icon: "warning",
        showCancelButton: true, 
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, estoy seguro!"
    }).then(async (result) => {
        if (result.isConfirmed) {

            let request = await fetch('../Controllers/UsuarioController.php?Operacion=delete&nombreUsuario=' + nombreUsuario)

            let mensaje = await request.json();

            if(request.ok)
            {
                Swal.fire({
                    title: "¡Acción realizada con éxito!",
                    text: mensaje,
                    icon: "success"
                });

                ActualizarTablaUsuarios(tabla)
            }
            else
            {
                throw new Error(mensaje);
            }
        }
    });
}

export function ActualizarTablaUsuarios(table){
    table.updateConfig({
        columns: ["ID", "Nombre completo", "Nombre de usuario", "Grupo de clientes", "Rol", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: 'http://localhost/VencimientoDeCertificados/App/Controllers/UsuarioController.php?Operacion=view',
            then: data => data.map(usuario => [usuario[0], usuario[1], usuario[2], usuario[3], usuario[4]])
        }
    }).forceRender();
}

/**********************************************************/
/*                     Metodos del usuario                */
/**********************************************************/

/**********************************************************/
/*                     Metodos del cliente                */
/**********************************************************/

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
            location.href = "pagina-principal.html";
        });
    }
    else
    {
        throw new Error(data);
    }
}

export async function EliminarCliente(rfc, tabla, url){
    Swal.fire({
        title: "¿Está seguro de borrar el cliente?",
        text: "No se podrá recuperar la información",
        icon: "warning",
        showCancelButton: true, 
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, estoy seguro!"
    }).then(async (result) => {
        if (result.isConfirmed) {

            let request = await fetch('../Controllers/ClienteController.php?Operacion=delete&&rfc=' + rfc)

            let mensaje = await request.json();

            if(request.ok)
            {
                Swal.fire({
                    title: "¡Acción realizada con éxito!",
                    text: mensaje,
                    icon: "success"
                });

                ActualizarTablaClientes(tabla, url)
            }
            else
            {
                throw new Error(mensaje);
            }
        }
    });
}

export function ActualizarTablaClientes(table, url)
{
    table.updateConfig({
        columns: ["RFC", "Nombre", "Grupo", "Vencimiento del sello", "Status del sello", "Vencimiento de la firma", "Status de la firma", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], MostrarVigencia(cliente[3]), cliente[6], MostrarVigencia(cliente[5])])
        }
    }).forceRender();
}

/**********************************************************/
/*                     Metodos del cliente                */
/**********************************************************/