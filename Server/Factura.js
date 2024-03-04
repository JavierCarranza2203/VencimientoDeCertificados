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

    toJSON() {
        return {
            Numero: this.Numero,
            Fecha: this.Fecha,
            Serie: this.Serie,
            Folio: this.Folio,
            RfcEmisor: this.RfcEmisor,
            NombreEmisor: this.NombreEmisor,
            SubTotal: this.SubTotal,
            RetIsr: this.RetIsr,
            RetIva: this.RetIva,
            Ieps: this.Ieps,
            Iva8: this.Iva8,
            Iva16: this.Iva16,
            Total: this.Total,
            Concepto: this.Concepto
        };
    }

    static ToObject( jsonObj ) 
    {
        if(jsonObj.Nombre && jsonObj.Fecha && jsonObj.Serie && jsonObj.Folio && jsonObj.RfcEmisor && jsonObj.NombreEmisor
            && jsonObj.SubTotal && jsonObj.RetIsr && jsonObj.RetIva && jsonObj.Ieps && jsonObj.Iva8 && jsonObj.Iva16 && jsonObj.Total && jsonObj.Concepto)
        {
            return new Factura(jsonObj.NombreEmisor, jsonObj.Fecha, jsonObj.Serie, jsonObj.Folio, jsonObj.RfcEmisor, jsonObj.NombreEmisor, 
                jsonObj.SubTotal, jsonObj.RetIsr, jsonObj.RetIva, jsonObj.Ieps, jsonObj.Iva8, jsonObj.Iva16, jsonObj.Total, jsonObj.Concepto)
        }
    }
}