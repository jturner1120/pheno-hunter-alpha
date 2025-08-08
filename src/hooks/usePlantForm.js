import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { createPlant, updatePlant } from '../utils/firestore';
import { uploadPlantImageSmart } from '../utils/imageUtils';
import { getAllUserStrainCodes, validateStrainCode, normalizeStrainCode } from '../utils/strainValidation';
import { generateSeedUID, formatDateForUID } from '../utils/uidGeneration';

export const usePlantForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    strain: '',
    strainCode: '',
    origin: 'Seed',
    imageFile: null,
    imagePreview: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uidPreview, setUidPreview] = useState('');
  const [strainWarning, setStrainWarning] = useState('');
  const [existingStrains, setExistingStrains] = useState([]);
  const [showStrainCodeField, setShowStrainCodeField] = useState(false);

  // Load existing strains on component mount
  useEffect(() => {
    const loadExistingStrains = async () => {
      if (user?.id) {
        try {
          const strains = await getAllUserStrainCodes(user.id);
          setExistingStrains(strains);
        } catch (error) {
          console.error('Error loading existing strains:', error);
        }
      }
    };
    loadExistingStrains();
  }, [user?.id]);

  // Generate UID preview when form data changes
  useEffect(() => {
    const generatePreview = async () => {
      if (formData.strain.trim() && formData.name.trim()) {
        try {
          const existingStrain = existingStrains.find(s => 
            s.strainName.toLowerCase() === formData.strain.toLowerCase()
          );
          
          if (existingStrain) {
            const dateBornStr = formatDateForUID(new Date());
            setUidPreview(`${existingStrain.strainCode}_${dateBornStr}_XX`);
            setShowStrainCodeField(false);
            setStrainWarning('');
          } else {
            setShowStrainCodeField(true);
            if (formData.strainCode.trim()) {
              const normalizedCode = normalizeStrainCode(formData.strainCode);
              const validation = validateStrainCode(normalizedCode);
              if (validation.valid) {
                const dateBornStr = formatDateForUID(new Date());
                setUidPreview(`${normalizedCode}_${dateBornStr}_XX`);
              } else {
                setUidPreview('Invalid strain code');
              }
            } else {
              setUidPreview('Enter strain code to preview UID');
            }
          }
        } catch (error) {
          console.error('Error generating UID preview:', error);
          setUidPreview('Error generating preview');
        }
      } else {
        setUidPreview('');
        setShowStrainCodeField(false);
      }
    };

    generatePreview();
  }, [formData.strain, formData.strainCode, formData.name, existingStrains]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'strainCode') {
      const normalizedValue = normalizeStrainCode(value);
      setFormData(prev => ({
        ...prev,
        [name]: normalizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
    if (strainWarning) setStrainWarning('');
  }, [error, success, strainWarning]);

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: previewUrl
      }));
      setError('');
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. Please try a different image.');
    }
  }, []);

  const clearImage = useCallback(() => {
    setFormData(prev => ({ 
      ...prev, 
      imageFile: null, 
      imagePreview: null 
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      return 'Plant name is required';
    }

    if (!formData.strain.trim()) {
      return 'Strain is required';
    }

    if (!formData.strainCode.trim()) {
      return 'Strain code is required';
    }

    const strainValidation = validateStrainCode(formData.strainCode);
    if (!strainValidation.valid) {
      return `Invalid strain code: ${strainValidation.error}`;
    }

    return null;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate UID for the plant
      let plantUID;
      try {
        const uidResult = await generateSeedUID(user.id, formData.strain, formData.strainCode);
        plantUID = uidResult.uid;
        
        if (uidResult.warning) {
          setStrainWarning(uidResult.warning);
        }
      } catch (uidError) {
        setError(`Failed to generate plant UID: ${uidError.message}`);
        setLoading(false);
        return;
      }

      // Create new plant object
      const newPlant = {
        uid: plantUID,
        name: formData.name.trim(),
        strain: formData.strain.trim(),
        strainCode: formData.strainCode.trim(),
        origin: 'Seed',
        status: 'seedling',
        isClone: false,
        cloneGeneration: 0,
        diary: '',
        environment: {
          lights: '',
          temperature: '',
          humidity: '',
          medium: ''
        },
        nutrients: {
          schedule: '',
          brand: '',
          notes: ''
        },
        genetics: {
          breeder: '',
          type: '',
          thc: null,
          cbd: null
        },
        harvests: []
      };

      // Save plant to Firestore
      const plantId = await createPlant(user.id, newPlant);

      // Upload image if provided
      if (formData.imageFile) {
        setError('Uploading image...');
        try {
          const imageUrl = await uploadPlantImageSmart(formData.imageFile, user.id, plantId, 'main');
          await updatePlant(user.id, plantId, { imageUrl });
        } catch (imageError) {
          console.warn('Image upload failed, but plant was created:', imageError);
        }
      }

      setSuccess('Plant added successfully!');
      setError('');
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/plants');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to save plant. Please try again.');
      console.error('Error saving plant:', err);
    } finally {
      setLoading(false);
    }
  }, [formData, user, validateForm, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return {
    // State
    formData,
    loading,
    error,
    success,
    uidPreview,
    strainWarning,
    existingStrains,
    showStrainCodeField,
    
    // Actions
    handleInputChange,
    handleImageChange,
    clearImage,
    handleSubmit,
    handleCancel,
    
    // Utilities
    setError,
    setSuccess
  };
};
