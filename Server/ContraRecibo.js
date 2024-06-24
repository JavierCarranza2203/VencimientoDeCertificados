import { jsPDF } from 'jspdf';
import fs from 'fs';

export class ContraRecibo {
    _document;
    _folio;
    _fecha;
    _nombre;
    _domicilio;
    _ciudad;
    _rfc;
    _concepto;
    _importe;
    _carpeta;

    constructor(folio, fecha, nombre, domicilio, ciudad, rfc, concepto, importe, carpeta) {
        this._folio = folio;
        this._fecha = fecha;
        this._nombre = nombre;
        this._domicilio = domicilio;
        this._ciudad = ciudad;
        this._rfc = rfc;
        this._concepto = concepto;
        this._importe = importe;
        this._carpeta = carpeta;
    }

    Generar() {
        this._document = new jsPDF();

        this._agregarSeccion();
        this._agregarSeccion(0, this._document.internal.pageSize.getHeight() / 2)
        this._guardar();
    }

    _guardar() {
        if(!this._document) { throw new Error("El documento no se ha inicializado") }

        const fechaActual = new Date();
        let ruta = '//Server/Resultados/'

        if(fs.existsSync(ruta + fechaActual.getFullYear()) === false) {
            fs.mkdirSync(ruta + fechaActual.getFullYear());
        }

        ruta += fechaActual.getFullYear() + '/';

        if(fs.existsSync(ruta + this._carpeta) === false) {
            fs.mkdirSync(ruta + this._carpeta);
        }

        ruta += this._carpeta + '/' + this._nombre + '.pdf';

        this._document.save(ruta);
    }

    _agregarSeccion(PosicionEnX = 0, PosicionEnY = 0) {
        this._agregarMargenes(PosicionEnX, PosicionEnY);
        this._agregarEncabezado(PosicionEnX, PosicionEnY);
        this._agregarDatosIdentificacion(PosicionEnX, PosicionEnY);
        this._agregarTabla(PosicionEnX, PosicionEnY);
        this._agregarCantidadConNumero(PosicionEnX, PosicionEnY);
    }

    _agregarMargenes() {
        if(!this._document) { throw new Error("El documento no se ha inicializado") }

        let margin = 7;

        //Linea de margen superior
        this._document.line(margin, margin, this._document.internal.pageSize.getWidth() - margin, margin);
        //Linea de margen inferior
        this._document.line(margin, this._document.internal.pageSize.getHeight() - margin, this._document.internal.pageSize.getWidth() - margin, this._document.internal.pageSize.getHeight() - margin);
        //Linea de margen intermedia
        this._document.line(margin + 4, this._document.internal.pageSize.getHeight() / 2, this._document.internal.pageSize.getWidth() - margin - 4, this._document.internal.pageSize.getHeight() / 2);
        //Linea de margen izquierdo
        this._document.line(margin, margin, margin, this._document.internal.pageSize.getHeight() - margin);
        //Linea de margen derecho
        this._document.line(this._document.internal.pageSize.getWidth() - margin, margin, this._document.internal.pageSize.getWidth() - margin, this._document.internal.pageSize.getHeight() - margin);
    }

    _agregarEncabezado(PosicionEnX = 0, PosicionEnY = 0) {
        if(!this._document) { throw new Error("El documento no se ha inicializado") }

        //========== CAMBIO DE LETRA
        this._document.setFontSize(14);
        this._document.setFont('Helvetica', 'Bold');
        this._document.text('GARCIA REYES Y ASOCIADOS', 88 + PosicionEnX, 18 + PosicionEnY);
        this._document.setFont('helvetica', 'normal');
        this._document.text('Dinorah Ortiz Obregón', 100 + PosicionEnX, 24 + PosicionEnY);

        //========== CAMBIO DE LETRA
        this._document.setFontSize(9);
        this._document.text('CONTADOR PÚBLICO', 110 + PosicionEnX, 29 + PosicionEnY);

        //========== CAMBIO DE LETRA
        this._document.setFont('helvetica', 'normal');
        this._document.text('R.F.C.: OIOD650814KQ9', 78 + PosicionEnX, 34 + PosicionEnY);
        this._document.text('CURP: OIOD650814MTSRBN03', 130 + PosicionEnX, 34 + PosicionEnY);
        this._document.text('MATIAS GUERRA #73', 78 + PosicionEnX, 39 + PosicionEnY);
        this._document.text('COL. INFONAVIT', 116 + PosicionEnX, 39 + PosicionEnY);
        this._document.text('TEL.: (867) 717-0815', 146 + PosicionEnX, 39 + PosicionEnY);
        this._document.text('CORREO: rgarcia@globalpc.net', 68 + PosicionEnX, 44 + PosicionEnY);
        this._document.text('NUEVO LAREDO, TAMAULIPAS', 116 + PosicionEnX, 44 + PosicionEnY);
        this._document.text('C.P.: 88275', 165 + PosicionEnX, 44 + PosicionEnY);
    }

