import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

class ImageProcessor {
  constructor() {
    this.edgeDetectionKernel = [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ];
  }

  async convertToFlat(inputPath, outputPath) {
    try {
      console.log(`Processing image: ${inputPath}`);
      
      // Load the image
      const image = await loadImage(inputPath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(image, 0, 0);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply preprocessing steps
      const processedData = await this.preprocessImage(data, canvas.width, canvas.height);
      
      // Detect edges and contours
      const edgeData = this.detectEdges(processedData, canvas.width, canvas.height);
      
      // Extract garment structure
      const structureData = this.extractGarmentStructure(edgeData, canvas.width, canvas.height);
      
      // Create flat technical drawing
      const flatData = this.createFlatDrawing(structureData, canvas.width, canvas.height);
      
      // Convert back to canvas
      const flatCanvas = createCanvas(canvas.width, canvas.height);
      const flatCtx = flatCanvas.getContext('2d');
      const flatImageData = flatCtx.createImageData(canvas.width, canvas.height);
      flatImageData.data.set(flatData);
      flatCtx.putImageData(flatImageData, 0, 0);
      
      // Save the flat drawing
      const buffer = flatCanvas.toBuffer('image/png');
      await sharp(buffer)
        .png()
        .toFile(outputPath);
      
      console.log(`Flat drawing saved to: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Error in convertToFlat:', error);
      throw error;
    }
  }

  async preprocessImage(data, width, height) {
    // Convert to grayscale and enhance contrast
    const processed = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Enhance contrast
      const enhanced = Math.max(0, Math.min(255, (gray - 128) * 1.5 + 128));
      
      processed[i] = enhanced;
      processed[i + 1] = enhanced;
      processed[i + 2] = enhanced;
      processed[i + 3] = data[i + 3];
    }
    
    return processed;
  }

  detectEdges(data, width, height) {
    const edgeData = new Uint8ClampedArray(data.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let sum = 0;
        
        // Apply edge detection kernel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kernelIdx = ((y + ky) * width + (x + kx)) * 4;
            const kernelValue = this.edgeDetectionKernel[ky + 1][kx + 1];
            sum += data[kernelIdx] * kernelValue;
          }
        }
        
        const edgeValue = Math.max(0, Math.min(255, Math.abs(sum)));
        const threshold = 50;
        const finalValue = edgeValue > threshold ? 255 : 0;
        
        edgeData[idx] = finalValue;
        edgeData[idx + 1] = finalValue;
        edgeData[idx + 2] = finalValue;
        edgeData[idx + 3] = data[idx + 3];
      }
    }
    
    return edgeData;
  }

  extractGarmentStructure(edgeData, width, height) {
    const structureData = new Uint8ClampedArray(edgeData.length);
    
    // Copy edge data
    structureData.set(edgeData);
    
    // Apply morphological operations to clean up the structure
    // This is a simplified version - in a real implementation, you'd use more sophisticated algorithms
    
    // Remove small noise
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const current = edgeData[idx];
        
        if (current === 255) {
          // Count neighbors
          let neighborCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
              if (edgeData[neighborIdx] === 255) neighborCount++;
            }
          }
          
          // Remove isolated pixels
          if (neighborCount < 2) {
            structureData[idx] = 0;
            structureData[idx + 1] = 0;
            structureData[idx + 2] = 0;
          }
        }
      }
    }
    
    return structureData;
  }

  createFlatDrawing(structureData, width, height) {
    const flatData = new Uint8ClampedArray(structureData.length);
    
    // Initialize with white background
    for (let i = 0; i < flatData.length; i += 4) {
      flatData[i] = 255;     // White background
      flatData[i + 1] = 255;
      flatData[i + 2] = 255;
      flatData[i + 3] = 255;
    }
    
    // Add structure lines in black
    for (let i = 0; i < structureData.length; i += 4) {
      if (structureData[i] === 255) {
        flatData[i] = 0;     // Black lines
        flatData[i + 1] = 0;
        flatData[i + 2] = 0;
        flatData[i + 3] = 255;
      }
    }
    
    // Add technical drawing elements
    this.addTechnicalElements(flatData, width, height);
    
    return flatData;
  }

  addTechnicalElements(flatData, width, height) {
    // Add measurement lines, darts, pleats, etc.
    // This is a simplified version - in a real implementation, you'd use AI to detect these elements
    
    // Add some basic technical drawing elements
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (flatData[idx] === 255) { // Only on white background
          flatData[idx] = 200;     // Light gray lines
          flatData[idx + 1] = 200;
          flatData[idx + 2] = 200;
        }
      }
    }
    
    for (let x = 0; x < width; x += 20) {
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * 4;
        if (flatData[idx] === 255) { // Only on white background
          flatData[idx] = 200;     // Light gray lines
          flatData[idx + 1] = 200;
          flatData[idx + 2] = 200;
        }
      }
    }
  }

  async enhanceFlatDrawing(inputPath, outputPath) {
    try {
      await sharp(inputPath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .sharpen()
        .png()
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error enhancing flat drawing:', error);
      throw error;
    }
  }
}

export { ImageProcessor };
