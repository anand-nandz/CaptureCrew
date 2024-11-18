import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { Edit, Trash2 } from 'lucide-react';
import { PackageData } from '../../../types/packageTypes';
import { axiosInstanceVendor } from '../../../config/api/axiosInstance';
import { showToastMessage } from '../../../validations/common/toast';
import { useNavigate } from 'react-router-dom';
import SidebarVendor from '../../../layout/vendor/SidebarProfileVendor';
import AddEditPackage from './AddPackage';

const PackageListing = () => {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [selectedPackageEdit, setSelectedPackageEdit] = useState<PackageData | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navigate = useNavigate()

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await axiosInstanceVendor.get('/view-packages');
            console.log(response.data);

            setPackages(response.data.data.packages);
        } catch (error) {
            console.error('Error fetching packages:', error);
            // showToastMessage('Failed to fetch packages', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPackage = (pkg: PackageData) => {
        setSelectedPackageEdit(pkg)
        setIsEditModalOpen(true);

    };


    const handleCloseEditModal = () => {
        setSelectedPackageEdit(null);
        setIsEditModalOpen(false);
    };



    const handleDeletePackage = async (packageId: string) => {
        try {
            await axiosInstanceVendor.delete(`/packages/${packageId}`);
            showToastMessage('Package deleted successfully', 'success');
            fetchPackages();
        } catch (error) {
            console.error('Error deleting package:', error);
            showToastMessage('Failed to delete package', 'error');
        }
    };

    const handleAddClick = () => {
        navigate('/vendor/add-package')
    }
    return (

        <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="shadow-xl">
                <SidebarVendor />
            </div>
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-center">PACKAGE'S</h1>
                        <Button
                            onClick={handleAddClick}
                            className="bg-black text-white hover:bg-gray-800"
                        >
                            Add Package
                        </Button>
                    </div>


                    <div className="container mx-auto px-4 py-8">
                        {/* Service type selector */}

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : packages.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600">No packages found </p>
                                <p className="text-gray-500 my-3">Check back later for updates</p>
                                <Button onClick={handleAddClick}>
                                    Add Pacakage
                                </Button>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-6">
                                {packages.map((pkg) => (
                                    <Card key={pkg._id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="flex justify-between items-center bg-gray-50 px-6 py-4">
                                            <div>
                                                <h3 className="text-xl font-bold">{pkg.serviceType}</h3>
                                                <p className="text-2xl font-bold text-green-600 mt-1">
                                                    ₹{pkg.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    isIconOnly
                                                    variant="light"
                                                    onClick={() => handleEditPackage(pkg)}
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    variant="light"
                                                    color="danger"
                                                    onClick={() => handleDeletePackage(pkg._id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="px-6 py-4 bg-white shadow-md rounded-lg">
                                            {/* Header Section */}
                                            <div className="flex flex-wrap gap-4 mb-4">
                                                <Chip color="primary" variant="flat" className="text-sm">
                                                    {pkg.duration} {pkg.duration > 1 ? "Hours" : "Hour"}
                                                </Chip>
                                                <Chip color="secondary" variant="flat" className="text-sm">
                                                    {pkg.photographerCount} Photographer{pkg.photographerCount !== 1 ? "s" : ""}
                                                </Chip>
                                                {pkg.videographerCount! > 0 && (
                                                    <Chip color="secondary" variant="flat" className="text-sm">
                                                        {pkg.videographerCount} Videographer{pkg.videographerCount !== 1 ? "s" : ""}
                                                    </Chip>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-700 text-base leading-relaxed mb-4">{pkg.description}</p>

                                            {/* Features Section */}
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-lg">Features:</h4>
                                                <ul className="list-disc list-inside space-y-1 pl-4">
                                                    {pkg.features.map((feature, index) => (
                                                        <li key={index} className="text-gray-600 text-sm">
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-4 mt-2">
                                            <h4 className="font-semibold text-lg">Customization Options:</h4>
                                                <div className="space-y-2">
                                                    {pkg.customizationOptions.map((option, index) => (
                                                        <details
                                                            key={index}
                                                            className="border rounded-lg p-4 shadow-sm open:shadow-md"
                                                        >
                                                            <summary className="font-semibold cursor-pointer">
                                                                {option.type}
                                                            </summary>
                                                            <div className="mt-2">
                                                                <p className="text-gray-600 text-sm">
                                                                    {option.description}
                                                                </p>
                                                                <p className="text-gray-800 font-medium">
                                                                ₹{option.price} <span className="text-sm text-gray-500">{option.unit ? `(${option.unit.toLowerCase()})` : `(per ${option.type.toLowerCase()})`}</span>
                                                            </p>
                                                            </div>
                                                        </details>
                                                    ))}
                                                </div>
                                            </div>


                                            
                                        </CardBody>

                                    </Card>
                                ))}

                                {packages.length === 0 && (
                                    <div className="col-span-2 text-center py-12">
                                        <p className="text-xl text-gray-600">No packages found </p>
                                        <p className="text-gray-500 mt-2">Create a new package to get started</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    <Modal
                        isOpen={isEditModalOpen}
                        onClose={handleCloseEditModal}
                        size="3xl"
                        className="bg-white bg-transparent max-h-[90vh] overflow-y-auto"
                        scrollBehavior="inside"
                        classNames={{
                            base: "scrollbar-hide",
                            wrapper: "scrollbar-hide",
                            body: "scrollbar-hide",
                            closeButton: "z-50"
                        }}
                        
                    >
                        <ModalContent className="max-h-full">
                            {(onClose) => (
                                <>
                                    
                                    <ModalBody>
                                        <AddEditPackage
                                            isEditMode={true}
                                            existingPackage={selectedPackageEdit}
                                            onClose={onClose}
                                            onPackageUpdated={fetchPackages}
                                        />
                                    </ModalBody>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </div>
            </main>
        </div>

    );
};

export default PackageListing;