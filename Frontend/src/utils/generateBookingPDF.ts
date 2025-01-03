import { BookingConfirmed } from '@/types/bookingTypes';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AutoTableOptions } from './interfaces';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: AutoTableOptions) => jsPDF;
    }
}

export const generateBookingPDF = async (booking: BookingConfirmed) => {
    const doc = new jsPDF();

    const primaryColor = '#2C2C2C';
    const secondaryColor = '#4A4A4A';
    const tertiaryColor = '#6E6E6E';

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
        };
    };

    const addSectionTitle = (title: string, y: number) => {
        doc.setFillColor(primaryColor);
        doc.rect(0, y, 210, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(title, 10, y + 7);
    };

    const addSubsectionTitle = (title: string, y: number) => {
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, 10, y);
        doc.setLineWidth(0.2);
        doc.line(10, y + 2, 200, y + 2);
        return y + 6;
    };

    const addRow = (left: string, right: string, y: number) => {
        doc.setTextColor(secondaryColor);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(left, 10, y);
        const rightText = String(right);

        if (rightText.includes('₹')) {
            doc.text(rightText, 200, y, { align: 'right' });
        } else {
            doc.text(rightText, 85, y);
        }
    };

    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("CaptureCrew", 70, 30);

    const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
        try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error loading image:', error);
            throw error;
        }
    };

    try {
        const logoPath = '/images/logo3.png';
        const logoBase64 = await loadImageAsBase64(logoPath);

        doc.addImage(logoBase64, 'PNG', 15, 12, 25, 25);
    } catch (error) {
        console.error('Error adding logo:', error);
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.rect(15, 12, 25, 25);
        doc.setFontSize(10);
        doc.text("CC", 22, 27);
    }


    let yPos = 55;

    const checkPageOverflow = (currentY: number, requiredSpace: number = 20) => {
        if (currentY + requiredSpace > doc.internal.pageSize.height - 40) {
            doc.addPage();
            return 20;
        }
        return currentY;
    };

    yPos = checkPageOverflow(yPos);
    addSectionTitle("Booking Summary", yPos);
    yPos += 18;
    addRow("Booking Reference:", booking.bookingId, yPos);
    yPos += 8;
    const bookingDate = formatDateTime(booking.createdAt);
    addRow("Booking Date:", `${bookingDate.date} at ${bookingDate.time}`, yPos);
    yPos += 8;
    addRow("Current Status:", booking.bookingStatus.toUpperCase(), yPos);
    yPos += 12;

    yPos = checkPageOverflow(yPos);
    addSectionTitle("Client Details", yPos);
    yPos += 18;
    addRow("Client Name:", booking.clientName, yPos);
    yPos += 8;
    addRow("Email Address:", booking.email, yPos);
    yPos += 8;
    addRow("Contact Number:", booking.phone, yPos);
    yPos += 12;

    yPos = checkPageOverflow(yPos);
    addSectionTitle("Event Information", yPos);
    yPos += 18;
    addRow("Event Type:", booking.serviceType, yPos);
    yPos += 8;
    addRow("Location:", booking.venue, yPos);
    yPos += 8;
    addRow("Event Date:", booking.startingDate, yPos);
    yPos += 8;
    addRow("Duration:", `${booking.noOfDays} day(s)`, yPos);
    yPos += 8;
    addRow("All Dates:", booking.requestedDates.join(", "), yPos);
    yPos += 12;

    yPos = checkPageOverflow(yPos);
    addSectionTitle("Vendor Information", yPos);
    yPos += 18;
    addRow("Business Name:", booking.vendorId.companyName, yPos);
    yPos += 8;
    addRow("Vendor Name:", booking.vendorId.name, yPos);
    yPos += 8;
    addRow("Contact:", booking.vendorId.contactinfo, yPos);
    yPos += 8;
    addRow("Location:", booking.vendorId.city, yPos);
    yPos += 12;

    yPos = checkPageOverflow(yPos);
    addSectionTitle("Payment Details", yPos);
    yPos += 18;

    yPos = addSubsectionTitle("Total Package Cost", yPos);
    addRow("Base Amount:", `Rs ${booking.totalAmount}`, yPos += 8);

    yPos = addSubsectionTitle("Advance Payment", yPos += 12);
    addRow("Amount Paid:", `Rs ${booking.advancePayment.amount}`, yPos += 8);
    addRow("Payment Status:", booking.advancePayment.status.toUpperCase(), yPos += 8);
    addRow("Payment ID:", booking.advancePayment?.paymentId ?? "N/A", yPos += 8);
    const advanceDate = booking.advancePayment.paidAt
        ? formatDateTime(booking.advancePayment.paidAt)
        : { date: "N/A", time: "N/A" };
    addRow("Paid On:", `${advanceDate.date} at ${advanceDate.time}`, yPos += 8);

    yPos = addSubsectionTitle("Final Payment", yPos += 12);
    addRow("Amount:", `Rs ${booking.finalPayment.amount}`, yPos += 8);
    addRow("Payment Status:", booking.finalPayment.status.toUpperCase(), yPos += 8);
    if (booking.finalPayment.paymentId) {
        addRow("Payment ID:", booking.finalPayment.paymentId, yPos += 8);
    }
    if (booking.finalPayment.paidAt) {
        const finalDate = formatDateTime(booking.finalPayment.paidAt);
        addRow("Paid On:", `${finalDate.date} at ${finalDate.time}`, yPos += 8);
    }
    const dueDate = new Date(booking.finalPayment.dueDate);
    addRow("Due Date:", dueDate.toLocaleDateString(), yPos += 8);

    yPos = addSubsectionTitle("Total Amount Paid", yPos += 12);
    const advancePaid = booking.advancePayment.status.toLowerCase() === "completed";
    const finalPaid = booking.finalPayment.status.toLowerCase() === "completed";

    addRow("Advance Payment: ", `${advancePaid ? '✓' : '✘'} Rs${booking.advancePayment.amount}`, yPos += 8);

    addRow("Final Payment: ", `${finalPaid ? '✓' : '✘'} Rs${booking.finalPayment.amount}`, yPos += 8);

    const balance = finalPaid ? 0 : (advancePaid ? booking.finalPayment.amount : booking.totalAmount - booking.advancePayment.amount);
    addRow("Balance: ", `Rs ${balance}`, yPos += 8);

    const totalAmt = finalPaid ? (booking.finalPayment.amount + booking.advancePayment.amount) : (booking.advancePayment.amount)
    addRow('Total Amount Paid ', `Rs ${totalAmt}`, yPos +=8)

    const addFooter = () => {
        const pageCount = doc.getNumberOfPages();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(tertiaryColor);

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            const pageHeight = doc.internal.pageSize.height;
            const footerY = pageHeight - 20;

            doc.setDrawColor(tertiaryColor);
            doc.setLineWidth(0.1);
            doc.line(20, footerY - 5, doc.internal.pageSize.width - 20, footerY - 5);

            doc.text(`Page ${i} of ${pageCount}`, 20, footerY);
            doc.text(`Generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 20, footerY, { align: 'right' });
            doc.text('This is a computer-generated document. No signature is required.',
                doc.internal.pageSize.width / 2, footerY + 5, { align: 'center' });
        }
    };

    addFooter();

    doc.save(`CaptureCrew_Booking_${booking.bookingId}_${new Date().toISOString().split('T')[0]}.pdf`);
};

