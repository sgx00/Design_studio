import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUpload, FiImage, FiSettings, FiDownload, FiRefreshCw, FiDroplet, FiScissors, FiTarget } from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';

// Axios configuration for garment variation API
const garmentApi = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 90000, // 90 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
garmentApi.interceptors.request.use(
  (config) => {
    console.log('Making garment variation request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Garment variation request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
garmentApi.interceptors.response.use(
  (response) => {
    console.log('Garment variation response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Garment variation response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const PanelTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: ${props => props.isDragOver ? '#f8f9fa' : 'transparent'};
  border-color: ${props => props.isDragOver ? '#3498db' : '#bdc3c7'};

  &:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.p`
  color: #95a5a6;
  font-size: 0.9rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const VariationControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e1e8ed;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3498db;
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ResultCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ResultImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ResultTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const ResultDescription = styled.p`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

const DownloadButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #229954;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #27ae60;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
`;

const GarmentVariation = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Variation parameters
  const [variationParams, setVariationParams] = useState({
    variationType: 'color',
    intensity: 50,
    style: 'casual',
    material: 'cotton',
    pattern: 'solid',
    fit: 'regular',
    length: 'standard',
    customPrompt: '',
    variationCount: 4
  });

  const variationTypes = [
    { value: 'color', label: 'Color Variation', icon: <FiDroplet /> },
    { value: 'style', label: 'Style Variation', icon: <FiScissors /> },
    { value: 'material', label: 'Material Variation', icon: <FiImage /> },
    { value: 'pattern', label: 'Pattern Variation', icon: <FiTarget /> },
    { value: 'fit', label: 'Fit Variation', icon: <FiSettings /> },
    { value: 'custom', label: 'Custom Variation', icon: <FiSettings /> }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError(null);
      setSuccess(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVariationParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateVariations = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      
      // Use AI-powered color variations for color type
      if (variationParams.variationType === 'color') {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('baseColor', variationParams.style); // Using style field for base color
        formData.append('intensity', variationParams.intensity);
        formData.append('count', variationParams.variationCount);
        formData.append('style', variationParams.material); // Using material field for style
        formData.append('material', variationParams.pattern); // Using pattern field for material

        response = await garmentApi.post('/api/garment-variation/ai-color', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Use general variation endpoint for other types
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('variationType', variationParams.variationType);
        formData.append('intensity', variationParams.intensity);
        formData.append('variationCount', variationParams.variationCount);
        formData.append('style', variationParams.style);
        formData.append('material', variationParams.material);
        formData.append('pattern', variationParams.pattern);
        formData.append('fit', variationParams.fit);
        formData.append('length', variationParams.length);
        formData.append('customPrompt', variationParams.customPrompt);

        response = await garmentApi.post('/api/garment-variation/generate', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        setResults(response.data.variations);
        const aiStatus = response.data.aiPowered ? ' (AI-powered)' : ' (Traditional processing)';
        setSuccess(`Generated ${response.data.variations.length} variations successfully!${aiStatus}`);
      } else {
        setError(response.data.error || 'Failed to generate variations');
      }
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(err.response?.data?.error || 'Failed to generate variations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <Content>
        <Header>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Garment Style Variations
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Create multiple variations of your garment designs with different styles, colors, materials, and patterns
          </Subtitle>
        </Header>

        <MainGrid>
          <Panel
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <PanelTitle>
              <FiUpload />
              Upload Garment Image
            </PanelTitle>
            
            <UploadArea
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon>
                <FiImage />
              </UploadIcon>
              <UploadText>Drag & drop your image here</UploadText>
              <UploadSubtext>or click to browse files</UploadSubtext>
              <UploadSubtext>Supports JPG, PNG, GIF (max 10MB)</UploadSubtext>
            </UploadArea>

            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            {selectedImage && (
              <ImagePreview>
                <PreviewImage
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected garment"
                />
              </ImagePreview>
            )}
          </Panel>

          <Panel
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <PanelTitle>
              <FiSettings />
              Variation Parameters
            </PanelTitle>

            <VariationControls>
              <ControlGroup>
                <Label>
                  <FiDroplet />
                  Variation Type
                </Label>
                <Select
                  name="variationType"
                  value={variationParams.variationType}
                  onChange={handleInputChange}
                >
                  {variationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </ControlGroup>

              <ControlGroup>
                <Label>
                  <FiSettings />
                  Intensity
                </Label>
                <SliderContainer>
                  <Slider
                    type="range"
                    min="10"
                    max="100"
                    value={variationParams.intensity}
                    onChange={(e) => setVariationParams(prev => ({
                      ...prev,
                      intensity: parseInt(e.target.value)
                    }))}
                  />
                  <SliderValue>{variationParams.intensity}%</SliderValue>
                </SliderContainer>
              </ControlGroup>

              <ControlGroup>
                <Label>
                  <FiTarget />
                  Number of Variations
                </Label>
                <Select
                  name="variationCount"
                  value={variationParams.variationCount}
                  onChange={handleInputChange}
                >
                  <option value={2}>2 Variations</option>
                  <option value={3}>3 Variations</option>
                  <option value={4}>4 Variations</option>
                  <option value={5}>5 Variations</option>
                  <option value={6}>6 Variations</option>
                </Select>
              </ControlGroup>

              <ControlGroup>
                <Label>{variationParams.variationType === 'color' ? 'Base Color' : 'Style'}</Label>
                <Select
                  name="style"
                  value={variationParams.style}
                  onChange={handleInputChange}
                >
                  {variationParams.variationType === 'color' ? (
                    <>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                      <option value="purple">Purple</option>
                      <option value="yellow">Yellow</option>
                      <option value="orange">Orange</option>
                      <option value="pink">Pink</option>
                      <option value="brown">Brown</option>
                      <option value="black">Black</option>
                      <option value="white">White</option>
                      <option value="gray">Gray</option>
                    </>
                  ) : (
                    <>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="sporty">Sporty</option>
                      <option value="elegant">Elegant</option>
                      <option value="vintage">Vintage</option>
                      <option value="modern">Modern</option>
                    </>
                  )}
                </Select>
              </ControlGroup>

              <ControlGroup>
                <Label>Material</Label>
                <Select
                  name="material"
                  value={variationParams.material}
                  onChange={handleInputChange}
                >
                  <option value="cotton">Cotton</option>
                  <option value="polyester">Polyester</option>
                  <option value="silk">Silk</option>
                  <option value="denim">Denim</option>
                  <option value="leather">Leather</option>
                  <option value="wool">Wool</option>
                  <option value="linen">Linen</option>
                </Select>
              </ControlGroup>

              <ControlGroup>
                <Label>Pattern</Label>
                <Select
                  name="pattern"
                  value={variationParams.pattern}
                  onChange={handleInputChange}
                >
                  <option value="solid">Solid</option>
                  <option value="striped">Striped</option>
                  <option value="polka-dot">Polka Dot</option>
                  <option value="floral">Floral</option>
                  <option value="geometric">Geometric</option>
                  <option value="abstract">Abstract</option>
                </Select>
              </ControlGroup>

              <ControlGroup>
                <Label>Fit</Label>
                <Select
                  name="fit"
                  value={variationParams.fit}
                  onChange={handleInputChange}
                >
                  <option value="regular">Regular</option>
                  <option value="slim">Slim</option>
                  <option value="loose">Loose</option>
                  <option value="oversized">Oversized</option>
                  <option value="fitted">Fitted</option>
                </Select>
              </ControlGroup>
            </VariationControls>

            {variationParams.variationType === 'custom' && (
              <ControlGroup>
                <Label>Custom Prompt</Label>
                <TextArea
                  name="customPrompt"
                  value={variationParams.customPrompt}
                  onChange={handleInputChange}
                  placeholder="Describe the specific variations you want to create..."
                />
              </ControlGroup>
            )}

            <Button
              onClick={handleGenerateVariations}
              disabled={!selectedImage || isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Generating Variations...
                </>
              ) : (
                <>
                  <FiRefreshCw />
                  Generate Variations
                </>
              )}
            </Button>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
          </Panel>
        </MainGrid>

        {results.length > 0 && (
          <Panel
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PanelTitle>
              <FiImage />
              Generated Variations
            </PanelTitle>
            <ResultsGrid>
              {results.map((result, index) => (
                <ResultCard
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ResultImage
                    src={getImageUrl(result.imageUrl)}
                    alt={`Variation ${index + 1}`}
                  />
                  <ResultTitle>{result.title}</ResultTitle>
                  <ResultDescription>{result.description}</ResultDescription>
                  <DownloadButton
                    onClick={() => handleDownload(getImageUrl(result.imageUrl), `variation-${index + 1}.png`)}
                  >
                    <FiDownload />
                    Download
                  </DownloadButton>
                </ResultCard>
              ))}
            </ResultsGrid>
          </Panel>
        )}
      </Content>
    </Container>
  );
};

export default GarmentVariation;
