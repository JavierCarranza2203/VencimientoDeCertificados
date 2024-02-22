export class OrderMethod {
    //Delegate to order list
    static OrderBy(invoicesList, compareFunction) {
        let virtualInvoice;
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
