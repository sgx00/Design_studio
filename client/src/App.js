import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import theme from './theme';
import { Spinner } from './components/ui';

const DesignWorkflow = lazy(() => import('./pages/DesignWorkflow'));
const BatchProcess = lazy(() => import('./pages/BatchProcess'));
const AIFashionAgent = lazy(() => import('./pages/AIFashionAgent'));
const GarmentVariation = lazy(() => import('./pages/GarmentVariation'));
const VirtualTryOn = lazy(() => import('./pages/VirtualTryOn'));

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  padding-top: ${props => props.$nopad ? '0' : theme.layout.headerHeight};
`;

const LoadingWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const PageFallback = () => (
  <LoadingWrap>
    <Spinner size="40px" />
  </LoadingWrap>
);

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <AppContainer>
      <Header />
      <Main $nopad={isHome}>
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/design-workflow" element={<DesignWorkflow />} />
                <Route path="/batch-process" element={<BatchProcess />} />
                <Route path="/ai-fashion-agent" element={<AIFashionAgent />} />
                <Route path="/garment-variation" element={<GarmentVariation />} />
                <Route path="/virtual-tryon" element={<VirtualTryOn />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </Main>
      <Footer />
    </AppContainer>
  );
}

export default App;
