function matchTransactions(invoices, transactions) {

    const results = [];

    invoices.forEach(invoice => {

        const transaction = transactions.find(
            txn => txn.invoiceNumber === invoice.invoiceNumber
        );

        results.push({
            invoice,
            transaction
        });

    });

    return results;
}

module.exports = {
    matchTransactions
};