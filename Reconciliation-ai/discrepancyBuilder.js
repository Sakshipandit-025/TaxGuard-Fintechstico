function buildDiscrepancies({
    results,
    taxResults,
    duplicateResults,
    missingResults,
    anomalyResults,
    transactions = []
}) {

    const discrepancies = [];

    let counter = 1;

    const createdAt =
        new Date().toISOString();

    // =====================================================
    // HELPER: CREATE DISCREPANCY ID
    // =====================================================

    function createDiscrepancyId() {

        return `DISC-${String(counter++).padStart(4, "0")}`;

    }


    // =====================================================
    // HELPER: FIND TRANSACTION
    // =====================================================

    function findTransaction(transactionId) {

        return transactions.find(
            transaction =>
                transaction.transactionId ===
                transactionId
        );

    }


    // =====================================================
    // 1. MISMATCH RESULTS
    // =====================================================

    results.forEach(result => {

        if (result.issueTypes.length === 0) {
            return;
        }

        result.issueTypes.forEach(issueType => {

            // Missing transactions are handled
            // by missingResults below.
            if (
                issueType ===
                "MISSING_TRANSACTION"
            ) {
                return;
            }

            const issue =
                result.issues.find(
                    issue =>
                        issue.type === issueType
                );

            discrepancies.push({

                discrepancyId:
                    createDiscrepancyId(),

                invoiceNumber:
                    result.invoiceNumber || null,

                transactionId:
                    result.transactionId || null,

                vendorName:
                    result.vendorName || null,

                status:
                    "OPEN",

                issueTypes: [
                    issueType
                ],

                details: {

                    issueType:
                        issueType,

                    invoiceAmount:
                        result.invoice?.totalAmount ?? null,

                    transactionAmount:
                        result.transaction?.amount ?? null,

                    difference:
                        issue?.difference ?? null,

                    differenceInDays:
                        issue?.differenceInDays ?? null,

                    message:
                        issue?.message || null
                },

                createdAt:
                    createdAt
            });

        });

    });


    // =====================================================
    // 2. TAX MISMATCH
    // =====================================================

    taxResults.forEach(tax => {

        if (
            tax.taxStatus !==
            "TAX_MISMATCH"
        ) {
            return;
        }

        discrepancies.push({

            discrepancyId:
                createDiscrepancyId(),

            invoiceNumber:
                tax.invoiceNumber,

            transactionId:
                null,

            vendorName:
                null,

            status:
                "OPEN",

            issueTypes: [
                "TAX_MISMATCH"
            ],

            details: {

                issueType:
                    "TAX_MISMATCH",

                taxableAmount:
                    tax.taxableAmount,

                taxRate:
                    tax.taxRate,

                expectedTax:
                    tax.expectedTax,

                recordedTax:
                    tax.recordedTax,

                taxDifference:
                    tax.taxDifference

            },

            createdAt:
                createdAt
        });

    });


    // =====================================================
    // 3. DUPLICATE RESULTS
    // =====================================================

    duplicateResults.forEach(
        duplicate => {

            discrepancies.push({

                discrepancyId:
                    createDiscrepancyId(),

                invoiceNumber:
                    duplicate.invoiceNumber ||
                    duplicate.invoice1 ||
                    null,

                transactionId:
                    null,

                vendorName:
                    null,

                status:
                    "OPEN",

                issueTypes: [
                    duplicate.type
                ],

                details: {

                    issueType:
                        duplicate.type,

                    invoice1:
                        duplicate.invoice1 ||
                        null,

                    invoice2:
                        duplicate.invoice2 ||
                        null,

                    similarity:
                        duplicate.similarity ??
                        null,

                    message:
                        duplicate.message ||
                        null

                },

                createdAt:
                    createdAt
            });

        }
    );


    // =====================================================
    // 4. MISSING / ORPHAN RESULTS
    // =====================================================

    missingResults.forEach(
        missing => {

            let vendorName = null;

            // For orphan transactions,
            // retrieve vendor directly from transaction.
            if (
                missing.type ===
                "ORPHAN_TRANSACTION"
            ) {

                const transaction =
                    findTransaction(
                        missing.transactionId
                    );

                vendorName =
                    transaction?.vendorName ||
                    null;
            }

            discrepancies.push({

                discrepancyId:
                    createDiscrepancyId(),

                invoiceNumber:
                    missing.invoiceNumber ||
                    null,

                transactionId:
                    missing.transactionId ||
                    null,

                vendorName:
                    vendorName,

                status:
                    "OPEN",

                issueTypes: [
                    missing.type
                ],

                details: {

                    issueType:
                        missing.type,

                    message:
                        missing.message ||
                        null

                },

                createdAt:
                    createdAt
            });

        }
    );


    // =====================================================
    // 5. ML ANOMALY RESULTS
    // =====================================================

    anomalyResults.forEach(
        anomaly => {

            discrepancies.push({

                discrepancyId:
                    createDiscrepancyId(),

                invoiceNumber:
                    anomaly.invoiceNumber ||
                    null,

                transactionId:
                    anomaly.transactionId ||
                    null,

                vendorName:
                    anomaly.vendorName ||
                    null,

                status:
                    "OPEN",

                issueTypes: [
                    "ANOMALY"
                ],

                details: {

                    issueType:
                        "ANOMALY",

                    amount:
                        anomaly.amount,

                    anomalyScore:
                        anomaly.anomalyScore,

                    message:
                        anomaly.message

                },

                createdAt:
                    createdAt
            });

        }
    );


    return discrepancies;
}


module.exports = {
    buildDiscrepancies
};