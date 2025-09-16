import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

class AIDesignGenerator {
  constructor() {
    // Initialize VertexAI with your Cloud project and location
    this.ai = new GoogleGenAI({
      vertexai: true,
      project: 'garment-design-ai-2025',
      location: 'global'
    });
    this.model = 'gemini-2.5-flash-image-preview';

    // Set up generation config
    this.generationConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["TEXT", "IMAGE"],
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_IMAGE_HATE',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_IMAGE_HARASSMENT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT',
          threshold: 'OFF',
        }
      ],
    };

    this.textureLibrary = {
      cotton: {
        pattern: 'cotton-texture.png',
        properties: { roughness: 0.3, reflectivity: 0.1 }
      },
      silk: {
        pattern: 'silk-texture.png',
        properties: { roughness: 0.1, reflectivity: 0.8 }
      },
      denim: {
        pattern: 'denim-texture.png',
        properties: { roughness: 0.7, reflectivity: 0.2 }
      },
      leather: {
        pattern: 'leather-texture.png',
        properties: { roughness: 0.5, reflectivity: 0.4 }
      }
    };
    
    this.colorPalettes = {
      blue: { r: 30, g: 144, b: 255 },
      red: { r: 255, g: 69, b: 0 },
      green: { r: 34, g: 139, b: 34 },
      black: { r: 0, g: 0, b: 0 },
      white: { r: 255, g: 255, b: 255 },
      gray: { r: 128, g: 128, b: 128 }
    };
  }

  async generateFinalImage(flatImagePath, outputPath, options = {}) {
    try {
      console.log(`Generating final image from flat using VertexAI Gemini: ${flatImagePath}`);
      
      const { 
        style = 'casual', 
        color = 'blue', 
        material = 'cotton',
        textPrompt = '',
        fabricImagePaths = []
      } = options;
      
      // Read the flat image file
      const imageBuffer = fs.readFileSync(flatImagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Prepare the prompt for Gemini
      const prompt = this.buildPrompt(style, color, material, textPrompt, fabricImagePaths);
      console.log('Prompt:', prompt);
      // Prepare the image data for VertexAI
      const parts = [];
      
      // Add flat image
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Image
        }
      });
      
      // Add fabric images if provided
      for (const fabricPath of fabricImagePaths) {
        try {
          const fabricBuffer = fs.readFileSync(fabricPath);
          const fabricBase64 = fabricBuffer.toString('base64');
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: fabricBase64
            }
          });
        } catch (error) {
          console.warn(`Could not read fabric image ${fabricPath}:`, error);
        }
      }
      
      // Add text prompt
      parts.push({ text: prompt });
      
      // Create the request for VertexAI
      const req = {
        model: this.model,
        contents: [
          { role: 'user', parts: parts }
        ],
        config: this.generationConfig,
      };

      console.log('Sending request to VertexAI Gemini...');
      
      // Generate content using VertexAI
      const response = await this.ai.models.generateContent(req);
      console.log('Received response from VertexAI Gemini:', response);
      let generatedImageBuffer = null;
      let responseText = '';
      
      // Parse the response to extract image data
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            // Extract image buffer from base64 data
            generatedImageBuffer = Buffer.from(part.inlineData.data, "base64");
            console.log('Successfully extracted image buffer from Gemini response');
          } else if (part.text) {
            // Extract text response
            responseText = part.text;
            console.log('Text response from Gemini:', responseText);
          }
        }
      }
      
      if (generatedImageBuffer) {
        // Save the generated image
        fs.writeFileSync(outputPath, generatedImageBuffer);
        console.log(`Final image saved to: ${outputPath}`);
        return outputPath;
      } else {
        // Fallback to traditional processing if no image generated
        console.log('No image generated by Gemini, using fallback processing...');
        return await this.generateFinalImageFallback(flatImagePath, outputPath, options);
      }
      
    } catch (error) {
      console.error('Error in generateFinalImage with VertexAI:', error);
      console.log('Falling back to traditional processing...');
      return await this.generateFinalImageFallback(flatImagePath, outputPath, options);
    }
  }

  buildPrompt(style, color, material, textPrompt = '', fabricImagePaths = []) {
    const styleDescriptions = {
      casual: 'casual, relaxed, everyday wear',
      formal: 'formal, elegant, professional',
      sporty: 'sporty, athletic, performance-oriented'
    };

    const materialDescriptions = {
      cotton: 'soft cotton fabric with natural texture',
      silk: 'luxurious silk fabric with smooth, shiny surface',
      denim: 'durable denim fabric with characteristic weave pattern',
      leather: 'premium leather with natural grain and texture'
    };

    const colorDescriptions = {
      blue: 'classic blue color',
      red: 'vibrant red color',
      green: 'natural green color',
      black: 'sophisticated black color',
      white: 'clean white color',
      gray: 'neutral gray color'
    };

    let basePrompt = `Transform this flat technical drawing of a garment into a realistic, high-quality final product image. 

Requirements:`;

    // Add style requirement only if not "none"
    if (style !== 'none') {
      basePrompt += `\n- Style: ${styleDescriptions[style]}`;
    }

    // Add material requirement only if not "none"
    if (material !== 'none') {
      basePrompt += `\n- Material: ${materialDescriptions[material]}`;
    }

    // Add color requirement only if not "none"
    if (color !== 'none') {
      basePrompt += `\n- Color: ${colorDescriptions[color]}`;
    }

    // Add fabric image guidance if provided
    if (fabricImagePaths && fabricImagePaths.length > 0) {
      basePrompt += `\n- Fabric References: ${fabricImagePaths.length} fabric sample(s) provided for texture and pattern reference`;
      if (fabricImagePaths.length === 1) {
        basePrompt += `\n  * Use the fabric image provided as the primary texture reference`;
      } else if (fabricImagePaths.length === 2) {
        basePrompt += `\n  * Use the second images which is a fabric image as the primary texture reference`;
        basePrompt += `\n  * Use the third image which is also a fabric image for accent details or secondary elements`;

      } 
    }

    // Add custom design guidance if provided
    if (textPrompt && textPrompt.trim()) {
      basePrompt += `\n- Custom Design Guidance: ${textPrompt}`;
    }

    basePrompt += `

Please create a photorealistic rendering that:
1. Maintains the exact proportions and structure of the original flat drawing
2. Adds realistic 3D depth and dimensionality`;

    // Add material and color instructions only if not "none"
    let stepNumber = 3;
    if (material !== 'none' && color !== 'none') {
      basePrompt += `\n3. Applies appropriate ${material} texture and ${color} color`;
    } else if (material !== 'none') {
      basePrompt += `\n3. Applies appropriate ${material} texture`;
    } else if (color !== 'none') {
      basePrompt += `\n3. Applies appropriate ${color} color`;
    } else if (fabricImagePaths && fabricImagePaths.length > 0) {
      basePrompt += `\n3. Uses and applies the provided fabric sample as the primary texture and pattern reference for the garment`;
      stepNumber = 4;
    }
    else {
      basePrompt += `\n3. Uses appropriate materials and colors based on the garment design`;
    }

    // Add fabric image reference instructions
    if (fabricImagePaths && fabricImagePaths.length > 0) {
      if (fabricImagePaths.length === 1) {
        basePrompt += `\n4. Uses the provided fabric sample as the primary texture and pattern reference`;
        stepNumber = 5;
      } else if (fabricImagePaths.length === 2) {
        basePrompt += `\n4. Uses the first fabric sample as the primary texture and pattern reference`;
        basePrompt += `\n5. Incorporates the second fabric sample for accent details, pockets, or secondary elements`;
        stepNumber = 6;
      } 
    } else {
      stepNumber = 4;
    }
    

    // Add final rendering instructions
    basePrompt += `
${stepNumber}. Includes realistic lighting and shadows${style !== 'none' ? ` for a ${style} aesthetic` : ''}
${stepNumber + 1}. Has high resolution and professional quality
${stepNumber + 2}. Includes subtle details like fabric folds, stitching, and material properties
${stepNumber + 3}. Ensure the garment is displayed in a natural way and the background is white and the garment is centered`;


    

    basePrompt += `\n\nThe output should be a single, high-quality image that looks like a professional product photograph.`;

    // Add final fabric usage instructions
    if (fabricImagePaths && fabricImagePaths.length > 0) {
      basePrompt += `\n\nIMPORTANT: Pay close attention to the fabric sample images provided. Use their textures, patterns, and visual characteristics to create a realistic representation of how the garment would look with those specific fabrics.`;
      if (fabricImagePaths.length > 1) {
        basePrompt += ` When multiple fabric samples are provided, blend them harmoniously to generate a realistic representation of how the flat design garment would look with those specific fabrics.`;
      }
    }

    return basePrompt;
  }

  async generateFinalImageFallback(flatImagePath, outputPath, options = {}) {
    try {
      console.log(`Using fallback processing for: ${flatImagePath}`);
      
      const { 
        style = 'casual', 
        color = 'blue', 
        material = 'cotton',
        textPrompt = '',
        fabricImagePaths = []
      } = options;
      
      // Use default values if "none" is selected
      const finalStyle = style === 'none' ? 'casual' : style;
      const finalColor = color === 'none' ? 'blue' : color;
      const finalMaterial = material === 'none' ? 'cotton' : material;
      
      // Load the flat technical drawing
      const flatImage = await loadImage(flatImagePath);
      const canvas = createCanvas(flatImage.width, flatImage.height);
      const ctx = canvas.getContext('2d');
      
      // Draw flat image
      ctx.drawImage(flatImage, 0, 0);
      
      // Note: In fallback mode, text prompt and fabric images are not processed
      // as the fallback uses traditional image processing techniques
      if (textPrompt || fabricImagePaths.length > 0) {
        console.log('Text prompt and fabric images are not processed in fallback mode');
      }
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply 3D transformation and rendering
      const renderedData = await this.apply3DRendering(data, canvas.width, canvas.height, options);
      
      // Apply material and texture
      const texturedData = await this.applyMaterialAndTexture(renderedData, canvas.width, canvas.height, finalMaterial);
      
      // Apply color
      const coloredData = this.applyColor(texturedData, canvas.width, canvas.height, finalColor);
      
      // Apply lighting and shadows
      const litData = this.applyLighting(coloredData, canvas.width, canvas.height, finalStyle);
      
      // Apply final enhancements
      const finalData = this.applyFinalEnhancements(litData, canvas.width, canvas.height, finalStyle);
      
      // Convert back to canvas
      const finalCanvas = createCanvas(canvas.width, canvas.height);
      const finalCtx = finalCanvas.getContext('2d');
      const finalImageData = finalCtx.createImageData(canvas.width, canvas.height);
      finalImageData.data.set(finalData);
      finalCtx.putImageData(finalImageData, 0, 0);
      
      // Save the final image
      const buffer = finalCanvas.toBuffer('image/png');
      await sharp(buffer)
        .png()
        .toFile(outputPath);
      
      console.log(`Fallback final image saved to: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error in generateFinalImageFallback:', error);
      throw error;
    }
  }

  async apply3DRendering(data, width, height, options) {
    const renderedData = new Uint8ClampedArray(data.length);
    
    // Simulate 3D transformation by applying perspective and depth
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Calculate depth based on position (simplified 3D effect)
        const centerX = width / 2;
        const centerY = height / 2;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        const depth = 1 - (distanceFromCenter / maxDistance) * 0.3;
        
        // Apply depth-based shading
        if (data[idx] === 0) { // Black lines (garment structure)
          const shade = Math.max(0, Math.min(255, 255 * depth));
          renderedData[idx] = shade;
          renderedData[idx + 1] = shade;
          renderedData[idx + 2] = shade;
          renderedData[idx + 3] = data[idx + 3];
        } else {
          // Apply 3D effect to white areas
          const originalValue = data[idx];
          const enhancedValue = Math.max(0, Math.min(255, originalValue * depth));
          renderedData[idx] = enhancedValue;
          renderedData[idx + 1] = enhancedValue;
          renderedData[idx + 2] = enhancedValue;
          renderedData[idx + 3] = data[idx + 3];
        }
      }
    }
    
    return renderedData;
  }

  async applyMaterialAndTexture(data, width, height, material) {
    const texturedData = new Uint8ClampedArray(data.length);
    
    // Apply material-specific texture patterns
    const texture = this.textureLibrary[material] || this.textureLibrary.cotton;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Generate texture pattern based on material
        const textureValue = this.generateTexturePattern(x, y, material);
        
        // Apply texture to the image
        const originalValue = data[idx];
        const texturedValue = Math.max(0, Math.min(255, originalValue * textureValue));
        
        texturedData[idx] = texturedValue;
        texturedData[idx + 1] = texturedValue;
        texturedData[idx + 2] = texturedValue;
        texturedData[idx + 3] = data[idx + 3];
      }
    }
    
    return texturedData;
  }

  generateTexturePattern(x, y, material) {
    // Generate different texture patterns for different materials
    switch (material) {
      case 'cotton':
        return 0.9 + 0.1 * Math.sin(x * 0.1) * Math.cos(y * 0.1);
      case 'silk':
        return 0.95 + 0.05 * Math.sin(x * 0.05) * Math.cos(y * 0.05);
      case 'denim':
        return 0.8 + 0.2 * Math.sin(x * 0.2) * Math.cos(y * 0.15);
      case 'leather':
        return 0.85 + 0.15 * Math.sin(x * 0.08) * Math.cos(y * 0.12);
      default:
        return 1.0;
    }
  }

  applyColor(data, width, height, color) {
    const coloredData = new Uint8ClampedArray(data.length);
    const colorPalette = this.colorPalettes[color] || this.colorPalettes.blue;
    
    for (let i = 0; i < data.length; i += 4) {
      const grayValue = data[i];
      const alpha = grayValue / 255;
      
      // Apply color while preserving the structure
      coloredData[i] = Math.round(colorPalette.r * alpha);
      coloredData[i + 1] = Math.round(colorPalette.g * alpha);
      coloredData[i + 2] = Math.round(colorPalette.b * alpha);
      coloredData[i + 3] = data[i + 3];
    }
    
    return coloredData;
  }

  applyLighting(data, width, height, style) {
    const litData = new Uint8ClampedArray(data.length);
    
    // Create lighting effect based on style
    const lightSource = this.getLightSource(style);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Calculate distance from light source
        const distanceFromLight = Math.sqrt((x - lightSource.x) ** 2 + (y - lightSource.y) ** 2);
        const maxDistance = Math.sqrt(width ** 2 + height ** 2);
        const lightIntensity = 1 - (distanceFromLight / maxDistance) * 0.5;
        
        // Apply lighting
        const originalR = data[idx];
        const originalG = data[idx + 1];
        const originalB = data[idx + 2];
        
        litData[idx] = Math.max(0, Math.min(255, originalR * lightIntensity));
        litData[idx + 1] = Math.max(0, Math.min(255, originalG * lightIntensity));
        litData[idx + 2] = Math.max(0, Math.min(255, originalB * lightIntensity));
        litData[idx + 3] = data[idx + 3];
      }
    }
    
    return litData;
  }

  getLightSource(style) {
    switch (style) {
      case 'casual':
        return { x: 0.3, y: 0.2 }; // Top-left lighting
      case 'formal':
        return { x: 0.5, y: 0.1 }; // Top-center lighting
      case 'sporty':
        return { x: 0.7, y: 0.3 }; // Top-right lighting
      default:
        return { x: 0.5, y: 0.2 }; // Default lighting
    }
  }

  applyFinalEnhancements(data, width, height, style) {
    const enhancedData = new Uint8ClampedArray(data.length);
    
    // Apply style-specific enhancements
    const enhancementFactor = this.getEnhancementFactor(style);
    
    for (let i = 0; i < data.length; i += 4) {
      // Enhance contrast and saturation
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Apply enhancement
      enhancedData[i] = Math.max(0, Math.min(255, r * enhancementFactor));
      enhancedData[i + 1] = Math.max(0, Math.min(255, g * enhancementFactor));
      enhancedData[i + 2] = Math.max(0, Math.min(255, b * enhancementFactor));
      enhancedData[i + 3] = data[i + 3];
    }
    
    return enhancedData;
  }

  getEnhancementFactor(style) {
    switch (style) {
      case 'casual':
        return 1.1;
      case 'formal':
        return 1.2;
      case 'sporty':
        return 1.15;
      default:
        return 1.0;
    }
  }

  async generateVariations(flatImagePath, outputDir, variations = 5) {
    const results = [];
    
    for (let i = 0; i < variations; i++) {
      const style = ['casual', 'formal', 'sporty'][Math.floor(Math.random() * 3)];
      const color = ['blue', 'red', 'green', 'black', 'white'][Math.floor(Math.random() * 5)];
      const material = ['cotton', 'silk', 'denim', 'leather'][Math.floor(Math.random() * 4)];
      
      const outputPath = path.join(outputDir, `variation-${i + 1}.png`);
      
      try {
        await this.generateFinalImage(flatImagePath, outputPath, { style, color, material });
        results.push({
          path: outputPath,
          style,
          color,
          material
        });
      } catch (error) {
        console.error(`Error generating variation ${i + 1}:`, error);
      }
    }
    
    return results;
  }
}

export { AIDesignGenerator };
