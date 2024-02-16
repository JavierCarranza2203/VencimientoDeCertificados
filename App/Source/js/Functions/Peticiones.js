import { MostrarVigencia } from "./MetodosSinPeticion.js";

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
    else //Si no, genera una excepción con la respuesta del servidor
    {
        throw new Error(await response.json());
    }
}

export async function AgregarNuevoUsuario(nombreCompleto, nombreUsuario, contrasenia, grupoClientes, rol)
{
    //Crea una instancia del objeto FormData y agrega los campos
    const formData = new FormData();
    formData.append('NombreCompleto', nombreCompleto);
    formData.append('NombreDeUsuario', nombreUsuario);
    formData.append('Contrasenia', contrasenia);
    formData.append('GrupoDeClientes', grupoClientes);
    formData.append('Rol', rol);

    //Realiza el envío de la solicitud POST al controlador que se encarga de agregar nuevos usuarios
    const response = await fetch("../Controllers/UsuarioController.php?Operacion=add", {
        method: "POST",
        body: formData
    });

    //Lee el resultado de la operación
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
            `<input id="swal-input1" class="double-form-container__form-input" value="${ nombre }" placeholder="Nombre"><br>` +
            '<label for="swal-input2" class="form__label">Ingrese el nombre de usuario:</label>' +
            `<input id="swal-input2" class="double-form-container__form-input" value="${ usuario }" placeholder="NombreUsuario"><br>` +
            '<label for="cmbGrupoClientes" class="form__label">Ingrese el grupo de clientes:</label>' +
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
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const nombre = Swal.getPopup().querySelector('#swal-input1').value;
            const usuario = Swal.getPopup().querySelector('#swal-input2').value;
            const grupoClientes = Swal.getPopup().querySelector('#cmbGrupoClientes').value;
            const rol = Swal.getPopup().querySelector('#cmbRol').value;

            fetch('../Controllers/UsuarioController.php?Operacion=update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    nombre: nombre,
                    usuario: usuario,
                    grupoClientes: grupoClientes,
                    rol: rol
                }),
            });
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
    //Muestra un modal para eliminar el usuario
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
    //Actualizamos la configuración de la tabla y volviendo a hacer la petición
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
            url: '../Controllers/UsuarioController.php?Operacion=view',
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
    //Envía la solicitud por método POST al server
    const response = await fetch("../Controllers/ClienteController.php?Operacion=add",
    {
        method:"POST",
        body: jsonCliente
    });

    //Lee la respuesta del servidor
    let data = await response.json()

    //Si responde con un código 200
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

export async function EditarCertificadosDelCliente(rfc, tabla, url){
    Swal.fire({
        title: 'Modificar cliente',
        html:
            '<label for="txtRfc" class="form__label">RFC del cliente a editar:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="${rfc}" placeholder="RFC" readonly><br>` +

            '<label for="certificadoSello" class="form__label">Ingrese certificado del sello:</label>' +
            `<input type="file" name="certificadoSello" id="certificadoSello" class="double-form-container__form-input"><br>` +

            '<label for="certificadoFiel" class="form__label">Ingrese certificado de la firma:</label>' +
            `<input type="file" name="certificadoFiel" id="certificadoFiel" class="double-form-container__form-input"><br>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const Rfc = Swal.getPopup().querySelector('#txtRfc').value;
            const CertificadoSello = Swal.getPopup().querySelector('#certificadoSello').files[0];
            const CertificadoFirma = Swal.getPopup().querySelector('#certificadoFiel').files[0];

            if(CertificadoSello == null && CertificadoFirma == null) { throw new Error("Debe ingresar por lo menos un dato"); }
            let datos = new FormData();
            datos.append("Rfc", Rfc);
            datos.append("CertificadoSello", CertificadoSello);
            datos.append("CertificadoFirma", CertificadoFirma);

            fetch('../Controllers/ClienteController.php?Operacion=updateCertificates', {
                method: 'POST',
                body: datos,
            });
        }
    }).then((result) => {
        // Maneja la respuesta de la petición AJAX
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Éxito',
                text: 'Datos insertados correctamente.',
                icon: 'success'
            });

            ActualizarTablaClientes(tabla, url);
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
    })
    .catch((error)=>{
        Swal.fire({
            title: 'Error',
            text: error,
            icon: 'error'
        });
    });
}

export async function EditarDatosDelCliente(rfc, clave, tabla, url){
    Swal.fire({
        title: 'Modificar cliente',
        html:
            '<label for="txtRfc" class="form__label">RFC del cliente a editar:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="${rfc}" placeholder="RFC" readonly><br>` +

            '<label for="certificadoSello" class="form__label">Ingrese certificado del sello:</label>' +
            `<input type="file" name="certificadoSello" id="certificadoSello" class="double-form-container__form-input"><br>` +

            '<label for="txtRfc" class="form__label">Ingrese la nueva clave CIEC:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="${rfc}" placeholder="Clave CIEC"><br>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const Rfc = Swal.getPopup().querySelector('#txtRfc').value;
            const CertificadoSello = Swal.getPopup().querySelector('#certificadoSello').files[0];
            const CertificadoFirma = Swal.getPopup().querySelector('#certificadoFiel').files[0];

            if(CertificadoSello == null && CertificadoFirma == null) { throw new Error("Debe ingresar por lo menos un dato"); }
            let datos = new FormData();
            datos.append("Rfc", Rfc);
            datos.append("CertificadoSello", CertificadoSello);
            datos.append("CertificadoFirma", CertificadoFirma);

            fetch('../Controllers/ClienteController.php?Operacion=updateCertificates', {
                method: 'POST',
                body: datos,
            });
        }
    }).then((result) => {
        // Maneja la respuesta de la petición AJAX
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Éxito',
                text: 'Datos insertados correctamente.',
                icon: 'success'
            });

            ActualizarTablaClientes(tabla, url);
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
    })
    .catch((error)=>{
        Swal.fire({
            title: 'Error',
            text: error,
            icon: 'error'
        });
    });
}

