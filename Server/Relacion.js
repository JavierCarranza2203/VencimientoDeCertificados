import { Factura } from './Factura.js';

export class Relacion
{
    ListaFacturas;
    miListaFacturasOriginal;

    get ListaFacturasOriginal() { return this.miListaFacturasOriginal; }

    constructor(data) {
        this.ListaFacturas = data;
        this.miListaFacturasOriginal = [...data];
    }

    CalcularSubTotal() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.SubTotal;
        });

        return suma;
    }

    CalcularSumaRetencionIsr() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.RetIsr;
        });

        return suma;
    }

    CalcularSumaRetIva() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.RetIva;
        });

        return suma;
    }

    CalcularSumaIeps() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Ieps;
        });

        return suma;
    }

    CalcularSumaIva8() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Iva8;
        });

        return suma;
    }

    CalcularSumaIva16() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Iva16;
        });

        return suma;
    }

    CalcularSumaTotal() {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Total;
        });

        return suma;
    }

    RestarCantidad(numero) {
        let indiceAEliminar = -1;
    
        this.ListaFacturas.forEach((factura, index) => {
            if(factura.Numero == numero) {
                indiceAEliminar = index;
            }
        });

        if(indiceAEliminar != -1) {
            this.ListaFacturas.splice(indiceAEliminar, 1);
        }
    }

    RestaurarCantidad(numero) {
        this.miListaFacturasOriginal.forEach(factura => {
            if(factura.Numero == numero) {
                this.ListaFacturas.push(factura);
            }
        });
    }
}