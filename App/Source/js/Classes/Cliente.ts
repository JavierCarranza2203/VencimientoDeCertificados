import { Certificado } from "./Certificado.ts";

export class Cliente
{
    public Nombre : string;
    public Rfc : string;
    public Grupo : string;
    public Sello : Certificado;
    public Firma : Certificado;

    constructor(nombre : string, rfc : string, grupo : string, fechaVencimientoFirma : string, statusFirma : boolean, fechaVencimientoSello : string, statusSello : boolean) {
        //Inicializacion de las propiedades del cliente
        this.Nombre = nombre;
        this.Rfc = rfc;
        this.Grupo = grupo;

        //Inicializacion del sello y firma
        this.Sello = new Certificado();
        this.Firma = new Certificado();
    }
}