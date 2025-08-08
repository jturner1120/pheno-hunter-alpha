import React from 'react';
import { usePlantForm } from '../../hooks/usePlantForm';
import FormErrorBoundary from '../FormErrorBoundary';
import PlantFormHeader from './PlantFormHeader';
import PlantDetailsSection from './PlantDetailsSection';
import PlantImageSection from './PlantImageSection';
import PlantFormStatus from './PlantFormStatus';

const PlantForm = () => {
  const {
    // State
    formData,
    loading,
    error,
    success,
    uidPreview,
    strainWarning,
    showStrainCodeField,
    
    // Actions
    handleInputChange,
    handleImageChange,
    clearImage,
    handleSubmit,
    handleCancel
  } = usePlantForm();

  return (
    <FormErrorBoundary formName="Plant Registration Form">
      <div className="min-h-screen bg-patriot-gray">
        <PlantFormHeader onBackClick={handleCancel} />

        {/* Main Content */}
        <main className="max-w-2xl mx-auto p-6">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PlantDetailsSection 
                formData={formData}
                onInputChange={handleInputChange}
                uidPreview={uidPreview}
                strainWarning={strainWarning}
                showStrainCodeField={showStrainCodeField}
              />

              <PlantImageSection 
                formData={formData}
                onImageChange={handleImageChange}
                onClearImage={clearImage}
              />

              <PlantFormStatus 
                error={error}
                success={success}
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </form>
          </div>
        </main>
      </div>
    </FormErrorBoundary>
  );
};

export default PlantForm;
