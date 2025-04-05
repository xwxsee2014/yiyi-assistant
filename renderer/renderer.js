document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const serverUrlInput = document.getElementById('server-url');
  const apiKeyInput = document.getElementById('api-key');
  const modelInput = document.getElementById('model');
  const connectBtn = document.getElementById('connect-btn');
  const connectionStatus = document.getElementById('connection-status');
  const chatContainer = document.getElementById('chat-container');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  
  // Server connection state
  let isConnected = false;
  let currentServerConfig = null;
  
  // Connect to MCP server
  connectBtn.addEventListener('click', async () => {
    const serverConfig = {
      url: serverUrlInput.value,
      apiKey: apiKeyInput.value,
      model: modelInput.value
    };
    
    connectionStatus.textContent = 'Connecting...';
    
    try {
      const result = await window.api.connectToMcpServer(serverConfig);
      
      if (result.success) {
        isConnected = true;
        currentServerConfig = serverConfig;
        connectionStatus.textContent = 'Connected';
        connectionStatus.style.color = '#2ecc71';
        sendBtn.disabled = false;
        
        // Add welcome message
        addAgentMessage('Connected to AI assistant. How can I help you today?');
      } else {
        connectionStatus.textContent = 'Connection failed: ' + result.error;
        connectionStatus.style.color = '#e74c3c';
      }
    } catch (error) {
      connectionStatus.textContent = 'Connection error: ' + error.message;
      connectionStatus.style.color = '#e74c3c';
    }
  });
  
  // Send user request to AI agent
  sendBtn.addEventListener('click', async () => {
    const userRequest = userInput.value.trim();
    
    if (!userRequest) return;
    
    // Display user message
    addUserMessage(userRequest);
    
    // Clear input field
    userInput.value = '';
    
    // Disable send button during processing
    sendBtn.disabled = true;
    
    try {
      // Send request to AI agent through main process
      const response = await window.api.processUserRequest(userRequest, currentServerConfig);
      
      if (response.success) {
        // Process step-by-step responses if available
        if (response.steps && response.steps.length > 0) {
          response.steps.forEach(step => {
            addStepMessage(step.content);
          });
        }
        
        // Add final agent response
        addAgentMessage(response.finalResponse);
      } else {
        addAgentMessage('Error: ' + response.error);
      }
    } catch (error) {
      addAgentMessage('An error occurred while processing your request: ' + error.message);
    }
    
    // Re-enable send button
    sendBtn.disabled = false;
  });
  
  // Enter key to send message
  userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !sendBtn.disabled) {
      event.preventDefault();
      sendBtn.click();
    }
  });
  
  // Helper functions to add messages to chat
  function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
  }
  
  function addAgentMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message agent-message';
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
  }
  
  function addStepMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message step-message';
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
  }
  
  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  // Initialize with default values
  serverUrlInput.value = 'ws://localhost:8765';
  modelInput.value = 'gpt-3.5-turbo';
});
