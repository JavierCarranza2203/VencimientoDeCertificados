import { Cliente } from "../Clases/Cliente.js";
import { Usuario } from "../Clases/Usuario.js";
import { AgregarCliente, ValidarUsuarioLogeado } from "./Peticiones.js";

export async function PermitirAcceso()
{
    try
    {
        const data = await ValidarUsuarioLogeado();

        document.getElementById("blocker").classList.add("content-blocker--hidden");

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
        .then((result)=>{
            if(result.isConfirmed)
            {
                location.href = "../../index.html";
            }
        });
    }
}

//Este método se usa para construir un nuevo objeto cliente y posteriormente insertar a la db
export async function RecibirDatosDelNuevoCliente(txtNombreEnFirma, txtRfcEnFirma, txtFechaFinEnFirma, statusFirma, txtFechaFinEnSello, statusSello, bandera, grupo){
    try{
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

export function ValidarCampos(campos)
{
    const soloLetras = /^[a-zA-ZÀ-ÿ\s]{1,40}$/;

    campos.forEach(input => {
        if(!soloLetras.test(input.value))
        {
            throw new Error(input.value + " no es un valor correcto");
        }
    });

    return true;
}