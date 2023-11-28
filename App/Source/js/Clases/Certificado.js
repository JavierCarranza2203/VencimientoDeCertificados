export class Certificado
{
    constructor()
    {
        this._dtmFechaVencimiento = "Desconocida";
        this._blnStatus = false;
    }
    
    //Get y set para la fecha de vencimiento
    get FechaVencimiento(){ return this._dtmFechaVencimiento; }

    //Get y set para el status
    get Status(){ return this._blnStatus; }
}