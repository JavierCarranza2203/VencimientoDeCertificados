export class Certificado
{
    private _dtmFechaVencimiento : string;
    private _blnStatus : boolean;

    constructor(fechaVencimiento : string = "Desconocida", status : boolean = false)
    {
        this._dtmFechaVencimiento = fechaVencimiento;
        this._blnStatus = status;
    }
    
    //Get y set para la fecha de vencimiento
    public get FechaVencimiento(){ return this._dtmFechaVencimiento; }
    public set FechaVencimiento(fecha : string){ this._dtmFechaVencimiento = fecha; }

    //Get y set para el status
    public get Status(){ return this._blnStatus; }
    public set Status(status : boolean){ this._blnStatus = status; }
}