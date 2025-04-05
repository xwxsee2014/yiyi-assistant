const WebSocket = require('ws');
const axios = require('axios');

class MCPClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.config = null;
  }
  
  async connect(serverConfig) {
    try {
      if (this.isConnected) {
        // Close existing connection if there is one
        this.ws.close();
      }
      
      this.config = serverConfig;
      
      // Connect to WebSocket server if using WebSocket protocol
      if (serverConfig.url.startsWith('ws')) {
        return await this.connectWebSocket(serverConfig);
      } else {
        // Otherwise assume HTTP/HTTPS API
        return await this.testHttpConnection(serverConfig);
      }
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw error;
    }
  }
  
  async connectWebSocket(config) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(config.url);
        
        this.ws.on('open', () => {
          console.log('WebSocket connection established');
          this.isConnected = true;
          
          // Send initial handshake with API key if provided
          if (config.apiKey) {
            this.ws.send(JSON.stringify({
              type: 'auth',
              apiKey: config.apiKey
            }));
          }
          
          resolve({ success: true });
        });
        
        this.ws.on('message', (data) => {
          const response = JSON.parse(data);
          
          if (response.type === 'auth_result') {
            if (!response.success) {
              this.isConnected = false;
              this.ws.close();
              reject(new Error(`Authentication failed: ${response.message}`));
            }
          }
          
          // Other message handlers will be implemented in the sendPrompt method
        });
        
        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        });
        
        this.ws.on('close', () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async testHttpConnection(config) {
    try {
      // Test the HTTP API connection with a simple request
      const response = await axios.post(`${config.url}/test`, {
        api_key: config.apiKey
      });
      
      if (response.status === 200) {
        this.isConnected = true;
        return { success: true };
      } else {
        throw new Error(`HTTP connection test failed with status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`HTTP connection test failed: ${error.message}`);
    }
  }
  
  async ensureConnection(serverConfig) {
    if (!this.isConnected || 
        this.config.url !== serverConfig.url || 
        this.config.apiKey !== serverConfig.apiKey) {
      await this.connect(serverConfig);
    }
    return this.isConnected;
  }
  
  async sendPrompt(prompt) {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    // Construct message to send
    const message = {
      model: this.config.model,
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 2000
    };
    
    // Send via WebSocket or HTTP based on connection type
    if (this.ws) {
      return await this.sendWebSocketPrompt(message);
    } else {
      return await this.sendHttpPrompt(message);
    }
  }
  
  async sendWebSocketPrompt(message) {
    return new Promise((resolve, reject) => {
      // Generate a unique ID for this request
      const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
      
      // Add message type and ID
      const request = {
        ...message,
        type: 'completion',
        requestId: requestId
      };
      
      // Set up response handler
      const responseHandler = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          // Check if this is a response to our specific request
          if (response.requestId === requestId) {
            if (response.type === 'completion_result') {
              // Remove the listener once we get our response
              this.ws.removeEventListener('message', responseHandler);
              
              if (response.error) {
                reject(new Error(`MCP server error: ${response.error}`));
              } else {
                resolve(response.text);
              }
            }
          }
        } catch (error) {
          reject(error);
        }
      };
      
      // Add temporary message listener for this request
      this.ws.addEventListener('message', responseHandler);
      
      // Send the request
      this.ws.send(JSON.stringify(request));
    });
  }
  
  async sendHttpPrompt(message) {
    try {
      const response = await axios.post(`${this.config.url}/v1/completions`, {
        ...message,
        api_key: this.config.apiKey
      });
      
      if (response.status === 200) {
        return response.data.text || response.data.choices[0].text;
      } else {
        throw new Error(`HTTP request failed with status: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }
}

module.exports = new MCPClient();
