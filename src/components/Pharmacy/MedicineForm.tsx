import React, { useState } from 'react';
import { X, Save, Pill, Package, DollarSign, Calendar } from 'lucide-react';
import { Medicine } from '../../types';
import Button from '../UI/Button';
import FormField from '../UI/FormField';

interface MedicineFormProps {
  medicine?: Medicine;
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Partial<Medicine>) => void;
}

const MedicineForm: React.FC<MedicineFormProps> = ({ medicine, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: medicine?.name || '',
    genericName: medicine?.genericName || '',
    manufacturer: medicine?.manufacturer || '',
    category: medicine?.category || '',
    stock: medicine?.stock || 0,
    minStock: medicine?.minStock || 10,
    price: medicine?.price || 0,
    expiryDate: medicine?.expiryDate || '',
    batchNumber: medicine?.batchNumber || '',
    description: medicine?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.genericName?.trim()) newErrors.genericName = 'Generic name is required';
    if (!formData.manufacturer?.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.minStock || formData.minStock < 0) newErrors.minStock = 'Valid minimum stock is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.batchNumber?.trim()) newErrors.batchNumber = 'Batch number is required';

    // Check if expiry date is in the future
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        id: medicine?.id || Date.now().toString()
      });
      onClose();
    }
  };

  const handleInputChange = (field: keyof Medicine, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const categories = [
    'Analgesics',
    'Antibiotics',
    'Cardiovascular',
    'Antidiabetic',
    'Respiratory',
    'Gastrointestinal',
    'Dermatological',
    'Neurological',
    'Vitamins & Supplements',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-3xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {medicine ? 'Edit Medicine' : 'Add New Medicine'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Pill className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Medicine Name" required error={errors.name}>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter medicine name"
                      />
                    </FormField>

                    <FormField label="Generic Name" required error={errors.genericName}>
                      <input
                        type="text"
                        value={formData.genericName}
                        onChange={(e) => handleInputChange('genericName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter generic name"
                      />
                    </FormField>

                    <FormField label="Manufacturer" required error={errors.manufacturer}>
                      <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter manufacturer name"
                      />
                    </FormField>

                    <FormField label="Category" required error={errors.category}>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>

                {/* Stock Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Package className="w-5 h-5 mr-2 text-green-600" />
                    Stock Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Current Stock" required error={errors.stock}>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </FormField>

                    <FormField label="Minimum Stock" required error={errors.minStock}>
                      <input
                        type="number"
                        min="0"
                        value={formData.minStock}
                        onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10"
                      />
                    </FormField>

                    <FormField label="Price ($)" required error={errors.price}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Expiry Date" required error={errors.expiryDate}>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormField>

                    <FormField label="Batch Number" required error={errors.batchNumber}>
                      <input
                        type="text"
                        value={formData.batchNumber}
                        onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter batch number"
                      />
                    </FormField>
                  </div>

                  <div className="mt-4">
                    <FormField label="Description">
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter medicine description, usage instructions, etc."
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" icon={Save}>
                {medicine ? 'Update Medicine' : 'Save Medicine'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicineForm;