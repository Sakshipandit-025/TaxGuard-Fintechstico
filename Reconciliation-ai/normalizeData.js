function normalizeInvoices(invoices) {
    return invoices.map(invoice => ({
        ...invoice,
        invoiceNumber: invoice.invoiceNumber?.trim(),
        vendorName: invoice.vendorName?.trim(),
        taxableAmount: Number(invoice.taxableAmount),
        taxAmount: Number(invoice.taxAmount),
        totalAmount: Number(invoice.totalAmount)
    }));
}

function normalizeTransactions(transactions) {
    return transactions.map(transaction => ({
        ...transaction,
        transactionId: transaction.transactionId?.trim(),
        invoiceNumber: transaction.invoiceNumber?.trim(),
        vendorName: transaction.vendorName?.trim(),
        amount: Number(transaction.amount)
    }));
}

module.exports = {
    normalizeInvoices,
    normalizeTransactions
};