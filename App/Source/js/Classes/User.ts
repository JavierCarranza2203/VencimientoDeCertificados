export class User {

    //Private attributes
    private _strRole : string;
    private _strCustomersGroup : string;
    
    //Constructor
    constructor(name : string, role : string, customersGroup : string) {
        this.Nombre = name;
        this.Role = role;
        this.CustomersGroup = customersGroup;
    }

    //Public properties
    public Nombre : string;

    //_strRole get and set
    public set Role(value : string) {
        if(value != "admin" && value != "acc" && value != "dev") {
            throw new Error("El rol para el usuario no es válido.");
        }
        else {
            this._strRole = value;
        }
    }
    public get Role() { return this._strRole }

    //_strCustomersGroup get and set
    public set CustomersGroup(value : string) { 
        if(value != "A" && value != "B" && value != "C" && value != "S") {
            throw new Error("La asignación de clientes no es válida.")
        }
        else { 
            this._strCustomersGroup = value;
        }
    }
    public get CustomersGroup() { return this._strCustomersGroup; }
}