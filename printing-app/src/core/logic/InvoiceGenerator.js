import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = async (order) => {
    console.log("Starting generateInvoice...", order);

    try {
        const doc = new jsPDF();
        console.log("jsPDF instance created");

        // Add custom fonts for UTF-8 support (Regular and Bold)
        try {
            const fontRegularUrl =
                "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
            const fontBoldUrl =
                "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf";

            console.log("Fetching fonts...");
            const [regularRes, boldRes] = await Promise.all([
                fetch(fontRegularUrl),
                fetch(fontBoldUrl),
            ]);

            const [regularBlob, boldBlob] = await Promise.all([
                regularRes.blob(),
                boldRes.blob(),
            ]);

            const readBlob = (blob) =>
                new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(",")[1]);
                    reader.readAsDataURL(blob);
                });

            const [regularBase64, boldBase64] = await Promise.all([
                readBlob(regularBlob),
                readBlob(boldBlob),
            ]);

            doc.addFileToVFS("Roboto-Regular.ttf", regularBase64);
            doc.addFileToVFS("Roboto-Bold.ttf", boldBase64);

            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

            doc.setFont("Roboto");
            console.log("Fonts loaded and set.");
        } catch (e) {
            console.error("Failed to load fonts, falling back to Helvetica", e);
            doc.setFont("Helvetica"); // Fallback
        }

        const invoiceId = `2026${String(order.id).slice(-4)}`;
        const issueDate = new Date().toLocaleDateString("sk-SK");
        const deliveryDate = new Date(order.date).toLocaleDateString("sk-SK");
        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("sk-SK");

        // --- Helper for dotted lines ---
        const drawDottedLine = (x1, y1, x2, y2) => {
            doc.setLineWidth(0.1);
            doc.setDrawColor(150);
            doc.setLineDash([0.5, 0.5], 0);
            doc.line(x1, y1, x2, y2);
            doc.setLineDash([]); // Reset
        };

        // --- Layout Grid ---
        // Vertical Separator - Header only
        drawDottedLine(105, 0, 105, 120);

        // Horizontal Separators
        drawDottedLine(10, 32, 200, 32); // Below Supplier Header / Invoice No
        drawDottedLine(10, 90, 200, 90); // Below Customer / Bank
        drawDottedLine(10, 120, 200, 120); // Below Dates / Before Items

        // --- Supplier Info (Left) ---
        doc.setFontSize(7);
        doc.setFont("Roboto", "bold");
        doc.text("DODÁVATEĽ:", 15, 12);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(8);
        doc.text(
            [
                "Hansman s.r.o.",
                "Obchodná 39",
                "81106 Bratislava - Staré mesto",
                "Slovensko",
                "",
                "",
                "IČO: 44928491",
                "IČ DPH: SK2022879639",
                "",
                "Mestský súd Bratislava III, odd. SRO, vl. č. 98942/B",
            ],
            15,
            18
        );

        // --- Invoice Title (Right) ---
        doc.setFontSize(22);
        doc.text(`Faktúra ${invoiceId}`, 195, 20, { align: "right" });

        // --- Customer Info (Right) ---
        doc.setFontSize(7);
        doc.setFont("Roboto", "bold");
        doc.text("ODBERATEĽ:", 110, 42);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(9);
        doc.text(
            [
                order.customer.name,
                order.customer.company || "",
                order.customer.street,
                `${order.customer.zip} ${order.customer.city}`,
                "Slovensko",
                "",
                "",
                `IČO: ${order.customer.ico || ""}`,
                `DIČ: ${order.customer.dic || ""}`,
                `IČ DPH: ${order.customer.icdph || ""}`,
            ],
            110,
            48
        );

        // --- Bank Details (Left) ---
        doc.setFontSize(8);
        const cleanInvoiceId = String(invoiceId).replace(/\D/g, ""); // Ensure only digits
        doc.text(
            [
                "Fio banka a.s.: 2500675732/8330",
                "IBAN / SWIFT: SK85 8330 0000 0025 0067 5732 / FIOZSKBAXXX",
                "Variabilný symbol: " + cleanInvoiceId,
                "Konštantný symbol: 0308",
            ],
            15,
            100
        );

        // --- Dates (Right) ---
        const dateLabelsX = 110;
        const dateY = 100;

        doc.setFontSize(8);
        doc.text(`Dátum vystavenia: ${issueDate}`, dateLabelsX, dateY);
        doc.text(`Dátum dodania: ${deliveryDate}`, dateLabelsX, dateY + 5);
        doc.text(`Dátum splatnosti: ${dueDate}`, dateLabelsX, dateY + 10);

        // --- Items Table ---
        const tableColumn = [
            "Názov a popis položky",
            "Počet",
            "Jednotka",
            "Cena bez DPH",
            "DPH",
            "Spolu s DPH",
        ];
        const tableRows = [];

        order.items.forEach((item) => {
            const unitPriceNoVat = item.totalPriceVat / 1.23 / item.qty;

            tableRows.push([
                item.name,
                item.qty,
                "ks",
                unitPriceNoVat.toFixed(3) + " €",
                "23%",
                item.totalPriceVat.toFixed(2) + " €",
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 130,
            theme: "plain",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                font: "Roboto",
                fontStyle: "normal",
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: "bold",
                font: "Roboto",
                lineWidth: 0,
            },
            columnStyles: {
                0: { cellWidth: 70 },
                3: { halign: "right" },
                4: { halign: "center" },
                5: { halign: "right" },
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
                const headerY = data.settings.startY + 8;
                drawDottedLine(15, headerY, 195, headerY);
            },
        });

        const finalY = doc.lastAutoTable.finalY + 10;

        // --- Layout after table ---
        doc.setFont("Roboto", "normal");
        doc.setFontSize(8);
        doc.text("Poznámka: Faktúra zároveň slúži ako dodací list.", 15, finalY + 5);

        // Totals
        const totalVat = order.total - order.total / 1.23;
        const totalNoVat = order.total - totalVat;

        const totalsY = finalY;
        const totalsXValue = 195;

        doc.setFont("Roboto", "normal");
        doc.setFontSize(9);
        doc.text("Základ DPH", 160, totalsY, { align: "right" });
        doc.text("Výška DPH", totalsXValue, totalsY, { align: "right" });

        // Values
        doc.text("DPH 23%", 135, totalsY + 5, { align: "right" });
        doc.text(totalNoVat.toFixed(2) + " €", 160, totalsY + 5, { align: "right" });
        doc.text(totalVat.toFixed(2) + " €", totalsXValue, totalsY + 5, { align: "right" });

        doc.setDrawColor(200);
        doc.setLineWidth(0.1);
        doc.line(130, totalsY + 8, 195, totalsY + 8);

        doc.setFont("Roboto", "bold");
        doc.setFontSize(14);
        doc.text(`Celková suma:   ${order.total.toFixed(2)} €`, 195, totalsY + 15, {
            align: "right",
        });

        // --- Dynamic Footer Positioning ---
        let footerStartY = totalsY + 30; // Gap between Totals and Signature section
        let barY = footerStartY + 35; // Gap between Signature section and Payment Bar

        // Check if footer fits on page (A4 height ~297mm)
        const pageHeight = doc.internal.pageSize.height || 297;
        const barHeight = 18;
        const footerHeight = 30; // Height reserved for the bottom contact footer

        if (barY + barHeight + footerHeight > pageHeight) {
            doc.addPage();
            footerStartY = 20;
            barY = footerStartY + 35;

            // Draw signature line on new page
            drawDottedLine(10, footerStartY, 200, footerStartY);

            doc.setFontSize(8);
            doc.setFont("Roboto", "normal");
            const signatureCenterX = 120;
            doc.text("Podpis a pečiatka:", signatureCenterX, footerStartY + 10, {
                align: "center",
            });
        }

        // --- Pay by Square QR Code Implementation (Fixed & Restored) ---
        // Uses standard bysquare.encode() (String output) + Patched LZMA (EOS marker)
        // This matches the working Python implementation.
        const qrSize = 35;
        const qrX = 160;
        const qrY = footerStartY - 10;

        try {
            // --- PAY BY SQUARE (HARDCODED DEBUG MODE) ---
            // Replicating EXACTLY what is in TestQRPage.jsx to verify it works in PDF.

            // Dynamic imports
            const bysquare = await import("bysquare");
            const QRCode = await import("qrcode");

            // --- PREPARE DYNAMIC VALUES ---
            // 1. Amount
            const amountStr = Number(order.total).toFixed(2);

            // 2. Dates (YYYYMMDD)
            // Header uses sk-SK format (DD.MM.YYYY), we need YYYYMMDD for QR
            // We use the same dueDate as calculated above: 14 days from issue
            const dueObj = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            const yyyy = dueObj.getFullYear();
            const mm = String(dueObj.getMonth() + 1).padStart(2, "0");
            const dd = String(dueObj.getDate()).padStart(2, "0");
            const dueDateQR = `${yyyy}${mm}${dd}`;

            // 3. Variable Symbol (digits only, max 10)
            let qrVarSymbol = String(invoiceId).replace(/\D/g, "");
            if (qrVarSymbol.length > 10) qrVarSymbol = qrVarSymbol.slice(-10);

            // 4. Note (sanitized)
            const note = `Hansman s.r.o. ${qrVarSymbol} ${order.customer?.company || order.customer?.name || ""}`
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

            const payload = {
                payments: [
                    {
                        type: 1, // PaymentOptions.PaymentOrder
                        amount: amountStr,
                        currencyCode: "EUR",
                        paymentDueDate: dueDateQR,
                        variableSymbol: qrVarSymbol,
                        constantSymbol: "0308",
                        specificSymbol: "",
                        paymentNote: note,
                        beneficiary: { name: "Hansman s.r.o." }, // Keep hardcoded as it works
                        bankAccounts: [{ iban: "SK8583300000002500675732" }],
                    },
                ],
            };

            // Encode with Verified Options
            let payBySquareString;
            try {
                payBySquareString = bysquare.encode(payload, { version: 0, documentType: 8 });
            } catch (error) {
                console.warn("Encode with options failed, trying default:", error);
                payBySquareString = bysquare.encode(payload);
            }

            console.log("InvoiceGenerator HARDCODED QR String:", payBySquareString);

            // Generate QR Image
            const toDataURL = QRCode.toDataURL || QRCode.default?.toDataURL;
            if (!toDataURL) throw new Error("QRCode library does not export toDataURL");

            const qrDataUrl = await toDataURL(payBySquareString, {
                margin: 4,
                errorCorrectionLevel: "L",
            });

            doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
            // Link removal...

            doc.setFontSize(7);
            doc.setTextColor(0);
            doc.text("PAY by square", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });
        } catch (err) {
            console.error("QR Code generation failed:", err);
            doc.setFontSize(8);
            doc.setTextColor(255, 0, 0);
            doc.text("Error: " + (err?.message || String(err)), qrX, qrY, { maxWidth: qrSize });
        }

        // --- Blue Footer Bar ---
        const pageWidth = 210; // (kept from your code though unused)

        const colors = {
            bg: [220, 245, 255],
            textLabel: [50, 80, 120],
            textValue: [10, 50, 100],
        };

        // Draw breadcrumb segments
        const drawSegment = (x, w, label, value, isLast) => {
            doc.setFillColor(...colors.bg);
            doc.rect(x, barY, w, barHeight, "F");

            doc.setFontSize(7);
            doc.setTextColor(...colors.textLabel);
            doc.text(label, x + 5, barY + 6);

            doc.setFontSize(10);
            doc.setTextColor(...colors.textValue);
            doc.setFont("Roboto", "bold");
            doc.text(value, x + 5, barY + 13);
            doc.setFont("Roboto", "normal");

            if (!isLast) {
                doc.setFillColor(255, 255, 255);
                doc.triangle(
                    x + w,
                    barY,
                    x + w + 5,
                    barY + barHeight / 2,
                    x + w,
                    barY + barHeight,
                    "F"
                );
            }
        };

        // Coordinates - Adjusted for larger IBAN box
        drawSegment(0, 85, "IBAN", "SK85 8330 0000 0025 0067 5732", false);
        drawSegment(90, 40, "Variabilný symbol", invoiceId, false);
        drawSegment(135, 40, "Dátum splatnosti", dueDate, false);
        drawSegment(180, 30, "Suma na úhradu", `${order.total.toFixed(2)} €`, true);

        // --- Absolute Bottom Footer (Contact Info) ---
        const bottomY = pageHeight - 10;

        // Separator line
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        doc.setLineDash([0.5, 0.5], 0);
        doc.line(10, bottomY - 5, 200, bottomY - 5);
        doc.setLineDash([]);

        doc.setFontSize(8);
        doc.setTextColor(50); // Dark grey text
        doc.setFont("Roboto", "normal");

        // Left: Vystavil
        doc.text("Vystavil: Rázga", 15, bottomY - 8);

        // Center: Contacts
        doc.text("Tel: +421 915 991 500", 60, bottomY - 8);
        doc.text("Web: www.hansman.sk", 110, bottomY - 8);
        doc.text("Email: razga@hansman.sk", 155, bottomY - 8);

        // Right: Page Number
        doc.setFontSize(7);
        doc.text("Strana 1/1", 200, bottomY, { align: "right" });

        // Save
        console.log("Saving PDF...");
        doc.save(`Faktura_${invoiceId}.pdf`);
        console.log("PDF Saved successfully.");
    } catch (error) {
        console.error("CRITICAL ERROR in generateInvoice:", error);
        alert(`Nepodarilo sa vygenerovať faktúru: ${error.message}`);
    }
};


