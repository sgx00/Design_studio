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
