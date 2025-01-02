import { FC, useEffect, useRef, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem,
    Checkbox
} from '@nextui-org/react';
import { ServiceProvided } from '@/types/postTypes';
import { CalendarIcon, CheckIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingFormData, useBookingValidation } from '@/validations/user/bookingValidation';
import { ChevronDown, ChevronUp, Package as PackageIcon } from 'lucide-react';
import { BookingModalProps, ValidationError } from '@/utils/interfaces';


export const BookingModal: FC<BookingModalProps> = ({
    isOpen,
    onOpenChange,
    bookingForm,
    setBookingForm,
    onSubmit: originalOnSubmit,
    selectedDate,
    packages,
    unavailableDates,
    onDateSelect
}) => {

    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);
    const { validateForm } = useBookingValidation(unavailableDates);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showCustomization, setShowCustomization] = useState(false);
    const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

    const MIN_BOOKING_DATE = new Date(TODAY);
    MIN_BOOKING_DATE.setDate(MIN_BOOKING_DATE.getDate() + 3);

    const MAX_BOOKING_DATE = new Date(TODAY);
    MAX_BOOKING_DATE.setFullYear(MAX_BOOKING_DATE.getFullYear() + 1);


    useEffect(() => {
        if (selectedDate) {
            const [, monthStr, yearStr] = selectedDate.split('/');

            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10) - 1;
            setCurrentMonth(new Date(year, month));
        }
    }, [selectedDate, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB');
    };

    const getDateStatus = (date: Date) => {
        const formattedDate = formatDate(date);
        if (date < TODAY) return 'past';
        if (formattedDate === selectedDate) return 'selected';
        if (unavailableDates.includes(formattedDate)) return 'unavailable';
        return 'available';
    };

    const handleDateClick = (date: Date) => {
        if (date < TODAY) return;
        const formattedDate = formatDate(date);
        if (!unavailableDates.includes(formattedDate)) {
            onDateSelect(date); // Update parent component's state
            setShowCalendar(false);
        }
    };

    const availableServiceTypes = [...new Set(packages.map(pkg => pkg.serviceType))];

    const getPackagesForServiceType = (serviceType: string) => {
        return packages.filter(pkg => pkg.serviceType === serviceType);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const clearFieldError = (fieldName: string) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const validateField = async (fieldName: string, value: unknown) => {
        try {
            await validateForm({
                ...bookingForm,
                [fieldName]: value
            });
            clearFieldError(fieldName);
        } catch (error) {
            const newErrors = { ...validationErrors };
            if (error && typeof error === 'object' && 'inner' in error) {
                const validationError = error as ValidationError;
                const fieldError = validationError.inner?.find(e => e.path === fieldName);
                if (fieldError) {
                    newErrors[fieldName] = fieldError.message;
                } else {
                    delete newErrors[fieldName];
                }
            }
            setValidationErrors(newErrors);
        }
    };

    const handleInputChange = (fieldName: string, value: BookingFormData[keyof BookingFormData]) => {
        setBookingForm(prev => ({ ...prev, [fieldName]: value }));

        validateField(fieldName, value);
    };

    const calculateTotalPrice = (packageId: string, customizations: string[]) => {
        const selectedPackage = packages.find(pkg => pkg._id === packageId);
        if (!selectedPackage) return 0;

        let basePrice = selectedPackage.price * bookingForm.noOfDays;

        // Add customization costs
        if (customizations.length > 0 && selectedPackage.customizationOptions) {
            const customizationCosts = customizations.reduce((total, optionId) => {
                const option = selectedPackage.customizationOptions?.find(opt => opt._id === optionId);
                return total + (option?.price || 0);
            }, 0);
            basePrice += customizationCosts;
        }

        return basePrice;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsSubmitSuccess(false);
        try {
            const { isValid, errors } = await validateForm({
                ...bookingForm,
                totalPrice: calculateTotalPrice(bookingForm.packageId, selectedCustomizations),
                customizations: selectedCustomizations
            });

            if (!isValid) {
                setValidationErrors(errors);
                setIsSubmitting(false);
                return;
            }

            const selectedPackage = packages.find(pkg => pkg._id === bookingForm.packageId);
            if (!selectedPackage) {
                setValidationErrors(prev => ({
                    ...prev,
                    package: 'Invalid package selected'
                }));
                setIsSubmitting(false);
                return;
            }

            const totalPrice = calculateTotalPrice(bookingForm.packageId, selectedCustomizations);

            const updatedBookingForm = {
                ...bookingForm,
                totalPrice,
                customizations: selectedCustomizations
            };

            setValidationErrors({});
            await new Promise(resolve => setTimeout(resolve, 1500));
            await originalOnSubmit(e, updatedBookingForm);
            setIsSubmitSuccess(true);
            setIsSubmitting(false);
        } catch (error) {
            console.error('Form submission error:', error);
            if (error && typeof error === 'object' && 'inner' in error) {
                const validationError = error as ValidationError;
                const errors: Record<string, string> = {};

                validationError.inner?.forEach(err => {
                    if (err.path) {
                        errors[err.path] = err.message;
                    }
                });

                setValidationErrors(errors);
            }
        }
    };
    const DateInput = () => (
        <div className="relative w-full">
            <Input
                label="Selected Date"
                value={bookingForm.selectedDate || "Select a date"}  // Use bookingForm.selectedDate instead of selectedDate prop
                isReadOnly
                required
                className="cursor-pointer w-full"
                onClick={() => setShowCalendar(true)}
                endContent={<CalendarIcon className="w-4 h-4" />}
            />
            {showCalendar && (
                <div
                    ref={calendarRef}
                    className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border p-4 min-w-[280px]"
                >
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
                            }}
                            disabled={currentMonth <= new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button
                            isIconOnly
                            variant="light"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
                            }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                            const date = new Date(
                                currentMonth.getFullYear(),
                                currentMonth.getMonth(),
                                i + 1
                            );
                            const formattedDate = formatDate(date);
                            const status = formattedDate === bookingForm.selectedDate ? 'selected' : getDateStatus(date);

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDateClick(date);
                                    }}
                                    disabled={status === 'past' || status === 'unavailable'}
                                    className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm
                                        ${status === 'past' ? 'text-gray-300 cursor-not-allowed' : ''}
                                        ${status === 'selected' ? 'bg-blue-500 text-white' : ''}
                                        ${status === 'unavailable' ? 'bg-red-100 text-red-400 cursor-not-allowed' : ''}
                                        ${status === 'available' ? 'hover:bg-blue-100 hover:text-blue-600' : ''}
                                    `}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-2 mt-2 text-xs">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                            <span>Selected</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-100 mr-1" />
                            <span>Unavailable</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );


    const renderCustomizationOptions = () => {
        const selectedPackage = packages.find(pkg => pkg._id === bookingForm.packageId);
        if (!selectedPackage?.customizationOptions?.length) return null;

        return (
            <div className="mt-4 border rounded-xl overflow-hidden bg-gray-50">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCustomization(!showCustomization);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <PackageIcon className="w-5 h-5 text-danger" />
                        <span className="font-medium text-gray-700">Package Customizations</span>
                    </div>
                    {showCustomization ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {showCustomization && (
                    <div className="p-4 space-y-3 bg-white border-t">
                        {selectedPackage.customizationOptions.map((option) => (
                            <div
                                key={option._id}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-black/20 hover:bg-black/5 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        checked={selectedCustomizations.includes(option._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCustomizations([...selectedCustomizations, option._id]);
                                            } else {
                                                setSelectedCustomizations(
                                                    selectedCustomizations.filter(id => id !== option._id)
                                                );
                                            }
                                        }}
                                    >
                                        <span className="ml-2">
                                            <span className="font-medium text-gray-700">{option.type}</span>
                                            <span className="text-sm text-gray-500 ml-1">({option.unit})</span>
                                        </span>
                                    </Checkbox>
                                </div>
                                <span className="text-black font-medium">
                                    {formatPrice(option.price)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h2 className="text-xl font-bold">Service Booking Request</h2>
                        </ModalHeader>
                        <ModalBody>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Name"
                                        placeholder="Enter your name"
                                        value={bookingForm.name}
                                        onChange={e => handleInputChange('name', e.target.value)}
                                        onBlur={() => validateField('name', bookingForm.name)}
                                        errorMessage={validationErrors.name}
                                        isInvalid={!!validationErrors.name}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="Enter email"
                                        value={bookingForm.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        onBlur={() => validateField('email', bookingForm.email)}
                                        errorMessage={validationErrors.email}
                                        isInvalid={!!validationErrors.email}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <DateInput />
                                    <Input
                                        label="No. of Days"
                                        placeholder="Enter number of days"
                                        type="number"
                                        min={1}
                                        max={2}
                                        value={bookingForm.noOfDays.toString()}
                                        onChange={e => {
                                            const value = parseInt(e.target.value) || 0;
                                            handleInputChange('noOfDays', Math.min(Math.max(value, 0), 2));
                                        }}
                                        onBlur={() => validateField('noOfDays', bookingForm.noOfDays)}
                                        errorMessage={validationErrors.noOfDays}
                                        isInvalid={!!validationErrors.noOfDays}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Venue"
                                        placeholder="Enter venue"
                                        value={bookingForm.venue}
                                        onChange={e => handleInputChange('venue', e.target.value)}
                                        onBlur={() => validateField('venue', bookingForm.venue)}
                                        errorMessage={validationErrors.venue}
                                        isInvalid={!!validationErrors.venue}
                                        required
                                    />
                                    <Input
                                        label="Phone Number"
                                        placeholder="Enter phone number"
                                        value={bookingForm.phone}
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                        onBlur={() => validateField('phone', bookingForm.phone)}
                                        errorMessage={validationErrors.phone}
                                        isInvalid={!!validationErrors.phone}
                                        required
                                    />

                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        key={`serviceType-${bookingForm.serviceType}`}
                                        label="Event Type"
                                        placeholder="Select event type"
                                        selectedKeys={bookingForm.serviceType ? [bookingForm.serviceType] : []}
                                        onChange={(e) => {
                                            const selectedValue = e.target.value as ServiceProvided;
                                            handleInputChange('serviceType', selectedValue);
                                            handleInputChange('packageId', ''); // Reset package
                                        }}
                                        onBlur={() => validateField('serviceType', bookingForm.serviceType)}
                                        errorMessage={validationErrors.serviceType}
                                        isInvalid={!!validationErrors.serviceType}
                                        required
                                    >
                                        {availableServiceTypes.length > 0 ?
                                            availableServiceTypes.map((type) => (
                                                <SelectItem key={type} value={type} textValue={type}>
                                                    {type}
                                                </SelectItem>
                                            )) :
                                            <SelectItem key="no-service" textValue="No services">
                                                No services available
                                            </SelectItem>
                                        }
                                    </Select>

                                    <Select
                                        label="Package Amount"
                                        placeholder="Select package"
                                        selectedKeys={bookingForm.packageId ? [bookingForm.packageId] : []}
                                        onChange={(e) => handleInputChange('packageId', e.target.value)}
                                        onBlur={() => validateField('packageId', bookingForm.packageId)}
                                        errorMessage={validationErrors.package}
                                        isInvalid={!!validationErrors.package}
                                        required
                                        isDisabled={!bookingForm.serviceType}
                                    >
                                        {bookingForm.serviceType ?
                                            getPackagesForServiceType(bookingForm.serviceType).map((pkg) => (
                                                <SelectItem key={pkg._id} textValue={formatPrice(pkg.price)}>
                                                    {formatPrice(pkg.price)}
                                                </SelectItem>
                                            )) :
                                            <SelectItem key="select-service-first" textValue="Select service type first">
                                                Select service type first
                                            </SelectItem>
                                        }
                                    </Select>
                                </div>

                                <Textarea
                                    label="Message"
                                    placeholder="Enter your message"
                                    value={bookingForm.message}
                                    onChange={e => handleInputChange('message', e.target.value)}
                                    onBlur={() => validateField('message', bookingForm.message)}
                                    errorMessage={validationErrors.message}
                                    isInvalid={!!validationErrors.message}
                                    required
                                />

                                {renderCustomizationOptions()}

                                <div className="mt-2 text-sm text-gray-600">
                                    Total Price: {formatPrice(calculateTotalPrice(bookingForm.packageId, selectedCustomizations))}
                                </div>



                            </form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="danger" onClick={handleSubmit} isLoading={isSubmitting} endContent={isSubmitSuccess ? <CheckIcon className="w-5 h-5" /> : null}
                                isDisabled={isSubmitting}>
                                {isSubmitSuccess ? 'Submitted' : 'Submit Request'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};