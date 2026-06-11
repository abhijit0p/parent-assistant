const { askLLM } = require('./services/llmRouter');

async function main() {

    const result = await askLLM(
        `
            You are an intent classifier.

            Allowed outputs:

            PAYMENT_DUE
            ATTENDANCE
            SUBSCRIPTION
            PAYMENT_LINK
            UNKNOWN

            Return exactly one label.

            Question:
            How many classes attended this month?
`
    );

    console.log("[" + result + "]");
}

main();