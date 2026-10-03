function detectMismatches(invoice, transaction) {

    const issues = [];

    // No transaction found
    if (!transaction) {

        issues.push({
            type: "MISSING_TRANSACTION",
            message: "No transaction found for this invoice."
        });

        return issues;
    }

    // Amount check
    const amountDifference =
        invoice.totalAmount - transaction.amount;

    if (amountDifference !== 0) {

        issues.push({
            type: "AMOUNT_MISMATCH",
            difference: amountDifference,
            message:
                `Invoice amount and transaction amount differ by ₹${Math.abs(amountDifference)}`
        });

    }

    // Vendor check
    if (
        invoice.vendorName.toLowerCase() !==
        transaction.vendorName.toLowerCase()
    ) {

        issues.push({
            type: "VENDOR_MISMATCH",
            message:
                "Invoice vendor and transaction vendor do not match."
        });

    }

    // Date check
    const invoiceDate =
        new Date(invoice.invoiceDate);

    const transactionDate =
        new Date(transaction.date);

    const differenceInDays =
        Math.abs(transactionDate - invoiceDate) /
        (1000 * 60 * 60 * 24);

    if (differenceInDays > 7) {

        issues.push({
            type: "DATE_MISMATCH",
            differenceInDays,
            message:
                `Transaction date is ${differenceInDays} days away from invoice date.`
        });

    }

    return issues;
}

module.exports = {
    detectMismatches
};