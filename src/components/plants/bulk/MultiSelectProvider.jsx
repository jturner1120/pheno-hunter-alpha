// src/components/plants/bulk/MultiSelectProvider.jsx
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useBulkOperations } from '../../../hooks/useBulkOperations';

const MultiSelectContext = createContext(null);

export const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error('useMultiSelect must be used within a MultiSelectProvider');
  }
  return context;
};

const MultiSelectProvider = ({ children }) => {
  const bulkOperations = useBulkOperations();

  return (
    <MultiSelectContext.Provider value={bulkOperations}>
      {children}
    </MultiSelectContext.Provider>
  );
};

MultiSelectProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default MultiSelectProvider;
