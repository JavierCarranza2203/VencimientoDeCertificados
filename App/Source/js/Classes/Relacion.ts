import { Factura } from './Factura.ts';

export class Relacion
{
    public ListaFacturas : Array<Factura>;
    private miListaFacturasOriginal : Array<Factura>;

    public get ListaFacturasOriginal() { return this.miListaFacturasOriginal; }

    constructor(data : Array<Factura>) {
        this.ListaFacturas = data;
        this.miListaFacturasOriginal = [...data];
    }

    public CalcularSubTotal() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.SubTotal;
        });

        return suma;
    }

    CalcularSumaRetencionIsr() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.RetIsr;
        });

        return suma;
    }

    CalcularSumaRetIva() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.RetIva;
        });

        return suma;
    }

    CalcularSumaIeps() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Ieps;
        });

        return suma;
    }

    CalcularSumaIva8() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Iva8;
        });

        return suma;
    }

    CalcularSumaIva16() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Iva16;
        });

        return suma;
    }

    CalcularSumaTotal() : number {
        let suma = 0;

        this.ListaFacturas.forEach(factura => {
            suma += factura.Total;
        });

        return suma;
    }

    RestarCantidad(numero : number) : void {
        let indiceAEliminar = -1;
    
        this.ListaFacturas.forEach((factura : Factura, index : number) => {
            if(factura.Numero == numero) {
                indiceAEliminar = index;
            }
        });

        if(indiceAEliminar != -1) {
            this.ListaFacturas.splice(indiceAEliminar, 1);
        }
    }

    RestaurarCantidad(numero : number) {
        this.miListaFacturasOriginal.forEach(factura => {
            if(factura.Numero == numero) {
                this.ListaFacturas.push(factura);
            }
        });
    }
}