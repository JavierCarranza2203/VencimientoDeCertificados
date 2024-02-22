import { OrderMethod } from "./OrderMethod.js";
export class InvoicesReport extends OrderMethod {
    //Attribute to store a list of invoices
    _InvoicesList;
    //Class constructor
    constructor() {
        super();
        this._InvoicesList = new Array();
    }
    get InvoicesList() { return this._InvoicesList; }
    //This method adds invoices to InvoicesList
    AddInvoice(invoice) {
        if (invoice.SenderName != null) {
            this._InvoicesList?.push(invoice);
        }
    }
    CalculateSubTotalsSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.SubTotal;
        });
        return summation;
    }
    CalculateIsrRetSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.IsrRet;
        });
        return summation;
    }
    CalculateIvaRetSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.IvaRet;
        });
        return summation;
    }
    CalculateIepsSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.Ieps;
        });
        return summation;
    }
    CalculateIvaAtEightPercentSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.IvaAtEightPercent;
        });
        return summation;
    }
    CalculateIvaAtSixteenPercentSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.IvaAtSixteenPercent;
        });
        return summation;
    }
    CalculateTotalsSummation() {
        let summation = 0;
        this._InvoicesList?.forEach((invoice) => {
            summation += invoice.Total;
        });
        return summation;
    }
    OrderInvoicesList(compareFunction) {
        OrderMethod.OrderBy(this._InvoicesList, compareFunction);
    }
}
