const mcpClient = require('../mcp-client');

class AIAgent {
  async processRequest(userRequest, serverConfig) {
    try {
      // Connect to MCP server (if not already connected)
      await mcpClient.ensureConnection(serverConfig);
      
      // Initialize response tracking
      const steps = [];
      let currentStep = 1;
      
      // Parse the user request to understand what needs to be done
      const requestAnalysis = await this.analyzeRequest(userRequest);
      steps.push({
        stepNumber: currentStep++,
        title: 'Request Analysis',
        content: `Understanding request: ${requestAnalysis.summary}`
      });
      
      // Break down the task into steps
      const taskSteps = await this.generateTaskSteps(userRequest, requestAnalysis);
      steps.push({
        stepNumber: currentStep++,
        title: 'Planning',
        content: `Breaking down task into ${taskSteps.length} steps`
      });
      
      // Execute each step sequentially
      let intermediateResults = [];
      for (const step of taskSteps) {
        steps.push({
          stepNumber: currentStep++,
          title: `Executing: ${step.title}`,
          content: `Working on: ${step.description}`
        });
        
        // Process this step
        const stepResult = await this.executeStep(step, intermediateResults, userRequest);
        intermediateResults.push(stepResult);
        
        steps.push({
          stepNumber: currentStep++,
          title: 'Step Complete',
          content: `Completed: ${step.title} - ${this.summarizeStepResult(stepResult)}`
        });
      }
      
      // Generate final response
      const finalResponse = await this.generateFinalResponse(userRequest, intermediateResults);
      
      return {
        success: true,
        steps: steps,
        finalResponse: finalResponse
      };
    } catch (error) {
      console.error('Error in AI agent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async analyzeRequest(userRequest) {
    // Ask the AI model to analyze the user's request
    const prompt = `Analyze the following user request and provide a summary of what needs to be done:
      
      "${userRequest}"
      
      Provide your analysis as JSON with the following structure:
      {
        "summary": "brief summary",
        "requestType": "query|task|creation|other",
        "complexity": "simple|medium|complex",
        "domains": ["domain1", "domain2"]
      }`;
    
    const response = await mcpClient.sendPrompt(prompt);
    
    // Parse JSON response
    try {
      return JSON.parse(response.trim());
    } catch (e) {
      // Fallback if the model doesn't return valid JSON
      return {
        summary: response.substring(0, 100) + "...",
        requestType: "unknown",
        complexity: "unknown",
        domains: []
      };
    }
  }
  
  async generateTaskSteps(userRequest, analysis) {
    // Ask the AI model to generate steps to complete the user's request
    const prompt = `Given the following user request:
    
      "${userRequest}"
      
      Break this down into sequential steps that an AI assistant should follow to fulfill this request.
      Return your response as a JSON array of step objects, where each object has a 'title' and 'description'.
      Keep the steps focused and specific.`;
      
    const response = await mcpClient.sendPrompt(prompt);
    
    // Parse JSON response
    try {
      return JSON.parse(response.trim());
    } catch (e) {
      // Fallback if the model doesn't return valid JSON
      return [{
        title: "Process request",
        description: "Complete the user's request directly"
      }];
    }
  }
  
  async executeStep(step, previousResults, originalRequest) {
    // Create context from previous results
    const contextString = previousResults.map((result, index) => 
      `Step ${index + 1} result: ${JSON.stringify(result)}`
    ).join('\n');
    
    // Execute this step using the AI model
    const prompt = `You are an AI assistant working on a step-by-step process to fulfill a user's request.
    
      Original user request: "${originalRequest}"
      
      Current step to execute:
      Title: ${step.title}
      Description: ${step.description}
      
      Previous step results:
      ${contextString}
      
      Execute this step and provide your result. Be thorough and focused on just this step.`;
      
    return await mcpClient.sendPrompt(prompt);
  }
  
  summarizeStepResult(stepResult) {
    // Create a short summary of the step result
    return stepResult.length > 50 
      ? stepResult.substring(0, 50) + "..." 
      : stepResult;
  }
  
  async generateFinalResponse(userRequest, allResults) {
    // Combine all step results to generate a coherent final response
    const resultsContext = allResults.map((result, index) => 
      `Step ${index + 1} result: ${result}`
    ).join('\n\n');
    
    const prompt = `Based on the user's request and all the work done, generate a final comprehensive response.
    
      User request: "${userRequest}"
      
      Work performed:
      ${resultsContext}
      
      Provide a clear, helpful final response that addresses all aspects of the user's request.`;
      
    return await mcpClient.sendPrompt(prompt);
  }
}

module.exports = new AIAgent();
