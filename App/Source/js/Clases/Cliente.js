import { Certificado } from "./Certificado.js";

export class Cliente
{
    constructor()
    {
        //Inicializacion de las propiedades del cliente
        this.Nombre = "Desconocido";
        this.Rfc = "Desconocida";

        //Inicializacion del sello y firma
        this.Sello = new Certificado()
        this.Firma = new Certificado();
    }

    //Get y set para la propiedad del nombre
    get Nombre() { return this.Nombre; }
    // set Nombre(n) { if(this.Nombre == "Desconocido"){ this.Nombre = n; } else { return } }

    //Get y set para la propiedad del RFC
    get Rfc() { return this.Rfc; }
    // set Rfc(value) { this.Rfc = value; }
}