import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { FiUpload, FiImage, FiLayers, FiDownload, FiRefreshCw, FiSettings, FiArrowRight, FiX } from 'react-icons/fi';
import api from '../config/axios';
import { getImageUrl } from '../utils/imageUtils';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 1rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const WorkflowTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const WorkflowSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const Dropzone = styled.div`
  border: 2px dashed #667eea;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  
  &:hover {
    border-color: #764ba2;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 0.75rem;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.4rem;
`;

const UploadHint = styled.p`
  color: #666;
  font-size: 0.85rem;
`;

const OptionsSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OptionGroup = styled.div`
  label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }
  
  select {
    width: 100%;
    padding: 0.6rem;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
`;

const ProcessingSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ProcessingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.75rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingText = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.4rem;
`;

const ProcessingSubtext = styled.p`
  color: #666;
  font-size: 0.85rem;
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageCard = styled.div`
  text-align: center;
`;

const ImageTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
`;

const ImageContainer = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  background: #f8f9fa;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const ProcessedImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  width: auto;
  height: auto;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  object-fit: contain;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #764ba2;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #e9ecef;
    color: #333;
    
    &:hover {
      background: #dee2e6;
      transform: translateY(-1px);
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
      transform: translateY(-1px);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DownloadLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  background: #28a745;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }
`;

