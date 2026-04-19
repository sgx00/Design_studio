import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiUpload,
  FiUser,
  FiShoppingBag,
  FiZap,
  FiDownload,
  FiRefreshCw,
  FiChevronDown,
  FiX,
  FiCamera,
} from 'react-icons/fi';

const fastapi = axios.create({ baseURL: 'http://localhost:8000', timeout: 120000 });

// ─── Animations ──────────────────────────────────────────────────────────────

const spin = keyframes`to { transform: rotate(360deg); }`;
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ─── Layout ──────────────────────────────────────────────────────────────────

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FE;
  padding: 2rem 1.5rem 4rem;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

const PageTitle = styled(motion.h1)`
  text-align: center;
  font-size: 2.25rem;
  font-weight: 700;
  color: #2D3436;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: #636E72;
  font-size: 1.05rem;
  margin-bottom: 2.5rem;
`;

// ─── Upload panels ────────────────────────────────────────────────────────────

const UploadGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const UploadPanel = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #E8E6F0;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid #F0EFF5;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const PanelIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const PanelTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0;
`;

const PanelHint = styled.p`
  font-size: 0.75rem;
  color: #999;
  margin: 0 0 0 auto;
`;

const DropZone = styled.div`
  margin: 1rem;
  border: 2px dashed ${({ $active, $hasFile }) =>
    $hasFile ? '#6C5CE7' : $active ? '#A29BFE' : '#E8E6F0'};
  border-radius: 16px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? 'rgba(108, 92, 231, 0.04)' : '#FAFAFE')};
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #A29BFE;
    background: rgba(108, 92, 231, 0.03);
  }
`;

const DropIcon = styled.div`
  font-size: 2rem;
  color: #ccc;
`;

const DropText = styled.p`
  font-size: 0.85rem;
  color: #999;
  text-align: center;
  margin: 0;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 240px;
  border-radius: 10px;
`;

const ClearButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  z-index: 2;
  &:hover { background: rgba(0,0,0,0.75); }
`;

// ─── Options row ─────────────────────────────────────────────────────────────

const OptionsCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #E8E6F0;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`;

const OptionsTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const OptionsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const SelectGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const SelectWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  padding: 0.45rem 2rem 0.45rem 0.75rem;
  border: 1.5px solid #E8E6F0;
  border-radius: 10px;
  font-size: 0.875rem;
  background: white;
  color: #2D3436;
  appearance: none;
  cursor: pointer;
  min-width: 150px;
  &:focus { outline: none; border-color: #6C5CE7; box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.08); }
`;

const SelectArrow = styled(FiChevronDown)`
  position: absolute;
  right: 8px;
  pointer-events: none;
  color: #999;
  font-size: 0.9rem;
`;

// ─── Generate button ──────────────────────────────────────────────────────────

const GenerateButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 2rem;
  background: ${({ disabled }) => disabled ? '#E8E6F0' : '#6C5CE7'};
  color: ${({ disabled }) => (disabled ? '#B2BEC3' : 'white')};
  box-shadow: ${({ disabled }) =>
    disabled ? 'none' : '0 2px 8px rgba(108, 92, 231, 0.3)'};
  transition: all 0.2s;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ disabled }) => disabled ? '#E8E6F0' : '#5A4BD1'};
    box-shadow: ${({ disabled }) =>
      disabled ? 'none' : '0 4px 16px rgba(108, 92, 231, 0.4)'};
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-1px)'};
  }
`;

// ─── Loading state ────────────────────────────────────────────────────────────

const LoadingCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  border: 1px solid #E8E6F0;
  margin-bottom: 2rem;
`;

const Spinner = styled.div`
  width: 44px;
  height: 44px;
  border: 3px solid #F0EFF5;
  border-top: 3px solid #6C5CE7;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 1.25rem;
`;

const LoadingShimmer = styled.div`
  height: 260px;
  border-radius: 12px;
  background: linear-gradient(90deg, #F0EFF5 25%, #E8E6F0 50%, #F0EFF5 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  margin-top: 1.5rem;
`;

const LoadingText = styled.p`
  color: #555;
  font-size: 0.95rem;
  margin: 0 0 0.4rem;
  font-weight: 500;
`;

const LoadingSubtext = styled.p`
  color: #aaa;
  font-size: 0.8rem;
  margin: 0;
  animation: ${pulse} 2s infinite;
`;

// ─── Result ───────────────────────────────────────────────────────────────────

const ResultCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #E8E6F0;
  margin-bottom: 2rem;
`;

const ResultHeader = styled.div`
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  font-size: 0.95rem;
`;

const ResultBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ResultImageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
  text-align: center;
`;

const ResultImage = styled.img`
  width: 100%;
  border-radius: 10px;
  object-fit: contain;
  max-height: 340px;
  border: 1px solid #f0f0f0;
`;

const ResultActions = styled.div`
  padding: 0 1.25rem 1.25rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.2rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $primary }) => $primary ? '#6C5CE7' : 'transparent'};
  color: ${({ $primary }) => ($primary ? 'white' : '#636E72')};
  border: ${({ $primary }) => $primary ? 'none' : '1.5px solid #E8E6F0'};
  &:hover {
    transform: translateY(-1px);
    ${({ $primary }) => $primary
      ? 'background: #5A4BD1; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);'
      : 'border-color: #6C5CE7; color: #6C5CE7;'}
  }
