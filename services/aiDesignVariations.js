import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

class AIDesignVariations {
  constructor() {
    // Check if Google API key is available
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('Warning: GOOGLE_API_KEY environment variable is not set. AI design variations will not work.');
      this.ai = null;
      this.model = 'gemini-2.5-flash-image-preview';
      return;
    }

    try {
      // Initialize GoogleGenAI
      this.ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);
      this.model = 'gemini-2.5-flash-image-preview';
    } catch (error) {
      console.error('Error initializing GoogleGenAI:', error.message);
      this.ai = null;
      this.model = 'gemini-2.5-flash-image-preview';
    }

    // Set up generation config
    this.generationConfig = {
      maxOutputTokens: 32768,
      temperature: 0.8,
      topP: 0.95,
      responseModalities: ["TEXT", "IMAGE"],
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        }
      ],
    };

    // Color variation templates
    this.colorVariations = {
      red: ['crimson', 'burgundy', 'scarlet', 'rose', 'coral', 'maroon'],
      blue: ['navy', 'royal', 'sky', 'teal', 'turquoise', 'indigo'],
      green: ['emerald', 'forest', 'mint', 'olive', 'sage', 'lime'],
      purple: ['violet', 'lavender', 'plum', 'magenta', 'amethyst', 'orchid'],
      yellow: ['gold', 'lemon', 'mustard', 'cream', 'amber', 'honey'],
      orange: ['peach', 'coral', 'terracotta', 'apricot', 'tangerine', 'rust'],
      pink: ['rose', 'blush', 'fuchsia', 'salmon', 'bubblegum', 'dusty'],
      brown: ['chocolate', 'tan', 'coffee', 'camel', 'mocha', 'espresso'],
      black: ['charcoal', 'onyx', 'ebony', 'jet', 'raven', 'midnight'],
      white: ['ivory', 'cream', 'pearl', 'snow', 'alabaster', 'bone'],
      gray: ['silver', 'slate', 'steel', 'ash', 'pewter', 'gunmetal']
    };

    // Style variation templates
    this.styleVariations = {
      casual: ['relaxed', 'everyday', 'comfortable', 'laid-back', 'effortless'],
      formal: ['elegant', 'sophisticated', 'professional', 'refined', 'polished'],
      sporty: ['athletic', 'performance', 'dynamic', 'energetic', 'active'],
      elegant: ['graceful', 'chic', 'stylish', 'classy', 'sophisticated'],
      vintage: ['retro', 'classic', 'timeless', 'nostalgic', 'heritage'],
      modern: ['contemporary', 'sleek', 'minimalist', 'futuristic', 'cutting-edge']
    };

    // Material variation templates
    this.materialVariations = {
      cotton: ['soft cotton', 'organic cotton', 'pima cotton', 'cotton blend', 'cotton jersey'],
      silk: ['pure silk', 'silk satin', 'silk chiffon', 'silk crepe', 'silk blend'],
      denim: ['raw denim', 'stretch denim', 'vintage denim', 'dark wash', 'light wash'],
      leather: ['genuine leather', 'suede leather', 'patent leather', 'distressed leather', 'vegan leather'],
      wool: ['merino wool', 'cashmere', 'alpaca wool', 'wool blend', 'tweed'],
      linen: ['pure linen', 'linen blend', 'crinkled linen', 'smooth linen', 'textured linen']
    };
  }

  async generateColorVariations(inputPath, outputDir, options = {}) {
    try {
      console.log('Generating color variations using Gemini 2.5 Flash Image Preview');
      
      if (!this.ai) {
        throw new Error('Google AI client is not initialized. Please check your GOOGLE_API_KEY environment variable.');
      }

      const {
        baseColor = 'blue',
        intensity = 50,
        count = 4,
        style = 'casual',
        material = 'cotton'
      } = options;

      // Read the input image
      const imageBuffer = fs.readFileSync(inputPath);
      const base64Image = imageBuffer.toString('base64');

      const variations = [];
      const colorOptions = this.colorVariations[baseColor] || this.colorVariations.blue;
      
      // Generate variations based on intensity
      const variationCount = Math.min(count, 6);
      const selectedColors = this.selectColorsForVariation(colorOptions, variationCount, intensity);

      for (let i = 0; i < variationCount; i++) {
        try {
          const outputPath = path.join(outputDir, `color-variation-${i + 1}.png`);
          const colorName = selectedColors[i];
          
          const prompt = this.buildColorVariationPrompt(colorName, style, material, intensity);
          
          const result = await this.generateVariationWithAI(base64Image, prompt, outputPath);
          
          if (result) {
            variations.push({
              imageUrl: `/uploads/${path.basename(outputPath)}`,
              title: `${colorName.charAt(0).toUpperCase() + colorName.slice(1)} Variation`,
              description: `Color variation in ${colorName} with ${style} style and ${material} material`,
              type: 'color',
              parameters: { color: colorName, style, material, intensity }
            });
          }
        } catch (error) {
          console.error(`Error generating color variation ${i + 1}:`, error);
        }
      }

      return variations;

    } catch (error) {
      console.error('Error generating color variations:', error);
      throw error;
    }
  }

  async generateStyleVariations(inputPath, outputDir, options = {}) {
    try {
      console.log('Generating style variations using Gemini 2.5 Flash Image Preview');
      
      if (!this.ai) {
        throw new Error('Google AI client is not initialized. Please check your GOOGLE_API_KEY environment variable.');
      }

      const {
        baseStyle = 'casual',
        intensity = 50,
        count = 4,
        color = 'blue',
        material = 'cotton'
      } = options;

      // Read the input image
      const imageBuffer = fs.readFileSync(inputPath);
      const base64Image = imageBuffer.toString('base64');

      const variations = [];
      const styleOptions = this.styleVariations[baseStyle] || this.styleVariations.casual;
      
      // Generate variations based on intensity
      const variationCount = Math.min(count, 6);
      const selectedStyles = this.selectStylesForVariation(styleOptions, variationCount, intensity);

      for (let i = 0; i < variationCount; i++) {
        try {
          const outputPath = path.join(outputDir, `style-variation-${i + 1}.png`);
          const styleName = selectedStyles[i];
          
          const prompt = this.buildStyleVariationPrompt(styleName, color, material, intensity);
          
          const result = await this.generateVariationWithAI(base64Image, prompt, outputPath);
          
          if (result) {
            variations.push({
              imageUrl: `/uploads/${path.basename(outputPath)}`,
              title: `${styleName.charAt(0).toUpperCase() + styleName.slice(1)} Style`,
              description: `Style variation with ${styleName} aesthetic in ${color} color and ${material} material`,
              type: 'style',
              parameters: { style: styleName, color, material, intensity }
            });
          }
        } catch (error) {
          console.error(`Error generating style variation ${i + 1}:`, error);
        }
      }

      return variations;

    } catch (error) {
      console.error('Error generating style variations:', error);
      throw error;
    }
  }

  async generateMaterialVariations(inputPath, outputDir, options = {}) {
    try {
      console.log('Generating material variations using Gemini 2.5 Flash Image Preview');
      
      if (!this.ai) {
        throw new Error('Google AI client is not initialized. Please check your GOOGLE_API_KEY environment variable.');
      }

      const {
        baseMaterial = 'cotton',
        intensity = 50,
        count = 4,
        color = 'blue',
        style = 'casual'
      } = options;

      // Read the input image
      const imageBuffer = fs.readFileSync(inputPath);
      const base64Image = imageBuffer.toString('base64');

      const variations = [];
      const materialOptions = this.materialVariations[baseMaterial] || this.materialVariations.cotton;
      
      // Generate variations based on intensity
      const variationCount = Math.min(count, 6);
      const selectedMaterials = this.selectMaterialsForVariation(materialOptions, variationCount, intensity);

      for (let i = 0; i < variationCount; i++) {
        try {
          const outputPath = path.join(outputDir, `material-variation-${i + 1}.png`);
          const materialName = selectedMaterials[i];
          
          const prompt = this.buildMaterialVariationPrompt(materialName, color, style, intensity);
          
          const result = await this.generateVariationWithAI(base64Image, prompt, outputPath);
          
          if (result) {
            variations.push({
              imageUrl: `/uploads/${path.basename(outputPath)}`,
              title: `${materialName.charAt(0).toUpperCase() + materialName.slice(1)} Material`,
              description: `Material variation using ${materialName} in ${color} color with ${style} style`,
              type: 'material',
              parameters: { material: materialName, color, style, intensity }
            });
          }
        } catch (error) {
          console.error(`Error generating material variation ${i + 1}:`, error);
        }
      }

      return variations;

    } catch (error) {
      console.error('Error generating material variations:', error);
      throw error;
    }
  }

  async generateCustomVariations(inputPath, outputDir, options = {}) {
    try {
      console.log('Generating custom variations using Gemini 2.5 Flash Image Preview');
      
      if (!this.ai) {
        throw new Error('Google AI client is not initialized. Please check your GOOGLE_API_KEY environment variable.');
      }

      const {
        customPrompt = '',
        intensity = 50,
        count = 4
      } = options;

      // Read the input image
      const imageBuffer = fs.readFileSync(inputPath);
      const base64Image = imageBuffer.toString('base64');

      const variations = [];
      const variationCount = Math.min(count, 6);

      for (let i = 0; i < variationCount; i++) {
        try {
          const outputPath = path.join(outputDir, `custom-variation-${i + 1}.png`);
          
          const prompt = this.buildCustomVariationPrompt(customPrompt, intensity, i);
          
          const result = await this.generateVariationWithAI(base64Image, prompt, outputPath);
          
          if (result) {
            variations.push({
              imageUrl: `/uploads/${path.basename(outputPath)}`,
              title: `Custom Variation ${i + 1}`,
              description: `Custom variation based on: ${customPrompt || 'AI-generated creative interpretation'}`,
              type: 'custom',
              parameters: { customPrompt, intensity, variationIndex: i }
            });
          }
        } catch (error) {
          console.error(`Error generating custom variation ${i + 1}:`, error);
        }
      }

      return variations;

    } catch (error) {
      console.error('Error generating custom variations:', error);
      throw error;
    }
  }

  async generateVariationWithAI(base64Image, prompt, outputPath) {
    try {
      // Prepare the request for Gemini
      const parts = [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        },
        { text: prompt }
      ];

      const req = {
        model: this.model,
        contents: [
          { role: 'user', parts: parts }
        ],
        config: this.generationConfig,
      };

      console.log('Sending variation request to Gemini...');
      
      // Generate content using Gemini
      const response = await this.ai.models.generateContent(req);
      console.log('Received response from Gemini for variation');
      
      let generatedImageBuffer = null;
      
      // Parse the response to extract image data
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            // Extract image buffer from base64 data
            generatedImageBuffer = Buffer.from(part.inlineData.data, "base64");
            console.log('Successfully extracted variation image buffer from Gemini response');
            break;
          }
        }
      }
      
      if (generatedImageBuffer) {
        // Save the generated image
        fs.writeFileSync(outputPath, generatedImageBuffer);
        console.log(`Variation image saved to: ${outputPath}`);
        return true;
      } else {
        console.log('No image generated by Gemini for variation');
        return false;
      }
      
    } catch (error) {
      console.error('Error generating variation with AI:', error);
      return false;
    }
  }

  buildColorVariationPrompt(colorName, style, material, intensity) {
    const intensityDescription = this.getIntensityDescription(intensity);
    
    return `Transform this garment image into a ${colorName} color variation while maintaining the exact same design, structure, and proportions.

Requirements:
- Color: Apply ${colorName} color with ${intensityDescription} intensity
- Style: Maintain ${style} aesthetic
- Material: Preserve ${material} texture and appearance
- Keep the exact same garment design and structure
- Maintain realistic lighting and shadows
- Ensure high quality and professional appearance
- Keep the background clean and simple

The output should be a single, high-quality image that looks like a professional product photograph with the new ${colorName} color applied.`;
  }

  buildStyleVariationPrompt(styleName, color, material, intensity) {
    const intensityDescription = this.getIntensityDescription(intensity);
    
    return `Transform this garment image to reflect a ${styleName} style while maintaining the same design structure.

Requirements:
- Style: Apply ${styleName} aesthetic with ${intensityDescription} intensity
- Color: Maintain ${color} color scheme
- Material: Preserve ${material} texture and appearance
- Keep the exact same garment design and structure
- Adjust styling elements to match ${styleName} characteristics
- Maintain realistic lighting and shadows appropriate for ${styleName} style
- Ensure high quality and professional appearance
- Keep the background clean and simple

The output should be a single, high-quality image that looks like a professional product photograph with the new ${styleName} styling applied.`;
  }

  buildMaterialVariationPrompt(materialName, color, style, intensity) {
    const intensityDescription = this.getIntensityDescription(intensity);
    
    return `Transform this garment image to show how it would look in ${materialName} while maintaining the same design structure.

Requirements:
- Material: Apply ${materialName} texture and appearance with ${intensityDescription} intensity
- Color: Maintain ${color} color scheme
- Style: Preserve ${style} aesthetic
- Keep the exact same garment design and structure
- Show realistic ${materialName} texture, drape, and material properties
- Maintain realistic lighting and shadows
- Ensure high quality and professional appearance
- Keep the background clean and simple

The output should be a single, high-quality image that looks like a professional product photograph showing the garment in ${materialName}.`;
  }

  buildCustomVariationPrompt(customPrompt, intensity, variationIndex) {
    const intensityDescription = this.getIntensityDescription(intensity);
    
    return `Create a creative variation of this garment image based on the following custom requirements: ${customPrompt}

Requirements:
- Apply the custom modifications with ${intensityDescription} intensity
- Maintain the core garment design and structure
- Be creative but realistic in the interpretation
- Ensure the variation is visually appealing and marketable
- Maintain realistic lighting and shadows
- Ensure high quality and professional appearance
- Keep the background clean and simple

The output should be a single, high-quality image that looks like a professional product photograph with the custom variations applied.`;
  }

  getIntensityDescription(intensity) {
    if (intensity <= 25) return 'subtle';
    if (intensity <= 50) return 'moderate';
    if (intensity <= 75) return 'strong';
    return 'dramatic';
  }

  selectColorsForVariation(colorOptions, count, intensity) {
    // Select colors based on intensity - higher intensity means more diverse colors
    const selectedColors = [];
    const step = Math.max(1, Math.floor(colorOptions.length / count));
    
    for (let i = 0; i < count; i++) {
      const index = (i * step) % colorOptions.length;
      selectedColors.push(colorOptions[index]);
    }
    
    return selectedColors;
  }

  selectStylesForVariation(styleOptions, count, intensity) {
    // Select styles based on intensity
    const selectedStyles = [];
    const step = Math.max(1, Math.floor(styleOptions.length / count));
    
    for (let i = 0; i < count; i++) {
      const index = (i * step) % styleOptions.length;
      selectedStyles.push(styleOptions[index]);
    }
    
    return selectedStyles;
  }

  selectMaterialsForVariation(materialOptions, count, intensity) {
    // Select materials based on intensity
    const selectedMaterials = [];
    const step = Math.max(1, Math.floor(materialOptions.length / count));
    
    for (let i = 0; i < count; i++) {
      const index = (i * step) % materialOptions.length;
      selectedMaterials.push(materialOptions[index]);
    }
    
    return selectedMaterials;
  }

  // Fallback method using Sharp.js for when AI is not available
  async generateFallbackVariations(inputPath, outputDir, variationType, options = {}) {
    console.log('Using fallback Sharp.js processing for variations');
    
    const {
      intensity = 50,
      count = 4,
      color = 'blue',
      style = 'casual',
      material = 'cotton'
    } = options;

    const variations = [];
    const variationCount = Math.min(count, 6);

    for (let i = 0; i < variationCount; i++) {
      try {
        const outputPath = path.join(outputDir, `fallback-${variationType}-${i + 1}.png`);
        
        // Apply different transformations based on variation type
        let processedImage = sharp(inputPath);
        
        switch (variationType) {
          case 'color':
            const hueShift = (360 / variationCount) * i;
            processedImage = processedImage.modulate({
              hue: hueShift,
              saturation: (intensity / 100) * 1.5,
              brightness: 0.9 + (Math.random() * 0.2)
            });
            break;
            
          case 'style':
            const contrast = 0.8 + (intensity / 100) * 0.4;
            const brightness = 0.9 + (intensity / 100) * 0.2;
            processedImage = processedImage
              .linear(contrast, -(128 * contrast) + 128)
              .modulate({ brightness: brightness * 100 });
            break;
            
          case 'material':
            const materialContrast = 1.0 + (intensity / 100) * 0.3;
            processedImage = processedImage.linear(materialContrast, -(128 * materialContrast) + 128);
            break;
            
          default:
            // Custom variations
            const randomHue = Math.random() * 360;
            const randomSaturation = 0.7 + (Math.random() * 0.6);
            processedImage = processedImage.modulate({
              hue: randomHue,
              saturation: randomSaturation * 100,
              brightness: 0.8 + (Math.random() * 0.4)
            });
        }
        
        await processedImage.png().toFile(outputPath);
        
        variations.push({
          imageUrl: `/uploads/${path.basename(outputPath)}`,
          title: `${variationType.charAt(0).toUpperCase() + variationType.slice(1)} Variation ${i + 1}`,
          description: `Fallback ${variationType} variation using traditional image processing`,
          type: variationType,
          parameters: { ...options, fallback: true }
        });
        
      } catch (error) {
        console.error(`Error generating fallback variation ${i + 1}:`, error);
      }
    }
    
    return variations;
  }
}

export { AIDesignVariations };
