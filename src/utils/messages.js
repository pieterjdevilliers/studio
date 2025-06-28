/**
 * Formats an array of message objects with sender prefixes
 * @param {Array} messages - Array of message objects with 'text' and 'sender' properties
 * @returns {Array<string>} - Array of formatted message strings
 * @throws {Error} - Throws error for invalid inputs
 */
function messages(messages) {
  // Input validation
  if (!Array.isArray(messages)) {
    throw new Error('Input must be an array');
  }

  if (messages.length === 0) {
    return [];
  }

  // Process each message with error handling
  return messages.map((message, index) => {
    // Validate message object structure
    if (typeof message !== 'object' || message === null) {
      throw new Error(`Invalid message at index ${index}: must be an object`);
    }

    // Validate required properties
    if (!message.hasOwnProperty('text')) {
      throw new Error(`Invalid message at index ${index}: missing 'text' property`);
    }

    if (!message.hasOwnProperty('sender')) {
      throw new Error(`Invalid message at index ${index}: missing 'sender' property`);
    }

    // Validate property types
    if (typeof message.text !== 'string') {
      throw new Error(`Invalid message at index ${index}: 'text' must be a string`);
    }

    if (typeof message.sender !== 'boolean') {
      throw new Error(`Invalid message at index ${index}: 'sender' must be a boolean`);
    }

    // Format message based on sender value
    const prefix = message.sender ? "Sent: " : "Received: ";
    return prefix + message.text;
  });
}

// Example usage and demonstrations
function demonstrateMessages() {
  console.log("=== Messages Function Demonstration ===\n");

  // Example 1: Basic usage
  console.log("Example 1: Basic usage");
  const basicMessages = [
    { text: "Hello there!", sender: true },
    { text: "Hi! How are you?", sender: false },
    { text: "I'm doing great, thanks!", sender: true },
    { text: "That's wonderful to hear!", sender: false }
  ];

  try {
    const formatted = messages(basicMessages);
    console.log("Input:", JSON.stringify(basicMessages, null, 2));
    console.log("Output:", formatted);
    console.log("✅ Success\n");
  } catch (error) {
    console.log("❌ Error:", error.message, "\n");
  }

  // Example 2: Empty array
  console.log("Example 2: Empty array");
  try {
    const emptyResult = messages([]);
    console.log("Input: []");
    console.log("Output:", emptyResult);
    console.log("✅ Success\n");
  } catch (error) {
    console.log("❌ Error:", error.message, "\n");
  }

  // Example 3: Mixed message types
  console.log("Example 3: Mixed message types");
  const mixedMessages = [
    { text: "Meeting at 3 PM", sender: true },
    { text: "Got it, see you then", sender: false },
    { text: "Don't forget the documents", sender: true }
  ];

  try {
    const mixedResult = messages(mixedMessages);
    console.log("Input:", JSON.stringify(mixedMessages, null, 2));
    console.log("Output:", mixedResult);
    console.log("✅ Success\n");
  } catch (error) {
    console.log("❌ Error:", error.message, "\n");
  }

  // Error handling examples
  console.log("=== Error Handling Examples ===\n");

  // Example 4: Invalid input type
  console.log("Example 4: Invalid input type (not an array)");
  try {
    messages("not an array");
  } catch (error) {
    console.log("❌ Expected Error:", error.message, "\n");
  }

  // Example 5: Invalid message object
  console.log("Example 5: Invalid message object (null)");
  try {
    messages([{ text: "Valid message", sender: true }, null]);
  } catch (error) {
    console.log("❌ Expected Error:", error.message, "\n");
  }

  // Example 6: Missing text property
  console.log("Example 6: Missing text property");
  try {
    messages([{ sender: true }]);
  } catch (error) {
    console.log("❌ Expected Error:", error.message, "\n");
  }

  // Example 7: Missing sender property
  console.log("Example 7: Missing sender property");
  try {
    messages([{ text: "Hello" }]);
  } catch (error) {
    console.log("❌ Expected Error:", error.message, "\n");
  }

  // Example 8: Invalid text type
  console.log("Example 8: Invalid text type (number instead of string)");
  try {
    messages([{ text: 123, sender: true }]);
  } catch (error) {
    console.log("❌ Expected Error:", error.message, "\n");
  }

  // Example 9: Invalid sender type
  console.log("Example 9: Invalid sender type (string instead of boolean)");
  try {
    messages([{ text: "Hello", sender: "true" }]);
  } catch (error) {
    console.log("❌ Expected Error:", error.message, "\n");
  }
}

// Real-world usage example
function realWorldExample() {
  console.log("=== Real-World Usage Example ===\n");
  
  // Simulating a chat conversation
  const chatConversation = [
    { text: "Hey, did you finish the project proposal?", sender: true },
    { text: "Yes, I just sent it to your email", sender: false },
    { text: "Perfect! I'll review it this afternoon", sender: true },
    { text: "Great, let me know if you need any changes", sender: false },
    { text: "Will do, thanks for getting it done so quickly", sender: true }
  ];

  try {
    const formattedChat = messages(chatConversation);
    console.log("Chat Conversation:");
    formattedChat.forEach((message, index) => {
      console.log(`${index + 1}. ${message}`);
    });
    console.log("\n✅ Chat formatted successfully!");
  } catch (error) {
    console.log("❌ Error formatting chat:", error.message);
  }
}

// Export for use in other modules (Node.js/ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { messages, demonstrateMessages, realWorldExample };
}

// Export for ES6 modules
if (typeof window === 'undefined') {
  // Node.js environment - run demonstrations
  demonstrateMessages();
  realWorldExample();
}

// For browser usage, attach to window object
if (typeof window !== 'undefined') {
  window.messages = messages;
  window.demonstrateMessages = demonstrateMessages;
  window.realWorldExample = realWorldExample;
}