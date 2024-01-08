export class Relacion
{
    constructor(data){
        this.Datos = data;
    }

    CalcularSubTotal() {
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.SubTotal;
        });

        return suma;
    }

    CalcularSumaRetencionIsr() {
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.RetIsr;
        });

        return suma;
    }

    CalcularSumaRetIva() {
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.RetIva;
        });

        return suma;
    }

    CalcularSumaIeps(){
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.Ieps;
        });

        return suma;
    }

    CalcularSumaIva8(){
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.Iva8;
        });

        return suma;
    }

    CalcularSumaIva16(){
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.Iva16;
        });

        return suma;
    }

    CalcularSumaTotal(){
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.Total;
        });

        return suma;
    }
}