export class Factura {
    Numero;
    Fecha;
    Serie;
    Folio;
    RfcEmisor;
    NombreEmisor;
    SubTotal;
    RetIsr;
    RetIva;
    Ieps;
    Iva8;
    Iva16;
    Total;
    Concepto;

    constructor(numero, fecha, serie, folio, 
        rfcEmisor,  nombreEmisor, subTotal, 
        retIsr, retIva, ieps, 
        iva8, iva16, total, concepto) 
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