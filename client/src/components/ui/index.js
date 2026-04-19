import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import theme from '../../theme';

// ─── Layout ──────────────────────────────────────────────

export const Section = styled.section`
  padding: ${theme.spacing['4xl']} 0;

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing['2xl']} 0;
  }
`;

export const Container = styled.div`
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0 ${theme.spacing.lg};
  }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

// ─── Typography ──────────────────────────────────────────

export const Display = styled.h1`
  font-size: ${theme.typography.display.size};
  font-weight: ${theme.typography.display.weight};
  line-height: ${theme.typography.display.lineHeight};
  letter-spacing: ${theme.typography.display.letterSpacing};
  color: ${props => props.color || theme.colors.text};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

export const Heading = styled.h2`
  font-size: ${theme.typography.h2.size};
  font-weight: ${theme.typography.h2.weight};
  line-height: ${theme.typography.h2.lineHeight};
  letter-spacing: ${theme.typography.h2.letterSpacing};
  color: ${props => props.color || theme.colors.text};
`;

export const Subheading = styled.h3`
  font-size: ${theme.typography.h3.size};
  font-weight: ${theme.typography.h3.weight};
  line-height: ${theme.typography.h3.lineHeight};
  color: ${props => props.color || theme.colors.text};
`;

export const Text = styled.p`
  font-size: ${props => props.large ? theme.typography.bodyLarge.size : theme.typography.body.size};
  font-weight: ${theme.typography.body.weight};
  line-height: ${props => props.large ? theme.typography.bodyLarge.lineHeight : theme.typography.body.lineHeight};
  color: ${props => props.color || theme.colors.textSecondary};
`;

export const Caption = styled.span`
  font-size: ${theme.typography.caption.size};
  font-weight: ${theme.typography.caption.weight};
  line-height: ${theme.typography.caption.lineHeight};
  letter-spacing: ${theme.typography.caption.letterSpacing};
  text-transform: uppercase;
  color: ${props => props.color || theme.colors.textMuted};
`;

export const GradientText = styled.span`
  background: ${props => props.gradient || theme.colors.gradient.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// ─── Buttons ─────────────────────────────────────────────

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily};
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all ${theme.transitions.normal};
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const buttonSizes = {
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    border-radius: ${theme.radius.sm};
  `,
  md: css`
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    border-radius: ${theme.radius.md};
  `,
  lg: css`
    padding: 1rem 2rem;
    font-size: 1.0625rem;
    border-radius: ${theme.radius.md};
  `,
};

export const Button = styled.button`
  ${buttonBase}
  ${props => buttonSizes[props.size || 'md']}

  ${props => props.variant === 'secondary' && css`
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border: 1.5px solid ${theme.colors.border};

    &:hover:not(:disabled) {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
      background: ${theme.colors.primaryGhost};
    }
  `}

  ${props => props.variant === 'ghost' && css`
    background: transparent;
    color: ${theme.colors.textSecondary};

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryGhost};
      color: ${theme.colors.primary};
    }
  `}

  ${props => (!props.variant || props.variant === 'primary') && css`
    background: ${theme.colors.primary};
    color: white;
    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryDark};
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(108, 92, 231, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}

  ${props => props.variant === 'accent' && css`
    background: ${theme.colors.gradient.warm};
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(253, 121, 168, 0.4);
    }
  `}
`;

export const ButtonLink = styled(Link)`
  ${buttonBase}
  ${props => buttonSizes[props.size || 'md']}

  ${props => (!props.variant || props.variant === 'primary') && css`
    background: ${theme.colors.primary};
    color: white;
    box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);

    &:hover {
      background: ${theme.colors.primaryDark};
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(108, 92, 231, 0.4);
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background: ${theme.colors.surface};
    color: ${theme.colors.text};
    border: 1.5px solid ${theme.colors.border};

    &:hover {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
      background: ${theme.colors.primaryGhost};
    }
  `}

  ${props => props.variant === 'white' && css`
    background: white;
    color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.md};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `}

  ${props => props.variant === 'outline-white' && css`
    background: transparent;
    color: white;
    border: 1.5px solid rgba(255, 255, 255, 0.4);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
    }
  `}
`;

// ─── Cards ───────────────────────────────────────────────

export const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.colors.borderLight};
  padding: ${props => props.padding || theme.spacing.xl};
  transition: all ${theme.transitions.normal};

  ${props => props.hoverable && css`
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${theme.shadows.cardHover};
      border-color: ${theme.colors.primaryLight};
    }
  `}
`;

export const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${theme.radius.lg};
  padding: ${props => props.padding || theme.spacing.xl};
`;

// ─── Badge / Pill ────────────────────────────────────────

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 0.3rem 0.75rem;
  font-size: ${theme.typography.caption.size};
  font-weight: 600;
  border-radius: ${theme.radius.full};
  letter-spacing: 0.02em;

  ${props => (!props.variant || props.variant === 'primary') && css`
    background: ${theme.colors.primaryGhost};
    color: ${theme.colors.primary};
  `}

  ${props => props.variant === 'success' && css`
    background: rgba(0, 184, 148, 0.1);
    color: ${theme.colors.success};
  `}

  ${props => props.variant === 'warning' && css`
    background: rgba(253, 203, 110, 0.15);
    color: #E17055;
  `}

  ${props => props.variant === 'accent' && css`
    background: rgba(253, 121, 168, 0.1);
    color: ${theme.colors.accent};
  `}
`;

// ─── Input ───────────────────────────────────────────────

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.body.size};
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  transition: all ${theme.transitions.fast};
  outline: none;

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryGhost};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.body.size};
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  transition: all ${theme.transitions.fast};
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23636E72' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryGhost};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.body.size};
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.radius.md};
  transition: all ${theme.transitions.fast};
  outline: none;
  resize: vertical;
  min-height: 100px;

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryGhost};
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const Label = styled.label`
  font-size: ${theme.typography.small.size};
  font-weight: 600;
  color: ${theme.colors.text};
`;

// ─── Upload Zone ─────────────────────────────────────────

export const UploadZone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing['2xl']};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  background: ${props => props.isDragActive ? theme.colors.primaryGhost : 'transparent'};

  &:hover {
    border-color: ${theme.colors.primaryLight};
    background: ${theme.colors.primaryGhost};
  }
`;

// ─── Divider ─────────────────────────────────────────────

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${theme.colors.borderLight};
  margin: ${props => props.spacing || theme.spacing.xl} 0;
`;

// ─── Animations ──────────────────────────────────────────

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const Skeleton = styled.div`
  background: linear-gradient(90deg, ${theme.colors.borderLight} 25%, #e8e6f0 50%, ${theme.colors.borderLight} 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${theme.radius.md};
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '1rem'};
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: ${props => props.size || '32px'};
  height: ${props => props.size || '32px'};
  border: 3px solid ${theme.colors.borderLight};
  border-top-color: ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// ─── Grid Helpers ────────────────────────────────────────

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 3}, 1fr);
  gap: ${props => props.gap || theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || theme.spacing.md};
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;

// ─── Motion Presets ──────────────────────────────────────

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
