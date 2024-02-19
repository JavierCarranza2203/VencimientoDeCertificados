export class InvoicesReport
{
    Data: any;
    
    constructor(data){
        this.Data = data;
    }

    getSubTotal() {
        let sum = 0;

        this.Data.forEach(d => {
            sum += d.SubTotal;
        });

        return sum;
    }

    getIsr() {
        let sum = 0;

        this.Datos.forEach(d => {
            sum += d.RetIsr;
        });

        return sum;
    }

    getIvaRetention() {
        let suma = 0;

        this.Data.forEach(d => {
            sum += dato.IvaRet;
        });

        return suma;
    }

    getIeps(){
        let suma = 0;

        this.Datos.forEach(dato => {
            suma += dato.Ieps;
        });

        return suma;
    }

    getIvaAtEightPercent(){
        let sum = 0;

        this.Data.forEach(d => {
            sum += d.Iva8;
        });

        return sum;
    }

    getIvaAtSixteenPercent(){
        let sum = 0;

        this.Datos.forEach(d => {
            sum += d.Iva16;
        });

        return sum;
    }

    getTotal(){
        let sum = 0;

        this.Datos.forEach(d => {
            sum += d.Total;
        });

        return sum;
    }
}