import React, { useEffect } from 'react';
import { SEOMetadata } from '../../types/seo';
import { applySEOMetadata } from '../../services/seoService';

interface SEOHeadProps {
  metadata: SEOMetadata;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ metadata }) => {
  useEffect(() => {
    applySEOMetadata(metadata);
  }, [metadata]);

  return null;
};
