"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const generatePdf = (invoiceData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
            const buffer = [];
            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (err) => reject(err));
            // === HEADER ===
            doc
                .fontSize(26)
                .fillColor("#333333")
                .text("Tour Management Agency", { align: "center" })
                .moveDown(0.2);
            doc
                .fontSize(12)
                .fillColor("#777777")
                .text("123 Main Street, Dhaka, Bangladesh", { align: "center" })
                .text("Email: support@urbantravel.com | Phone: +880 1234-567890", { align: "center" });
            doc.moveDown(1.5);
            // === INVOICE TITLE ===
            doc
                .fontSize(20)
                .fillColor("#000000")
                .text("INVOICE", { align: "center", underline: true });
            doc.moveDown();
            // === INVOICE META INFO ===
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const metaStartY = doc.y;
            doc
                .fontSize(12)
                .fillColor("#000")
                .text(`Transaction ID: ${invoiceData.transactionId}`)
                .text(`Booking Date: ${invoiceData.bookingDate.toLocaleDateString()}`)
                .text(`Customer Name: ${invoiceData.userName}`);
            doc.moveDown();
            // === DETAILS TABLE ===
            doc
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .strokeColor("#cccccc")
                .stroke();
            doc.moveDown(0.5);
            doc
                .fontSize(12)
                .fillColor("#000")
                .text("Tour Title", 50, doc.y, { continued: true })
                .text("Guests", 250, doc.y, { continued: true })
                .text("Total Amount (BDT)", 350, doc.y);
            doc.moveDown(0.3);
            doc
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .strokeColor("#cccccc")
                .stroke();
            doc.moveDown(0.5);
            doc
                .fontSize(12)
                .fillColor("#444444")
                .text(invoiceData.tourTitle, 50, doc.y, { continued: true })
                .text(invoiceData.guestsCount.toString(), 250, doc.y, { continued: true })
                .text(invoiceData.totalAmount.toFixed(2), 350, doc.y);
            doc.moveDown(1.5);
            // === FOOTER MESSAGE ===
            doc
                .fontSize(12)
                .fillColor("#555555")
                .text("Thank you for booking with Tour Management Agency!", { align: "center" })
                .moveDown(0.5)
                .text("We hope you have a great journey!", { align: "center" });
            // === SIGNATURE LINE ===
            doc.moveDown(2);
            doc
                .moveTo(400, doc.y)
                .lineTo(550, doc.y)
                .strokeColor("#000")
                .stroke();
            doc
                .fontSize(10)
                .fillColor("#444")
                .text("Authorized Signature", 400, doc.y);
            doc.end();
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        console.error(error);
        throw new appError_1.default(401, `PDF creation error: ${error.message}`);
    }
});
exports.generatePdf = generatePdf;
