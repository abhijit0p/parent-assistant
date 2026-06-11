const {
    getEmbedding
} = require('./services/embeddingService');

const {
    cosineSimilarity
} = require('./services/similarityService');

async function main() {

    const e1 =
        await getEmbedding(
            "refund policy"
        );

    const e2 =
        await getEmbedding(
            "how do refunds work"
        );

    const e3 =
        await getEmbedding(
            "loan EMI interest rate"
        );

    console.log(
        "refund vs refund:",
        cosineSimilarity(e1, e2)
    );

    console.log(
        "refund vs loan:",
        cosineSimilarity(e1, e3)
    );
}

main();