import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiImage, FiLayers, FiGrid, FiZap, FiTrendingUp, FiTarget, FiRefreshCw } from 'react-icons/fi';

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(motion(Link))`
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const FeaturesSection = styled.section`
  padding: 5rem 0;
  background: white;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 3rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const WorkflowSection = styled.section`
  padding: 5rem 0;
  background: #f8f9fa;
`;

const WorkflowContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const WorkflowSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const WorkflowStep = styled(motion.div)`
  text-align: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 40px;
    right: -1rem;
    width: 2rem;
    height: 2px;
    background: #667eea;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1rem;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;



const Home = () => {
  const features = [
    {
      icon: <FiImage />,
      title: 'Complete Design Workflow',
      description: 'Convert product images to technical flats and generate realistic final renders in one seamless workflow.'
    },
    {
      icon: <FiLayers />,
      title: 'AI-Powered Conversion',
      description: 'Transform product images into technical flat drawings with AI-powered edge detection and structure analysis.'
    },
    {
      icon: <FiGrid />,
      title: 'Batch Processing',
      description: 'Process multiple images simultaneously with our efficient batch processing pipeline.'
    },
    {
      icon: <FiZap />,
      title: 'AI Fashion Agent',
      description: 'Generate trend-based garment designs using the latest fashion insights and AI technology.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Trend Analysis',
      description: 'Stay ahead with real-time fashion trend analysis and market insights.'
    },
    {
      icon: <FiTarget />,
      title: 'Market Intelligence',
      description: 'Get detailed market analysis and recommendations for your designs.'
    },
    {
      icon: <FiRefreshCw />,
      title: 'Garment Variations',
      description: 'Create multiple style variations of your garments with different colors, materials, and patterns.'
    }
  ];

  const workflowSteps = [
    {
      number: '1',
      title: 'Upload Image',
      description: 'Upload your product image in any common format (JPG, PNG, etc.)'
    },
    {
      number: '2',
      title: 'AI Processing',
      description: 'Our AI analyzes the image and extracts garment structure and details'
    },
    {
      number: '3',
      title: 'Generate Flat',
      description: 'Get a clean technical flat drawing with measurement lines and details'
    },
    {
      number: '4',
      title: 'Create Final Render',
      description: 'Apply materials, colors, and lighting to generate realistic final images'
    }
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            StyleSynapse.ai - Transform Your Design Workflow
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Convert product images to technical flats and generate realistic final renders 
            with StyleSynapse.ai's advanced neural network-powered design platform.
          </HeroSubtitle>
          <CTAButton
            to="/design-workflow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </CTAButton>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <FeaturesContainer>
          <SectionTitle>Powerful Features</SectionTitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      <WorkflowSection>
        <WorkflowContainer>
          <SectionTitle>How It Works</SectionTitle>
          <WorkflowSteps>
            {workflowSteps.map((step, index) => (
              <WorkflowStep
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </WorkflowStep>
            ))}
          </WorkflowSteps>
        </WorkflowContainer>
      </WorkflowSection>
    </HomeContainer>
  );
};

export default Home;
