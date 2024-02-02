export class Usuario
{
    private Nombre : string;
    private Rol : string;
    private GrupoClientes : string;

    constructor(nombre : string, rol : string, grupoClientes : string)
    {
        this.Nombre = nombre;
        this.Rol = rol;
        this.GrupoClientes = grupoClientes;
    }
}