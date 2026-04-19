import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { FiUpload, FiImage, FiLayers, FiDownload, FiRefreshCw, FiSettings, FiArrowRight, FiX, FiVideo } from 'react-icons/fi';
import api from '../config/axios';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

const fastapi = axios.create({ baseURL: 'http://localhost:8000', timeout: 30000 });

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FE;
  padding: 2rem 0 3rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: #636E72;
  font-size: 1.05rem;
  margin-bottom: 2rem;
`;

const WorkflowTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  border-radius: 10px;
  padding: 0.3rem;
  border: 1px solid #E8E6F0;
  max-width: 460px;
  margin-left: auto;
  margin-right: auto;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.7rem 1rem;
  border: none;
  background: ${props => props.active ? '#6C5CE7' : 'transparent'};
  color: ${props => props.active ? 'white' : '#636E72'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  &:hover {
    background: ${props => props.active ? '#6C5CE7' : 'rgba(108, 92, 231, 0.08)'};
    color: ${props => props.active ? 'white' : '#6C5CE7'};
  }
`;

const WorkflowSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #E8E6F0;
  margin-bottom: 1.5rem;
`;

const Dropzone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#6C5CE7' : '#E8E6F0'};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(108, 92, 231, 0.06)' : '#FAFAFE'};

  &:hover {
    border-color: #A29BFE;
    background: rgba(108, 92, 231, 0.04);
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #6C5CE7;
  margin-bottom: 0.75rem;
`;

const UploadText = styled.p`
  font-size: 1.05rem;
  color: #2D3436;
  margin-bottom: 0.4rem;
  font-weight: 500;
`;

const UploadHint = styled.p`
  color: #B2BEC3;
  font-size: 0.8rem;
`;

const OptionsSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #E8E6F0;
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
    color: #2D3436;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
  }

  select {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1.5px solid #E8E6F0;
    border-radius: 10px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    background: white;
    color: #2D3436;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #6C5CE7;
      box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.08);
    }
  }
`;

const ProcessingSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 3rem 1.5rem;
  border: 1px solid #E8E6F0;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ProcessingSpinner = styled.div`
  border: 3px solid #F0EFF5;
  border-top: 3px solid #6C5CE7;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProcessingText = styled.p`
  font-size: 1rem;
  color: #2D3436;
  margin-bottom: 0.4rem;
  font-weight: 500;
`;

const ProcessingSubtext = styled.p`
  color: #B2BEC3;
  font-size: 0.85rem;
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #E8E6F0;
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
  font-size: 0.9rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const ImageContainer = styled.div`
  border: 1px solid #E8E6F0;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  background: #FAFAFE;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
`;

const ProcessedImage = styled.img`
  max-width: 100%;
  max-height: 340px;
  width: auto;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &.primary {
    background: #6C5CE7;
    color: white;
    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.25);

    &:hover {
      background: #5A4BD1;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(108, 92, 231, 0.35);
    }
  }

  &.secondary {
    background: transparent;
    color: #636E72;
    border: 1.5px solid #E8E6F0;

    &:hover {
      border-color: #6C5CE7;
      color: #6C5CE7;
      background: rgba(108, 92, 231, 0.04);
    }
  }

  &.success {
    background: #00B894;
    color: white;

    &:hover {
      background: #00A381;
      transform: translateY(-1px);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const DownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  background: #00B894;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #00A381;
    transform: translateY(-1px);
  }
`;