export function ActualizarTablaClientes(table, url)
{
    table.updateConfig({
        columns: ["Nombre", "Grupo", "Vigencia del sello", "Vigencia de la firma", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[1], cliente[2], cliente[7], cliente[5]])
        }
    }).forceRender();
}

/**********************************************************/
/*                     Metodos del cliente                */
/**********************************************************/

/**********************************************************/
/*                Auto Update Service Request             */
/**********************************************************/

export async function RunAutoUpdateService()
{
    let message;
    await Swal.fire({
        title: "Mensaje de AUS",
        html:
            '<label for="txtGrupo" class="form__label">Ingrese el grupo de clientes para agregar:</label><br>' +
            `<input id="txtGrupo" class="double-form-container__form-input" placeholder="Ejemplo: A, B o C">`,
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        showLoaderOnConfirm: true,
        backdrop: false,
        preConfirm: async ()=>
        {
            let grupo = Swal.getPopup().querySelector('#txtGrupo').value.toUpperCase();

            if(grupo != 'A' && grupo != 'B' && grupo != 'C'){ throw new Error("El grupo no es válido."); }
            
            let response = await fetch("../Controllers/AutoUpdateController.php?status=run&&grupo=" + grupo);

            message = await response.json();

            if(!response.ok)
            {
                throw new Error(message);
            }
        }
    }).then((result)=>{
        // Maneja la respuesta de la petición AJAX
        if (result.isConfirmed) {
            Swal.fire({
                title: "Mensaje de AUS",
                html: `
                    <h2>${message["Mensaje"]}</h2>
                    <p>Agregados: ${ message["Agregados"] }</p>
                    <p>Errores: ${message["Con Errores"]}</p>
                    <p>Confusiones: ${message["Confusiones"]}</p>
                `,
                icon: "info"
            });
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

/**********************************************************/
/*                Auto Update Service Request             */
/**********************************************************/

/**********************************************************/
/*       Método para generar relaciones de excel          */
/**********************************************************/

export async function LeerArchivoDeExcel(archivo, orderBy){
    //Genera una instancia de la clase FormData
    const formData = new FormData();

    //Agrega el campo "Certificado" al formdata y asigna el valor
    formData.append("ReporteDeGastos", archivo);

    //Realiza la petición al controlador del certificado
    const response = await fetch("http://localhost:8082/leer_archivo?orderBy=" + orderBy, {
        method: "POST",
        body: formData,
    });

    //Si la petición responde con estado 200, regresa los datos del certificado
    if(response.ok)
    {
        return await response.json();
    }
    else {
        throw new Error(await response.json());
    }
}

/**********************************************************/
/*       Método para generar relaciones de excel          */
/**********************************************************/