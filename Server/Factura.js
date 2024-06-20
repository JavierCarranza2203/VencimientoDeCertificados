export class Factura {
    VerificadoOAsoc;
    EstadoSat;
    Version;
    Tipo;
    FechaEmision;
    FechaTimbrado;
    EstadoPago;
    FechaPago;
    Serie;
    Folio;
    Uuid;
    UuidRelacion;
    RfcEmisor;
    NombreEmisor;
    LugarDeExpedicion;
    RfcReceptor;
    NombreReceptor;
    ResidenciaFiscal;
    NumRegIdTrib;
    UsoCfdi;
    SubTotal;
    Descuento;
    TotalIeps;
    Iva16Porciento;
    RetenidoIva;
    RetenidoIsr;
    Ish;
    Total;
    TotalOriginal;
    TotalTrasladados;
    TotalRetenidos;
    TotalLocalTrasladado;
    TotalLocalRetenido;
    Complemento;
    Moneda;
    TipoDeCambio;
    FormaDePago;
    MetodoDePago;
    NumCtaPago;
    CondicionDePago;
    Conceptos;
    Combustible;
    Ieps3Porciento;
    Ieps6Porciento;
    Ieps7Porciento;
    Ieps8Porciento;
    Ieps9Porciento;
    Ieps26Porciento;
    Ieps30Porciento;
    Ieps53Porciento;
    Ieps160Porciento;
    ArchivoXml;
    DireccionEmisor;
    LocalidadEmisor;
    Iva8Porciento;
    Ieps30Punto4Porciento;
    IvaRet6Porciento;
    RegimenFiscalReceptor;
    DomicilioFiscalReceptor;

    constructor(comprobante) 
    {
        // this.VerificadoOAsoc = '';
        this.EstadoSat = 'Vigente';
        this.Version = comprobante["$"]["Version"];
        this.Tipo = 'Factura';
        this.FechaEmision = comprobante["$"]["Fecha"].slice(0, -9);
        this.FechaTimbrado = comprobante["cfdi:Complemento"][0]["tfd:TimbreFiscalDigital"][0]["$"]["FechaTimbrado"];
        // this.EstadoPago = 
        // this.FechaPago = 
        // this.Serie = 
        // this.Folio = 
        this.Uuid = comprobante["cfdi:Complemento"][0]["tfd:TimbreFiscalDigital"][0]["$"]["UUID"];
        // this.UuidRelacion = 
        this.RfcEmisor = comprobante["cfdi:Emisor"][0]["$"]["Rfc"];
        this.NombreEmisor = comprobante["cfdi:Emisor"][0]["$"]["Nombre"];
        this.LugarDeExpedicion = comprobante["$"]["LugarExpedicion"];
        this.RfcReceptor = comprobante["cfdi:Receptor"][0]["$"]["Rfc"];
        this.NombreReceptor = comprobante["cfdi:Receptor"][0]["$"]["Nombre"];
        // this.ResidenciaFiscal = 
        // this.NumRegIdTrib = 
        this.UsoCfdi = this._strCalcularUsoCFDI(comprobante["cfdi:Receptor"][0]["$"]["UsoCFDI"]);
        this.SubTotal = comprobante["$"]["SubTotal"];
        // this.Descuento = comprobante["$"]
        // this.TotalIeps
        // this.Iva16Porciento = 
        // this.RetenidoIva = 
        // this.RetenidoIsr = 
        // this.Ish = 
        this.Total = comprobante["$"]["Total"];
        // this.TotalOriginal = 
        this.TotalTrasladados = comprobante["cfdi:Conceptos"][0]["cfdi:Concepto"][0]["cfdi:Impuestos"][0]["cfdi:Traslados"][0]["cfdi:Traslado"][0]["$"]["Importe"];
        // this.TotalRetenidos = comprobante["cfdi:Conceptos"][0][""]
        this.TotalLocalTrasladado = 0;
        this.TotalLocalRetenido = 0;
        this.Complemento = 0;
        this.Moneda = comprobante["$"]["Moneda"];
        this.TipoDeCambio = comprobante["$"]["FormaPago"];
        // this.FormaDePago
        // this.MetodoDePago
        // this.NumCtaPago
        // this.CondicionDePago
        // this.Conceptos
        // this.Combustible
        // this.Ieps3Porciento
        // this.Ieps6Porciento
        // this.Ieps7Porciento
        // this.Ieps8Porciento
        // this.Ieps9Porciento
        // this.Ieps26Porciento
        // this.Ieps30Porciento
        // this.Ieps53Porciento
        // this.Ieps160Porciento
        // this.ArchivoXml
        // this.DireccionEmisor
        // this.LocalidadEmisor
        // this.Iva8Porciento
        // this.Ieps30Punto4Porciento
        // this.IvaRet6Porciento
        // this.RegimenFiscalReceptor
        // this.DomicilioFiscalReceptor
    }

    _strCalcularTipoComprobante(_strTipo) {
        switch(_strTipo) {
            case 'I':
                return 'Ingreso';
            default:
                throw new Error('Tipo de comprobante no identificado');
        }
    }

    _strCalcularUsoCFDI(_strUsoCfdi) {
        let message = '';

        switch(_strUsoCfdi) {
            case 'G01':
                    message = ' - Adquisición de mercancías';
                break;
            case 'G02':
                    message = ' - Devoluciones, descuentos o bonificaciones';
                break;
            case 'G03':
                    message = ' - Gastos en general';
                break;
            case 'I01':
                    message = ' - Construcciones';
                break;
            case 'I02':
                    message = ' - Mobiliario y equipo de oficina por inversiones';
                break;
            case 'I03':
                    message = ' - Equipo de transporte';
                break;
            case 'I04':
                    message = ' - Equipo de cómputo y accesorios';
                break;
            case 'I05':
                    message = ' - Dados, troqueles, moldes, matrices y herramental';
                break;
            case 'I06':
                    message = ' - Comunicaciones telefónicas';
                break;
            case 'I07':
                    message = ' - Comunicaciones satelitales';
                break;
            case 'I08':
                    message = ' - Otra maquinaria y equipo';
                break;
            case 'D01':
                    message = ' - Honorarios médicos, dentales y gastos hospitalarios';
                break;
            case 'D02':
                    message = ' - Gastos médicos por incapacidad o discapacidad';
                break;
            case 'D03':
                    message = ' - Gastos funerales';
                break;
            case 'D04':
                    message = ' - Donativos';
                break;
            case 'D05':
                    message = ' - Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)';
                break;
            case 'D06':
                    message = ' - Aportaciones voluntarias al SAR';
                break;
            case 'D07':
                    message = ' - Primas por seguros de gastos médicos';
                break;
            case 'D08':
                    message = ' - Gastos de transportación escolar obligatoria';
                break;
            case 'D09':
                    message = ' - Dépositos en cuentas para el ahorro, primas que tengan como base planes de pensiones';
                break;
            case 'D10':
                    message = ' - Pagos por servicios educativos (colegiaturas)';
                break;
            case 'P01':
                    message = ' - Por definir';
                break;
            default:
                message = '';
        }

        return _strUsoCfdi + message;
    }

    _strCalcularFormaPago(_strFormaPago) {
        let message = '';

        switch(_strFormaPago) {
            case '01':
                    message = ' - Efectivo';
                break;
            case '02':
                    message = ' - Cheque nominativo';
                break;
            case '03':
                    message = ' - Transferencia electrónica de fondos SPEI';
                break;
            case '04':
                    message = ' - Tarjeta de crédito';
                break;
            case '05':
                    message = ' - Monedero electrónico';
                break;
            case '06':
                    message = ' - Dinero electrónico';
                break;
            case '08':
                    message = ' - Vales de despensa';
                break;
            case '12':
                    message = ' - Dación en pago';
                break;
            case '13':
                    message = ' - Pago por subrogación';
                break;
            case '14':
                    message = ' - Pago por consignación';
                break;
            case '15':
                    message = ' - Condonación';
                break;
            case '17':
                    message = ' - Compensación';
                break;
            case '23':
                    message = ' - Novación';
                break;
            case '24':
                    message = ' - Confusión';
                break;
            case '25':
                    message = ' - Remisión de deuda';
                break;
            case '26':
                    message = ' - Prescripción o caducidad';
                break;
            case '27':
                    message = ' - A satisfacción del acreedor';
                break;
            case '28':
                    message = ' - Tarjeta de débito';
                break;
            case '29':
                    message = ' - Tarjeta de servicios';
                break;
            case '30':
                    message = ' - Aplicación de anticipos';
                break;
            case '31':
                    message = ' - Intermediario pagos';
                break;
            case '99':
                    message = ' - Por definir';
                break;
        }
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