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
    const response = await fetch("../Controllers/UsuarioController.php?Operacion=userLogged", { method:"GET" })

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
    console.log(jsonCliente);

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
    let res;
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
        preConfirm: async () => {
            // Obtiene los valores de los campos de entrada
            const Rfc = Swal.getPopup().querySelector('#txtRfc').value;
            const CertificadoSello = Swal.getPopup().querySelector('#certificadoSello').files[0];
            const CertificadoFirma = Swal.getPopup().querySelector('#certificadoFiel').files[0];

            if(CertificadoSello == null && CertificadoFirma == null) { throw new Error("Debe ingresar por lo menos un dato"); }
            let datos = new FormData();
            datos.append("Rfc", Rfc);
            datos.append("CertificadoSello", CertificadoSello);
            datos.append("CertificadoFirma", CertificadoFirma);

            await fetch('../Controllers/ClienteController.php?Operacion=updateCertificates', {
                method: 'POST',
                body: datos,
            }).then(async (response) => {

                if(response.ok) {
                    await Swal.fire({
                        title: 'Éxito',
                        text: 'Datos insertados correctamente.',
                        icon: 'success'
                    });

                    ActualizarTablaClientes(tabla, url);
                }
                else{
                    let mensaje = await response.json();
                    
                    throw new Error(mensaje)
                }
            });
        }
    }).then((result) => {
        // Maneja la respuesta de la petición AJAX
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
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

            '<label for="certificadoSello" class="form__label">Ingrese el nuevo régimen fiscal:</label>' +
            '<select name="cmbRegimenFiscal" id="cmbRegimenFiscal" class="double-form-container__form-combobox">' +
                '<option value="601">601. General de Ley Personas Morales</option>' +
                '<option value="603">603. Personas Morales con Fines no Lucrativos</option>' +
                '<option value="605">605. Sueldos y Salarios e Ingresos Asimilados a Salarios</option>' +
                '<option value="606">606. Arrendamiento</option>' +
                '<option value="607">607. Régimen de Enajenación o Adquisición de Bienes</option>' +
                '<option value="608">608. Demás ingresos</option>' +
                '<option value="609">609. Consolidación</option>' +
                '<option value="610">610. Residentes en el Extranjero sin Establecimineto Permanente en México</option>' +
                '<option value="611">611. Ingresos por Dividendos (socios y accionistas)</option>' +
                '<option value="612">612. Personas Físicas con Actividades Empresariales y Profesionales</option>' +
                '<option value="614">614. Ingresos por intereses</option>' +
                '<option value="615">615. Régimen de los ingresos por obtención de premios</option>' +
                '<option value="616">616. Sin obligaciones fiscales</option>' +
                '<option value="620">620. Sociedades Cooperativas de Producción que optan por diferir sus ingresos</option>' +
                '<option value="621">621. Régimen de Incorporación Fiscal (RIF)</option>' +
                '<option value="622">622. Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</option>' +
                '<option value="623">623. Opcional para Grupos de Sociedades</option>' +
                '<option value="624">624. Coordinados</option>' +
                '<option value="625">625. Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>' +
                '<option value="626">626. Régimen Simplificado de Confianza (RESICO)</option>' +
                '<option value="628">628. Hidrocarburos</option>' +
                '<option value="629">629. De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales</option>' +
                '<option value="630">630. Enajenación de acciones en bolsa de valores</option>' +
            '</select><br>' +

            '<label for="txtRfc" class="form__label">Ingrese la nueva clave CIEC:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="${clave}" placeholder="Clave CIEC"><br>`,
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

            fetch('../Controllers/ClienteController.php?Operacion=updateInformation', {
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
                text: res['message'],
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
        columns: ["RFC", "Nombre", "Grupo", "Clave CIEC", "Régimen fiscal", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit"></i>`;
                const eliminarIcono = `<i class="fas fa-trash"></i>`;

                return gridjs.html(`<div class="acciones">${editarIcono} ${eliminarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[3], 
                cliente[8]])
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

    let mensaje = await response.json();
    //Si la petición responde con estado 200, regresa los datos del certificado
    if(response.ok)
    {
        return mensaje;
    }
    else {
        throw new Error(mensaje['message']);
    }
}

/**********************************************************/
/*       Método para generar relaciones de excel          */
/**********************************************************/

export async function TimbrarContraRecibo(rfc, tarifa) {
    let folio;

    Swal.fire({
        title: 'Timbrar contra recibo',
        html:
            '<label for="txtRfc" class="form__label">RFC del cliente a timbrar:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="${rfc}" placeholder="RFC" readonly><br>` +

            '<label for="txtTarifa" class="form__label">Tarifa mensual:</label>' +
            `<input id="txtTarifa" class="double-form-container__form-input" value="${tarifa}" placeholder="Tarifa" readonly><br>` +

            '<label for="txtConcepto" class="form__label">Ingrese el concepto:</label>' +
            `<input id="txtConcepto" class="double-form-container__form-input" placeholder="HONORARIOS DEL MES DE..."><br>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const Rfc = Swal.getPopup().querySelector('#txtRfc').value;
            const Concepto = Swal.getPopup().querySelector('#txtConcepto').value;

            if(Concepto === null || Concepto === '') { throw new Error("Debe ingresar por lo menos un dato"); }
            
            let datos = new FormData();
            datos.append("rfc", Rfc);
            datos.append("concepto", Concepto);

            fetch('../Controllers/ClienteController.php?Operacion=stampTicket', {
                method: 'POST',
                body: datos,
            }).then(async response => {
                if(response.ok) {

                    Swal.fire({
                        title: 'Éxito',
                        text: 'El contra recibo se ha timbrado.',
                        icon: 'success'
                    });
                }
                else {
                    Swal.fire({
                        title: '¡Error al timbrar!',
                        text: "Verifique que no haya un contra-recibo con el mismo concepto e intente de nuevo, por favor.",
                        icon: 'error'
                    });
                }
            });
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: res['message'],
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

export async function RegistrarPago(rfc, table) {
    Swal.fire({
        title: 'Realizar pago',
        html:
            '<label for="txtRfc" class="form__label">RFC del cliente a pagar:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="${rfc}" placeholder="RFC" readonly><br>` +

            '<label for="txtMonto" class="form__label">Cantidad pagada (Sin decimales):</label>' +
            `<input id="txtMonto" class="double-form-container__form-input" placeholder="Monto"><br>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const Rfc = Swal.getPopup().querySelector('#txtRfc').value;
            const Monto = Swal.getPopup().querySelector('#txtMonto').value;

            if(Monto === null || Monto === '') { throw new Error("Debe ingresar por lo menos un dato"); }
            
            let datos = new FormData();
            datos.append("rfc", Rfc);
            datos.append("monto", Monto);

            fetch('../Controllers/ClienteController.php?Operacion=pay', {
                method: 'POST',
                body: datos,
            }).then(async response => {
                if(response.ok) {
                    Swal.fire({
                        title: 'Éxito',
                        text: 'Datos insertados correctamente.',
                        icon: 'success'
                    });

                    table.updateConfig({
                        search: true,
                        columns: ["RFC", "Cliente", "Calle", "Colonia", "Número", "Ciudad", "Estado", "C.P.", "Tarifa mensual", "Activo", "Saldo actual", {
                            name: 'Acciones',
                            formatter: (cell, row) => {
                                const editarIcono = `<i class="fas fa-edit" aria-hidden="true" title="Editar datos"></i>`;
                                const eliminarIcono = `<i class="fas fa-trash" aria-hidden="true" title="Dejar de timbar"></i>`;
                                const estadoDeCuenta = `<i class="fa-solid fa-tablet" aria-hidden="true" title="Estado de cuenta"></i>`;
                                const agregarPago = `<i class="fa-solid fa-sack-dollar" aria-hidden="true" title="Registrar pago"></i>`

                                return gridjs.html(`<div class="acciones">${estadoDeCuenta}${editarIcono}${eliminarIcono}${agregarPago}</div>`);
                            }
                        }],
                        server: {
                            url: '../Controllers/ClienteController.php?Operacion=viewInfoTimbrado',
                            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], cliente[3], cliente[5], cliente[6], cliente[7], "$" + cliente[10] + ".00", cliente[8], "$" + cliente[9] + ".00"])
                        },
                        pagination: {
                            limit: 6
                        },
                        language: {
                            'search': {
                                'placeholder': '🔍 Escriba para buscar...'
                            }
                        }
                    }).forceRender();
                }
                else {
                    const error = await response.json();
                    console.log(error);

                    if(error === null || error === '' || typeof(error) === 'undefined') {
                        error = "Intente de nuevo o llame al administrador del sistema."
                    }

                    Swal.fire({
                        title: '¡Error al realizar el pago!',
                        text: error,
                        icon: 'error'
                    });
                }
            });
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: result['message'],
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

export async function GenerarReporteDeContraRecibosTimbrados() {
    Swal.fire({
        title: 'Generar reporte de Excel',
        html:
            '<label for="txtRfc" class="double-form-container__form-label swal-label">Ingrese el RFC del cliente (Si así lo requiere):</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="TODOS" placeholder="RFC"><br>` +

            '<label for="txtTarifa" class="double-form-container__form-label swal-label">Ingrese la fecha inicial:</label>' +
            `<input type="date" name="txtFechaInicial" id="txtFechaInicial" class="double-form-container__form-input"><br>` +

            '<label for="txtConcepto" class="double-form-container__form-label swal-label">Ingrese la fecha final:</label>' +
            `<input type="date" name="txtFechaFinal" id="txtFechaFinal" class="double-form-container__form-input"><br>`,
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const Rfc = Swal.getPopup().querySelector('#txtRfc').value.toUpperCase();
            const FechaInicial = Swal.getPopup().querySelector('#txtFechaInicial').value;
            const FechaFinal = Swal.getPopup().querySelector('#txtFechaFinal').value;

            if(Rfc === null || Rfc === '' || FechaFinal === '' || FechaInicial === '') { throw new Error('Debe llenar todos los campos'); }

            if(!/^([A-ZÑ&]{3,4}) ?(?:- ?)?([0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1-2][0-9]|3[0-1])) ?(?:- ?)?([A-Z0-9]{2}) ?([A-Z0-9]{1})$/.test(Rfc) && Rfc != "TODOS") 
            {
                throw new Error('El RFC ingresado no es válido. Si desea generar de todos los clientes, escriba "TODOS"');
            }

            let datos = new FormData();

            datos.append("rfc", Rfc);
            datos.append("fechaInicial", FechaInicial);
            datos.append("fechaFinal", FechaFinal);

            Swal.fire({
                title: "El archivo se está generando",
                text: "Espere por favor",
                timerProgressBar: true,
                backdrop: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            fetch(`http://localhost:8082/generar-reporte-contrarecibos-timbrados?rfc=${Rfc}&fechaInicial=${FechaInicial}&fechaFinal=${FechaFinal}`, {
                method: 'POST'
            }).then(async response => {
                if(response.ok) {
                    let blob = await response.blob();
                    let url = window.URL.createObjectURL(blob);
                    let a = document.createElement('a');
                    a.href = url;

                    if(Rfc === "TODOS") {
                        a.download = 'Contra Recibos timbrados ' + FechaInicial + ' a ' + FechaFinal;
                    }
                    else {
                        a.download = 'Contra Recibos timbrados ' + FechaInicial + ' a ' + FechaFinal + ' -- ' + Rfc;
                    }

                    Swal.fire({
                        title: 'Éxito',
                        text: 'El archivo se ha generado correctamente.',
                        icon: 'success'
                    });

                    a.click();
                }
                else {
                    const data = await response.json();
                    Swal.fire({
                        title: '¡Error al generar el archivo!',
                        text: data["message"],
                        icon: 'error'
                    });
                }
            }).catch(error => {
                Swal.fire({
                    title: '¡Error al generar el archivo!',
                    text: error,
                    icon: 'error'
                });
            })
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
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

export async function EditarDetallesDeTimbrado(rfc, nombre, calle, colonia, numero, ciudad, estado, cp, tarifaM, table) {
    Swal.fire({
        title: 'Editar a ' + nombre,
        html:
            '<label for="txtCalle" class="double-form-container__form-label swal-label">Calle:</label>' +
            `<input id="txtCalle" class="double-form-container__form-input" value="${calle}" placeholder="Calle de domicilio">` +

            '<label for="txtColonia" class="double-form-container__form-label swal-label">Colonia:</label>' +
            `<input id="txtColonia" class="double-form-container__form-input" value="${colonia}" placeholder="Colonia de domicilio">` +

            '<label for="txtNumero" class="double-form-container__form-label swal-label">Número exterior o interior:</label>' +
            `<input id="txtNumero" class="double-form-container__form-input" value="${numero}" placeholder="Número exterior o interior">` +

            '<label for="txtCiudad" class="double-form-container__form-label swal-label">Ciudad:</label>' +
            `<input id="txtCiudad" class="double-form-container__form-input" value="${ciudad}" placeholder="Ciudad">` +

            '<label for="txtEstado" class="double-form-container__form-label swal-label">Estado:</label>' +
            `<input id="txtEstado" class="double-form-container__form-input" value="${estado}" placeholder="Estado">` +

            '<label for="txtCodigoPostal" class="double-form-container__form-label swal-label">Código postal:</label>' +
            `<input id="txtCodigoPostal" class="double-form-container__form-input" value="${cp}" placeholder="Código postal">   ` +

            '<label for="txtTarifa" class="double-form-container__form-label swal-label">Tarifa mensual (Sin decimales y signos):</label>' +
            `<input id="txtTarifa" class="double-form-container__form-input" value="${tarifaM}" placeholder="Tarifa mensual">`,
        showCancelButton: true,
        confirmButtonText: 'Sí, insertar',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            const calle = Swal.getPopup().querySelector('#txtCalle').value.toUpperCase();
            const colonia = Swal.getPopup().querySelector('#txtColonia').value.toUpperCase();
            const numero = Swal.getPopup().querySelector('#txtNumero').value.toUpperCase();
            const ciudad = Swal.getPopup().querySelector('#txtCiudad').value.toUpperCase();
            const estado = Swal.getPopup().querySelector('#txtEstado').value.toUpperCase();
            const codigoPostal = Swal.getPopup().querySelector('#txtCodigoPostal').value.toUpperCase();
            const tarifa = Swal.getPopup().querySelector('#txtTarifa').value.toUpperCase();

            let datos = new FormData();

            datos.append("rfc", rfc);
            datos.append("calle", calle);
            datos.append("colonia", colonia);
            datos.append("numero", numero);
            datos.append("ciudad", ciudad);
            datos.append("estado", estado);
            datos.append("codigoPostal", codigoPostal);
            datos.append("tarifaMensual", tarifa);

            fetch(`../Controllers/ClienteController.php?Operacion=updateTicketsInfo`, {
                method: 'POST',
                body: datos
            }).then(async response => {
                if(response.ok) {
                    Swal.fire({
                        title: 'Éxito',
                        text: 'El cliente se ha actualizado.',
                        icon: 'success'
                    });

                    ActualizarTablaClienteContraRecibos(table);
                }
                else {
                    const data = await response.json();

                    Swal.fire({
                        title: '¡Error al editar el cliente!',
                        text: data,
                        icon: 'error'
                    });
                }
            }).catch(error => {
                Swal.fire({
                    title: '¡Error al editar el cliente!',
                    text: error,
                    icon: 'error'
                });
            })
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
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

export async function CancelarContraRecibo(folio, table) {
    Swal.fire({
        title: "Se cancelará el contra recibo con folio " + folio,
        text: "Deberá timbrar otro en caso de error",
        icon: "warning",
        showCancelButton: true, 
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "¡Si, cancelar contrarecibo!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            fetch('../Controllers/ClienteController.php?Operacion=cancelTicket&folio=' + folio).then(async response => {
                const data = await response.json();
                if(response.ok) {
                    Swal.fire({
                        title: '¡Acción realizada con éxito!',
                        text: data,
                        icon: 'success'
                    });

                    ActualizarTablaContraRecibos(table);
                }
                else {
                    Swal.fire({
                        title: '¡Error al cancelar el contrarecibo!',
                        text: data,
                        icon: 'error'
                    });
                }
            }).catch(error => {
                Swal.fire({
                    title: '¡Error al cancelar el contrarecibo!',
                    text: error,
                    icon: 'error'
                });
            })
        }
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
            });
        }
    });
}

export async function ActualizarTablaContraRecibos(table) {
    table.updateConfig({
        search: true,
        columns: ["Folio", "Fecha y hora", "Cliente", "Concepto", "Importe", "Estatus", {
            name: 'Cancelar',
            formatter: (cell, row) => {
                const timbrarIcono = `<i class="fa-solid fa-trash" aria-hidden="true" title="Cancelar Contra Recibo"></i>`;

                return gridjs.html(`<div class="acciones">${timbrarIcono}</div>`);
            }
        }],
        server: {
            url: '../Controllers/ClienteController.php?Operacion=viewRecibos',
            then: data => data.map(recibo => [recibo[0], recibo[1] + " " + recibo[2], recibo[3], 
                recibo[7], "$" + recibo[8] + ".00", recibo[9]])
        },
        pagination: {
            limit: 10
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).forceRender();
}

export async function ActualizarTablaClienteContraRecibos(table) {
    table.updateConfig({
        search: true,
        columns: ["RFC", "Cliente", "Calle", "Colonia", "Número", "Ciudad", "Estado", "C.P.", "Tarifa mensual", "Activo", "Saldo actual", {
            name: 'Acciones',
            formatter: (cell, row) => {
                const editarIcono = `<i class="fas fa-edit" aria-hidden="true" title="Editar datos"></i>`;
                const eliminarIcono = `<i class="fas fa-trash" aria-hidden="true" title="Dejar de timbar"></i>`;
                const estadoDeCuenta = `<i class="fa-solid fa-tablet" aria-hidden="true" title="Estado de cuenta"></i>`;
                const agregarPago = `<i class="fa-solid fa-sack-dollar" aria-hidden="true" title="Registrar pago"></i>`

                return gridjs.html(`<div class="acciones">${estadoDeCuenta}${editarIcono}${eliminarIcono}${agregarPago}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(cliente => [cliente[0], cliente[1], cliente[2], cliente[4], cliente[3], cliente[5], cliente[6], cliente[7], "$" + cliente[10] + ".00", cliente[8], "$" + cliente[9] + ".00"])
        },
        pagination: {
            limit: 6
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).forceRender();
}

export async function DejarDeTimbrarContraRecibos(rfc, table, nombre) {
    Swal.fire({
        title: nombre + " dejará de timbrar contra recibos",
        text: "Los contra recibos ya timbrados seguirán existiendo",
        icon: "warning",
        showCancelButton: true, 
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "¡Si, cancelar cliente!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            fetch('../Controllers/ClienteController.php?Operacion=cancelCustomer&rfc=' + rfc).then(async response => {
                const data = await response.json();
                if(response.ok) {
                    Swal.fire({
                        title: '¡Acción realizada con éxito!',
                        text: data,
                        icon: 'success'
                    });

                    ActualizarTablaClienteContraRecibos(table);
                }
                else {
                    Swal.fire({
                        title: '¡Error al cancelar el cliente!',
                        text: data,
                        icon: 'error'
                    });
                }
            }).catch(error => {
                Swal.fire({
                    title: '¡Error al cancelar el cliente!',
                    text: error,
                    icon: 'error'
                });
            })
        }
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
            });
        }
    });
}