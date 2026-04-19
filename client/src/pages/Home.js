import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiImage,
  FiZap,
  FiRefreshCw,
  FiUser,
  FiTrendingUp,
  FiVideo,
  FiCheck,
  FiUpload,
  FiCpu,
  FiLayers,
  FiDownload,
} from 'react-icons/fi';
import theme from '../theme';
import {
  Container,
  Section,
  Badge,
  GlassCard,
  ButtonLink,
  GradientText,
  fadeInUp,
  staggerContainer,
  staggerItem,
} from '../components/ui';

// ─── Hero ────────────────────────────────────────────────

const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: ${theme.colors.gradient.hero};
  overflow: hidden;
  padding: ${theme.layout.headerHeight} 0 0;
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(108, 92, 231, 0.25) 0%, transparent 70%);
    top: -100px;
    right: -200px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 206, 201, 0.15) 0%, transparent 70%);
    bottom: -150px;
    left: -100px;
  }
`;

const HeroGrid = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing['3xl']};
  align-items: center;
  padding: ${theme.spacing['4xl']} 0;

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: ${theme.spacing['2xl']} 0;
  }
`;

const HeroContent = styled.div``;

const HeroBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(108, 92, 231, 0.15);
  border: 1px solid rgba(108, 92, 231, 0.25);
  border-radius: ${theme.radius.full};
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${theme.colors.primaryLight};
  margin-bottom: ${theme.spacing.lg};
`;

const HeroTitle = styled(motion.h1)`
  font-size: ${theme.typography.display.size};
  font-weight: ${theme.typography.display.weight};
  line-height: ${theme.typography.display.lineHeight};
  letter-spacing: ${theme.typography.display.letterSpacing};
  color: white;
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 2.75rem;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: 2.25rem;
  }
`;

const HeroDesc = styled(motion.p)`
  font-size: ${theme.typography.bodyLarge.size};
  line-height: ${theme.typography.bodyLarge.lineHeight};
  color: rgba(255, 255, 255, 0.65);
  max-width: 520px;
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: ${theme.breakpoints.lg}) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroCTAs = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.lg}) {
    justify-content: center;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
  }
`;

const HeroVisual = styled(motion.div)`
  position: relative;

  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const VisualCard = styled(GlassCard)`
  padding: ${theme.spacing['2xl']};
`;

const VisualGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const VisualTile = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${theme.radius.md};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;

  svg {
    color: ${props => props.color || theme.colors.primaryLight};
    font-size: 1.5rem;
  }

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    font-weight: 500;
  }
`;

const StatRow = styled.div`
  display: flex;
  gap: ${theme.spacing['2xl']};
  margin-top: ${theme.spacing['2xl']};

  @media (max-width: ${theme.breakpoints.lg}) {
    justify-content: center;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing.xl};
  }
`;

const Stat = styled(motion.div)`
  text-align: left;

  @media (max-width: ${theme.breakpoints.lg}) {
    text-align: center;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
`;

// ─── Features ────────────────────────────────────────────

const FeaturesSection = styled(Section)`
  background: ${theme.colors.background};
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 580px;
  margin: 0 auto ${theme.spacing['3xl']};
`;

const SectionBadge = styled(Badge)`
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.h1.size};
  font-weight: ${theme.typography.h1.weight};
  line-height: ${theme.typography.h1.lineHeight};
  letter-spacing: ${theme.typography.h1.letterSpacing};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.h2.size};
  }
`;

const SectionDesc = styled.p`
  font-size: ${theme.typography.bodyLarge.size};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.bodyLarge.lineHeight};
`;

const FeaturesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion(Link))`
  display: flex;
  flex-direction: column;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.xl};
  text-decoration: none;
  transition: all ${theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.cardHover};
    border-color: ${theme.colors.primaryLight};
  }
`;

const FeatureIconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.radius.md};
  background: ${props => props.bg || theme.colors.primaryGhost};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: ${props => props.color || theme.colors.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.typography.h4.size};
  font-weight: ${theme.typography.h4.weight};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const FeatureDesc = styled.p`
  font-size: ${theme.typography.small.size};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  flex: 1;
`;

const FeatureArrow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-top: ${theme.spacing.lg};
  opacity: 0;
  transform: translateX(-4px);
  transition: all ${theme.transitions.normal};

  ${FeatureCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

// ─── How It Works ────────────────────────────────────────

const WorkflowSection = styled(Section)`
  background: ${theme.colors.surface};
