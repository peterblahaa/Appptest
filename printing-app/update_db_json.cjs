const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const dbContent = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbContent);

if (!db.machines) {
    db.machines = [
        {
            "id": "XEROX_SRA3",
            "sheet_format": "SRA3",
            "technology": "digital",
            "digital_setup_fixed": 15,
            "digital_price_per_side_1F": 0.03,
            "digital_price_per_side_4F": 0.05
        },
        {
            "id": "KONICA_SRA3",
            "sheet_format": "SRA3",
            "technology": "digital",
            "digital_setup_fixed": 15,
            "digital_price_per_side_1F": 0.03,
            "digital_price_per_side_4F": 0.05
        },
        {
            "id": "HEIDELBERG_SRA2",
            "sheet_format": "SRA2",
            "technology": "offset",
            "offset_run_price_per_sheet_side": 0.02,
            "offset_setup_per_side": 30,
            "plate_price": 6
        }
    ];
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Stroje úspešne pridané do lokálneho db.json.');
} else {
    console.log('Stroje už v db.json existujú.');
}
