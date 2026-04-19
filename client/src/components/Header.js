import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiChevronRight } from 'react-icons/fi';
import theme from '../theme';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${theme.layout.headerHeight};
  background: ${props => props.$scrolled
    ? 'rgba(255, 255, 255, 0.92)'
    : 'transparent'};
  backdrop-filter: ${props => props.$scrolled ? 'blur(20px) saturate(180%)' : 'none'};
  border-bottom: 1px solid ${props => props.$scrolled
    ? theme.colors.borderLight
    : 'transparent'};
  z-index: 1000;
  transition: all ${theme.transitions.normal};
`;

const Nav = styled.nav`
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 ${theme.spacing.xl};
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  z-index: 10;
`;

const LogoMark = styled.div`
  width: 34px;
  height: 34px;
  background: ${theme.colors.gradient.primary};
  border-radius: ${theme.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 1rem;
  letter-spacing: -0.5px;
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$light && !props.$scrolled ? 'white' : theme.colors.text};
  transition: color ${theme.transitions.normal};

  span {
    color: ${theme.colors.primary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const NavItem = styled(Link)`
  position: relative;
  color: ${props => {
    if (props.$active) return theme.colors.primary;
    if (props.$light && !props.$scrolled) return 'rgba(255, 255, 255, 0.85)';
    return theme.colors.textSecondary;
  }};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 0.875rem;
  border-radius: ${theme.radius.sm};
  transition: all ${theme.transitions.fast};

  &:hover {
    color: ${props => props.$light && !props.$scrolled ? 'white' : theme.colors.primary};
    background: ${props => props.$light && !props.$scrolled
      ? 'rgba(255, 255, 255, 0.1)'
      : theme.colors.primaryGhost};
  }

  ${props => props.$active && `
    background: ${theme.colors.primaryGhost};
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 2px;
      background: ${theme.colors.primary};
      border-radius: 1px;
    }
  `}
`;

const CTALink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background: ${theme.colors.primary};
  border-radius: ${theme.radius.full};
  text-decoration: none;
  transition: all ${theme.transitions.normal};
  margin-left: 0.5rem;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.$light && !props.$scrolled ? 'white' : theme.colors.text};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.radius.sm};
  transition: all ${theme.transitions.fast};
  z-index: 10;

  &:hover {
    background: ${theme.colors.primaryGhost};
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;

  @media (min-width: calc(${theme.breakpoints.lg} + 1px)) {
    display: none;
  }
`;

const MobileDrawer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  max-width: 85vw;
  height: 100vh;
  background: white;
  z-index: 999;
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.1);

  @media (min-width: calc(${theme.breakpoints.lg} + 1px)) {
    display: none;
  }
`;

const MobileNavItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${props => props.$active ? theme.colors.primary : theme.colors.text};
  text-decoration: none;
  font-weight: ${props => props.$active ? 600 : 500};
  padding: 0.875rem 1rem;
  border-radius: ${theme.radius.md};
  transition: all ${theme.transitions.fast};
  background: ${props => props.$active ? theme.colors.primaryGhost : 'transparent'};

  &:hover {
    background: ${theme.colors.primaryGhost};
    color: ${theme.colors.primary};
  }
`;

const MobileCTA = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  font-weight: 600;
  color: white;
  background: ${theme.colors.primary};
  border-radius: ${theme.radius.md};
  text-decoration: none;
  margin-top: auto;
  margin-bottom: ${theme.spacing.xl};
  transition: all ${theme.transitions.normal};

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/design-workflow', label: 'Design Studio' },
  { path: '/ai-fashion-agent', label: 'AI Agent' },
  { path: '/garment-variation', label: 'Variations' },
  { path: '/virtual-tryon', label: 'Virtual Try-On' },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <HeaderContainer $scrolled={scrolled || !isHome}>
      <Nav>
        <LogoLink to="/">
          <LogoText $light={isHome} $scrolled={scrolled}>
            Style<span>Synapse</span>
          </LogoText>
        </LogoLink>

        <NavLinks>
          {navItems.map(item => (
            <NavItem
              key={item.path}
              to={item.path}
              $active={location.pathname === item.path}
              $light={isHome}
              $scrolled={scrolled}
            >
              {item.label}
            </NavItem>
          ))}
        </NavLinks>

        <CTALink to="/design-workflow">
          Start Designing <FiChevronRight size={14} />
        </CTALink>

        <MobileButton
          onClick={() => setIsOpen(!isOpen)}
          $light={isHome}
          $scrolled={scrolled}
          aria-label="Toggle menu"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </MobileButton>
      </Nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <MobileOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <MobileDrawer
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {navItems.map(item => (
                <MobileNavItem
                  key={item.path}
                  to={item.path}
                  $active={location.pathname === item.path}
                >
                  {item.label}
                  <FiChevronRight size={16} />
                </MobileNavItem>
              ))}
              <MobileCTA to="/design-workflow">
                Start Designing
              </MobileCTA>
            </MobileDrawer>
          </>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
};

export default Header;
