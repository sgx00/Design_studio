import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ImageProcessor } from './services/imageProcessor.js';
import { AIDesignGenerator } from './services/aiDesignGenerator.js';
import { AIFashionAgent } from './services/aiFashionAgent.js';
import { LangGraphIntegration } from './services/langgraphIntegration.js';
import { AIDesignVariations } from './services/aiDesignVariations.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Initialize services
const imageProcessor = new ImageProcessor();
const aiDesignGenerator = new AIDesignGenerator();
const aiFashionAgent = new AIFashionAgent();
const langGraphIntegration = new LangGraphIntegration();
const aiDesignVariations = new AIDesignVariations();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Design Platform is running' });
});

// Convert image to flat technical drawing
app.post('/api/image-to-flat', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, `flat-${uuidv4()}.png`);

    // Process image to create flat technical drawing
    const flatImage = await imageProcessor.convertToFlat(inputPath, outputPath);
    
    res.json({
      success: true,
      message: 'Image successfully converted to flat technical drawing',
      flatImage: `/uploads/${path.basename(outputPath)}`,
      originalImage: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error('Error converting image to flat:', error);
    res.status(500).json({ error: 'Failed to convert image to flat' });
  }
});

// Generate final product image from flat design
app.post('/api/flat-to-final', upload.fields([
  { name: 'flatImage', maxCount: 1 },
  { name: 'fabricImages', maxCount: 4 }
]), async (req, res) => {
  try {
    if (!req.files.flatImage || req.files.flatImage.length === 0) {
      return res.status(400).json({ error: 'No flat image provided' });
    }

    const { style, color, material, textPrompt } = req.body;
    const flatImagePath = req.files.flatImage[0].path;
    const outputPath = path.join(uploadsDir, `final-${uuidv4()}.png`);

    // Get fabric image paths if provided
    const fabricImagePaths = req.files.fabricImages ? 
      req.files.fabricImages.map(file => file.path) : [];

    // Generate final product image from flat design
    const finalImage = await aiDesignGenerator.generateFinalImage(
      flatImagePath, 
      outputPath, 
      { 
        style, 
        color, 
        material, 
        textPrompt,
        fabricImagePaths 
      }
    );

    res.json({
      success: true,
      message: 'Final product image generated successfully',
      finalImage: `/uploads/${path.basename(outputPath)}`,
      flatImage: `/uploads/${req.files.flatImage[0].filename}`,
      fabricImages: req.files.fabricImages ? 
        req.files.fabricImages.map(file => `/uploads/${file.filename}`) : []
    });

  } catch (error) {
    console.error('Error generating final image:', error);
    res.status(500).json({ error: 'Failed to generate final product image' });
  }
});

