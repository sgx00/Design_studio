import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { FiUpload, FiImage, FiLayers, FiDownload, FiRefreshCw, FiSettings, FiArrowRight } from 'react-icons/fi';
import api from '../config/axios';
import { getImageUrl } from '../utils/imageUtils';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 3rem;
`;

const WorkflowTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const WorkflowSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Dropzone = styled.div`
  border: 2px dashed #667eea;
  border-radius: 12px;
  padding: 3rem;
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
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const UploadHint = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const OptionsSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OptionGroup = styled.div`
  label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
`;

const ProcessingSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
`;

const ProcessingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ProcessingSubtext = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageCard = styled.div`
  text-align: center;
`;

const ImageTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const ImageContainer = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
`;

const ProcessedImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #e9ecef;
    color: #333;
    
    &:hover {
      background: #dee2e6;
      transform: translateY(-2px);
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
      transform: translateY(-2px);
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
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const WorkflowStep = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
`;

const StepArrow = styled.div`
  color: #667eea;
  font-size: 1.5rem;
`;

const DesignWorkflow = () => {
  const [activeTab, setActiveTab] = useState('image-to-flat');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [flatImage, setFlatImage] = useState(null);
  const [options, setOptions] = useState({
    style: 'casual',
    color: 'blue',
    material: 'cotton'
  });

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
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              <FiSettings style={{ marginRight: '0.5rem' }} />
              Customization Options
            </h3>
            <OptionsGrid>
              <OptionGroup>
                <label>Style</label>
                <select
                  value={options.style}
                  onChange={(e) => handleOptionChange('style', e.target.value)}
                >
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
