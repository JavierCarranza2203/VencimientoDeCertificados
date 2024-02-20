import { isSet } from "util/types";
import { Invoice } from "./Invoice.ts";

export class InvoicesReport
{
    private InvoicesList : Array<Invoice> | null;

    public constructor() {
        this.InvoicesList = null;
    }

    public addInvoice(invoice: Invoice) : void {
        if(isSet(invoice.SenderName)) {
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
}