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
  FiCheckCircle
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const MainSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  select, input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSection = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 2rem 0;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
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

const LoadingText = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ResultsTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ResultsStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const DesignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const DesignCard = styled(motion.div)`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  max-height: 600px;
  overflow-y: auto;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
  background: ${props => props.score > 0.8 ? '#28a745' : props.score > 0.6 ? '#ffc107' : '#dc3545'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
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
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  }
  
  &.secondary {
    background: #e9ecef;
    color: #333;
    
    &:hover {
      background: #dee2e6;
    }
  }
`;

const TrendAnalysisSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
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
  border-radius: 8px;
  border-left: 4px solid #667eea;
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
  color: #28a745;
  font-weight: 600;
`;

const MarketAnalysisSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
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
    font-weight: 700;
    color: ${props => props.score > 0.8 ? '#28a745' : props.score > 0.6 ? '#ffc107' : '#dc3545'};
  }
  
  .label {
    color: #666;
    font-size: 0.9rem;
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
  border-radius: 8px;
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
      color: #667eea;
    }
  }
`;

const DesignConceptSection = styled.div`
  margin-bottom: 1rem;
  
  h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &:before {
      content: '💡';
      font-size: 1rem;
    }
  }
  
  .concept-text {
    font-size: 0.8rem;
    color: #666;
    line-height: 1.4;
    max-height: 120px;
    overflow-y: auto;
    padding: 0.75rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    white-space: pre-wrap;
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
                    <DesignConceptSection>
                      <h4>Design Concept</h4>
                      <div className="concept-text">
                        {design.concept}
                      </div>
                    </DesignConceptSection>

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