`;

// ─── How it works ─────────────────────────────────────────────────────────────

const HowItWorksRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HowCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  border: 1px solid #E8E6F0;
`;

const HowNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
`;

const HowTitle = styled.p`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.3rem;
`;

const HowDesc = styled.p`
  font-size: 0.78rem;
  color: #888;
  margin: 0;
  line-height: 1.5;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const VirtualTryOn = () => {
  const [personFile, setPersonFile] = useState(null);
  const [garmentFile, setGarmentFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [garmentPreview, setGarmentPreview] = useState(null);
  const [options, setOptions] = useState({ style: '', background: 'studio' });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // { resultUrl, personPreview, garmentPreview }

  const handlePersonDrop = useCallback((files) => {
    if (!files.length) return;
    const file = files[0];
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const handleGarmentDrop = useCallback((files) => {
    if (!files.length) return;
    const file = files[0];
    setGarmentFile(file);
    setGarmentPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const { getRootProps: getPersonProps, getInputProps: getPersonInput, isDragActive: personDrag } =
    useDropzone({ onDrop: handlePersonDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  const { getRootProps: getGarmentProps, getInputProps: getGarmentInput, isDragActive: garmentDrag } =
    useDropzone({ onDrop: handleGarmentDrop, accept: { 'image/*': [] }, maxFiles: 1 });

  const clearPerson = (e) => {
    e.stopPropagation();
    setPersonFile(null);
    setPersonPreview(null);
    setResult(null);
  };

  const clearGarment = (e) => {
    e.stopPropagation();
    setGarmentFile(null);
    setGarmentPreview(null);
    setResult(null);
  };

  const handleTryOn = async () => {
    if (!personFile || !garmentFile) {
      toast.error('Please upload both a person photo and a garment image.');
      return;
    }
    setIsLoading(true);
    setResult(null);

    const form = new FormData();
    form.append('person_image', personFile);
    form.append('garment_image', garmentFile);
    form.append('style', options.style);
    form.append('background', options.background);

    try {
      const res = await fastapi.post('/api/v1/tryon', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resultUrl = `http://localhost:3001${res.data.result_url}`;
      setResult({
        resultUrl,
        personPreview,
        garmentPreview,
      });
      toast.success('Virtual try-on complete!');
    } catch (err) {
      console.error('Try-on error:', err);
      const msg = err.response?.data?.detail || 'Try-on generation failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonFile(null);
    setGarmentFile(null);
    setPersonPreview(null);
    setGarmentPreview(null);
    setResult(null);
    setOptions({ style: '', background: 'studio' });
  };

  const canGenerate = personFile && garmentFile && !isLoading;

  return (
    <PageContainer>
      <Container>
        <PageTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Virtual Try-On
        </PageTitle>
        <PageSubtitle>
          Upload a person photo and a garment — AI dresses them in seconds.
        </PageSubtitle>

        {/* How it works */}
        <HowItWorksRow>
          <HowCard>
            <HowNumber>1</HowNumber>
            <HowTitle>Upload a person photo</HowTitle>
            <HowDesc>Full-body or half-body photo with the face visible works best.</HowDesc>
          </HowCard>
          <HowCard>
            <HowNumber>2</HowNumber>
            <HowTitle>Upload the garment</HowTitle>
            <HowDesc>Use a flat-lay, model, or product shot of the clothing item.</HowDesc>
          </HowCard>
          <HowCard>
            <HowNumber>3</HowNumber>
            <HowTitle>Generate the try-on</HowTitle>
            <HowDesc>Gemini composites the garment onto the person with photorealistic quality.</HowDesc>
          </HowCard>
        </HowItWorksRow>

        {/* Upload panels */}
        <UploadGrid>
          {/* Person panel */}
          <UploadPanel>
            <PanelHeader>
              <PanelIcon><FiUser /></PanelIcon>
              <PanelTitle>Person Photo</PanelTitle>
              <PanelHint>JPG / PNG</PanelHint>
            </PanelHeader>
            <DropZone
              {...getPersonProps()}
              $active={personDrag}
              $hasFile={!!personPreview}
            >
              <input {...getPersonInput()} />
              {personPreview ? (
                <>
                  <PreviewImage src={personPreview} alt="Person" />
                  <ClearButton onClick={clearPerson}><FiX /></ClearButton>
                </>
              ) : (
                <>
                  <DropIcon><FiUpload /></DropIcon>
                  <DropText>
                    {personDrag ? 'Drop here…' : 'Drag & drop or click to upload'}
                  </DropText>
                  <DropText style={{ fontSize: '0.75rem' }}>
                    Best: full-body photo, clear background
                  </DropText>
                </>
              )}
            </DropZone>
          </UploadPanel>

          {/* Garment panel */}
          <UploadPanel>
            <PanelHeader>
              <PanelIcon><FiShoppingBag /></PanelIcon>
              <PanelTitle>Garment Image</PanelTitle>
              <PanelHint>JPG / PNG</PanelHint>
            </PanelHeader>
            <DropZone
              {...getGarmentProps()}
              $active={garmentDrag}
              $hasFile={!!garmentPreview}
            >
              <input {...getGarmentInput()} />
              {garmentPreview ? (
                <>
                  <PreviewImage src={garmentPreview} alt="Garment" />
                  <ClearButton onClick={clearGarment}><FiX /></ClearButton>
                </>
              ) : (
                <>
                  <DropIcon><FiUpload /></DropIcon>
                  <DropText>
                    {garmentDrag ? 'Drop here…' : 'Drag & drop or click to upload'}
                  </DropText>
                  <DropText style={{ fontSize: '0.75rem' }}>
                    Flat-lay, model shot, or product image
                  </DropText>
                </>
              )}
            </DropZone>
          </UploadPanel>
        </UploadGrid>

        {/* Options */}
        <OptionsCard>
          <OptionsTitle>Style Options</OptionsTitle>
          <OptionsRow>
            <SelectGroup>
              Photography Style
              <SelectWrap>
                <StyledSelect
                  value={options.style}
                  onChange={e => setOptions(o => ({ ...o, style: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="">Natural / Realistic</option>
                  <option value="editorial">Editorial</option>
                  <option value="lookbook">Lookbook</option>
                  <option value="campaign">Campaign</option>
                  <option value="street">Street Style</option>
                </StyledSelect>
                <SelectArrow />
              </SelectWrap>
            </SelectGroup>

            <SelectGroup>
              Background
              <SelectWrap>
                <StyledSelect
                  value={options.background}
                  onChange={e => setOptions(o => ({ ...o, background: e.target.value }))}
                  disabled={isLoading}
                >
                  <option value="studio">Studio (clean)</option>
                  <option value="original">Keep Original</option>
                  <option value="runway">Runway</option>
                  <option value="street">Street</option>
                  <option value="outdoor">Outdoor</option>
                </StyledSelect>
                <SelectArrow />
              </SelectWrap>
            </SelectGroup>
          </OptionsRow>
        </OptionsCard>

        {/* Generate button */}
        <GenerateButton
          onClick={handleTryOn}
          disabled={!canGenerate}
          whileTap={canGenerate ? { scale: 0.98 } : {}}
        >
          <FiZap />
          {isLoading ? 'Generating Try-On…' : 'Generate Virtual Try-On'}
        </GenerateButton>

        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <LoadingCard
              key="loading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Spinner />
              <LoadingText>Compositing garment onto person…</LoadingText>
              <LoadingSubtext>Gemini is generating a photorealistic try-on — usually 15–30 seconds</LoadingSubtext>
              <LoadingShimmer />
            </LoadingCard>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && !isLoading && (
            <ResultCard
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ResultHeader>
                <FiCamera />
                Virtual Try-On Result
              </ResultHeader>
              <ResultBody>
                <ResultImageWrap>
                  <ResultLabel>Person</ResultLabel>
                  <ResultImage src={result.personPreview} alt="Person" />
                </ResultImageWrap>
                <ResultImageWrap>
                  <ResultLabel>Garment</ResultLabel>
                  <ResultImage src={result.garmentPreview} alt="Garment" />
                </ResultImageWrap>
                <ResultImageWrap>
                  <ResultLabel>Try-On Result</ResultLabel>
                  <ResultImage src={result.resultUrl} alt="Try-On Result" />
                </ResultImageWrap>
              </ResultBody>
              <ResultActions>
                <ActionBtn
                  $primary
                  href={result.resultUrl}
                  download="virtual-tryon.png"
                >
                  <FiDownload />
                  Download Result
                </ActionBtn>
                <ActionBtn as="button" onClick={handleReset}>
                  <FiRefreshCw />
                  Try Another
                </ActionBtn>
              </ResultActions>
            </ResultCard>
          )}
        </AnimatePresence>
      </Container>
    </PageContainer>
  );
};

export default VirtualTryOn;
