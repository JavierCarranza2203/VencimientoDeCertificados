import { Invoice } from "./Invoice.ts";

export class OrderMethod 
{
    //Delegate to order list
    protected static OrderBy(invoicesList: Array<Invoice>, compareFunction: (a: Invoice, b: Invoice) => number) {
        let virtualInvoice: Invoice | null;

        for (let i = 0; i < invoicesList.length - 1; i++) {
            if (compareFunction(invoicesList[i], invoicesList[i + 1]) > 0) {
                virtualInvoice = invoicesList[i];
                invoicesList[i] = invoicesList[i + 1];
                invoicesList[i + 1] = virtualInvoice;
                virtualInvoice = null;
            }
        }
    }
}