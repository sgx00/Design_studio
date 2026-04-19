import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FiTrendingUp,
  FiZap,
  FiSettings,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiBarChart,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import axios from 'axios';
import { getImageUrl, getImageUrl2 } from '../utils/imageUtils';

// Axios configuration for FastAPI backend
const axiosConfig = {
  baseURL: 'http://localhost:8000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FE;
  padding: 2rem 0 3rem;
`;

const Container = styled.div`
  max-width: 1280px;
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
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const MainSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #E8E6F0;
  margin-bottom: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  label {
    display: block;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }

  select, input {
    width: 100%;
    padding: 0.75rem;
    border: 1.5px solid #E8E6F0;
    border-radius: 10px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    background: white;
    color: #2D3436;

    &:focus {
      outline: none;
      border-color: #6C5CE7;
      box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.08);
    }
  }
`;

const PreferencesSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const PreferenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
  
  label {
    margin: 0;
    font-weight: 500;
    font-size: 0.9rem;
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: #6C5CE7;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);

  &:hover {
    background: #5A4BD1;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(108, 92, 231, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const LoadingSection = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: #F8F9FE;
  border-radius: 16px;
  margin: 2rem 0;
`;

const LoadingSpinner = styled.div`
  border: 3px solid #F0EFF5;
  border-top: 3px solid #6C5CE7;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.h3`
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.p`
  color: #B2BEC3;
  font-size: 0.9rem;
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #E8E6F0;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E8E6F0;
`;

const ResultsTitle = styled.h2`
  color: #2D3436;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const ResultsStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #636E72;
`;

const DesignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const DesignCard = styled(motion.div)`
  background: #F8F9FE;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #E8E6F0;
  transition: all 0.25s ease;

  &:hover {
    border-color: #A29BFE;
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(108, 92, 231, 0.12);
  }
`;

const DesignHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const DesignTitle = styled.h3`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const DesignScore = styled.div`
  background: ${props => props.score > 0.8 ? '#00B894' : props.score > 0.6 ? '#FDCB6E' : '#FF7675'};
  color: ${props => props.score > 0.6 && props.score <= 0.8 ? '#2D3436' : 'white'};
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const DesignImage = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  
  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DesignDetails = styled.div`
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  .label {
    color: #666;
    font-weight: 500;
  }
  
  .value {
    color: #333;
    font-weight: 600;
  }
`;

const DesignActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &.primary {
    background: #6C5CE7;
    color: white;

    &:hover {
      background: #5A4BD1;
    }
  }

  &.secondary {
    background: transparent;
    color: #636E72;
    border: 1.5px solid #E8E6F0;

    &:hover {
      border-color: #6C5CE7;
      color: #6C5CE7;
    }
  }
`;

const TrendAnalysisSection = styled.div`
  background: #F8F9FE;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const TrendTitle = styled.h3`
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const TrendCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 10px;
  border-left: 3px solid #6C5CE7;
  border: 1px solid #E8E6F0;
  border-left: 3px solid #6C5CE7;
`;

const TrendName = styled.h4`
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TrendDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
`;

const TrendConfidence = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #00B894;
  font-weight: 600;
`;

const MarketAnalysisSection = styled.div`
  background: #F8F9FE;
  border-radius: 16px;
  padding: 1.5rem;
`;

const MarketTitle = styled.h3`
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MarketScore = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;

  .score {
    font-size: 3rem;
    font-weight: 800;
    color: ${props => props.score > 0.8 ? '#00B894' : props.score > 0.6 ? '#E17055' : '#FF7675'};
  }

  .label {
    color: #636E72;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
`;

const MarketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const MarketCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #E8E6F0;
`;

const MarketCardTitle = styled.h4`
  color: #333;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const MarketList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    color: #666;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
    padding-left: 1rem;
    position: relative;
    
    &:before {
      content: '•';
      position: absolute;
      left: 0;
      color: #6C5CE7;
    }
  }
`;

const ConceptContainer = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
`;

const ConceptToggle = styled.button`
  background: none;
  border: none;
  color: #6C5CE7;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.75rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ConceptBody = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
`;

const ConceptSectionTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: #6C5CE7;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.85rem;
  margin-bottom: 0.2rem;

  &:first-child {
    margin-top: 0;
  }
