// app_2.js
import { routerModel } from "./services/llmRouter.js";
import { answerPolicyQuestion } from "./tools/answerPolicyQuestion.js";
import readline from "readline";

// Import your data-fetching tools
import { getAttendanceThisMonth } from "./tools/attendanceTool.js";
import { getAttendanceLastMonth } from "./tools/attendanceLastMonthTool.js";
import { getPaymentStatus } from "./tools/paymentTool.js";
import { getPaymentLink } from "./tools/paymentLinkTool.js";
import { getSubscriptionDetails } from "./tools/subscriptionTool.js";

// Global in-memory chat session store
const chatHistory = [];

/**
 * Enhanced Memory Handler: Skip contextualization if the user is just saying goodbye or hello
 */
async function contextualizeUserQuery(currentInput) {
  if (chatHistory.length === 0) return currentInput;

  // 🛡️ Clean the string from punctuation and lowercase it for accurate matching
  const cleanInput = currentInput.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g,"").trim();

  // Expanded vocabulary list for short greetings, exclamations, and feedback loops
  const conversationalShortcuts = [
    "bye", "goodbye", "exit", "quit", 
    "hello", "hi", "hey", "greetings",
    "thanks", "thank you", "thx",
    "wow", "nice", "awesome", "great", "cool", "ok", "okay", "perfect", "got it"
  ];

  // If the user just said an exclamation or greeting, don't let the history distort it
  if (conversationalShortcuts.includes(cleanInput)) {
    return currentInput;
  }

  // If it's a long sentence or a real query, proceed to merge history context safely
  const memoryPrompt = `
Given the following conversation history and a follow-up question from a parent, rephrase the follow-up question to be a standalone question that can be understood WITHOUT the conversation history. Do not change the core intent of the question.

Conversation History:
${chatHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")}

Follow-Up Question: "${currentInput}"
Standalone Question:`;

  try {
    const response = await routerModel.invoke(memoryPrompt);
    const simplifiedQuery = typeof response === "string" ? response : response.content;
    return simplifiedQuery.trim();
  } catch (err) {
    console.error("⚠️ Memory Contextualization failed, using raw input.", err);
    return currentInput;
  }
}

/**
 * Main Application Routing Handler
 */
async function handleParentInput(userInput, parentPhone) {
  // 1. Run the input through the memory condensation layer
  const standaloneQuery = await contextualizeUserQuery(userInput);
  
  if (standaloneQuery !== userInput) {
    console.log(`🧠 Memory Resolver Contextualized Query To: "${standaloneQuery}"`);
  }

  const routerPrompt = `
You are a deterministic routing backend engine. Respond ONLY with a valid JSON object. 
Do not include any conversational commentary or markdown text blocks.

Analyze the user input and classify it into exactly one of these intents:
- "check_attendance": User wants to see real-time or current presence logs for this month.
- "check_attendance_past": User explicitly asks about last month's attendance records.
- "billing_status": User wants to check their balance, invoice status, or see if they owe money.
- "get_payment_url": User explicitly wants a link to execute a payment or pay their bills.
- "subscription_specs": User is asking details about their specific active plan status or tier.
- "policy_governance": User is asking general institutional rules, refund policies, financing options, extensions regulations, cancellation mechanics, or makeup guidelines.
- "general_chat": Standard greetings.

User Input: "${standaloneQuery}"
JSON Output:`;

  try {
    const routerResponse = await routerModel.invoke(routerPrompt);
    const rawContent = typeof routerResponse === "string" ? routerResponse : routerResponse.content;
    
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new SyntaxError("Failed to parse routing classification.");
    const { intent } = JSON.parse(jsonMatch[0].trim());

    console.log(`🤖 Router Classified Intent As: [${intent.toUpperCase()}]`);

    let finalResponse;

    // Route to appropriate core pipeline tool
    switch (intent) {
      case "policy_governance":
        finalResponse = await answerPolicyQuestion(standaloneQuery);
        if (finalResponse.includes("TRIGGER_ADMIN_ESCAPEMENT")) {
          finalResponse = "I've flagged this scenario for administrative review. A representative will get back to you shortly.";
        }
        break;

      case "check_attendance":
        finalResponse = await getAttendanceThisMonth(parentPhone);
        break;

      case "check_attendance_past":
        finalResponse = await getAttendanceLastMonth(parentPhone);
        break;

      case "billing_status":
        finalResponse = await getPaymentStatus(parentPhone);
        break;

      case "get_payment_url":
        finalResponse = await getPaymentLink(parentPhone);
        break;

      case "subscription_specs":
        finalResponse = await getSubscriptionDetails(parentPhone);
        break;

      case "general_chat":
        finalResponse = "Hello! How can I help you handle classes, billing data, or school guidelines today?";
        break;

      default:
        finalResponse = "Could you rephrase that? I can assist with attendance tracking, payment links, and school policies.";
    }

    // 2. Append this exchange turn back to our chat memory window
    chatHistory.push({ role: "user", content: userInput });
    chatHistory.push({ role: "assistant", content: finalResponse });
    
    // Keep a sliding window of the last 6 turns to avoid bloated payloads
    if (chatHistory.length > 12) chatHistory.splice(0, 2);

    return finalResponse;

  } catch (err) {
    console.error("Routing execution error:", err);
    return "An internal system routing discrepancy occurred.";
  }
}

/**
 * Updated Interactive Terminal Loop UI with Default Phone Configuration
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log("==================================================================");
console.log("⚡ HYBRID AI PARENT ASSISTANT: INTERACTIVE CONSOLE CHAT DECK ⚡");
console.log("==================================================================");

// 📞 Fallback configuration default number
const DEFAULT_PHONE = "9916130148";

rl.question(`📞 Enter Parent Phone Number [Default: ${DEFAULT_PHONE}]: `, (phoneNumber) => {
  // If the user hits enter without typing anything, fall back to the default number
  const activePhone = phoneNumber.trim() || DEFAULT_PHONE;
  
  console.log(`\n✅ Session established for context channel: [${activePhone}]`);
  console.log("Type your queries live below. (Type 'exit' or 'bye' to quit the application)\n");

  const promptUser = () => {
    rl.question("👤 Parent: ", async (input) => {
      const cleanInput = input.trim();
      
      // Support 'exit' or 'bye' cleanly from the root session UI loop
      if (cleanInput.toLowerCase() === "exit" || cleanInput.toLowerCase() === "bye") {
        console.log("\n👋 Session explicitly closed by parent thread. Goodbye!");
        rl.close();
        process.exit(0);
      }

      if (!cleanInput) {
        promptUser();
        return;
      }

      const reply = await handleParentInput(cleanInput, activePhone);
      console.log(`🤖 Assistant:\n"${reply}"\n`);
      
      promptUser(); // Loop back recursively
    });
  };

  promptUser();
});