// src/core/calculator.js

// ============================================
// 📐 FORMÁTY (mm)
// ============================================
export const FORMATS = {
    A7: [74, 105],
    A6: [105, 148],
    A5: [148, 210],
    A4: [210, 297],
    A3: [297, 420],
    A2: [420, 594],
    DL: [99, 210],
    BUSINESS_CARD: [90, 50],
    SRA3: [320, 450],
    SRA2: [450, 640]
};

// ============================================
// 📚 VÄZBY
// ============================================
export const BINDINGS = {
    V1: 10,
    V2: 15,
    V4: 20,
    V8: 30
};

// ============================================
// 📌 PEVNÉ UPS (realita výroby)
// ============================================
export const FIXED_UPS = {
    SRA3: { BUSINESS_CARD: 21 },
    SRA2: { BUSINESS_CARD: 42 }
};

// ============================================
// 🎨 OFFSET FAREBNÉ MODY (tu si píšeš vlastné možnosti)
// front/back = počet farieb (CMYK=4, Pantone=1, atď.)
// ============================================
export const OFFSET_COLOR_MODES = {
    "1/0": { front: 1, back: 0 },
    "1/1": { front: 1, back: 1 },
    "4/0": { front: 4, back: 0 },
    "4/4": { front: 4, back: 4 },
    "2/1": { front: 2, back: 1 },
    "4/1": { front: 4, back: 1 },
    "1/4": { front: 1, back: 4 },
    // pridáš si hocčo:
    // "5/0": { front: 5, back: 0 },  // CMYK + Pantone
};

// ============================================
// 🖨️ DEFINÍCIA STROJOV
// digital: ceny per-side zvlášť pre 1F a 4F
// offset: per-side cena tlače + cena platní + setup per side
// ============================================
export const DEFAULT_MACHINES = {
    XEROX_SRA3: {
        sheet_format: "SRA3",
        technology: "digital",
        digital_setup_fixed: 15,
        digital_price_per_side_1F: 0.03,
        digital_price_per_side_4F: 0.05,
    },
    KONICA_SRA3: {
        sheet_format: "SRA3",
        technology: "digital",
        digital_setup_fixed: 15,
        digital_price_per_side_1F: 0.03,
        digital_price_per_side_4F: 0.05,
    },
    HEIDELBERG_SRA2: {
        sheet_format: "SRA2",
        technology: "offset",
        offset_run_price_per_sheet_side: 0.02,
        offset_setup_per_side: 30,
        plate_price: 6,
    },
};

// ============================================
// ✨ DOKONČOVANIE (post-press)
// setup_cost = fixná príprava za zákazku
// price_per_sheet_pass = cena za 1 prechod na 1 hárok
// passes = koľkokrát ide hárok cez stroj (default 1)
// ============================================
export const DEFAULT_FINISHING = {
    LAMINATION: { setup_cost: 5, price_per_sheet_pass: 0.00, passes: 1 },
    VARNISH: { setup_cost: 5, price_per_sheet_pass: 0.00, passes: 1 },
    FOIL: { setup_cost: 5, price_per_sheet_pass: 0.00, passes: 1 },
};

// ============================================
// 📐 UPS
// ============================================
export function calculate_ups(sheet_format, product_format) {
    if (FIXED_UPS[sheet_format] && FIXED_UPS[sheet_format][product_format]) {
        return FIXED_UPS[sheet_format][product_format];
    }

    const [sheet_w, sheet_h] = FORMATS[sheet_format];
    const [prod_w, prod_h] = FORMATS[product_format];

    const fit1 = Math.floor(sheet_w / prod_w) * Math.floor(sheet_h / prod_h);
    const fit2 = Math.floor(sheet_w / prod_h) * Math.floor(sheet_h / prod_w);

    return Math.max(fit1, fit2);
}

