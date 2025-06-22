import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = '',
  testId = 'page-container-component'
}) => {
  return (
    <div 
      className={`page-container space-y-6 ${className}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default PageContainer; 