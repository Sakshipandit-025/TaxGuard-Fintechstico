const { IsolationForest } = require("isolation-forest");

function detectAnomalies(transactions) {

    const anomalies = [];

    // Need enough records for ML
    if (transactions.length < 5) {
        return anomalies;
    }

    // Convert transaction amounts into ML features
    const data = transactions.map(transaction => [
        transaction.amount
    ]);

    // Create Isolation Forest
    const model = new IsolationForest();

    // Train model
    model.fit(data);

    // Calculate anomaly scores
    const scores = model.scores(data);

    // DEBUG: show ML scores
    console.log("\nML ANOMALY SCORES:");

    transactions.forEach((transaction, index) => {

        console.log({
            transactionId: transaction.transactionId,
            invoiceNumber: transaction.invoiceNumber,
            vendorName: transaction.vendorName,
            amount: transaction.amount,
            score: scores[index]
        });

    });

    // Detect unusual transactions
    transactions.forEach((transaction, index) => {

        const score = scores[index];

        if (score > 0.6) {

            anomalies.push({
                type: "ANOMALY",

                transactionId:
                    transaction.transactionId,

                invoiceNumber:
                    transaction.invoiceNumber,

                vendorName:
                    transaction.vendorName,

                amount:
                    transaction.amount,

                anomalyScore:
                    Number(score.toFixed(2)),

                message:
                    "Transaction amount shows an unusual pattern compared with other transactions."
            });
        }
    });

    return anomalies;
}

module.exports = {
    detectAnomalies
};