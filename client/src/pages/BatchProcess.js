import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiRefreshCw, FiClock } from 'react-icons/fi';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #F8F9FE;
  padding: 2rem 0 3rem;
`;

const Container = styled.div`
  max-width: 800px;
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
  margin-bottom: 2.5rem;
`;

const UploadSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid #E8E6F0;
  margin-bottom: 2rem;
`;

const Dropzone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#6C5CE7' : '#E8E6F0'};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(108, 92, 231, 0.06)' : '#FAFAFE'};

  &:hover {
    border-color: #A29BFE;
    background: rgba(108, 92, 231, 0.04);
  }
`;

const UploadIcon = styled.div`
  font-size: 2.5rem;
  color: #6C5CE7;
  margin-bottom: 0.75rem;
`;

const UploadText = styled.p`
  font-size: 1.05rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const UploadHint = styled.p`
  color: #B2BEC3;
  font-size: 0.85rem;
`;

const ComingSoon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: rgba(108, 92, 231, 0.08);
  color: #6C5CE7;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 1.5rem auto 0;
  width: fit-content;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  border: 1.5px solid #E8E6F0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #636E72;
  margin: 1.5rem auto 0;

  &:hover {
    border-color: #6C5CE7;
    color: #6C5CE7;
  }
`;

const BatchProcess = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'] },
    multiple: true,
  });

  return (
    <PageContainer>
      <Container>
        <PageTitle>Batch Processing</PageTitle>
        <PageSubtitle>
          Process multiple designs at once with AI-powered batch workflows
        </PageSubtitle>

        <UploadSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Dropzone {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <UploadIcon><FiUpload /></UploadIcon>
            <UploadText>
              {isDragActive
                ? 'Drop the images here...'
                : 'Drag & drop multiple images here, or click to select'}
            </UploadText>
            <UploadHint>
              Supports JPG, PNG, GIF, BMP (Max 10 files, 10MB each)
            </UploadHint>
          </Dropzone>

          <ComingSoon><FiClock size={14} /> Coming Soon</ComingSoon>

          {uploadedFiles.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#636E72', marginTop: '1rem' }}>
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected
              </p>
              <Button onClick={() => setUploadedFiles([])}>
                <FiRefreshCw size={14} /> Clear Selection
              </Button>
            </div>
          )}
        </UploadSection>
      </Container>
    </PageContainer>
  );
};

export default BatchProcess;
