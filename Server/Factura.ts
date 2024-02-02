export class Factura {
    public Numero : number;
    public Fecha : Date;
    public Serie : string;
    public Folio: number;
    public RfcEmisor : string;
    public NombreEmisor : string;
    public SubTotal : number;
    public RetIsr : number;
    public RetIva : number;
    public Ieps : number;
    public Iva8 : number;
    public Iva16 : number;
    public Total : number;
    public Concepto : string;

    public  constructor(numero : number, fecha : Date, serie : string, folio : number, 
        rfcEmisor : string,  nombreEmisor : string, subTotal : number, 
        retIsr : number, retIva : number, ieps : number, 
        iva8 : number, iva16 : number, total : number, concepto : string) 
    {
        this.Numero = numero;
        this.Fecha = fecha;
        this.Serie = serie;
        this.Folio = folio;
        this.RfcEmisor = rfcEmisor;
        this.NombreEmisor = nombreEmisor;
        this.SubTotal = subTotal;
        this.RetIsr = retIsr;
        this.RetIva = retIva;
        this.Ieps = ieps;
        this.Iva8 = iva8;
        this.Iva16 = iva16;
        this.Total = total;
        this.Concepto = concepto;
    }
}