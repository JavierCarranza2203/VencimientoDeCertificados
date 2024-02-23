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
        if(bandera == true)
        {
            await Swal.fire({
                title: "Ingrese el grupo de clientes al que pertenece",
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Aceptar",
                showLoaderOnConfirm: true,
                preConfirm: (group)=>
                {
                    grupo = group.toUpperCase();
                }
            });
        }

        let NuevoCliente = new Cliente();

        NuevoCliente.Nombre = txtNombreEnFirma.value;
        NuevoCliente.Rfc = txtRfcEnFirma.value;
        NuevoCliente.Firma.FechaVencimiento = txtFechaFinEnFirma.value;
        NuevoCliente.Firma.Status = statusFirma.textContent;
        NuevoCliente.Sello.FechaVencimiento = txtFechaFinEnSello.value;
        NuevoCliente.Sello.Status = statusSello.textContent;
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