import { Certificado } from "./Certificado.js";

export class Cliente
{
    Nombre;
    Rfc;
    Grupo;
    Sello;
    Firma;

    constructor(nombre, rfc, grupo, fechaVencimientoFirma, statusFirma, fechaVencimientoSello, statusSello) {
        //Inicializacion de las propiedades del cliente
        this.Nombre = nombre;
        this.Rfc = rfc;
        this.Grupo = grupo;

        //Inicializacion del sello y firma
        this.Sello = new Certificado();
        this.Firma = new Certificado();
    }
}