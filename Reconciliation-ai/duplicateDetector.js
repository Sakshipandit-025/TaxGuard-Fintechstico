function detectDuplicates(invoices) {

    const duplicates = [];

    for (let i = 0; i < invoices.length; i++) {

        for (let j = i + 1; j < invoices.length; j++) {

            const invoice1 = invoices[i];
            const invoice2 = invoices[j];

            // Exact duplicate invoice number
            if (
                invoice1.invoiceNumber ===
                invoice2.invoiceNumber
            ) {

                duplicates.push({
                    type: "DUPLICATE_INVOICE",
                    invoiceNumber: invoice1.invoiceNumber,
                    similarity: 100,
                    message:
                        "Two invoices have the same invoice number."
                });

                continue;
            }

            // Potential duplicate
            const sameVendor =
                invoice1.vendorName.toLowerCase() ===
                invoice2.vendorName.toLowerCase();

            const sameAmount =
                invoice1.totalAmount ===
                invoice2.totalAmount;

            const date1 = new Date(invoice1.invoiceDate);
            const date2 = new Date(invoice2.invoiceDate);

            const differenceInDays =
                Math.abs(date1 - date2) /
                (1000 * 60 * 60 * 24);

            const similarDate =
                differenceInDays <= 2;

            if (
                sameVendor &&
                sameAmount &&
                similarDate
            ) {

                duplicates.push({
                    type: "POTENTIAL_DUPLICATE",
                    invoice1: invoice1.invoiceNumber,
                    invoice2: invoice2.invoiceNumber,
                    similarity: 90,
                    message:
                        "Invoices have the same vendor, amount and a nearby date."
                });
            }
        }
    }

    return duplicates;
}

module.exports = {
    detectDuplicates
};