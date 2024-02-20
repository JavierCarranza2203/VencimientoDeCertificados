import { Invoice } from "./Invoice.ts";
import { OrderMethod } from "./OrderMethod.ts";

export class InvoicesReport extends OrderMethod
{
    //Attribute to store a list of invoices
    private InvoicesList : Array<Invoice>;

    //Class constructor
    public constructor() {
        super();
        this.InvoicesList = new Array<Invoice>();
    }

    //This method adds invoices to InvoicesList
    public AddInvoice(invoice: Invoice) : void {
        if(invoice.SenderName != null) {
            this.InvoicesList?.push(invoice);
        }
    }

    public CalculateSubTotalsSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.SubTotal;
        });

        return summation;
    }

    public CalculateIsrRetSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.IsrRet;
        });

        return summation;
    }

    public CalculateIvaRetSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.IvaRet;
        });

        return summation;
    }

    public CalculateIepsSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.Ieps;
        });

        return summation;
    }

    public CalculateIvaAtEightPercentSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.IvaAtEightPercent;
        });

        return summation;
    }

    public CalculateIvaAtSixteenPercentSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.IvaAtSixteenPercent;
        });

        return summation;
    }

    public CalculateTotalsSummation() : number {
        let summation = 0;

        this.InvoicesList?.forEach((invoice) => {
            summation += invoice.Total;
        });

        return summation;
    }

    public OrderInvoicesList(compareFunction: (a: Invoice, b: Invoice) => number) {
        OrderMethod.OrderBy(this.InvoicesList, compareFunction);
    }
}