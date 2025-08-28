import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { FiUpload, FiGrid, FiDownload, FiRefreshCw } from 'react-icons/fi';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const PageSubtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 3rem;
`;

const UploadSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Dropzone = styled.div`
  border: 2px dashed #667eea;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  
  &:hover {
    border-color: #764ba2;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const UploadHint = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem auto;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #e9ecef;
    color: #333;
    
    &:hover {
      background: #dee2e6;
      transform: translateY(-2px);
    }
  }
`;

const BatchProcess = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: true
  });

  const resetProcess = () => {
    setUploadedFiles([]);
  };

  return (
    <PageContainer>
      <Container>
        <PageTitle>Batch Processing</PageTitle>
        <PageSubtitle>
          Upload multiple images for batch processing (Coming Soon)
        </PageSubtitle>

        <UploadSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Dropzone {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <UploadIcon>
              <FiUpload />
            </UploadIcon>
            <UploadText>
              {isDragActive
                ? 'Drop the images here...'
                : 'Drag & drop multiple images here, or click to select'
              }
            </UploadText>
            <UploadHint>
              Supports JPG, PNG, GIF, BMP (Max 10 files, 10MB each)
            </UploadHint>
          </Dropzone>
          
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p>Selected {uploadedFiles.length} files</p>
              <Button className="secondary" onClick={resetProcess}>
                <FiRefreshCw />
                Clear Selection
              </Button>
            </div>
          )}
        </UploadSection>
      </Container>
    </PageContainer>
  );
};

export default BatchProcess;
