import React from 'react';
import styled from 'styled-components';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    color: #667eea;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: #666;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: #667eea;
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #764ba2;
    transform: translateY(-2px);
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  color: #666;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>AI Design Platform</h3>
          <p>
            Transform your design workflow with AI-powered image processing. 
            Convert product images to technical flats and generate realistic final renders.
          </p>
          <SocialLinks>
            <SocialLink href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FiGithub />
            </SocialLink>
            <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FiTwitter />
            </SocialLink>
            <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FiLinkedin />
            </SocialLink>
            <SocialLink href="mailto:contact@aidesignplatform.com">
              <FiMail />
            </SocialLink>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Features</h3>
          <ul>
            <li><a href="/image-to-flat">Image to Flat Conversion</a></li>
            <li><a href="/flat-to-final">Flat to Final Generation</a></li>
            <li><a href="/batch-process">Batch Processing</a></li>
            <li><a href="/gallery">Design Gallery</a></li>
          </ul>
        </FooterSection>
        
        <FooterSection>
          <h3>Resources</h3>
          <ul>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/api">API Reference</a></li>
            <li><a href="/tutorials">Tutorials</a></li>
            <li><a href="/examples">Examples</a></li>
          </ul>
        </FooterSection>
        
        <FooterSection>
          <h3>Support</h3>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/feedback">Feedback</a></li>
            <li><a href="/status">System Status</a></li>
          </ul>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        <p>&copy; 2024 AI Design Platform. All rights reserved.</p>
        <p>Built with ❤️ for designers and creators</p>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