const TextPromptSection = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1.5px solid #E8E6F0;
    border-radius: 10px;
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    transition: all 0.2s ease;
    color: #2D3436;

    &::placeholder { color: #B2BEC3; }
    &:focus {
      outline: none;
      border-color: #6C5CE7;
      box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.08);
    }
  }

  .char-count {
    text-align: right;
    font-size: 0.75rem;
    color: #B2BEC3;
    margin-top: 0.25rem;
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
  border: 2px dashed ${props => props.isDragActive ? '#6C5CE7' : '#E8E6F0'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(108, 92, 231, 0.06)' : '#FAFAFE'};
  margin-bottom: 0.75rem;

  &:hover {
    border-color: #A29BFE;
    background: rgba(108, 92, 231, 0.04);
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
  border: 1px solid #E8E6F0;
  border-radius: 10px;
  overflow: hidden;
  background: #FAFAFE;
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

const VideoSection = styled(motion.div)`
  margin-top: 2rem;
  background: linear-gradient(180deg, #1A1A2E 0%, #16213E 100%);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
`;

const VideoSectionTitle = styled.h3`
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const VideoGeneratingState = styled.div`
  color: rgba(255,255,255,0.75);
  font-size: 0.9rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const VideoSpinner = styled.div`
  border: 3px solid rgba(255,255,255,0.1);
  border-top: 3px solid #A29BFE;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const StyledVideo = styled.video`
  max-width: 100%;
  max-height: 560px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
`;

const VideoOptionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const VideoOptionLabel = styled.label`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const VideoOptionSelect = styled.select`
  padding: 0.35rem 0.6rem;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
  color: #333;
  cursor: pointer;
  &:focus { outline: none; border-color: #667eea; }
`;

const VideoDownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: rgba(255,255,255,0.12);
  color: white;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.22); }
`;

const WorkflowStep = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 0.75rem;
  background: #F8F9FE;
  border-radius: 10px;
`;

const StepArrow = styled.div`
  color: #6C5CE7;
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
  const [videoJobId, setVideoJobId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoOptions, setVideoOptions] = useState({ style: 'elegant', occasion: 'runway', aspect_ratio: '9:16' });
  const pollRef = useRef(null);

  useEffect(() => {
    if (!videoJobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fastapi.get(`/api/v1/video/status/${videoJobId}`);
        if (res.data.status === 'done') {
          clearInterval(pollRef.current);
          setVideoJobId(null);
          setIsGeneratingVideo(false);
          setVideoUrl(`http://localhost:3001${res.data.video_url}`);
          toast.success('Fashion shoot video ready!');
        } else if (res.data.status === 'failed') {
          clearInterval(pollRef.current);
          setVideoJobId(null);
          setIsGeneratingVideo(false);
          toast.error(`Video generation failed: ${res.data.error}`);
        }
      } catch (err) {
        console.error('Error polling video status:', err);
      }
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [videoJobId]);

  const animateDesign = async (imagePath) => {
    setIsGeneratingVideo(true);
    setVideoUrl(null);
    try {
      const res = await fastapi.post('/api/v1/video/generate', {
        image_path: imagePath,
        aspect_ratio: videoOptions.aspect_ratio,
        duration_seconds: 8,
        style: videoOptions.style,
        occasion: videoOptions.occasion,
      });
      setVideoJobId(res.data.job_id);
      toast.info('Fashion shoot generating... this takes ~2 minutes', { autoClose: 8000 });
    } catch (err) {
      setIsGeneratingVideo(false);
      toast.error('Failed to start video generation');
    }
  };

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
              <ActionButtons>
                <DownloadLink
                  href={getImageUrl(results.finalImage)}
                  download="final-product.png"
                >
                  <FiDownload />
                  Download Final
                </DownloadLink>
              </ActionButtons>
              <VideoOptionsRow>
                <VideoOptionLabel>
                  Style
                  <VideoOptionSelect
                    value={videoOptions.style}
                    onChange={e => setVideoOptions(v => ({ ...v, style: e.target.value }))}
                    disabled={isGeneratingVideo}
                  >
                    <option value="elegant">Elegant</option>
                    <option value="editorial">Editorial</option>
                    <option value="street">Street</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="bold">Bold</option>
                  </VideoOptionSelect>
                </VideoOptionLabel>
                <VideoOptionLabel>
                  Occasion
                  <VideoOptionSelect
                    value={videoOptions.occasion}
                    onChange={e => setVideoOptions(v => ({ ...v, occasion: e.target.value }))}
                    disabled={isGeneratingVideo}
                  >
                    <option value="runway">Runway</option>
                    <option value="studio">Studio</option>
                    <option value="street">Street</option>
                    <option value="editorial">Editorial</option>
                    <option value="lookbook">Lookbook</option>
                  </VideoOptionSelect>
                </VideoOptionLabel>
                <VideoOptionLabel>
                  Aspect Ratio
                  <VideoOptionSelect
                    value={videoOptions.aspect_ratio}
                    onChange={e => setVideoOptions(v => ({ ...v, aspect_ratio: e.target.value }))}
                    disabled={isGeneratingVideo}
                  >
                    <option value="9:16">9:16 Portrait</option>
                    <option value="16:9">16:9 Landscape</option>
                    <option value="1:1">1:1 Square</option>
                  </VideoOptionSelect>
                </VideoOptionLabel>
                <Button
                  className="primary"
                  style={{ alignSelf: 'flex-end' }}
                  onClick={() => animateDesign(results.finalImage)}
                  disabled={isGeneratingVideo}
                >
                  <FiVideo />
                  {isGeneratingVideo ? 'Generating Shoot...' : 'Create Fashion Shoot'}
                </Button>
              </VideoOptionsRow>
            </ImageCard>
          </ResultsGrid>

          {(isGeneratingVideo || videoUrl) && (
            <VideoSection
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VideoSectionTitle>
                <FiVideo />
                Fashion Model Shoot
              </VideoSectionTitle>
              {isGeneratingVideo && !videoUrl && (
                <VideoGeneratingState>
                  <VideoSpinner />
                  <span>Veo 3.1 is generating your fashion shoot video...</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>Usually takes 1–2 minutes</span>
                </VideoGeneratingState>
              )}
              {videoUrl && (
                <>
                  <StyledVideo controls autoPlay loop>
                    <source src={videoUrl} type="video/mp4" />
                  </StyledVideo>
                  <VideoDownloadLink href={videoUrl} download="fashion-shoot.mp4">
                    <FiDownload />
                    Download Video
                  </VideoDownloadLink>
                </>
              )}
            </VideoSection>
          )}
          
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