`;

const ConceptBulletItem = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #444;
  line-height: 1.55;

  .bullet-dot {
    color: #6C5CE7;
    flex-shrink: 0;
    font-weight: 700;
    margin-top: 1px;
  }
`;

const ConceptParagraph = styled.p`
  font-size: 0.82rem;
  color: #555;
  line-height: 1.65;
  margin: 0.15rem 0;

  strong {
    color: #333;
    font-weight: 600;
  }
`;

const AIFashionAgent = () => {
  const [formData, setFormData] = useState({
    garmentType: 'general',
    category: 'all',
    strategy: 'balanced',
    count: 3,
    targetAudience: 'general',
    occasion: 'everyday',
    preferences: {}
  });

  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [expandedConcepts, setExpandedConcepts] = useState({});

  const toggleConcept = (id) => {
    setExpandedConcepts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderInline = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  const renderConceptText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Section header: **text** or "1. Title" or "Title:" alone on a line
      const isBoldHeader = /^\*\*[^*]+\*\*:?$/.test(trimmed);
      const isNumberedHeader =
        /^\d+\.\s+[A-Z]/.test(trimmed) &&
        trimmed.length < 70 &&
        !/^[-•*]\s/.test(trimmed);
      const isPlainHeader =
        /^[A-Z][A-Za-z\s&,/]+:$/.test(trimmed) && trimmed.length < 60;

      if (isBoldHeader || isNumberedHeader || isPlainHeader) {
        const headerText = trimmed
          .replace(/\*\*/g, '')
          .replace(/^\d+\.\s+/, '')
          .replace(/:$/, '')
          .trim();
        elements.push(
          <ConceptSectionTitle key={i}>{headerText}</ConceptSectionTitle>
        );
        return;
      }

      // Bullet point
      if (/^[-•*]\s/.test(trimmed)) {
        const bulletText = trimmed.replace(/^[-•*]\s+/, '').trim();
        elements.push(
          <ConceptBulletItem key={i}>
            <span className="bullet-dot">•</span>
            <span>{renderInline(bulletText)}</span>
          </ConceptBulletItem>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <ConceptParagraph key={i}>{renderInline(trimmed)}</ConceptParagraph>
      );
    });

    return elements;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      // Load strategies and categories from FastAPI backend
      const [strategiesResponse, categoriesResponse] = await Promise.all([
        axios.get('/api/v1/designs/strategies', axiosConfig),
        axios.get('/api/v1/designs/categories', axiosConfig)
      ]);
      
      setConfig({
        strategies: strategiesResponse.data.strategies,
        categories: categoriesResponse.data.categories
      });
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load configuration');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference, checked) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: checked
      }
    }));
  };

  const generateDesigns = async () => {
    setIsLoading(true);
    setLoadingStep('Analyzing current fashion trends...');

    try {
      const response = await axios.post('/api/v1/designs/generate', formData, {
        ...axiosConfig,
        timeout: 120000 // 2 minutes timeout for design generation
      });
      
      if (response.data.success) {
        console.log('Designs generated successfully:', response.data);
        setResults(response.data.data);
        toast.success('Designs generated successfully!');
      } else {
        toast.error(response.data.error || 'Failed to generate designs');
      }
    } catch (error) {
      console.error('Error generating designs:', error);
      toast.error('Failed to generate designs. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const downloadDesign = (designPath) => {
    const link = document.createElement('a');
    link.href = getImageUrl2(designPath);
    link.download = `ai-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewDesign = (designPath) => {
    window.open(getImageUrl2(designPath), '_blank');
  };

  if (!config) {
    return (
      <PageContainer>
        <Container>
          <LoadingSection>
            <LoadingSpinner />
            <LoadingText>Loading AI Fashion Agent...</LoadingText>
          </LoadingSection>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <PageTitle>AI Fashion Agent</PageTitle>
        <PageSubtitle>
          Generate trend-based garment designs using the latest fashion insights and AI technology
        </PageSubtitle>

        <MainSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FormGrid>
            <FormGroup>
              <label>Garment Type</label>
              <select
                value={formData.garmentType}
                onChange={(e) => handleInputChange('garmentType', e.target.value)}
              >
                <option value="general">General</option>
                <option value="t-shirt">T-Shirt</option>
                <option value="blouse">Blouse</option>
                <option value="dress">Dress</option>
                <option value="pants">Pants</option>
                <option value="jacket">Jacket</option>
                <option value="sweater">Sweater</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="outerwear">Outerwear</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Design Strategy</label>
              <select
                value={formData.strategy}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
              >
                {config && config.strategies ? Object.entries(config.strategies).map(([key, strategy]) => (
                  <option key={key} value={key}>
                    {strategy.description}
                  </option>
                )) : (
                  <>
                    <option value="trend_following">Follow current trends closely</option>
                    <option value="trend_leading">Lead trends with innovative designs</option>
                    <option value="balanced">Balance trends with timeless appeal</option>
                    <option value="sustainable">Focus on sustainable and ethical design</option>
                  </>
                )}
              </select>
            </FormGroup>

            <FormGroup>
              <label>Number of Designs</label>
              <select
                value={formData.count}
                onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
              >
                <option value={1}>1 Design</option>
                <option value={2}>2 Designs</option>
                <option value={3}>3 Designs</option>
                <option value={4}>4 Designs</option>
                <option value={5}>5 Designs</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              >
                <option value="general">General</option>
                <option value="young">Young Adults (18-25)</option>
                <option value="professional">Professionals (25-40)</option>
                <option value="casual">Casual Wearers</option>
                <option value="luxury">Luxury Consumers</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Occasion</label>
              <select
                value={formData.occasion}
                onChange={(e) => handleInputChange('occasion', e.target.value)}
              >
                <option value="everyday">Everyday</option>
                <option value="casual">Casual</option>
                <option value="business">Business</option>
                <option value="formal">Formal</option>
                <option value="sporty">Sporty</option>
                <option value="evening">Evening</option>
              </select>
            </FormGroup>
          </FormGrid>

          <PreferencesSection>
            <h3>
              <FiSettings />
              Design Preferences
            </h3>
            <PreferencesGrid>
              <PreferenceItem>
                <input
                  type="checkbox"
                  id="sustainable"
                  checked={formData.preferences.sustainable || false}
                  onChange={(e) => handlePreferenceChange('sustainable', e.target.checked)}
                />
                <label htmlFor="sustainable">Sustainable Materials</label>
              </PreferenceItem>
              <PreferenceItem>
                <input
                  type="checkbox"
                  id="minimalist"
                  checked={formData.preferences.minimalist || false}
                  onChange={(e) => handlePreferenceChange('minimalist', e.target.checked)}
                />
                <label htmlFor="minimalist">Minimalist Design</label>
              </PreferenceItem>
              <PreferenceItem>
                <input
                  type="checkbox"
                  id="versatile"
                  checked={formData.preferences.versatile || false}
                  onChange={(e) => handlePreferenceChange('versatile', e.target.checked)}
                />
                <label htmlFor="versatile">Versatile Styling</label>
              </PreferenceItem>
              <PreferenceItem>
                <input
                  type="checkbox"
                  id="comfortable"
                  checked={formData.preferences.comfortable || false}
                  onChange={(e) => handlePreferenceChange('comfortable', e.target.checked)}
                />
                <label htmlFor="comfortable">Comfortable Fit</label>
              </PreferenceItem>
            </PreferencesGrid>
          </PreferencesSection>

          <GenerateButton onClick={generateDesigns} disabled={isLoading}>
            {isLoading ? (
              <>
                <FiRefreshCw className="spin" />
                Generating Designs...
              </>
            ) : (
              <>
                <FiZap />
                Generate Trend-Based Designs
              </>
            )}
          </GenerateButton>
        </MainSection>

        {isLoading && (
          <LoadingSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LoadingSpinner />
            <LoadingText>AI Fashion Agent is working...</LoadingText>
            <LoadingSubtext>{loadingStep}</LoadingSubtext>
          </LoadingSection>
        )}

        {results && (
          <ResultsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ResultsHeader>
              <ResultsTitle>Generated Designs</ResultsTitle>
              <ResultsStats>
                <span>{results.generated_designs.length} designs generated</span>
                <span>•</span>
                <span>Strategy: {results.metadata.strategy}</span>
                <span>•</span>
                <span>{new Date(results.metadata.generatedAt).toLocaleDateString()}</span>
              </ResultsStats>
            </ResultsHeader>

            {results.trend_analysis && (
              <TrendAnalysisSection>
                <TrendTitle>
                  <FiTrendingUp />
                  Current Fashion Trends Analysis
                </TrendTitle>
                <TrendGrid>
                  {results.trend_analysis.keyTrends.slice(0, 4).map((trend, index) => (
                    <TrendCard key={index}>
                      <TrendName>{trend.name}</TrendName>
                      <TrendDescription>{trend.description}</TrendDescription>
                      <TrendConfidence>
                        <FiCheckCircle />
                        {Math.round(trend.confidence * 100)}% confidence
                      </TrendConfidence>
                    </TrendCard>
                  ))}
                </TrendGrid>
              </TrendAnalysisSection>
            )}

            <DesignsGrid>
              {results.generated_designs.map((design, index) => {
                // Find corresponding image for this design
                const correspondingImage = results.final_images[index] || null;
                
                return (
                  <DesignCard
                    key={design.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <DesignHeader>
                      <DesignTitle>Design {index + 1}</DesignTitle>
                      <DesignScore score={0.8}>
                        80%
                      </DesignScore>
                    </DesignHeader>

                    {correspondingImage && (
                      <DesignImage>
                        <img src={getImageUrl2(correspondingImage)} alt={`Design ${index + 1}`} />
                      </DesignImage>
                    )}

                    <DesignDetails>
                      <DetailRow>
                        <span className="label">Strategy:</span>
                        <span className="value">{design.strategy}</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="label">Target:</span>
                        <span className="value">{design.target_audience}</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="label">Occasion:</span>
                        <span className="value">{design.occasion}</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="label">Garment Type:</span>
                        <span className="value">{design.garment_type}</span>
                      </DetailRow>
                    </DesignDetails>

                    {/* Design Concept Section */}
                    {design.concept && (
                      <ConceptContainer>
                        <ConceptToggle onClick={() => toggleConcept(design.id)}>
                          💡 Design Concept
                          {expandedConcepts[design.id] ? <FiChevronUp /> : <FiChevronDown />}
                        </ConceptToggle>
                        {expandedConcepts[design.id] && (
                          <ConceptBody
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            {renderConceptText(design.concept)}
                          </ConceptBody>
                        )}
                      </ConceptContainer>
                    )}

                    <DesignActions>
                      {correspondingImage && (
                        <>
                          <ActionButton
                            className="primary"
                            onClick={() => viewDesign(correspondingImage)}
                          >
                            <FiEye />
                            View Image
                          </ActionButton>
                          <ActionButton
                            className="secondary"
                            onClick={() => downloadDesign(correspondingImage)}
                          >
                            <FiDownload />
                            Download
                          </ActionButton>
                        </>
                      )}
                    </DesignActions>
                  </DesignCard>
                );
              })}
            </DesignsGrid>

            {results.market_analysis && (
              <MarketAnalysisSection>
                <MarketTitle>
                  <FiBarChart />
                  Market Analysis
                </MarketTitle>
                <MarketScore score={results.market_analysis.overallScore || 0.8}>
                  <div className="score">{Math.round((results.market_analysis.overallScore || 0.8) * 100)}</div>
                  <div className="label">Market Fit Score</div>
                </MarketScore>
                <MarketGrid>
                  <MarketCard>
                    <MarketCardTitle>Opportunities</MarketCardTitle>
                    <MarketList>
                      {(results.market_analysis.opportunities || []).slice(0, 3).map((opportunity, index) => (
                        <li key={index}>{opportunity}</li>
                      ))}
                    </MarketList>
                  </MarketCard>
                  <MarketCard>
                    <MarketCardTitle>Risks</MarketCardTitle>
                    <MarketList>
                      {(results.market_analysis.risks || []).slice(0, 3).map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </MarketList>
                  </MarketCard>
                  <MarketCard>
                    <MarketCardTitle>Recommendations</MarketCardTitle>
                    <MarketList>
                      {(results.market_analysis.recommendations || []).slice(0, 3).map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </MarketList>
                  </MarketCard>
                </MarketGrid>
              </MarketAnalysisSection>
            )}
          </ResultsSection>
        )}
      </Container>
    </PageContainer>
  );
};

export default AIFashionAgent;
