import { DigitalCertificate } from "./DigitalCertificate.ts";

export class Customer {
    
    private _dcCSD : DigitalCertificate;
    private _dcFIEL : DigitalCertificate;
    private _strGroup : string;

    constructor() {
        this.Name = "Desconocido";
        this.Rfc = "Desconocida";
        this._strGroup = "";

        //Inicializacion del sello y firma
        this._dcCSD = new DigitalCertificate()
        this._dcFIEL = new DigitalCertificate();
    }

    public Name : string;
    public Rfc : string;

    public set Group(value : string) {
        if(value != 'A' && value != 'B' && value != 'C') {
            throw new Error("El grupo para el cliente no existe. Debe ser A, B o C");
        }
        else {
            this._strGroup=value;
        }
    }
    public get Group() { return this._strGroup; }

    /**
     *  AddCsd
     */
    public AddCSD(expirationDate : Date, type : string) : void {
        this._dcCSD.ExpirationDate = expirationDate;

        if(type === "CSD") { this._dcCSD.Type = "CSD"; }
        else { throw new Error("Está intentando agregar un certificado que no es CSD"); }
    }

    /**
     *  AddFiel
     */
    public AddFiel(expirationDate : Date, type : string) : void {
        this._dcCSD.ExpirationDate = expirationDate;

        if(type === "FIEL") { this._dcCSD.Type = "FIEL"; }
        else { throw new Error("Está intentando agregar un certificado que no es FIEL"); }
    }
}