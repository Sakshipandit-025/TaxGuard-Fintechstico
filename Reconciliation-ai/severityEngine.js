function calculateSeverity(discrepancy) {

    let score = 0;

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

        if (difference <= 100) {
            score += 20;
        }
        else if (difference <= 500) {
            score += 40;
        }
        else if (difference <= 1000) {
            score += 60;
        }
        else {
            score += 80;
        }
    }


    // =================================
    // OTHER ISSUE TYPES
    // =================================

    if (
        discrepancy.issueTypes.includes("TAX_MISMATCH")
    ) {
        score += 60;
    }

    if (
        discrepancy.issueTypes.includes("VENDOR_MISMATCH")
    ) {
        score += 50;
    }

    if (
        discrepancy.issueTypes.includes("DATE_MISMATCH")
    ) {
        score += 30;
    }

    if (
        discrepancy.issueTypes.includes("DUPLICATE_INVOICE")
    ) {
        score += 70;
    }

    if (
        discrepancy.issueTypes.includes("POTENTIAL_DUPLICATE")
    ) {
        score += 40;
    }

    if (
        discrepancy.issueTypes.includes("MISSING_TRANSACTION")
    ) {
        score += 70;
    }

    if (
        discrepancy.issueTypes.includes("ORPHAN_TRANSACTION")
    ) {
        score += 70;
    }

    if (
        discrepancy.issueTypes.includes("ANOMALY")
    ) {
        score += 80;
    }


    // =================================
    // LIMIT SCORE TO 100
    // =================================

    score = Math.min(score, 100);


    // =================================
    // CONVERT SCORE TO SEVERITY
    // =================================

    let severity;

    if (score <= 30) {
        severity = "LOW";
    }
    else if (score <= 70) {
        severity = "MEDIUM";
    }
    else {
        severity = "HIGH";
    }


    return {
        severityScore: score,
        severity: severity
    };
}


module.exports = {
    calculateSeverity
};