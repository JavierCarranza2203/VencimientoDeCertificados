export class DigitalCertificate {

    //Private attributes
    private _dtmExpirationDate : Date;
    private _blnStatus : boolean;
    private _strType : string;

    //Constructor
    constructor() {
        this._dtmExpirationDate = new Date();
        this._blnStatus = false;
    }
    
    //_dtmExpirationDate get and set
    public set ExpirationDate(value : Date) {
        this._dtmExpirationDate = value;

        value >=  new Date()? this._blnStatus = true : this._blnStatus = false;
    }
    public get ExpirationDate() { return this._dtmExpirationDate; }

    //_blnStatus getter
    public get Status() { return this._blnStatus; }

    //_strType get and set
    public set Type(value: string) {
        if(value != "CSD" && value != "FIEL") {
            throw new Error("Tipo de certificado desconocido. Debe ser CSD o FIEL.");
        }
        else {
            this._strType = value;
        }
    }
    public get Type() { return this._strType; }
}