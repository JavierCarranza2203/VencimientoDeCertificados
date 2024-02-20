export class Invoice {

    //Attributes
    private _dblSubTotal : number;
    private _dblIsrRet : number;
    private _dblIvaRet : number;
    private _dblIeps : number;
    private _dblIvaAtEightPercent : number;
    private _dblIvaAtSixteenPercent : number;
    private _dblTotal : number;

    //Constructor
    public constructor(number : number, type : string, date : Date, serie : string, folio : string, senderRfc : string, senderName : string, discount : number, description : string) {
        this.Number = number;
        this.Type = type;
        this.Date  = date;
        this.Serie = serie;
        this.Folio = folio;
        this.SenderRfc = senderRfc;
        this.SenderName = senderName;
        this.Discount = discount;
        this.Description = description;
    }

    //Public properties
    public Number : number;
    public Type : string;
    public Date : Date;
    public Serie: string;
    public Folio: string;
    public SenderRfc : string;
    public SenderName : string;
    public Discount : number;
    public Description : string;
    
    /*<======= Getters and setters to give value to attributes =======>*/

    //_dblSubTotal get and set
    public get Subtotal(){ return this._dblSubTotal; }
    public set SubTotal(value : number) {
        if(this.Type === "Factura") {
            this._dblSubTotal = value - this.Discount;
        }
        else if(this.Type === "") {
            this._dblSubTotal = 0;
        }
        else {
            this._dblSubTotal = this.Discount - value;
        }
    }

    //_dblIsrRet get and set
    public get IsrRet(){ return this._dblIsrRet; }
    public set IsrRet(value : number){ this._dblIsrRet = this.GetValueToSetInAttribute(value); }

    //_dblIvaRet get and set
    public get IvaRet(){ return this._dblIvaRet; }
    public set IvaRet(value : number){ this._dblIvaRet = this.GetValueToSetInAttribute(value); }

    //_dblIeps get and set
    public get Ieps(){ return this._dblIeps; }
    public set Ieps(value : number){ this._dblIeps = this.GetValueToSetInAttribute(value); }

    //_dblIvaAtEightPercent get and set
    public get IvaAtEightPercent(){ return this._dblIvaAtEightPercent; }
    public set IvaAtEightPercent(value : number){ this.IvaAtEightPercent = this.GetValueToSetInAttribute(value); }

    //_dblIvaAtSixteenPercent get and set
    public get IvaAtSixteenPercent(){ return this._dblIvaAtSixteenPercent; }
    public set IvaAtSixteenPercent(value : number){ this.IvaAtSixteenPercent = this.GetValueToSetInAttribute(value); }

    //_dblTotal get and set
    public get Total(){ return this._dblTotal; }
    public set Total(value : number) { this._dblTotal = this.GetValueToSetInAttribute(value); }

    //Method to convert the value given into the value to set to an attribute
    private GetValueToSetInAttribute(value : number) : number {
        if(this.Type === "Factura") {
            return value;
        }
        else if(this.Type === "") {
            return 0;
        }
        else {
            return value * -1;
        }
    }
}