import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  testId?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  children, 
  className = '',
  testId = 'page-header-component'
}) => {
  return (
    <div 
      className={`page-header flex items-center justify-between ${className}`}
      data-testid={testId}
    >
      <h1 className="page-title text-3xl font-bold text-gray-800">
        {title}
      </h1>
      {children && (
        <div className="flex items-center space-x-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader; 