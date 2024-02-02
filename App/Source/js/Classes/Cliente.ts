import { Certificado } from "./Certificado.ts";

export class Cliente
{
    public Nombre : string;
    public Rfc : string;
    public Grupo : string;
    public Sello : Certificado;
    public Firma : Certificado;

    constructor()
    {
        //Inicializacion de las propiedades del cliente
        this.Nombre = "Desconocido";
        this.Rfc = "Desconocida";
        this.Grupo = "";

        //Inicializacion del sello y firma
        this.Sello = new Certificado();
        this.Firma = new Certificado();
    }
}