// ============================================
// 💰 HLAVNÁ FUNKCIA
// ============================================
export function calculate_print_price(params = {}) {
    const {
        // custom parameters to inject dynamically created machines/finishing
        custom_machines = {},
        custom_finishing = {},

        // režim
        job_type = "sheet",                 // "sheet" alebo "catalog"
        machine_name = null,

        // spoločné
        quantity = 1000,
        sheet_format = "SRA3",
        product_format = "A5",

        grammage_gm2 = 130,
        paper_price_per_ton = 1100,
        paper_margin_percent = 0,

        technology = "digital",

        // farebnosť
        color_mode = "4F",                  // digital: "1F" alebo "4F"
        offset_color_mode = "4/4",          // offset: napr. "4/4", "4/0"...

        // ceny (fallbacky, ak by stroj nemal v profile)
        digital_price_per_side = 0.05,
        digital_setup_fixed = 15,

        offset_run_price_per_sheet_side = 0.02,
        offset_setup_per_side = 30,
        plate_price = 30,

        // katalóg
        pages = 16,
        duplex = true,

        // väzba
        binding_type = "V1",
        binding_pass_price = 0.05,

        // dokončovanie
        finishing = null,                   // napr. ["LAMINATION", "FOIL"]
    } = params;

    let final_sheet_format = sheet_format;
    let final_technology = technology;
    let final_digital_setup_fixed = digital_setup_fixed;
    let final_digital_price_per_side = digital_price_per_side;
    let final_offset_run_price_per_sheet_side = offset_run_price_per_sheet_side;
    let final_offset_setup_per_side = offset_setup_per_side;
    let final_plate_price = plate_price;

    const ALL_MACHINES = { ...DEFAULT_MACHINES, ...custom_machines };
    const ALL_FINISHING = { ...DEFAULT_FINISHING, ...custom_finishing };

    // ======================================
    // 0️⃣ PROFIL STROJA
    // ======================================
    if (machine_name) {
        if (!ALL_MACHINES[machine_name]) {
            throw new Error(`Neznámy stroj: ${machine_name}`);
        }

        const m = ALL_MACHINES[machine_name];
        final_sheet_format = m.sheet_format !== undefined ? m.sheet_format : final_sheet_format;
        final_technology = m.technology !== undefined ? m.technology : final_technology;

        if (final_technology === "digital") {
            final_digital_setup_fixed = m.digital_setup_fixed !== undefined ? m.digital_setup_fixed : final_digital_setup_fixed;

            if (!["1F", "4F"].includes(color_mode)) {
                throw new Error("Digital color_mode musí byť '1F' alebo '4F'.");
            }

            if (color_mode === "1F") {
                final_digital_price_per_side = m.digital_price_per_side_1F !== undefined ? m.digital_price_per_side_1F : final_digital_price_per_side;
            } else {
                final_digital_price_per_side = m.digital_price_per_side_4F !== undefined ? m.digital_price_per_side_4F : final_digital_price_per_side;
            }

        } else { // offset
            final_offset_run_price_per_sheet_side = m.offset_run_price_per_sheet_side !== undefined ? m.offset_run_price_per_sheet_side : final_offset_run_price_per_sheet_side;
            final_plate_price = m.plate_price !== undefined ? m.plate_price : final_plate_price;
        }
    }

    // ======================================
    // 1️⃣ POČET HÁRKOV
    // ======================================
    let sheets_needed = 0;
    let sides_total = 0;

    if (job_type === "sheet") {
        const ups = calculate_ups(final_sheet_format, product_format);
        if (ups === 0) {
            throw new Error("Produkt sa nezmestí na hárok.");
        }
        sheets_needed = Math.ceil(quantity / ups);
        sides_total = duplex ? 2 : 1;

    } else if (job_type === "catalog") {
        if (pages % 4 !== 0) {
            throw new Error("Počet strán musí byť deliteľný 4.");
        }

        const a4_per_piece = pages / 4;

        const [sheet_w, sheet_h] = FORMATS[final_sheet_format];
        const [a4_w, a4_h] = FORMATS["A4"];

        const fit1 = Math.floor(sheet_w / a4_w) * Math.floor(sheet_h / a4_h);
        const fit2 = Math.floor(sheet_w / a4_h) * Math.floor(sheet_h / a4_w);
        const a4_per_sheet = Math.max(fit1, fit2);

        if (a4_per_sheet === 0) {
            throw new Error("Na zvolený hárok sa nezmestí ani 1×A4.");
        }

        const sheets_per_piece = a4_per_piece / a4_per_sheet;
        sheets_needed = Math.ceil(sheets_per_piece * quantity);
        sides_total = duplex ? 2 : 1;

    } else {
        throw new Error("job_type musí byť 'sheet' alebo 'catalog'.");
    }

    // ======================================
    // 2️⃣ PAPIER
    // ======================================
    const [sheet_w_mm, sheet_h_mm] = FORMATS[final_sheet_format];
    const sheet_weight_kg = ((sheet_w_mm / 1000) * (sheet_h_mm / 1000) * grammage_gm2) / 1000;
    const price_per_kg = paper_price_per_ton / 1000;

    let sheet_price = sheet_weight_kg * price_per_kg;
    sheet_price *= (1 + paper_margin_percent / 100);

    const paper_cost = sheets_needed * sheet_price;

    // ======================================
    // 3️⃣ TLAČ + SETUP (farebnosť)
    // ======================================
    let print_cost = 0;
    let setup_cost = 0;

    if (final_technology === "digital") {
        // digitál: tlač per-side už zahŕňa farebnosť (1F/4F)
        print_cost = sheets_needed * sides_total * final_digital_price_per_side;
        setup_cost = final_digital_setup_fixed;

    } else {
        // offset: print per-side, platne podľa offset_color_mode
        if (!OFFSET_COLOR_MODES[offset_color_mode]) {
            throw new Error(`Neznámy offset_color_mode: ${offset_color_mode}`);
        }

        const colors = OFFSET_COLOR_MODES[offset_color_mode];
        const total_plates = colors.front + colors.back;

        print_cost = sheets_needed * sides_total * final_offset_run_price_per_sheet_side;

        // setup: môžeš si vybrať:
        // A) fix za prípravu na stranu (tvoj starý model)
        // setup_cost = final_offset_setup_per_side * sides_total
        //
        // B) platne podľa farieb (realistickejšie)
        setup_cost = final_plate_price * total_plates;
    }

    // ======================================
    // 4️⃣ VÄZBA
    // ======================================
    let binding_cost = 0;
    if (job_type === "catalog") {
        if (BINDINGS[binding_type] === undefined) {
            throw new Error(`Neznáma väzba: ${binding_type}`);
        }
        binding_cost = BINDINGS[binding_type] + quantity * binding_pass_price;
    }

    // ======================================
    // 5️⃣ DOKONČOVANIE
    // ======================================
    let finishing_cost = 0;
    const finishing_breakdown = {};

    if (finishing && Array.isArray(finishing)) {
        for (const item of finishing) {
            if (!ALL_FINISHING[item]) {
                throw new Error(`Neznáme dokončovanie: ${item}`);
            }

            const cfg = ALL_FINISHING[item];
            const item_setup = cfg.setup_cost;
            const item_pass = cfg.price_per_sheet_pass;
            const item_passes = cfg.passes !== undefined ? cfg.passes : 1;

            const item_cost = item_setup + sheets_needed * item_passes * item_pass;
            finishing_cost += item_cost;
            finishing_breakdown[item] = Number(item_cost.toFixed(2));
        }
    }

    const total_price = paper_cost + print_cost + setup_cost + binding_cost + finishing_cost;

    return {
        machine: machine_name,
        sheet_format: final_sheet_format,
        technology: final_technology,
        job_type: job_type,

        sheets_needed: sheets_needed,
        paper_cost: Number(paper_cost.toFixed(2)),
        print_cost: Number(print_cost.toFixed(2)),
        setup_cost: Number(setup_cost.toFixed(2)),
        binding_cost: Number(binding_cost.toFixed(2)),
        finishing_cost: Number(finishing_cost.toFixed(2)),
        finishing_breakdown: finishing_breakdown,

        total_price: Number(total_price.toFixed(2))
    };
}
