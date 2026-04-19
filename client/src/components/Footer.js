import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowUpRight } from 'react-icons/fi';
import theme from '../theme';

const FooterWrap = styled.footer`
  background: ${theme.colors.gradient.dark};
  color: rgba(255, 255, 255, 0.7);
  padding: ${theme.spacing['4xl']} 0 ${theme.spacing.xl};
  margin-top: auto;
`;

const Inner = styled.div`
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 ${theme.spacing.xl};
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: ${theme.spacing['2xl']};
  padding-bottom: ${theme.spacing['2xl']};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const BrandCol = styled.div``;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: ${theme.spacing.md};
`;

const BrandName = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
`;

const BrandDesc = styled.p`
  font-size: ${theme.typography.small.size};
  line-height: 1.7;
  max-width: 280px;
  margin-bottom: ${theme.spacing.lg};
`;

const SocialRow = styled.div`
  display: flex;
  gap: 0.625rem;
`;

const SocialIcon = styled.a`
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  transition: all ${theme.transitions.fast};
  font-size: 1rem;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

const ColTitle = styled.h4`
  font-size: ${theme.typography.caption.size};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: ${theme.spacing.lg};
`;

const ColLinks = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const ColLink = styled.li`
  a {
    font-size: ${theme.typography.small.size};
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: color ${theme.transitions.fast};
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;

    &:hover {
      color: white;
    }
  }
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${theme.spacing.xl};
  font-size: ${theme.typography.caption.size};
  color: rgba(255, 255, 255, 0.3);

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
    text-align: center;
  }
`;

const Footer = () => {
  return (
    <FooterWrap>
      <Inner>
        <TopRow>
          <BrandCol>
            <BrandLogo>
              <BrandName>StyleSynapse</BrandName>
            </BrandLogo>
            <BrandDesc>
              From concept to collection — design, iterate, and visualize
              fashion faster with advanced generative AI orchestration.
            </BrandDesc>
            <SocialRow>
              <SocialIcon href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub />
              </SocialIcon>
              <SocialIcon href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FiTwitter />
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin />
              </SocialIcon>
              <SocialIcon href="mailto:contact@stylesynapse.ai" aria-label="Email">
                <FiMail />
              </SocialIcon>
            </SocialRow>
          </BrandCol>

          <div>
            <ColTitle>Platform</ColTitle>
            <ColLinks>
              <ColLink><Link to="/design-workflow">Design Studio</Link></ColLink>
              <ColLink><Link to="/ai-fashion-agent">AI Fashion Agent</Link></ColLink>
              <ColLink><Link to="/garment-variation">Garment Variations</Link></ColLink>
              <ColLink><Link to="/virtual-tryon">Virtual Try-On</Link></ColLink>
            </ColLinks>
          </div>

          <div>
            <ColTitle>Resources</ColTitle>
            <ColLinks>
              <ColLink><Link to="/">Getting Started</Link></ColLink>
              <ColLink><Link to="/">API Documentation <FiArrowUpRight size={11} /></Link></ColLink>
              <ColLink><Link to="/">Tutorials</Link></ColLink>
              <ColLink><Link to="/">Changelog</Link></ColLink>
            </ColLinks>
          </div>

          <div>
            <ColTitle>Company</ColTitle>
            <ColLinks>
              <ColLink><Link to="/">About</Link></ColLink>
              <ColLink><Link to="/">Privacy Policy</Link></ColLink>
              <ColLink><Link to="/">Terms of Service</Link></ColLink>
              <ColLink><Link to="/">Contact</Link></ColLink>
            </ColLinks>
          </div>
        </TopRow>

        <BottomRow>
          <span>&copy; {new Date().getFullYear()} StyleSynapse.ai. All rights reserved.</span>
          <span>Made for designers, powered by AI</span>
        </BottomRow>
      </Inner>
    </FooterWrap>
  );
};

export default Footer;
