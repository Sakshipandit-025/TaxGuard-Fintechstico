function detectMissingRecords(invoices, transactions) {

    const issues = [];

    // Check invoices without transactions
    invoices.forEach(invoice => {

        const transactionExists =
            transactions.some(
                transaction =>
                    transaction.invoiceNumber ===
                    invoice.invoiceNumber
            );

        if (!transactionExists) {

            issues.push({
                type: "MISSING_TRANSACTION",
                invoiceNumber: invoice.invoiceNumber,
                message:
                    "Invoice exists but no transaction was found."
            });
        }
    });


    // Check transactions without invoices
    transactions.forEach(transaction => {

        const invoiceExists =
            invoices.some(
                invoice =>
                    invoice.invoiceNumber ===
                    transaction.invoiceNumber
            );

        if (!invoiceExists) {

            issues.push({
                type: "ORPHAN_TRANSACTION",
                transactionId: transaction.transactionId,
                invoiceNumber: transaction.invoiceNumber,
                message:
                    "Transaction exists but no matching invoice was found."
            });
        }
    });


    return issues;
}


module.exports = {
    detectMissingRecords
};