`;

const StepsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.xl};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 36px;
    left: 80px;
    right: 80px;
    height: 2px;
    background: ${theme.colors.borderLight};

    @media (max-width: ${theme.breakpoints.lg}) {
      display: none;
    }
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const Step = styled(motion.div)`
  text-align: center;
  position: relative;
`;

const StepNum = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${theme.radius.full};
  background: ${theme.colors.gradient.primary};
  color: white;
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.lg};
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.25);
`;

const StepTitle = styled.h3`
  font-size: ${theme.typography.h4.size};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const StepDesc = styled.p`
  font-size: ${theme.typography.small.size};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
`;

// ─── CTA Banner ──────────────────────────────────────────

const CTASection = styled(Section)`
  background: ${theme.colors.gradient.hero};
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const CTAInner = styled(motion.div)`
  position: relative;
  z-index: 1;
`;

const CTATitle = styled.h2`
  font-size: ${theme.typography.h1.size};
  font-weight: ${theme.typography.h1.weight};
  color: white;
  margin-bottom: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.h2.size};
  }
`;

const CTADesc = styled.p`
  font-size: ${theme.typography.bodyLarge.size};
  color: rgba(255, 255, 255, 0.6);
  max-width: 500px;
  margin: 0 auto ${theme.spacing['2xl']};
`;

const CTAButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
  }
`;

const CheckList = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  justify-content: center;
  margin-top: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const CheckItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.small.size};
  color: rgba(255, 255, 255, 0.5);

  svg {
    color: ${theme.colors.secondary};
  }
`;

// ─── Component ───────────────────────────────────────────

const features = [
  {
    icon: <FiImage />,
    title: 'Design Studio',
    desc: 'Convert product images to technical flats and generate photorealistic renders in one seamless workflow.',
    color: theme.colors.primary,
    bg: theme.colors.primaryGhost,
    to: '/design-workflow',
  },
  {
    icon: <FiZap />,
    title: 'AI Fashion Agent',
    desc: 'Generate trend-based garment designs using real-time fashion insights and market intelligence.',
    color: '#E17055',
    bg: 'rgba(225, 112, 85, 0.08)',
    to: '/ai-fashion-agent',
  },
  {
    icon: <FiRefreshCw />,
    title: 'Garment Variations',
    desc: 'Create color, material, pattern, and style variations of any garment with AI-powered generation.',
    color: theme.colors.secondary,
    bg: 'rgba(0, 206, 201, 0.08)',
    to: '/garment-variation',
  },
  {
    icon: <FiUser />,
    title: 'Virtual Try-On',
    desc: 'See how designs look on models with AI-powered virtual fitting and environment staging.',
    color: theme.colors.accent,
    bg: 'rgba(253, 121, 168, 0.08)',
    to: '/virtual-tryon',
  },
  {
    icon: <FiTrendingUp />,
    title: 'Trend Analysis',
    desc: 'Stay ahead with real-time fashion trend analysis, market insights, and demand forecasting.',
    color: '#6C5CE7',
    bg: 'rgba(108, 92, 231, 0.08)',
    to: '/ai-fashion-agent',
  },
  {
    icon: <FiVideo />,
    title: 'Video Generation',
    desc: 'Create fashion shoot videos of your designs with AI-powered video synthesis and animation.',
    color: '#00B894',
    bg: 'rgba(0, 184, 148, 0.08)',
    to: '/design-workflow',
  },
];

const steps = [
  { icon: <FiUpload />, title: 'Upload', desc: 'Upload your product image or describe your design concept' },
  { icon: <FiCpu />, title: 'AI Processing', desc: 'Our AI analyzes structure, trends, and design patterns' },
  { icon: <FiLayers />, title: 'Generate', desc: 'Get technical flats, renders, or trend-based designs' },
  { icon: <FiDownload />, title: 'Export', desc: 'Download production-ready assets and design variations' },
];

