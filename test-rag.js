const {
    answerPolicyQuestion
} = require("./tools/answerPolicyQuestion");

async function main() {

console.log(
   await answerPolicyQuestion(
      "Can I get refund after 5 classes?"
   )
);
}

main();