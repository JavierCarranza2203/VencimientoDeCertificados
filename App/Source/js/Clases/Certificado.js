export class Certificado
{
    constructor()
    {
        this.FechaVencimiento = "Desconocida";
        this.Status = false;
    }
    
    //Get y set para la fecha de vencimiento
    get FechaVencimiento(){ return this.FechaVencimiento; }
    set FechaVencimiento(value) { this.FechaVencimiento = value; }

    //Get y set para el status
    get Status(){ return this.Status; }
    set Status(value) { this.Status = value; }
}