const TextPromptSection = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }
  
  textarea {
    width: 100%;
    padding: 0.6rem;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    min-height: 70px;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
  
  .char-count {
    text-align: right;
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.2rem;
  }
`;

const FabricImagesSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FabricImagesTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const FabricDropzone = styled.div`
  border: 2px dashed #667eea;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  margin-bottom: 0.75rem;
  
  &:hover {
    border-color: #764ba2;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const FabricImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const FabricImageCard = styled.div`
  position: relative;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  background: #f8f9fa;
`;

const FabricImage = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
`;

const RemoveFabricButton = styled.button`
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(220, 53, 69, 1);
    transform: scale(1.1);
  }
`;

const WorkflowStep = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StepArrow = styled.div`
  color: #667eea;
  font-size: 1.2rem;
`;

const DesignWorkflow = () => {
  const [activeTab, setActiveTab] = useState('image-to-flat');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [flatImage, setFlatImage] = useState(null);
  const [options, setOptions] = useState({
    style: 'none',
    color: 'none',
    material: 'none'
  });
  const [textPrompt, setTextPrompt] = useState('');
  const [fabricImages, setFabricImages] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      setResults(null);
      setFlatImage(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false
  });

  const onFabricDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const currentCount = fabricImages.length;
      const availableSlots = 4 - currentCount;
      const filesToAdd = acceptedFiles.slice(0, availableSlots);
      
      if (filesToAdd.length > 0) {
        setFabricImages(prev => [...prev, ...filesToAdd]);
        if (acceptedFiles.length > availableSlots) {
          toast.warning(`Only ${availableSlots} fabric images can be added. Maximum 4 allowed.`);
        }
      } else {
        toast.warning('Maximum 4 fabric images allowed. Please remove some before adding more.');
      }
    }
  }, [fabricImages.length]);

  const { getRootProps: getFabricRootProps, getInputProps: getFabricInputProps, isDragActive: isFabricDragActive } = useDropzone({
    onDrop: onFabricDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: true,
    maxFiles: 4
  });

  const processImageToFlat = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Converting to flat technical drawing...');

    const formData = new FormData();
    formData.append('image', uploadedFile);

    try {
      const response = await api.post('/api/image-to-flat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFlatImage(response.data.flatImage);
      setResults(response.data);
      toast.success('Image successfully converted to flat!');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const processFlatToFinal = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a flat image first');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Generating final product image...');

    const formData = new FormData();
    formData.append('flatImage', uploadedFile);
    formData.append('style', options.style);
    formData.append('color', options.color);
    formData.append('material', options.material);
    
    // Add text prompt if provided
    if (textPrompt.trim()) {
      formData.append('textPrompt', textPrompt.trim());
    }
    
    // Add fabric images if provided
    fabricImages.forEach((image, index) => {
      formData.append('fabricImages', image);
    });

    try {
      const response = await api.post('/api/flat-to-final', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      toast.success('Final product image generated successfully!');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to generate final image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setResults(null);
    setFlatImage(null);
    setTextPrompt('');
    setFabricImages([]);
  };

  const removeFabricImage = (index) => {
    setFabricImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const continueToFinal = () => {
    setActiveTab('flat-to-final');
    setUploadedFile(null);
    setResults(null);
  };

  const renderImageToFlat = () => (
    <>
      {!uploadedFile && !isProcessing && (
        <WorkflowSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Dropzone {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <UploadIcon>
              <FiUpload />
            </UploadIcon>
            <UploadText>
              {isDragActive
                ? 'Drop the image here...'
                : 'Drag & drop a product image here, or click to select'
              }
            </UploadText>
            <UploadHint>
              Supports JPG, PNG, GIF, BMP (Max 10MB)
            </UploadHint>
          </Dropzone>
        </WorkflowSection>
      )}

      {uploadedFile && !isProcessing && !results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <WorkflowSection>
            <ImageCard>
              <ImageTitle>Uploaded Image</ImageTitle>
              <ImageContainer>
                <ProcessedImage
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Uploaded"
                />
              </ImageContainer>
              <ActionButtons>
                <Button className="primary" onClick={processImageToFlat}>
                  <FiImage />
                  Convert to Flat
                </Button>
                <Button className="secondary" onClick={resetProcess}>
                  <FiRefreshCw />
                  Upload Different Image
                </Button>
              </ActionButtons>
            </ImageCard>
          </WorkflowSection>
        </motion.div>
      )}

      {results && (
        <ResultsSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ResultsGrid>
            <ImageCard>
              <ImageTitle>Original Image</ImageTitle>
              <ImageContainer>
                <ProcessedImage
                  src={getImageUrl(results.originalImage)}
                  alt="Original"
                />
              </ImageContainer>
              <DownloadLink
                href={getImageUrl(results.originalImage)}
                download="original-image.png"
              >
                <FiDownload />
                Download Original
              </DownloadLink>
            </ImageCard>
            
            <ImageCard>
              <ImageTitle>Flat Technical Drawing</ImageTitle>
              <ImageContainer>
                <ProcessedImage
                  src={getImageUrl(results.flatImage)}
                  alt="Flat Drawing"
                />
              </ImageContainer>
              <DownloadLink
                href={getImageUrl(results.flatImage)}
                download="flat-drawing.png"
              >
                <FiDownload />
                Download Flat
              </DownloadLink>
            </ImageCard>
          </ResultsGrid>
          
          <ActionButtons>
            <Button className="success" onClick={continueToFinal}>
              <FiArrowRight />
              Continue to Final Generation
            </Button>
            <Button className="secondary" onClick={resetProcess}>
              <FiRefreshCw />
              Process Another Image
            </Button>
          </ActionButtons>
        </ResultsSection>
      )}
    </>
  );

  const renderFlatToFinal = () => (
    <>
      {!uploadedFile && !isProcessing && (
        <WorkflowSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Dropzone {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <UploadIcon>
              <FiUpload />
            </UploadIcon>
            <UploadText>
              {isDragActive
                ? 'Drop the flat image here...'
                : 'Drag & drop a flat technical drawing here, or click to select'
              }
            </UploadText>
            <UploadHint>
              Supports JPG, PNG, GIF, BMP (Max 10MB)
            </UploadHint>
          </Dropzone>
        </WorkflowSection>
      )}

      {uploadedFile && !isProcessing && !results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <OptionsSection>
            <h3 style={{ marginBottom: '0.75rem', color: '#333', fontSize: '1.1rem' }}>
              <FiSettings style={{ marginRight: '0.4rem' }} />
              Customization Options
            </h3>
            
            <TextPromptSection>
              <label>Custom Design Prompt (Optional)</label>
              <textarea
                placeholder="Describe any specific design elements, patterns, or style preferences you'd like to see in the final garment..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                maxLength={500}
              />
              <div className="char-count">
                {textPrompt.length}/500 characters
              </div>
            </TextPromptSection>

            <FabricImagesSection>
              <FabricImagesTitle>
                <FiImage />
                Fabric Material Images (Optional)
              </FabricImagesTitle>
              <FabricDropzone {...getFabricRootProps()} isDragActive={isFabricDragActive}>
                <input {...getFabricInputProps()} />
                <UploadIcon>
                  <FiUpload />
                </UploadIcon>
                <UploadText>
                  {isFabricDragActive
                    ? 'Drop fabric images here...'
                    : 'Drag & drop fabric material images here, or click to select'
                  }
                </UploadText>
                <UploadHint>
                  Upload 1-4 images of fabric materials to guide the design (Max 10MB each)
                </UploadHint>
              </FabricDropzone>
              
              {fabricImages.length > 0 && (
                <FabricImagesGrid>
                  {fabricImages.map((image, index) => (
                    <FabricImageCard key={index}>
                      <FabricImage
                        src={URL.createObjectURL(image)}
                        alt={`Fabric ${index + 1}`}
                      />
                      <RemoveFabricButton onClick={() => removeFabricImage(index)}>
                        <FiX />
                      </RemoveFabricButton>
                    </FabricImageCard>
                  ))}
                </FabricImagesGrid>
              )}
            </FabricImagesSection>
            
            <OptionsGrid>
              <OptionGroup>
                <label>Style</label>
                <select
                  value={options.style}
                  onChange={(e) => handleOptionChange('style', e.target.value)}
                >
                  <option value="none">None (AI decides)</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="sporty">Sporty</option>
                </select>
              </OptionGroup>
              
              <OptionGroup>
                <label>Color</label>
                <select
                  value={options.color}
                  onChange={(e) => handleOptionChange('color', e.target.value)}
                >
                  <option value="none">None (AI decides)</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="gray">Gray</option>
                </select>
              </OptionGroup>
              
              <OptionGroup>
                <label>Material</label>
                <select
                  value={options.material}
                  onChange={(e) => handleOptionChange('material', e.target.value)}
                >
                  <option value="none">None (AI decides)</option>
                  <option value="cotton">Cotton</option>
                  <option value="silk">Silk</option>
                  <option value="denim">Denim</option>
                  <option value="leather">Leather</option>
                </select>
              </OptionGroup>
            </OptionsGrid>
            
            <ImageCard>
              <ImageTitle>Uploaded Flat Drawing</ImageTitle>
              <ImageContainer>
                <ProcessedImage
                  src={URL.createObjectURL(uploadedFile)}
                  alt="Uploaded Flat"
                />
              </ImageContainer>
              <ActionButtons>
                <Button className="primary" onClick={processFlatToFinal}>
                  <FiLayers />
                  Generate Final Image
                </Button>
                <Button className="secondary" onClick={resetProcess}>
                  <FiRefreshCw />
                  Upload Different Image
                </Button>
              </ActionButtons>
            </ImageCard>
          </OptionsSection>
        </motion.div>
      )}

      {results && (
        <ResultsSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ResultsGrid>
            <ImageCard>
              <ImageTitle>Flat Technical Drawing</ImageTitle>
              <ImageContainer>
                <ProcessedImage
                  src={getImageUrl(results.flatImage)}
                  alt="Flat Drawing"
                />
              </ImageContainer>
              <DownloadLink
                href={getImageUrl(results.flatImage)}
                download="flat-drawing.png"
              >
                <FiDownload />
                Download Flat
              </DownloadLink>
            </ImageCard>
            
            <ImageCard>
              <ImageTitle>Final Product Image</ImageTitle>
              <ImageContainer>
                <ProcessedImage
                  src={getImageUrl(results.finalImage)}
                  alt="Final Product"
                />
              </ImageContainer>
              <DownloadLink
                href={getImageUrl(results.finalImage)}
                download="final-product.png"
              >
                <FiDownload />
                Download Final
              </DownloadLink>
            </ImageCard>
          </ResultsGrid>
          
          {results.fabricImages && results.fabricImages.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#333', textAlign: 'center', fontSize: '1.1rem' }}>
                Fabric Materials Used
              </h3>
              <FabricImagesGrid>
                {results.fabricImages.map((fabricImage, index) => (
                  <FabricImageCard key={index}>
                    <FabricImage
                      src={getImageUrl(fabricImage)}
                      alt={`Fabric ${index + 1}`}
                    />
                  </FabricImageCard>
                ))}
              </FabricImagesGrid>
            </div>
          )}
          
          <ActionButtons>
            <Button className="secondary" onClick={resetProcess}>
              <FiRefreshCw />
              Process Another Image
            </Button>
          </ActionButtons>
        </ResultsSection>
      )}
    </>
  );

  return (
    <PageContainer>
      <Container>
        <PageTitle>AI Design Workflow</PageTitle>
        <PageSubtitle>
          Convert product images to technical flats and generate realistic final renders
        </PageSubtitle>

        <WorkflowTabs>
          <TabButton
            active={activeTab === 'image-to-flat'}
            onClick={() => setActiveTab('image-to-flat')}
          >
            <FiImage />
            Image to Flat
          </TabButton>
          <TabButton
            active={activeTab === 'flat-to-final'}
            onClick={() => setActiveTab('flat-to-final')}
          >
            <FiLayers />
            Flat to Final
          </TabButton>
        </WorkflowTabs>

        {isProcessing && (
          <ProcessingSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProcessingSpinner />
            <ProcessingText>Processing your image...</ProcessingText>
            <ProcessingSubtext>{processingStep}</ProcessingSubtext>
          </ProcessingSection>
        )}

        {activeTab === 'image-to-flat' && renderImageToFlat()}
        {activeTab === 'flat-to-final' && renderFlatToFinal()}
      </Container>
    </PageContainer>
  );
};

export default DesignWorkflow;
