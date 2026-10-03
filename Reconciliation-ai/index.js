const {
    detectAnomalies
} = require("./anomalyDetector");

const {
    generateExplanation
} = require("./explanationEngine");

const {
    calculateSeverity
} = require("./severityEngine");

const {
    buildDiscrepancies
} = require("./discrepancyBuilder");

const {
    detectMissingRecords
} = require("./missingRecordDetector");

const {
    detectDuplicates
} = require("./duplicateDetector");

const {
    verifyTax
} = require("./taxEngine");

const {
    normalizeInvoices,
    normalizeTransactions
} = require("./normalizeData");

const {
    matchTransactions
} = require("./matchingEngine");

const {
    detectMismatches
} = require("./mismatchDetector");


// =====================================================
// SAMPLE INVOICE DATA
// =====================================================

const invoices = [
    {
        invoiceNumber: "INV001",
        vendorName: "ABC Traders",
        invoiceDate: "2026-09-01",
        taxableAmount: 10000,
        taxAmount: 1800,
        totalAmount: 11800
    },

    {
        invoiceNumber: "INV002",
        vendorName: "XYZ Supplies",
        invoiceDate: "2026-09-02",
        taxableAmount: 5000,
        taxAmount: 900,
        totalAmount: 5900
    }
];


// =====================================================
// SAMPLE TRANSACTION DATA
// =====================================================

const transactions = [
    {
        transactionId: "TXN001",
        invoiceNumber: "INV001",
        vendorName: "ABC Traders",
        date: "2026-09-03",
        amount: 11800
    },

    {
        transactionId: "TXN002",
        invoiceNumber: "INV002",
        vendorName: "XYZ Supplies",
        date: "2026-09-04",
        amount: 5500
    },

    {
        transactionId: "TXN003",
        invoiceNumber: "INV003",
        vendorName: "DEF Stores",
        date: "2026-09-05",
        amount: 6000
    },

    {
        transactionId: "TXN004",
        invoiceNumber: "INV004",
        vendorName: "PQR Traders",
        date: "2026-09-06",
        amount: 6200
    },

    {
        transactionId: "TXN005",
        invoiceNumber: "INV005",
        vendorName: "LMN Supplies",
        date: "2026-09-07",
        amount: 5800
    },

    {
        transactionId: "TXN006",
        invoiceNumber: "INV006",
        vendorName: "Test Vendor",
        date: "2026-09-08",
        amount: 50000
    }
];


// =====================================================
// STEP 1: NORMALIZE DATA
// =====================================================

const normalizedInvoices =
    normalizeInvoices(invoices);

const normalizedTransactions =
    normalizeTransactions(transactions);


// =====================================================
// STEP 2: MATCH INVOICES WITH TRANSACTIONS
// =====================================================

const matches =
    matchTransactions(
        normalizedInvoices,
        normalizedTransactions
    );
    // =====================================================
// STEP 3: DETECT RULE-BASED MISMATCHES
// =====================================================

const results =
    matches.map(match => {

        const issues =
            detectMismatches(
                match.invoice,
                match.transaction
            );

        return {

            // Keep the original matched records
            // for the discrepancy builder.
            invoice:
                match.invoice,

            transaction:
                match.transaction,

            invoiceNumber:
                match.invoice.invoiceNumber,

            transactionId:
                match.transaction?.transactionId || null,

            vendorName:
                match.invoice.vendorName,

            status:
                issues.length === 0
                    ? "MATCHED"
                    : "MISMATCHED",

            issueTypes:
                issues.map(
                    issue => issue.type
                ),

            issues
        };
    });

// =====================================================
// STEP 4: TAX VERIFICATION
// =====================================================

const taxRate = 0.18;

const taxResults =
    normalizedInvoices.map(invoice => {

        return verifyTax(
            invoice,
            taxRate
        );
    });

console.log("\n==============================");
console.log("TAX RESULTS");
console.log("==============================");

console.log(
    JSON.stringify(
        taxResults,
        null,
        2
    )
);


// =====================================================
// STEP 5: DUPLICATE DETECTION
// =====================================================

const duplicateResults =
    detectDuplicates(
        normalizedInvoices
    );

console.log("\n==============================");
console.log("DUPLICATE RESULTS");
console.log("==============================");

console.log(
    JSON.stringify(
        duplicateResults,
        null,
        2
    )
);


// =====================================================
// STEP 6: MISSING / ORPHAN DETECTION
// =====================================================

const missingResults =
    detectMissingRecords(
        normalizedInvoices,
        normalizedTransactions
    );

console.log("\n==============================");
console.log("MISSING / ORPHAN RESULTS");
console.log("==============================");

console.log(
    JSON.stringify(
        missingResults,
        null,
        2
    )
);


// =====================================================
// STEP 7: ML ANOMALY DETECTION
// =====================================================

const anomalyResults =
    detectAnomalies(
        normalizedTransactions
    );

console.log("\n==============================");
console.log("ML ANOMALY RESULTS");
console.log("==============================");

console.log(
    JSON.stringify(
        anomalyResults,
        null,
        2
    )
);


// =====================================================
// STEP 8: BUILD STANDARD DISCREPANCIES
// =====================================================

const discrepancies =
    buildDiscrepancies({

        results,

        taxResults,

        duplicateResults,

        missingResults,

        anomalyResults,

        // IMPORTANT:
        // Pass transactions so the discrepancy
        // builder can retrieve vendor information
        // for orphan transactions.
        transactions:
            normalizedTransactions
    });

console.log("\n==============================");
console.log("STANDARD DISCREPANCIES");
console.log("==============================");

console.log(
    JSON.stringify(
        discrepancies,
        null,
        2
    )
);


// =====================================================
// STEP 9: SEVERITY ENGINE
// =====================================================

const severityResults =
    discrepancies.map(
        discrepancy => {

            const severity =
                calculateSeverity(
                    discrepancy
                );

            return {

                ...discrepancy,

                severityScore:
                    severity.severityScore,

                severity:
                    severity.severity
            };
        }
    );

console.log("\n==============================");
console.log("SEVERITY RESULTS");
console.log("==============================");

console.log(
    JSON.stringify(
        severityResults,
        null,
        2
    )
);


// =====================================================
// STEP 10: AI EXPLANATION ENGINE
// =====================================================

const finalResults =
    severityResults.map(
        discrepancy => {

            const explanation =
                generateExplanation(
                    discrepancy
                );

            return {

                ...discrepancy,

                aiExplanation:
                    explanation
            };
        }
    );

console.log("\n==============================");
console.log("FINAL RESULTS");
console.log("==============================");

console.log(
    JSON.stringify(
        finalResults,
        null,
        2
    )
);


// =====================================================
// FINAL OUTPUT 
// =====================================================

console.log("\n==============================");
console.log("FINAL OUTPUT");
console.log("==============================");

console.log(
    JSON.stringify(
        finalResults,
        null,
        2
    )
);