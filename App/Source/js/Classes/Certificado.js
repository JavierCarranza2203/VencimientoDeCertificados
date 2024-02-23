export class Certificado
{
    _dtmFechaVencimiento;
    _blnStatus;

    constructor(fechaVencimiento = "Desconocida", status = false)
    {
        this._dtmFechaVencimiento = fechaVencimiento;
        this._blnStatus = status;
    }
    
    //Get y set para la fecha de vencimiento
    get FechaVencimiento(){ return this._dtmFechaVencimiento; }
    set FechaVencimiento(fecha){ this._dtmFechaVencimiento = fecha; }

    //Get y set para el status
    get Status(){ return this._blnStatus; }
    set Status(status){ this._blnStatus = status; }
}