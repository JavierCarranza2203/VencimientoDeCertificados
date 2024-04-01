import { Cliente } from "../Classes/Cliente.js";
import { Usuario } from "../Classes/Usuario.js";
import { AgregarCliente, ValidarUsuarioLogeado } from "./Peticiones.js";

//Método que realiza la llamada al método de validar sesión
export async function PermitirAcceso()
{
    try
    {
        //Llama al método para validar la sesión
        const data = await ValidarUsuarioLogeado(); //NOTA: En caso de que no haya sesión, genera una excepción

        //Obtiene el bloqueador de contenido y lo oculta
        document.getElementById("blocker").classList.add("content-blocker--hidden");

        //Regresa un objeto anónimo de la clase usuario
        return new Usuario(data["NombreUsuario"], data["Rol"], data["GrupoClientes"]);
    }
    catch(error)
    {
        Swal.fire({
            icon: "error",
            title: "¡No tiene autorización!",
            text: error,
            footer: '<label>Si ya lo hizo, intente reiniciar el navegador.</label>',
            confirmButtonText: "Iniciar sesión",
            allowOutsideClick: false
        })
        .then((result)=>{ //En caso de que haya saltado la excepción, lo manda directamente a la página de login
            if(result.isConfirmed)
            {
                location.href = "../../index.html";
            }
        });
    }
}

//Este método se usa para construir un nuevo objeto cliente y posteriormente insertar a la db
export async function RecibirDatosDelNuevoCliente(txtNombreEnFirma, txtRfcEnFirma, txtFechaFinEnFirma, statusFirma, txtFechaFinEnSello, statusSello, bandera, grupo){
    try {
        //La bandera es utilizada para saber si el usuario no es admin o dev,
        //En caso de ser cualquiera de los dos, pide el grupo al que pertenece el nuevo cliente
        let grupo, claveCiec, regimenFiscal;
        if(bandera == true)
        {
            await Swal.fire({
                html:
                '<label for="cmbGrupoClientes" class="form__label">Ingrese el grupo de clientes:</label>' +
                '<select name="cmbGrupoClientes" id="cmbGrupoClientes" class="double-form-container__form-combobox">' +
                    '<option value="A" selected>Clientes A</option>' +
                    '<option value="B">Clientes B</option>' +
                    '<option value="C">Clientes C</option>' +
                '</select><br>' +

                '<label for="cmbRegimenFiscal" class="form__label">Ingrese el régimen fiscal:</label>' +
                '<select name="cmbRegimenFiscal" id="cmbRegimenFiscal" class="double-form-container__form-combobox">' +
                    '<option value="601" selected>601. General de Ley Personas Morales</option>' +
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

                '<label for="certificadoFiel" class="form__label">Ingrese la clave CIEC:</label>' +
                `<input type="file" name="txtClaveCiec" id="txtClaveCiec" class="double-form-container__form-input"><br>`,
                showCancelButton: true,
                confirmButtonText: 'Sí, insertar',
                cancelButtonText: 'Cancelar',
                backdrop: false,
                preConfirm: ()=>
                {
                    grupo = Swal.getPopup().querySelector('#cmbGrupoClientes').value;
                    regimenFiscal = Swal.getPopup().querySelector('#cmbRegimenFiscal').value;
                    claveCiec = Swal.getPopup().querySelector('#txtClaveCiec').value;
                }
            });
        }

        let NuevoCliente = new Cliente();

        NuevoCliente.Nombre = txtNombreEnFirma.value;
        NuevoCliente.Rfc = txtRfcEnFirma.value;
        NuevoCliente.Firma.FechaVencimiento = txtFechaFinEnFirma.value;
        NuevoCliente.Firma.Status = statusFirma.textContent;
        NuevoCliente.Sello.FechaVencimiento = txtFechaFinEnSello.value != '' && txtFechaFinEnSello.value != null? txtFechaFinEnSello.value : '';
        NuevoCliente.Sello.Status = statusSello.textContent != '' && statusSello.textContent != null? statusSello.textContent : false;
        NuevoCliente.Grupo = grupo;

        await AgregarCliente(JSON.stringify(NuevoCliente));
    }
    catch(error){
        throw new Error(error);
    }
}

//Metodo para validar los campos por expresiones comunes
export function ValidarCampos(campos)
{
    let i = 0;
    //Expresion regular que solo permite letras
    const soloLetras = /^[a-zA-ZÀ-ÿ\s]{1,40}$/;
    //Expresión regular que permite números y letras
    const letrasNumeros = /^[a-zA-ZÀ-ÿ0-9-.\s]{1,40}$/;

    //Recorre los campos recibidos por parametro y en caso de que el test falle, genera una excepcion
    campos.forEach(input => {
        if(!soloLetras.test(input.value)) {
            //Como el textbox para la contraseña está en el indice 2 del arreglo de textbox, probamos con la expresión para letras y números
            if(i == 2) {
                if(!letrasNumeros.test(input.value))
                {
                    throw new Error("Solo se admiten números y letras en la contraseña");
                }
            }
            else {
                //El espacio antes de la palabra "no" se puso a proposito para que no saliera el valor del input pegado a la palabra antes mencionada
                throw new Error(input.value + " no es un valor correcto");
            }
        }

        i++;
    });

    return true;
}

//Como en la base de datos maneja los valores booleanos guardando un 1 o un 0, este método nos permite
//mostrarle al usuario un mensaje que pueda entender (Vigente cuando es 1 o vencido cuando es 0)
export function MostrarVigencia(bitBooleano) {
    if(bitBooleano == 1){
        return "Vigente";
    }
    else{
        return "Vencido";
    }
}

//Este método muestra los números como formato de decimales. Ejemplo: 1234 lo muestra como 1,234.00
export function FormatearCadena(cadena) {
    return cadena.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        thousand: '.', 
        decimal: ','
    });
}

export function ConvertirNumeroDeMesALetra(numeroDelMes) {
    switch(numeroDelMes) {
        case 0: return 'ENERO';
        case 1: return 'FEBRERO';
        case 2: return 'MARZO';
        case 3: return 'ABRIL';
        case 4: return 'MAYO';
        case 5: return 'JUNIO';
        case 6: return 'JULIO';
        case 7: return 'AGOSTO';
        case 8: return 'SEPTIEMBRE';
        case 9: return 'OCTUBRE';
        case 10: return 'NOVIEMBRE';
        case 11: return 'DICIEMBRE';
        default: throw new Error("No se encontró el mes correspondiente"); //No se encontró el mes correspondiente
    }
}