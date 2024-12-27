import { BookingConfirmed } from '@/types/bookingTypes';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AutoTableOptions } from './interfaces';


declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: AutoTableOptions) => jsPDF;
    }
  }
  

export const generateBookingPDF = (booking: BookingConfirmed) => {
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

    // Helper function to add a section title
    const addSectionTitle = (title: string, y: number) => {
        doc.setFillColor(primaryColor);
        doc.rect(0, y, 210, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(title, 10, y + 6);
    };

    // Helper function to add a subsection title
    const addSubsectionTitle = (title: string, y: number) => {
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, 10, y);
        doc.setLineWidth(0.1);
        doc.line(10, y + 1, 200, y + 1);
        return y + 5;
    };

    // Helper function to add a two-column row
    const addRow = (left: string, right: string, y: number) => {
        doc.setTextColor(secondaryColor);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(left, 10, y);
        doc.text(right, 85, y);
    };

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("CaptureCrew", 70, 25);

    // Logo placeholder
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 20, 20);
    doc.setFontSize(8);
    doc.text("LOGO", 15, 22);

    let yPos = 50;

    // Booking Summary
    addSectionTitle("Booking Summary", yPos);
    yPos += 15;
    addRow("Booking Reference:", booking.bookingId, yPos);
    yPos += 7;
    const bookingDate = formatDateTime(booking.createdAt);
    addRow("Booking Date:", `${bookingDate.date} at ${bookingDate.time}`, yPos);
    yPos += 7;
    addRow("Current Status:", booking.bookingStatus.toUpperCase(), yPos);
    yPos += 10;

    // Client Details
    addSectionTitle("Client Details", yPos);
    yPos += 15;
    addRow("Client Name:", booking.clientName, yPos);
    yPos += 7;
    addRow("Email Address:", booking.email, yPos);
    yPos += 7;
    addRow("Contact Number:", booking.phone, yPos);
    yPos += 10;

    // Event Information
    addSectionTitle("Event Information", yPos);
    yPos += 15;
    addRow("Event Type:", booking.serviceType, yPos);
    yPos += 7;
    addRow("Location:", booking.venue, yPos);
    yPos += 7;
    addRow("Event Date:", booking.startingDate, yPos);
    yPos += 7;
    addRow("Duration:", `${booking.noOfDays} day(s)`, yPos);
    yPos += 7;
    addRow("All Dates:", booking.requestedDates.join(", "), yPos);
    yPos += 10;

    // Vendor Information
    addSectionTitle("Vendor Information", yPos);
    yPos += 15;
    addRow("Business Name:", booking.vendorId.companyName, yPos);
    yPos += 7;
    addRow("Vendor Name:", booking.vendorId.name, yPos);
    yPos += 7;
    addRow("Contact:", booking.vendorId.contactinfo, yPos);
    yPos += 7;
    addRow("Location:", booking.vendorId.city, yPos);
    yPos += 10;

    // Package Details
    addSectionTitle("Package Details", yPos);
    yPos += 15;
    addRow("Photographers:", booking.packageId.photographerCount.toString(), yPos);
    yPos += 7;

    // Package description with word wrap
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(booking.packageId.description, 180);
    doc.text(splitDescription, 10, yPos);
    yPos += splitDescription.length * 7 + 5;
    yPos += 25;
    // Features table with improved styling
    doc.autoTable({
        startY: yPos,
        head: [['Included Features']],
        body: booking.packageId.features.map(feature => [feature]),
        theme: 'striped',
        headStyles: {
            fillColor: [44, 44, 44],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            cellPadding: 5,
            fontSize: 10,
            textColor: [74, 74, 74]
        },
        columnStyles: {
            0: { cellWidth: 180 }
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    // yPos = (doc as any).lastAutoTable.finalY + 10;

    // Detailed Payment Information
    addSectionTitle("Payment Details", yPos);
    yPos += 15;

    // Total Amount
    yPos = addSubsectionTitle("Total Package Cost", yPos);
    addRow("Base Amount:", `₹${booking.totalAmount}`, yPos += 7);

    // Advance Payment Details
    yPos = addSubsectionTitle("Advance Payment", yPos += 10);
    addRow("Amount Paid:", `₹${booking.advancePayment.amount}`, yPos += 7);
    addRow("Payment Status:", booking.advancePayment.status.toUpperCase(), yPos += 7);
    addRow("Payment ID:", booking.advancePayment?.paymentId ?? "N/A", yPos += 7);
    const advanceDate = booking.advancePayment.paidAt
        ? formatDateTime(booking.advancePayment.paidAt)
        : { date: "N/A", time: "N/A" };
    addRow("Paid On:", `${advanceDate.date} at ${advanceDate.time}`, yPos += 7);

    // Final Payment Details
    yPos = addSubsectionTitle("Final Payment", yPos += 10);
    addRow("Amount:", `₹${booking.finalPayment.amount}`, yPos += 7);
    addRow("Payment Status:", booking.finalPayment.status.toUpperCase(), yPos += 7);
    if (booking.finalPayment.paymentId) {
        addRow("Payment ID:", booking.finalPayment.paymentId, yPos += 7);
    }
    if (booking.finalPayment.paidAt) {
        const finalDate = formatDateTime(booking.finalPayment.paidAt);
        addRow("Paid On:", `${finalDate.date} at ${finalDate.time}`, yPos += 7);
    }
    const dueDate = new Date(booking.finalPayment.dueDate);
    addRow("Due Date:", dueDate.toLocaleDateString(), yPos += 7);


    const pageCount = doc.getNumberOfPages();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(tertiaryColor);
        const footerText = `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()} | This is a computer-generated document. No signature is required.`;
        doc.text(
            footerText,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
    }

    // Save the PDF
    doc.save(`Booking-${booking.bookingId}.pdf`);
};