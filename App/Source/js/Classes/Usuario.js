export class Usuario
{
    Nombre;
    Rol;
    GrupoClientes;

    constructor(nombre, rol, grupoClientes)
    {
        this.Nombre = nombre;
        this.Rol = rol;
        this.GrupoClientes = grupoClientes;
    }
}