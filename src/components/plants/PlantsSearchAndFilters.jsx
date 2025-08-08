// src/components/plants/PlantsSearchAndFilters.jsx
import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const SearchInput = memo(({ searchQuery, onSearchChange, loading }) => {
  const [localValue, setLocalValue] = useState(searchQuery);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setLocalValue(value);
    onSearchChange(value);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search plants by name, strain, UID, or notes..."
        disabled={loading}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-patriot-blue focus:border-patriot-blue disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Search plants"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

const SortControls = memo(({ sortBy, sortOrder, onSortChange, loading }) => {
  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'strain', label: 'Strain' },
    { value: 'status', label: 'Status' },
  ];

  const handleSortByChange = useCallback((e) => {
    onSortChange(e.target.value, sortOrder);
  }, [onSortChange, sortOrder]);

  const handleSortOrderToggle = useCallback(() => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newOrder);
  }, [onSortChange, sortBy, sortOrder]);

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort-by"
        value={sortBy}
        onChange={handleSortByChange}
        disabled={loading}
        className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-patriot-blue focus:border-patriot-blue disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Sort plants by"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSortOrderToggle}
        disabled={loading}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-patriot-blue focus:border-patriot-blue disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}, click to toggle`}
      >
        {sortOrder === 'asc' ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
        <span className="ml-1">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
      </button>
    </div>
  );
});

SortControls.displayName = 'SortControls';

const ResultsInfo = memo(({ 
  filteredCount, 
  totalCount, 
  activeFilter, 
  searchQuery, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="text-sm text-gray-600">
        <div className="animate-pulse">Loading plants...</div>
      </div>
    );
  }

  const hasFilters = activeFilter !== 'all' || searchQuery;
  
  if (!hasFilters) {
    return (
      <div className="text-sm text-gray-600">
        Showing {totalCount} plant{totalCount !== 1 ? 's' : ''}
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      <span>
        Showing {filteredCount} of {totalCount} plant{totalCount !== 1 ? 's' : ''}
      </span>
      {activeFilter !== 'all' && (
        <span className="text-patriot-blue ml-1">
          • Filter: {activeFilter}
        </span>
      )}
      {searchQuery && (
        <span className="text-patriot-blue ml-1">
          • Search: "{searchQuery}"
        </span>
      )}
    </div>
  );
});

ResultsInfo.displayName = 'ResultsInfo';

const PlantsSearchAndFilters = ({
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  filteredCount,
  totalCount,
  activeFilter,
  loading = false,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          loading={loading}
        />
      </div>

      {/* Sort Controls and Results Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <ResultsInfo
          filteredCount={filteredCount}
          totalCount={totalCount}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          loading={loading}
        />
        
        <div className="flex-shrink-0">
          <SortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

PlantsSearchAndFilters.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSortChange: PropTypes.func.isRequired,
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  activeFilter: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

SearchInput.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

SortControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSortChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ResultsInfo.propTypes = {
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  activeFilter: PropTypes.string.isRequired,
  searchQuery: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

export default memo(PlantsSearchAndFilters);
