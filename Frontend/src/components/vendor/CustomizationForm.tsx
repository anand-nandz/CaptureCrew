import React from 'react';
import { Input, Button } from '@nextui-org/react';
import { Plus, Minus } from 'lucide-react';

interface CustomizationOption {
    type: string;
    description: string;
    price: number;
    unit?: string;  // e.g., "per photographer", "per page"
}

interface CustomizationErrors {
    type?: string;
    description?: string;
    price?: string;
    unit?: string;
}

interface CustomizationFormProps {
    options: CustomizationOption[];
    onChange: (options: CustomizationOption[]) => void;
    errors?: {
        customizationOptions?: string;
        optionErrors?: CustomizationErrors[];
    };
}

export const CustomizationForm: React.FC<CustomizationFormProps> = ({
    options,
    onChange,
    errors
}) => {
    const addOption = () => {
        onChange([...options, { type: '', description: '', price: 0, unit: '' }]);
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        onChange(newOptions);
    };

    const updateOption = (index: number, field: keyof CustomizationOption, value: string | number) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            [field]: value
        };
        onChange(newOptions);
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium">Customization Options</label>
                {options.length <2 && (
                    <Button
                    type="button"
                    onClick={addOption}
                    startContent={<Plus size={16} />}
                    size="sm"
                >
                    Add Option
                </Button>
                )}
                
            </div>
            <div className='grid grid-cols-2 gap-3'>
                {options.map((option, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium">Option {index + 1}</h4>
                            <Button
                                type="button"
                                isIconOnly
                                color="danger"
                                size="sm"
                                onClick={() => removeOption(index)}
                                className="min-w-[32px]"
                            >
                                <Minus size={16} />
                            </Button>
                        </div>


                        <div className="space-y-3">
                            <Input
                                label="Type"
                                placeholder="e.g., Extra Photographer"
                                value={option.type}
                                onChange={(e) => updateOption(index, 'type', e.target.value)}
                                errorMessage={errors?.optionErrors?.[index]?.type}
                                isInvalid={!!errors?.optionErrors?.[index]?.type}
                                className="w-full"
                            />

                            <Input
                                label="Description"
                                placeholder="e.g., Add an additional photographer"
                                value={option.description}
                                onChange={(e) => updateOption(index, 'description', e.target.value)}
                                errorMessage={errors?.optionErrors?.[index]?.description}
                                isInvalid={!!errors?.optionErrors?.[index]?.description}
                                className="w-full"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input
                                    type="number"
                                    label="Price"
                                    placeholder="Enter price"
                                    min={500}
                                    value={option.price.toString()}
                                    onChange={(e) => updateOption(index, 'price', parseFloat(e.target.value))}
                                    errorMessage={errors?.optionErrors?.[index]?.price}
                                    isInvalid={!!errors?.optionErrors?.[index]?.price}
                                    className="w-full"
                                />

                                <Input
                                    label="Unit (Optional)"
                                    placeholder="e.g., per photographer"
                                    value={option.unit || ''}
                                    onChange={(e) => updateOption(index, 'unit', e.target.value)}
                                    errorMessage={errors?.optionErrors?.[index]?.unit}
                                    isInvalid={!!errors?.optionErrors?.[index]?.unit}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {errors?.customizationOptions && (
                <p className="text-danger text-sm">{errors.customizationOptions}</p>
            )}
        </div>
    );
};