const Home = () => {
  return (
    <>
      {/* ── Hero ─────────────────────────── */}
      <HeroSection>
        <HeroBg />
        <Container>
          <HeroGrid>
            <HeroContent>
              <HeroBadge {...fadeInUp}>
                <FiZap size={14} /> AI-Powered Fashion Design
              </HeroBadge>

              <HeroTitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                Design the future of fashion with{' '}
                <GradientText gradient="linear-gradient(135deg, #A29BFE 0%, #00CEC9 100%)">
                  AI
                </GradientText>
              </HeroTitle>

              <HeroDesc
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Transform product images into technical flats, generate trend-aware designs,
                create variations, and visualize with virtual try-on — all in one platform.
              </HeroDesc>

              <HeroCTAs
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <ButtonLink to="/design-workflow" variant="white" size="lg">
                  Start Designing <FiArrowRight />
                </ButtonLink>
                <ButtonLink to="/ai-fashion-agent" variant="outline-white" size="lg">
                  Explore AI Agent
                </ButtonLink>
              </HeroCTAs>

              <StatRow>
                {[
                  { value: '10K+', label: 'Designs Generated' },
                  { value: '95%', label: 'Accuracy Rate' },
                  { value: '50x', label: 'Faster Workflow' },
                ].map((stat, i) => (
                  <Stat
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                  >
                    <StatValue>{stat.value}</StatValue>
                    <StatLabel>{stat.label}</StatLabel>
                  </Stat>
                ))}
              </StatRow>
            </HeroContent>

            <HeroVisual
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <VisualCard>
                <VisualGrid>
                  <VisualTile color={theme.colors.primaryLight}>
                    <FiImage />
                    <span>Image to Flat</span>
                  </VisualTile>
                  <VisualTile color={theme.colors.secondary}>
                    <FiLayers />
                    <span>Flat to Render</span>
                  </VisualTile>
                  <VisualTile color={theme.colors.accent}>
                    <FiRefreshCw />
                    <span>Variations</span>
                  </VisualTile>
                  <VisualTile color="#FDCB6E">
                    <FiTrendingUp />
                    <span>Trend Analysis</span>
                  </VisualTile>
                </VisualGrid>
              </VisualCard>
            </HeroVisual>
          </HeroGrid>
        </Container>
      </HeroSection>

      {/* ── Features ─────────────────────── */}
      <FeaturesSection>
        <Container>
          <SectionHeader>
            <SectionBadge>Platform</SectionBadge>
            <SectionTitle>Everything you need to design</SectionTitle>
            <SectionDesc>
              From concept to production-ready assets, StyleSynapse brings AI to every
              step of your fashion design workflow.
            </SectionDesc>
          </SectionHeader>

          <FeaturesGrid
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {features.map((f, i) => (
              <FeatureCard key={i} to={f.to} variants={staggerItem}>
                <FeatureIconWrap color={f.color} bg={f.bg}>
                  {f.icon}
                </FeatureIconWrap>
                <FeatureTitle>{f.title}</FeatureTitle>
                <FeatureDesc>{f.desc}</FeatureDesc>
                <FeatureArrow>
                  Try it now <FiArrowRight size={14} />
                </FeatureArrow>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </Container>
      </FeaturesSection>

      {/* ── How It Works ─────────────────── */}
      <WorkflowSection>
        <Container>
          <SectionHeader>
            <SectionBadge variant="success">Workflow</SectionBadge>
            <SectionTitle>Four steps to your next design</SectionTitle>
            <SectionDesc>
              A streamlined process that takes you from raw inspiration to
              polished, production-ready fashion designs.
            </SectionDesc>
          </SectionHeader>

          <StepsGrid
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {steps.map((step, i) => (
              <Step key={i} variants={staggerItem}>
                <StepNum>{i + 1}</StepNum>
                <StepTitle>{step.title}</StepTitle>
                <StepDesc>{step.desc}</StepDesc>
              </Step>
            ))}
          </StepsGrid>
        </Container>
      </WorkflowSection>

      {/* ── Bottom CTA ───────────────────── */}
      <CTASection>
        <Container>
          <CTAInner
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <CTATitle>Ready to transform your design workflow?</CTATitle>
            <CTADesc>
              Join thousands of designers using AI to create, iterate, and ship
              fashion designs faster than ever.
            </CTADesc>
            <CTAButtons>
              <ButtonLink to="/design-workflow" variant="white" size="lg">
                Get Started Free <FiArrowRight />
              </ButtonLink>
              <ButtonLink to="/ai-fashion-agent" variant="outline-white" size="lg">
                See AI in Action
              </ButtonLink>
            </CTAButtons>
            <CheckList>
              <CheckItem><FiCheck size={16} /> No credit card required</CheckItem>
              <CheckItem><FiCheck size={16} /> Unlimited designs</CheckItem>
              <CheckItem><FiCheck size={16} /> Export in any format</CheckItem>
            </CheckList>
          </CTAInner>
        </Container>
      </CTASection>
    </>
  );
};

export default Home;
