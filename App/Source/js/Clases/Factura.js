export class Relacion
{
    constructor(data){
        this.Datos = data;
        this.Respaldo = [...data];
        this.DatosEliminados = [];
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

    RestarCantidad(numero){
        let indiceAEliminar = -1;
    
        this.Datos.forEach((dato, index) => {
            if(dato.Numero == numero){
                indiceAEliminar = index;
            }
        });

        if(indiceAEliminar != -1){
            this.Datos.splice(indiceAEliminar, 1);
        }
    }

    RestaurarCantidad(numero){
        this.Respaldo.forEach((dato) => {
            if(dato.Numero == numero){
                this.Datos.push(dato);
            }
        });
    }
}