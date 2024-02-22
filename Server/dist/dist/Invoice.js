export class Invoice {
    //Attributes
    _dblSubTotal;
    _dblIsrRet;
    _dblIvaRet;
    _dblIeps;
    _dblIvaAtEightPercent;
    _dblIvaAtSixteenPercent;
    _dblTotal;
    //Constructor
    constructor(number, type, date, serie, folio, senderRfc, senderName, discount, description) {
        this.Number = number;
        this.Type = type;
        this.Date = date;
        this.Serie = serie;
        this.Folio = folio;
        this.SenderRfc = senderRfc;
        this.SenderName = senderName;
        this.Discount = discount;
        this.Description = description;
    }
    //Public properties
    Number;
    Type;
    Date;
    Serie;
    Folio;
    SenderRfc;
    SenderName;
    Discount;
    Description;
    /*<======= Getters and setters to give value to attributes =======>*/
    //_dblSubTotal get and set
    get Subtotal() { return this._dblSubTotal; }
    set SubTotal(value) {
        if (this.Type === "Factura") {
            this._dblSubTotal = value - this.Discount;
        }
        else if (this.Type === "") {
            this._dblSubTotal = 0;
        }
        else {
            this._dblSubTotal = this.Discount - value;
        }
    }
    //_dblIsrRet get and set
    get IsrRet() { return this._dblIsrRet; }
    set IsrRet(value) { this._dblIsrRet = this.GetValueToSetInAttribute(value); }
    //_dblIvaRet get and set
    get IvaRet() { return this._dblIvaRet; }
    set IvaRet(value) { this._dblIvaRet = this.GetValueToSetInAttribute(value); }
    //_dblIeps get and set
    get Ieps() { return this._dblIeps; }
    set Ieps(value) { this._dblIeps = this.GetValueToSetInAttribute(value); }
    //_dblIvaAtEightPercent get and set
    get IvaAtEightPercent() { return this._dblIvaAtEightPercent; }
    set IvaAtEightPercent(value) { this.IvaAtEightPercent = this.GetValueToSetInAttribute(value); }
    //_dblIvaAtSixteenPercent get and set
    get IvaAtSixteenPercent() { return this._dblIvaAtSixteenPercent; }
    set IvaAtSixteenPercent(value) { this.IvaAtSixteenPercent = this.GetValueToSetInAttribute(value); }
    //_dblTotal get and set
    get Total() { return this._dblTotal; }
    set Total(value) { this._dblTotal = this.GetValueToSetInAttribute(value); }
    //Method to convert the value given into the value to set to an attribute
    GetValueToSetInAttribute(value) {
        if (this.Type === "Factura") {
            return value;
        }
        else if (this.Type === "") {
            return 0;
        }
        else {
            return value * -1;
        }
    }
}
