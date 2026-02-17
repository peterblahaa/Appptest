import React, { useState } from "react";

export const TestQRPage = () => {
    const [qrImage, setQrImage] = useState(null);
    const [log, setLog] = useState("");

    const generateQR = async () => {
        setLog("Generating...\n");

        try {
            const bysquare = await import("bysquare");
            const QRCode = await import("qrcode");

            // Debug: čo všetko knižnica exportuje (keď options nebudú fungovať, toto nám povie prečo)
            setLog((prev) => prev + `bysquare exports: ${Object.keys(bysquare).join(", ")}\n`);

            const payload = {
                payments: [
                    {
                        type: bysquare.PaymentOptions.PaymentOrder, // 1
                        amount: 119.56,
                        currencyCode: bysquare.CurrencyCode.EUR,
                        paymentDueDate: "20260216", // YYYYMMDD
                        variableSymbol: "2026030",
                        constantSymbol: "0308",
                        specificSymbol: "",
                        paymentNote: "Hansman s.r.o. 2026030 ECOPAP s.r.o.",
                        beneficiary: { name: "Hansman s.r.o." },
                        bankAccounts: [{ iban: "SK8583300000002500675732" }],
                    },
                ],
            };

            // ✅ Skúsime vynútiť rovnaký “V0 payment” formát ako Python (0008...)
            // Ak tvoja verzia bysquare options nepodporuje, chytí to catch a uvidíme v logu.
            let qrstring;
            try {
                qrstring = bysquare.encode(payload, { version: 0, documentType: 8 });
            } catch (optErr) {
                setLog((prev) => prev + `encode(payload, options) failed: ${optErr.message}\n`);
                // fallback bez options
                qrstring = bysquare.encode(payload);
            }

            setLog((prev) => prev + `PAY by square string:\n${qrstring}\n`);
            setLog((prev) => prev + `Prefix (first 12): ${qrstring.slice(0, 12)}\n`);

            const qrUrl = await QRCode.toDataURL(qrstring, {
                errorCorrectionLevel: "L",
                type: "image/png",
                margin: 2,
                scale: 6,
            });

            setQrImage(qrUrl);
            setLog((prev) => prev + "QR Image generated successfully.\n");
        } catch (e) {
            setLog((prev) => prev + `Error: ${e.message}\n`);
            console.error(e);
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h1>Test QR Page</h1>
            <p>PAY by square test</p>

            <button
                onClick={generateQR}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                }}
            >
                Generate QR
            </button>

            <pre style={{ marginTop: 20, background: "#f0f0f0", padding: 10 }}>
                {log}
            </pre>

            {qrImage && <img src={qrImage} alt="QR Code" style={{ marginTop: 20 }} />}
        </div>
    );
};
