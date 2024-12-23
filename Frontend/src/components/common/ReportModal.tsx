import React, { useState } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Select, 
  SelectItem, 
  Textarea 
} from '@nextui-org/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import { ReportReasons, VendorReportReasons } from '@/utils/utils';
import { ReportModalProps } from '@/utils/interfaces';
import { AxiosError } from 'axios';



export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onOpenChange,
  onReportSubmit,
  type
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportReasons = type === 'Vendor' ? VendorReportReasons : ReportReasons;

  const handleSubmit = async () => {
    // Validate reason is selected
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'OTHER' && !additionalDetails.trim()) {
        setError('Please provide additional details for the "Other" reason');
        return;
      }

    setIsSubmitting(true);
    setError(null);

    try {
      await onReportSubmit({
        reason: selectedReason,
        additionalDetails: additionalDetails.trim() || undefined
      });

      setSelectedReason(null);
      setAdditionalDetails('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof AxiosError ? err?.response?.data?.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center">
              <FontAwesomeIcon icon={faFlag} className="mr-2 text-red-500" />
              {`Report ${type}`}
            </ModalHeader>
            
            <ModalBody>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <Select
                label="Reason for Reporting"
                placeholder="Select a reason"
                variant="bordered"
                selectedKeys={selectedReason ? [selectedReason] : []}
                onSelectionChange={(keys) => {
                  const reason = Array.from(keys)[0] as string;
                  setSelectedReason(reason);
                  setError(null);
                }}
                className="mb-4"
              >
                {reportReasons.map((reason) => (
                  <SelectItem key={reason.key} value={reason.key}>
                    {reason.label}
                  </SelectItem>
                ))}
              </Select>

              <Textarea
                label="Additional Details (Optional)"
                variant="bordered"
                placeholder="Provide more context about your report"
                value={additionalDetails}
                onValueChange={setAdditionalDetails}
                minRows={3}
              />
            </ModalBody>
            
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                color="default" 
                startContent={<FontAwesomeIcon icon={faFlag} />}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!selectedReason}
              >
                Submit Report
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};