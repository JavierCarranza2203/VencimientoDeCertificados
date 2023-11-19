export class Usuario
{
    constructor(nombre, rol, grupoClientes)
    {
        this._strNombre = nombre;
        this._strRol = rol;
        this._chrGrupoClientes = grupoClientes;
    }

    get Nombre(){ return this._strNombre; }

    get Rol() { return this._strRol; }

    get GrupoClientes() { return this._chrGrupoClientes; }
}