// Batch processing endpoint
app.post('/api/batch-process', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'fabricImages', maxCount: 4 }
]), async (req, res) => {
  try {
    if (!req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const { style, color, material, textPrompt } = req.body;
    const fabricImagePaths = req.files.fabricImages ? 
      req.files.fabricImages.map(file => file.path) : [];

    const results = [];
    
    for (const file of req.files.images) {
      try {
        const flatPath = path.join(uploadsDir, `flat-${uuidv4()}.png`);
        const finalPath = path.join(uploadsDir, `final-${uuidv4()}.png`);

        // Convert to flat
        await imageProcessor.convertToFlat(file.path, flatPath);
        
        // Generate final image
        await aiDesignGenerator.generateFinalImage(flatPath, finalPath, {
          style: style || 'casual',
          color: color || 'blue',
          material: material || 'cotton',
          textPrompt: textPrompt || '',
          fabricImagePaths
        });

        results.push({
          original: `/uploads/${file.filename}`,
          flat: `/uploads/${path.basename(flatPath)}`,
          final: `/uploads/${path.basename(finalPath)}`
        });

      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        results.push({
          original: `/uploads/${file.filename}`,
          error: 'Processing failed'
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} images`,
      results
    });

  } catch (error) {
    console.error('Error in batch processing:', error);
    res.status(500).json({ error: 'Batch processing failed' });
  }
});

// AI Fashion Agent endpoints
app.post('/api/ai-fashion-agent/generate-designs', async (req, res) => {
  try {
    const {
      garmentType = 'general',
      category = 'all',
      strategy = 'balanced',
      count = 3,
      targetAudience = 'general',
      occasion = 'everyday',
      preferences = {}
    } = req.body;

    console.log('AI Fashion Agent request:', req.body);

    const result = await aiFashionAgent.generateTrendBasedDesigns({
      garmentType,
      category,
      strategy,
      count: Math.min(count, 5), // Limit to 5 designs max
      targetAudience,
      occasion,
      preferences
    });

    res.json(result);

  } catch (error) {
    console.error('Error in AI Fashion Agent:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate trend-based designs',
      details: error.message 
    });
  }
});

// Get current fashion trends
app.get('/api/ai-fashion-agent/trends', async (req, res) => {
  try {
    const { category = 'all' } = req.query;
    
    const trendInsights = await aiFashionAgent.getTrendInsights(category);
    
    res.json({
      success: true,
      data: trendInsights
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch fashion trends',
      details: error.message 
    });
  }
});

// Get design recommendations
app.post('/api/ai-fashion-agent/recommendations', async (req, res) => {
  try {
    const { garmentType = 'general', category = 'all' } = req.body;
    
    const trendAnalysis = await aiFashionAgent.trendAnalyzer.analyzeCurrentTrends(category);
    const recommendations = await aiFashionAgent.getDesignRecommendations(trendAnalysis, garmentType);
    
    res.json({
      success: true,
      data: {
        trendAnalysis,
        recommendations
      }
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get design recommendations',
      details: error.message 
    });
  }
});

// Get available strategies and categories
app.get('/api/ai-fashion-agent/config', (req, res) => {
  try {
    const config = {
      strategies: aiFashionAgent.designStrategies,
      garmentCategories: aiFashionAgent.garmentCategories,
      trendCategories: aiFashionAgent.trendAnalyzer.trendCategories
    };
    
    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get configuration',
      details: error.message 
    });
  }
});

// LangGraph Fashion Agent endpoint
app.post('/api/langgraph-fashion-agent/generate', async (req, res) => {
  try {
    console.log('🚀 LangGraph Fashion Agent request received');
    
    const {
      garmentType = 'general',
      category = 'all',
      strategy = 'balanced',
      count = 3,
      targetAudience = 'general',
      occasion = 'everyday',
      preferences = {}
    } = req.body;

    const request = {
      garmentType,
      category,
      strategy,
      count,
      targetAudience,
      occasion,
      preferences
    };

    console.log('Request parameters:', request);

    // Check dependencies first
    const dependenciesOk = await langGraphIntegration.checkDependencies();
    if (!dependenciesOk) {
      console.log('⚠️ LangGraph dependencies not available, falling back to regular agent');
      
      // Fallback to regular AI Fashion Agent
      const fallbackResult = await aiFashionAgent.generateTrendBasedDesigns(request);
      return res.json({
        success: true,
        data: fallbackResult,
        source: 'fallback'
      });
    }

    // Use LangGraph agent
    const result = await langGraphIntegration.generateTrendBasedDesigns(request);
    
    res.json({
      success: true,
      data: result,
      source: 'langgraph'
    });

  } catch (error) {
    console.error('❌ Error in LangGraph Fashion Agent:', error);
    
    // Fallback to regular agent on error
    try {
      const fallbackResult = await aiFashionAgent.generateTrendBasedDesigns(req.body);
      res.json({
        success: true,
        data: fallbackResult,
        source: 'fallback',
        warning: 'LangGraph agent failed, used fallback'
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate designs',
        details: error.message,
        fallbackError: fallbackError.message
      });
    }
  }
});

// Check LangGraph dependencies
app.get('/api/langgraph-fashion-agent/status', async (req, res) => {
  try {
    const dependenciesOk = await langGraphIntegration.checkDependencies();
    
    res.json({
      success: true,
      data: {
        langgraphAvailable: dependenciesOk,
        message: dependenciesOk ? 'LangGraph agent ready' : 'LangGraph dependencies not available'
      }
    });

  } catch (error) {
    console.error('Error checking LangGraph status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check LangGraph status',
      details: error.message 
    });
  }
});

// Garment Variation endpoints
app.post('/api/garment-variation/generate', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const {
      variationType = 'color',
      intensity = 50,
      variationCount = 4,
      style = 'casual',
      material = 'cotton',
      pattern = 'solid',
      fit = 'regular',
      length = 'standard',
      customPrompt = ''
    } = req.body;

    console.log('Garment variation request:', {
      variationType,
      intensity,
      variationCount,
      style,
      material,
      pattern,
      fit,
      length,
      customPrompt
    });

    const inputPath = req.file.path;
    const outputDir = uploadsDir;
    const variations = [];

    try {
      // Try AI-powered variations first
      let aiVariations = [];
      
      switch (variationType) {
        case 'color':
          aiVariations = await aiDesignVariations.generateColorVariations(inputPath, outputDir, {
            baseColor: style, // Using style field for base color
            intensity: parseInt(intensity),
            count: parseInt(variationCount),
            style: material, // Using material field for style
            material: pattern // Using pattern field for material
          });
          break;
          
        case 'style':
          aiVariations = await aiDesignVariations.generateStyleVariations(inputPath, outputDir, {
            baseStyle: style,
            intensity: parseInt(intensity),
            count: parseInt(variationCount),
            color: material, // Using material field for color
            material: pattern // Using pattern field for material
          });
          break;
          
        case 'material':
          aiVariations = await aiDesignVariations.generateMaterialVariations(inputPath, outputDir, {
            baseMaterial: material,
            intensity: parseInt(intensity),
            count: parseInt(variationCount),
            color: style, // Using style field for color
            style: pattern // Using pattern field for style
          });
          break;
          
        case 'custom':
          aiVariations = await aiDesignVariations.generateCustomVariations(inputPath, outputDir, {
            customPrompt,
            intensity: parseInt(intensity),
            count: parseInt(variationCount)
          });
          break;
          
        default:
          // For pattern and fit variations, use fallback
          aiVariations = await aiDesignVariations.generateFallbackVariations(inputPath, outputDir, variationType, {
            intensity: parseInt(intensity),
            count: parseInt(variationCount),
            color: style,
            style: material,
            material: pattern
          });
      }

      if (aiVariations && aiVariations.length > 0) {
        variations.push(...aiVariations);
        console.log(`Generated ${aiVariations.length} AI-powered variations`);
      } else {
        throw new Error('AI variations failed, falling back to traditional processing');
      }

    } catch (aiError) {
      console.log('AI variations failed, using fallback processing:', aiError.message);
      
      // Fallback to traditional Sharp.js processing
      const fallbackVariationCount = parseInt(variationCount);
      
      for (let i = 0; i < fallbackVariationCount; i++) {
        try {
          const outputPath = path.join(uploadsDir, `variation-${uuidv4()}.png`);
          
          // Create variation based on type using fallback methods
          let variationResult;
          switch (variationType) {
            case 'color':
              variationResult = await generateColorVariation(inputPath, outputPath, i, fallbackVariationCount);
              break;
            case 'style':
              variationResult = await generateStyleVariation(inputPath, outputPath, style, i);
              break;
            case 'material':
              variationResult = await generateMaterialVariation(inputPath, outputPath, material, i);
              break;
            case 'pattern':
              variationResult = await generatePatternVariation(inputPath, outputPath, pattern, i);
              break;
            case 'fit':
              variationResult = await generateFitVariation(inputPath, outputPath, fit, i);
              break;
            case 'custom':
              variationResult = await generateCustomVariation(inputPath, outputPath, customPrompt, i);
              break;
            default:
              variationResult = await generateColorVariation(inputPath, outputPath, i, fallbackVariationCount);
          }

          variations.push({
            imageUrl: `/uploads/${path.basename(outputPath)}`,
            title: `${variationResult.title} ${i + 1}`,
            description: variationResult.description,
            type: variationType,
            parameters: variationResult.parameters
          });

        } catch (error) {
          console.error(`Error generating fallback variation ${i}:`, error);
        }
      }
    }

    res.json({
      success: true,
      message: `Generated ${variations.length} variations successfully`,
      variations,
      originalImage: `/uploads/${req.file.filename}`,
      aiPowered: variations.some(v => !v.parameters?.fallback)
    });

  } catch (error) {
    console.error('Error generating garment variations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate garment variations',
      details: error.message 
    });
  }
});

// AI-powered color variation endpoint
app.post('/api/garment-variation/ai-color', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const {
      baseColor = 'blue',
      intensity = 50,
      count = 4,
      style = 'casual',
      material = 'cotton'
    } = req.body;

    console.log('AI Color variation request:', {
      baseColor,
      intensity,
      count,
      style,
      material
    });

    const inputPath = req.file.path;
    const outputDir = uploadsDir;

    try {
      // Generate AI-powered color variations
      const variations = await aiDesignVariations.generateColorVariations(inputPath, outputDir, {
        baseColor,
        intensity: parseInt(intensity),
        count: Math.min(parseInt(count), 6),
        style,
        material
      });

      res.json({
        success: true,
        message: `Generated ${variations.length} AI-powered color variations`,
        variations,
        originalImage: `/uploads/${req.file.filename}`,
        aiPowered: true
      });

    } catch (aiError) {
      console.log('AI color variations failed, using fallback:', aiError.message);
      
      // Fallback to traditional processing
      const fallbackVariations = await aiDesignVariations.generateFallbackVariations(inputPath, outputDir, 'color', {
        intensity: parseInt(intensity),
        count: Math.min(parseInt(count), 6),
        color: baseColor,
        style,
        material
      });

      res.json({
        success: true,
        message: `Generated ${fallbackVariations.length} fallback color variations`,
        variations: fallbackVariations,
        originalImage: `/uploads/${req.file.filename}`,
        aiPowered: false,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error generating AI color variations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate AI color variations',
      details: error.message 
    });
  }
});

// Helper functions for different variation types
async function generateColorVariation(inputPath, outputPath, index, total) {
  // Simulate color variation by adjusting hue, saturation, and brightness
  const hueShift = (360 / total) * index;
  const saturation = 0.7 + (Math.random() * 0.3);
  const brightness = 0.8 + (Math.random() * 0.4);

  await sharp(inputPath)
    .modulate({
      hue: hueShift,
      saturation: saturation * 100,
      brightness: brightness * 100
    })
    .png()
    .toFile(outputPath);

  const colors = ['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Yellow'];
  const colorName = colors[index % colors.length];

  return {
    title: `${colorName} Variation`,
    description: `Color variation with ${colorName.toLowerCase()} tones`,
    parameters: { hue: hueShift, saturation, brightness }
  };
}

async function generateStyleVariation(inputPath, outputPath, style, index) {
  // Apply style-specific transformations
  let transform = {};
  
  switch (style) {
    case 'formal':
      transform = { contrast: 1.2, brightness: 0.9, saturation: 0.8 };
      break;
    case 'casual':
      transform = { contrast: 1.0, brightness: 1.1, saturation: 1.1 };
      break;
    case 'sporty':
      transform = { contrast: 1.3, brightness: 1.2, saturation: 1.2 };
      break;
    case 'elegant':
      transform = { contrast: 1.1, brightness: 0.95, saturation: 0.9 };
      break;
    case 'vintage':
      transform = { contrast: 0.8, brightness: 0.9, saturation: 0.7 };
      break;
    case 'modern':
      transform = { contrast: 1.2, brightness: 1.0, saturation: 1.0 };
      break;
    default:
      transform = { contrast: 1.0, brightness: 1.0, saturation: 1.0 };
  }

  await sharp(inputPath)
    .modulate({
      brightness: transform.brightness * 100,
      saturation: transform.saturation * 100
    })
    .linear(transform.contrast, -(128 * transform.contrast) + 128)
    .png()
    .toFile(outputPath);

  return {
    title: `${style.charAt(0).toUpperCase() + style.slice(1)} Style`,
    description: `Styled with ${style} aesthetic`,
    parameters: transform
  };
}

async function generateMaterialVariation(inputPath, outputPath, material, index) {
  // Simulate material texture effects
  let textureEffect = {};
  
  switch (material) {
    case 'cotton':
      textureEffect = { contrast: 1.0, brightness: 1.0, noise: 0.1 };
      break;
    case 'silk':
      textureEffect = { contrast: 1.2, brightness: 1.1, noise: 0.05 };
      break;
    case 'denim':
      textureEffect = { contrast: 1.3, brightness: 0.9, noise: 0.2 };
      break;
    case 'leather':
      textureEffect = { contrast: 1.4, brightness: 0.8, noise: 0.15 };
      break;
    case 'wool':
      textureEffect = { contrast: 1.1, brightness: 0.95, noise: 0.25 };
      break;
    case 'linen':
      textureEffect = { contrast: 0.9, brightness: 1.05, noise: 0.2 };
      break;
    default:
      textureEffect = { contrast: 1.0, brightness: 1.0, noise: 0.1 };
  }

  await sharp(inputPath)
    .modulate({
      brightness: textureEffect.brightness * 100,
      saturation: 100
    })
    .linear(textureEffect.contrast, -(128 * textureEffect.contrast) + 128)
    .png()
    .toFile(outputPath);

  return {
    title: `${material.charAt(0).toUpperCase() + material.slice(1)} Material`,
    description: `Simulated ${material} texture and appearance`,
    parameters: textureEffect
  };
}

async function generatePatternVariation(inputPath, outputPath, pattern, index) {
  // Apply pattern-specific effects
  let patternEffect = {};
  
  switch (pattern) {
    case 'striped':
      patternEffect = { contrast: 1.2, brightness: 1.0 };
      break;
    case 'polka-dot':
      patternEffect = { contrast: 1.1, brightness: 1.05 };
      break;
    case 'floral':
      patternEffect = { contrast: 1.0, brightness: 1.1, saturation: 1.2 };
      break;
    case 'geometric':
      patternEffect = { contrast: 1.3, brightness: 0.95 };
      break;
    case 'abstract':
      patternEffect = { contrast: 1.1, brightness: 1.0, saturation: 1.1 };
      break;
    default: // solid
      patternEffect = { contrast: 1.0, brightness: 1.0 };
  }

  await sharp(inputPath)
    .modulate({
      brightness: patternEffect.brightness * 100,
      saturation: (patternEffect.saturation || 1.0) * 100
    })
    .linear(patternEffect.contrast, -(128 * patternEffect.contrast) + 128)
    .png()
    .toFile(outputPath);

  return {
    title: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Pattern`,
    description: `Applied ${pattern} pattern styling`,
    parameters: patternEffect
  };
}

async function generateFitVariation(inputPath, outputPath, fit, index) {
  // Simulate fit variations by adjusting image dimensions and effects
  let fitEffect = {};
  
  switch (fit) {
    case 'slim':
      fitEffect = { width: 0.95, height: 1.0, contrast: 1.1 };
      break;
    case 'loose':
      fitEffect = { width: 1.05, height: 1.0, contrast: 0.9 };
      break;
    case 'oversized':
      fitEffect = { width: 1.1, height: 1.05, contrast: 0.85 };
      break;
    case 'fitted':
      fitEffect = { width: 0.98, height: 1.02, contrast: 1.15 };
      break;
    default: // regular
      fitEffect = { width: 1.0, height: 1.0, contrast: 1.0 };
  }

  const metadata = await sharp(inputPath).metadata();
  const newWidth = Math.round(metadata.width * fitEffect.width);
  const newHeight = Math.round(metadata.height * fitEffect.height);

  await sharp(inputPath)
    .resize(newWidth, newHeight, { fit: 'fill' })
    .linear(fitEffect.contrast, -(128 * fitEffect.contrast) + 128)
    .png()
    .toFile(outputPath);

  return {
    title: `${fit.charAt(0).toUpperCase() + fit.slice(1)} Fit`,
    description: `Adjusted to ${fit} fit proportions`,
    parameters: fitEffect
  };
}

async function generateCustomVariation(inputPath, outputPath, customPrompt, index) {
  // Apply custom variations based on prompt
  // This is a simplified implementation - in a real scenario, you'd use AI/ML models
  
  const randomEffect = {
    contrast: 0.8 + Math.random() * 0.4,
    brightness: 0.8 + Math.random() * 0.4,
    saturation: 0.7 + Math.random() * 0.6,
    hue: Math.random() * 360
  };

  await sharp(inputPath)
    .modulate({
      hue: randomEffect.hue,
      brightness: randomEffect.brightness * 100,
      saturation: randomEffect.saturation * 100
    })
    .linear(randomEffect.contrast, -(128 * randomEffect.contrast) + 128)
    .png()
    .toFile(outputPath);

  return {
    title: `Custom Variation ${index + 1}`,
    description: `Custom variation based on: ${customPrompt || 'default parameters'}`,
    parameters: randomEffect
  };
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Design Platform server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
