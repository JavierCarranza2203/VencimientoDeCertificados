import { Certificado } from "./Certificado.js";

export class Cliente
{
    constructor()
    {
        //Inicializacion de las propiedades del cliente
        this._strNombre = "Desconocido";
        this._strRfc = "Desconocida";
        this._chrGrupo = "";

        //Inicializacion del sello y firma
        this.Sello = new Certificado()
        this.Firma = new Certificado();
    }

    //Get y set para la propiedad del nombre
    get Nombre() { return this._strNombre; }

    //Get y set para la propiedad del RFC
    get Rfc() { return this._strRfc; }

    //Get para el grupo de clientes
    get Grupo() { return this._chrGrupo;}
}