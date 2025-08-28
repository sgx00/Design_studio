import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ImageProcessor } from './services/imageProcessor.js';
import { AIDesignGenerator } from './services/aiDesignGenerator.js';
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
app.post('/api/flat-to-final', upload.single('flatImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No flat image provided' });
    }

    const { style, color, material } = req.body;
    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, `final-${uuidv4()}.png`);

    // Generate final product image from flat design
    const finalImage = await aiDesignGenerator.generateFinalImage(
      inputPath, 
      outputPath, 
      { style, color, material }
    );

    res.json({
      success: true,
      message: 'Final product image generated successfully',
      finalImage: `/uploads/${path.basename(outputPath)}`,
      flatImage: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error('Error generating final image:', error);
    res.status(500).json({ error: 'Failed to generate final product image' });
  }
});

// Batch processing endpoint
app.post('/api/batch-process', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const results = [];
    
    for (const file of req.files) {
      try {
        const flatPath = path.join(uploadsDir, `flat-${uuidv4()}.png`);
        const finalPath = path.join(uploadsDir, `final-${uuidv4()}.png`);

        // Convert to flat
        await imageProcessor.convertToFlat(file.path, flatPath);
        
        // Generate final image
        await aiDesignGenerator.generateFinalImage(flatPath, finalPath, {
          style: req.body.style || 'casual',
          color: req.body.color || 'blue',
          material: req.body.material || 'cotton'
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
