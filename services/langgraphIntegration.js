/**
 * LangGraph Fashion Agent Integration for Node.js
 * Provides a bridge between the Node.js server and Python LangGraph agent
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

class LangGraphIntegration {
  constructor() {
    this.pythonPath = 'python3'; // Adjust if needed
    this.agentScript = path.join(process.cwd(), 'services', 'langgraphFashionAgent.py');
    this.tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate trend-based designs using the LangGraph agent
   * @param {Object} request - Design generation request
   * @returns {Promise<Object>} - Generated designs and images
   */
  async generateTrendBasedDesigns(request) {
    try {
      console.log('🚀 Starting LangGraph Fashion Agent...');
      
      // Prepare request data
      const requestData = {
        garmentType: request.garmentType || 'general',
        category: request.category || 'all',
        strategy: request.strategy || 'balanced',
        count: request.count || 3,
        targetAudience: request.targetAudience || 'general',
        occasion: request.occasion || 'everyday',
        preferences: request.preferences || {}
      };

      // Create temporary file for request
      const requestId = uuidv4();
      const requestFile = path.join(this.tempDir, `request_${requestId}.json`);
      const responseFile = path.join(this.tempDir, `response_${requestId}.json`);
      
      // Write request to file
      fs.writeFileSync(requestFile, JSON.stringify(requestData, null, 2));
      
      // Create Python script to handle the request
      const pythonScript = this.createPythonScript(requestFile, responseFile);
      const scriptFile = path.join(this.tempDir, `script_${requestId}.py`);
      fs.writeFileSync(scriptFile, pythonScript);
      
      // Execute Python script
      const result = await this.executePythonScript(scriptFile);
      
      // Read response
      if (fs.existsSync(responseFile)) {
        const responseData = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
        
        // Clean up temporary files
        this.cleanupTempFiles([requestFile, responseFile, scriptFile]);
        
        return responseData;
      } else {
        throw new Error('No response file generated');
      }
      
    } catch (error) {
      console.error('❌ Error in LangGraph integration:', error);
      return {
        success: false,
        error: error.message,
        fallbackDesigns: await this.generateFallbackDesigns(request)
      };
    }
  }

  /**
   * Create Python script to execute the LangGraph agent
   */
  createPythonScript(requestFile, responseFile) {
    return `
import asyncio
import json
import sys
import os
from pathlib import Path

# Add the services directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / 'services'))

from langgraphFashionAgent import LangGraphFashionAgent

async def main():
    try:
        # Read request
        with open('${requestFile}', 'r') as f:
            request = json.load(f)
        
        # Initialize agent
        agent = LangGraphFashionAgent()
        
        # Generate designs
        result = await agent.generate_trend_based_designs(request)
        
        # Write response
        with open('${responseFile}', 'w') as f:
            json.dump(result, f, indent=2)
        
        print("✅ LangGraph agent completed successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        # Write error response
        error_result = {
            "success": False,
            "error": str(e),
            "error_messages": [str(e)]
        }
        with open('${responseFile}', 'w') as f:
            json.dump(error_result, f, indent=2)

if __name__ == "__main__":
    asyncio.run(main())
`;
  }

  /**
   * Execute Python script
   */
  executePythonScript(scriptFile) {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [scriptFile], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('Python stdout:', data.toString());
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Python stderr:', data.toString());
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  /**
   * Clean up temporary files
   */
  cleanupTempFiles(files) {
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.warn(`Warning: Could not delete temp file ${file}:`, error);
      }
    });
  }

  /**
   * Generate fallback designs when LangGraph agent fails
   */
  async generateFallbackDesigns(request) {
    console.log('🔄 Generating fallback designs...');
    
    return {
      success: true,
      designs: [
        {
          id: uuidv4(),
          prompt: `Create a modern ${request.garmentType || 'garment'} design`,
          strategy: request.strategy || 'balanced',
          targetAudience: request.targetAudience || 'general',
          occasion: request.occasion || 'everyday',
          isFallback: true,
          metadata: {
            generatedAt: new Date().toISOString(),
            fallback: true
          }
        }
      ],
      trendAnalysis: {
        season: this.getCurrentSeason(),
        year: new Date().getFullYear(),
        category: request.category || 'all',
        keyTrends: [
          {
            name: 'Sustainable Fashion',
            description: 'Eco-friendly materials and ethical production',
            confidence: 0.9
          }
        ],
        colorPalettes: [
          {
            name: 'Earth Tones',
            colors: ['sage green', 'terracotta', 'cream', 'navy'],
            trendStrength: 0.8
          }
        ]
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        fallback: true,
        garmentType: request.garmentType || 'general',
        category: request.category || 'all',
        strategy: request.strategy || 'balanced'
      }
    };
  }

  /**
   * Get current season
   */
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  /**
   * Check if Python and required packages are available
   */
  async checkDependencies() {
    try {
      // Check Python
      const pythonCheck = await this.executeCommand(`${this.pythonPath} --version`);
      console.log('✅ Python available:', pythonCheck.stdout);
      
      // Check if langgraphFashionAgent.py exists
      if (!fs.existsSync(this.agentScript)) {
        throw new Error('langgraphFashionAgent.py not found');
      }
      
      // Check Python packages
      const packageCheck = await this.executeCommand(`${this.pythonPath} -c "import langgraph, google.generativeai; print('✅ Required packages available')"`);
      console.log('✅ Required Python packages available');
      
      return true;
    } catch (error) {
      console.error('❌ Dependency check failed:', error);
      return false;
    }
  }

  /**
   * Execute command and return result
   */
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }
}

export { LangGraphIntegration };
