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

// Enum for report reasons
const ReportReasons = [
  { key: 'Inappropriate Content', label: 'Inappropriate Content' },
  { key: 'Spam', label: 'Spam' },
  { key: 'Misleading Information', label: 'Misleading Information' },
  { key: 'Harassment', label: 'Harassment' },
  { key: 'Copyright Infringement', label: 'Copyright Infringement' },
  { key: 'Other', label: 'Other' }
];

const VendorReportReasons = [
    { key: 'Fraudulent Activity', label: 'Fraudulent Activity' },
    { key: 'Poor Customer Service', label: 'Poor Customer Service' },
    { key: 'Unresponsive to Communication', label: 'Unresponsive to Communication' },
    { key: 'Violation of Terms of Service', label: 'Violation of Terms of Service' },
    { key: 'Unethical Business Practices', label: 'Unethical Business Practices' },
    { key: 'Other', label: 'Other' }
  ];
  

interface ReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onReportSubmit: (reportData: {
    reason: string;
    additionalDetails?: string;
  }) => Promise<void>;
  type: string
}

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
      setError(err instanceof Error ? err.message : 'Failed to submit report');
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