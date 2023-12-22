import { Cliente } from "../Clases/Cliente.js";
import { Usuario } from "../Clases/Usuario.js";
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

        NuevoCliente._strNombre = txtNombreEnFirma.value;
        NuevoCliente._strRfc = txtRfcEnFirma.value;
        NuevoCliente.Firma._dtmFechaVencimiento = txtFechaFinEnFirma.value;
        NuevoCliente.Firma._blnStatus = statusFirma.textContent;
        NuevoCliente.Sello._dtmFechaVencimiento = txtFechaFinEnSello.value;
        NuevoCliente.Sello._blnStatus = statusSello.textContent;
        NuevoCliente._chrGrupo = grupo;

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
    //Expresion común que solo permite letras
    const soloLetras = /^[a-zA-ZÀ-ÿ\s]{1,40}$/;
    const letrasNumeros = /^[a-zA-ZÀ-ÿ0-9-.\s]{1,40}$/;

    //Recorre los campos recibidos por parametro y en caso de que el test falle, genera una excepcion
    campos.forEach(input => {
        if(!soloLetras.test(input.value))
        {
            if(i == 2)
            {
                if(!letrasNumeros.test(input.value))
                {
                    throw new Error("Solo se admiten números y letras en la contraseña");
                }
            }
            else
            {
                throw new Error(input.value + " no es un valor correcto");
            }
        }

        i++;
    });

    return true;
}

export function MostrarVigencia(bitBooleano)
{
    if(bitBooleano == 1){
        return "Vigente";
    }
    else{
        return "Vencido";
    }
}