    _agregarDatosIdentificacion(PosicionEnX = 0, PosicionEnY = 0) {
        if(!this._document) { throw new Error("El documento no se ha inicializado") }

        this._document.setFontSize(9);
        this._document.setFont('Helvetica', 'Bold');
        this._document.text('FECHA:', 15 + PosicionEnX, 70 + PosicionEnY);
        this._document.text('RECIBÍ DE:', 15 + PosicionEnX, 75 + PosicionEnY);
        this._document.text('DOMICILIO:', 15 + PosicionEnX, 80 + PosicionEnY);
        this._document.text('CIUDAD:', 15 + PosicionEnX, 85 + PosicionEnY);
        this._document.text('RFC:', 15 + PosicionEnX, 90 + PosicionEnY);
        this._document.text('CONCEPTO:', 15 + PosicionEnX, 95 + PosicionEnY);

        //AQUI SE ASIGNAN LOS DATOS DE IDENTIFICACION
        this._document.setFont('helvetica', 'normal');
        this._document.text(this._folio, 167 + PosicionEnX, 57 + PosicionEnY);
        this._document.text(this._fecha, 28 + PosicionEnX, 70 + PosicionEnY);
        this._document.text(this._nombre, 33 + PosicionEnX, 75 + PosicionEnY);
        this._document.text(this._domicilio, 34 + PosicionEnX, 80 + PosicionEnY);
        this._document.text(this._ciudad, 29 + PosicionEnX, 85 + PosicionEnY);
        this._document.text(this._rfc, 23 + PosicionEnX, 90 + PosicionEnY);
        this._document.text(this._concepto, 35 + PosicionEnX, 95 + PosicionEnY);

        this._document.setFillColor('#C0C0C0');
        this._document.setFontSize(12);
        this._document.rect(56, 52, 90, 7, 'FD');
        this._document.text('CONTRA RECIBO', 85, 57);
    }

    _agregarTabla(PosicionEnX = 0, PosicionEnY = 0) {
        if(!this._document) { throw new Error("El documento no se ha inicializado") }

        //Primer linea vertical
        this._document.line(192 + PosicionEnX, 67 + PosicionEnY, 192 + PosicionEnX, 97 + PosicionEnY);
        //Linea vertical media
        this._document.line(140 + PosicionEnX, 67 + PosicionEnY, 140 + PosicionEnX, 97 + PosicionEnY);
        //Ultima linea vertical
        this._document.line(166 + PosicionEnX, 67 + PosicionEnY, 166 + PosicionEnX, 97 + PosicionEnY);
        //Linea de inicio de tabla (Arriba de IMPORTE) HORIZONTAL
        this._document.line(140 + PosicionEnX, 67 + PosicionEnY, 192 + PosicionEnX, 67 + PosicionEnY);
        //Linea debajo de IMPORTE HORIZONTAL
        this._document.line(140 + PosicionEnX, 72 + PosicionEnY, 192 + PosicionEnX, 72 + PosicionEnY);
        //Linea debajo de IVA HORIZONTAL
        this._document.line(140 + PosicionEnX, 77 + PosicionEnY, 192 + PosicionEnX, 77 + PosicionEnY);
        //Linea debajo de SUBTOTAL HORIZONTAL
        this._document.line(140 + PosicionEnX, 82 + PosicionEnY, 192 + PosicionEnX, 82 + PosicionEnY);
        //Linea debajo de RET. IVA. HORIZONTAL
        this._document.line(140 + PosicionEnX, 87 + PosicionEnY, 192 + PosicionEnX, 87 + PosicionEnY);
        //Linea debajo de RET. ISR. HORIZONTAL
        this._document.line(140 + PosicionEnX, 92 + PosicionEnY, 192 + PosicionEnX, 92 + PosicionEnY);
        //Linea debajo de TOTAL HORIZONTAL
        this._document.line(140 + PosicionEnX, 97 + PosicionEnY, 192 + PosicionEnX, 97 + PosicionEnY);

        //ENCABEZADOS DE LA TABLA DE RESUMEN DE PAGO
        this._document.setFontSize(9);
        this._document.setFont('Helvetica', 'Bold');
        this._document.text('IMPORTE:', 149 + PosicionEnX, 70.5 + PosicionEnY);
        this._document.text('IVA:', 158 + PosicionEnX, 75.5 + PosicionEnY);
        this._document.text('SUBTOTAL:', 146 + PosicionEnX, 80.5 + PosicionEnY);
        this._document.text('RET. IVA:', 150 + PosicionEnX, 85.5 + PosicionEnY);
        this._document.text('RET. ISR:', 150 + PosicionEnX, 90.5 + PosicionEnY);
        this._document.text('TOTAL:', 153 + PosicionEnX, 95.5 + PosicionEnY);

        this._document.setFont('helvetica', 'normal');
        //AQUI SE LLENAN LAS CELDAS DE DATOS DE LA TABLA
        this._document.text('$' + this._importe + '.00', 167 + PosicionEnX, 70.5 + PosicionEnY);
        this._document.text('$0.00', 167 + PosicionEnX, 75.5 + PosicionEnY);
        this._document.text('$' + this._importe + '.00', 167 + PosicionEnX, 80.5 + PosicionEnY);
        this._document.text('$0.00', 167 + PosicionEnX, 85.5 + PosicionEnY);
        this._document.text('$0.00', 167 + PosicionEnX, 90.5 + PosicionEnY);
        this._document.text('$' + this._importe + '.00', 167 + PosicionEnX, 95.5 + PosicionEnY);
    }

    _agregarCantidadConNumero(PosicionEnX = 0, PosicionEnY = 0) {
        if(!this._document) { throw new Error("El documento no se ha inicializado") }

        this._document.setFontSize(9);
        this._document.setFont('helvetica', 'normal');
        this._document.line(30 + PosicionEnX, 116 + PosicionEnY, 125 + PosicionEnX, 116 + PosicionEnY);
        this._document.text('CANTIDAD CON LETRA', 60 + PosicionEnX, 120 + PosicionEnY);
    }
}