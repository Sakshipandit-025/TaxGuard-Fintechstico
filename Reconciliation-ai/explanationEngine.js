function generateExplanation(discrepancy) {

    const reasons = [];
    let summary = "";

    // =================================
    // AMOUNT MISMATCH
    // =================================

    if (
        discrepancy.issueTypes.includes("AMOUNT_MISMATCH")
    ) {

        const difference =
            Math.abs(
                discrepancy.details.difference || 0
            );

        summary =
            `Transaction amount is ₹${difference} different from the invoice total.`;

        reasons.push({
            factor: "Amount Difference",
            value: difference,
            impact: discrepancy.severity
        });
    }


    // =================================
    // TAX MISMATCH
    // =================================

    if (
        discrepancy.issueTypes.includes("TAX_MISMATCH")
    ) {

        const taxDifference =
            discrepancy.details.taxDifference || 0;

        summary =
            "Recorded tax does not match the expected tax amount.";

        reasons.push({
            factor: "Tax Difference",
            value: taxDifference,
            impact: discrepancy.severity
        });
    }


    // =================================
    // VENDOR MISMATCH
    // =================================

    if (
        discrepancy.issueTypes.includes("VENDOR_MISMATCH")
    ) {

        summary =
            "The vendor information in the invoice and transaction does not match.";

        reasons.push({
            factor: "Vendor Mismatch",
            value: "Vendor names differ",
            impact: discrepancy.severity
        });
    }


    // =================================
    // DATE MISMATCH
    // =================================

    if (
        discrepancy.issueTypes.includes("DATE_MISMATCH")
    ) {

        const differenceInDays =
            discrepancy.details.differenceInDays || 0;

        summary =
            "The transaction date is significantly different from the invoice date.";

        reasons.push({
            factor: "Date Difference",
            value: differenceInDays,
            impact: discrepancy.severity
        });
    }


    // =================================
    // DUPLICATE
    // =================================

    if (
        discrepancy.issueTypes.includes("DUPLICATE_INVOICE")
    ) {

        summary =
            "Two invoices have the same invoice number.";

        reasons.push({
            factor: "Duplicate Invoice",
            value: "Same invoice number",
            impact: discrepancy.severity
        });
    }


    // =================================
    // POTENTIAL DUPLICATE
    // =================================

    if (
        discrepancy.issueTypes.includes("POTENTIAL_DUPLICATE")
    ) {

        const similarity =
            discrepancy.details.similarity || 0;

        summary =
            "The invoice has characteristics similar to another invoice.";

        reasons.push({
            factor: "Potential Duplicate",
            value: similarity,
            impact: discrepancy.severity
        });
    }


    // =================================
    // MISSING TRANSACTION
    // =================================

    if (
        discrepancy.issueTypes.includes("MISSING_TRANSACTION")
    ) {

        summary =
            "An invoice exists but no matching transaction was found.";

        reasons.push({
            factor: "Missing Transaction",
            value: discrepancy.invoiceNumber,
            impact: discrepancy.severity
        });
    }


    // =================================
    // ORPHAN TRANSACTION
    // =================================

    if (
        discrepancy.issueTypes.includes("ORPHAN_TRANSACTION")
    ) {

        summary =
            "A transaction exists without a matching invoice.";

        reasons.push({
            factor: "Orphan Transaction",
            value: discrepancy.transactionId,
            impact: discrepancy.severity
        });
    }


    // =================================
    // ANOMALY
    // =================================

    if (
        discrepancy.issueTypes.includes("ANOMALY")
    ) {

        const amount =
            discrepancy.details.amount || 0;

        const anomalyScore =
            discrepancy.details.anomalyScore || 0;

        summary =
            `Transaction amount of ₹${amount} shows an unusual pattern compared with other transactions.`;

        reasons.push({
            factor: "Anomaly Score",
            value: anomalyScore,
            impact: discrepancy.severity
        });

        reasons.push({
            factor: "Transaction Amount",
            value: amount,
            impact: discrepancy.severity
        });
    }


    // =================================
    // RETURN EXPLANATION
    // =================================

    return {
        summary,
        reasons
    };
}


module.exports = {
    generateExplanation
};