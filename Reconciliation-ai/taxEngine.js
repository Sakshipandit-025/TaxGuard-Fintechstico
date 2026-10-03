function verifyTax(invoice, taxRate) {

    const expectedTax =
        invoice.taxableAmount * taxRate;

    const taxDifference =
        expectedTax - invoice.taxAmount;

    const taxStatus =
        Math.abs(taxDifference) < 0.01
            ? "VALID"
            : "TAX_MISMATCH";

    return {
        invoiceNumber: invoice.invoiceNumber,
        taxableAmount: invoice.taxableAmount,
        taxRate: taxRate,
        expectedTax: expectedTax,
        recordedTax: invoice.taxAmount,
        taxDifference: taxDifference,
        taxStatus: taxStatus
    };
}

module.exports = {
    verifyTax
};