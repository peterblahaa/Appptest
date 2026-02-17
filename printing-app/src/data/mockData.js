import krabiceImg from './Krabice.png';
import postoveImg from './Postove.png';
import vizitkyImg from './Vizitky.png';
import plagatyImg from './Plagaty.png';
import akcneLetakyImg from './Akcne+Letaky.png';
import katalogyImg from './Katalogy.png';
import blokyImg from './Bloky.png';
import harkyImg from './Harky.png';
import pozvankyImg from './Pozvanky.png';
import zlozkyImg from './Zlozky.png';
import taskyImg from './Tasky.png';
import banneryImg from './Bannery.png';
import doskyImg from './Dosky.png';
import kalendareImg from './Kalendare.png';
import papierImg from './Papier.png';
import wobbleryImg from './Wobblery.png';
import letakyImg from './Letaky.png';
import stojanyImg from './Stojany.png';

// Helper to get a cleaner placeholder image that looks like a product on white
const getImg = (text) => `https://placehold.co/400x400/white/e2e8f0?text=${text.replace(/ /g, '+')}`;

export const categories = [
  { id: 'krabice-a-obaly', name: 'Krabice a obaly', image: krabiceImg },
  { id: 'postove-krabice', name: 'Poštové krabice', image: postoveImg },
  { id: 'vizitky', name: 'Vizitky', image: vizitkyImg },
  { id: 'letaky', name: 'Letáky', image: letakyImg },
  { id: 'plagaty', name: 'Plagáty', image: plagatyImg },
  { id: 'akcne-letaky', name: 'Akčné letáky', image: akcneLetakyImg },
  { id: 'katalogy', name: 'Katalógy', image: katalogyImg },
  { id: 'bloky', name: 'Bloky', image: blokyImg },
  { id: 'harky-papiera', name: 'Hárky papiera', image: harkyImg },
  { id: 'pozvanky', name: 'Pozvánky', image: pozvankyImg },
  { id: 'zlozky', name: 'Zložky', image: zlozkyImg },
  { id: 'reklamne-tasky', name: 'Reklamné tašky', image: taskyImg },
  { id: 'bannery', name: 'Bannery', image: banneryImg },
  { id: 'doskove-materialy', name: 'Doskové materiály', image: doskyImg },
  { id: 'reklamne-stojany', name: 'Reklamné stojany', image: stojanyImg },
  { id: 'kalendare', name: 'Kalendáre', image: kalendareImg },
  { id: 'baliaci-papier', name: 'Baliaci papier', image: papierImg },
  { id: 'wobblery', name: 'Wobblery', image: wobbleryImg },
];

export const subCategories = {
  'vizitky': [
    { id: 'vizitky-standard', name: 'Vizitky', image: getImg('Vizitky') },
    { id: 'vizitky-premium', name: 'Vizitky Premium', image: getImg('Premium') },
    { id: 'vizitky-multiloft', name: 'Vizitky Multiloft', image: getImg('Multiloft') },
    { id: 'skladane-vizitky', name: 'Skladané vizitky', image: getImg('Skladane') },
  ],
  'krabice-a-obaly': [
    { id: 'postove-krabice-sub', name: 'Poštové krabice', image: getImg('Postove') },
    { id: 'krabice-s-vekom', name: 'Krabice s vekom', image: getImg('Veko') },
    { id: 'krabice-na-produkty', name: 'Krabice na produkty', image: getImg('Produkty') },
    { id: 'krabice-na-zavesenie', name: 'Krabice na produkty – na zavesenie', image: getImg('Zavesenie') },
    { id: 'kartonove-rukavy', name: 'Kartónové rukávy', image: getImg('Rukavy') },
    { id: 'kartonove-obalky-uzaver', name: 'Kartónové obálky s uzáverom', image: getImg('Obalky') },
    { id: 'kartonove-obalky-bez', name: 'Kartónové obálky bez uzavretia', image: getImg('Obalky+Bez') },
    { id: 'krabice-samozatvaracie', name: 'Krabice so samozatváracím vekom', image: getImg('Samozatvaracie') },
    { id: 'darcekove-rukovat', name: 'Darčekové krabice s rukoväťou', image: getImg('Rukovat') },
    { id: 'darcekove-zuzene', name: 'Darčekové krabice so zúženým uzáverom', image: getImg('Zuzene') },
    { id: 'darcekove-rozeta-4', name: 'Darčekové krabice s rozetovým uzáverom, 4 strany', image: getImg('Rozeta+4') },
    { id: 'darcekove-rozeta-6', name: 'Darčekové krabice s rozetovým uzáverom, 6 strán', image: getImg('Rozeta+6') },
  ],
  'letaky': [
    { id: 'letaky-a6', name: 'Letáky A6', image: getImg('A6') },
    { id: 'letaky-a5', name: 'Letáky A5', image: getImg('A5') },
    { id: 'letaky-a4', name: 'Letáky A4', image: getImg('A4') },
    { id: 'letaky-dl', name: 'Letáky DL', image: getImg('DL') },
    { id: 'letaky-skladane', name: 'Skladané letáky', image: getImg('Skladane') },
  ],
  'plagaty': [
    { id: 'plagaty-a3', name: 'Plagáty A3', image: getImg('A3') },
    { id: 'plagaty-a2', name: 'Plagáty A2', image: getImg('A2') },
    { id: 'plagaty-b1', name: 'Plagáty B1', image: getImg('B1') },
    { id: 'plagaty-xxl', name: 'XXL Plagáty', image: getImg('XXL') },
  ],
  'bannery': [
    { id: 'bannery-pvc', name: 'PVC Bannery', image: getImg('PVC') },
    { id: 'bannery-mesh', name: 'Mesh Bannery (dierkovane)', image: getImg('Mesh') },
    { id: 'roll-up', name: 'Roll-Up Systémy', image: getImg('RollUp') },
  ],
  'katalogy': [
    { id: 'katalogy-site', name: 'Šité katalógy V1', image: getImg('V1') },
    { id: 'katalogy-lepene', name: 'Lepené katalógy V2', image: getImg('V2') },
    { id: 'katalogy-spirala', name: 'Katalógy so špirálou', image: getImg('Spirala') },
  ],
  'reklamne-tasky': [
    { id: 'tasky-papierove', name: 'Papierové tašky', image: getImg('Papierove') },
    { id: 'tasky-bavlnene', name: 'Bavlnené tašky', image: getImg('Bavlnene') },
  ],
  'kalendare': [
    { id: 'kalendare-naste', name: 'Nástenné kalendáre', image: getImg('Nastenne') },
    { id: 'kalendare-stol', name: 'Stolové kalendáre', image: getImg('Stolove') },
  ]
};

// Default product schema for configurator
export const productSchema = {
  internalDimensions: ['100x100x100', '200x200x100', '300x200x150'],
  papers: ['Karton 300g', 'Ekologický Kraft 250g', 'Krieda Matná 350g'],
  print: ['Jednostranný 4/0', 'Obojstranný 4/4', 'Bez potlače'],
  surfaceFinish: [
    { id: 'none', name: 'Bez', priceMod: 0 },
    { id: 'matt', name: 'Matná', priceMod: 0.1 },
    { id: 'gloss', name: 'Lesklá', priceMod: 0.1 },
    { id: 'soft-touch', name: 'Soft-touch', priceMod: 0.15 }
  ],
  uvLack: [
    { id: 'none', name: 'Žiadna', priceMod: 0 },
    { id: 'partial', name: 'Parciálny', priceMod: 0.12 }
  ],
  colorFoil: [
    { id: 'none', name: 'Bez', priceMod: 0 },
    { id: 'gold', name: 'Zlatá', priceMod: 0.15 },
    { id: 'silver', name: 'Strieborná', priceMod: 0.15 }
  ],
  fileCheck: [
    { id: 'auto', name: 'Automatické overovanie', price: 0 },
    { id: 'manual', name: 'Manuálna kontrola', price: 5 }
  ]
}

export const priceTableQuantities = [10, 20, 30, 40, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500];

export const products = {
  'vizitky-standard': {
    id: 'vizitky-standard',
    name: 'Vizitky',
    basePrice: 0.05,
    description: 'Klasické vizitky pre vašu prezentáciu.',
    shipping: { eco: true, standard: true, express: true },
    options: productSchema
  },
  'postove-krabice-sub': {
    id: 'postove-krabice-sub',
    name: 'Poštové krabice',
    basePrice: 0.50,
    description: 'Odolné poštové krabice pre váš e-shop.',
    shipping: { eco: true, standard: true, express: false },
    options: productSchema
  },
  // Letaky
  'letaky-a6': { id: 'letaky-a6', name: 'Letáky A6', basePrice: 0.02, description: 'Kompaktné letáky formátu A6.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'letaky-a5': { id: 'letaky-a5', name: 'Letáky A5', basePrice: 0.04, description: 'Štandardné letáky formátu A5.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'letaky-a4': { id: 'letaky-a4', name: 'Letáky A4', basePrice: 0.08, description: 'Veľké letáky formátu A4.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'letaky-dl': { id: 'letaky-dl', name: 'Letáky DL', basePrice: 0.03, description: 'Podlhovasté letáky do obálok.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'letaky-skladane': { id: 'letaky-skladane', name: 'Skladané letáky', basePrice: 0.10, description: 'Viacstranové skladané letáky.', shipping: { eco: true, standard: true, express: false }, options: productSchema },

  // Plagaty
  'plagaty-a3': { id: 'plagaty-a3', name: 'Plagáty A3', basePrice: 0.50, description: 'Plagáty pre vaše podujatia.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'plagaty-a2': { id: 'plagaty-a2', name: 'Plagáty A2', basePrice: 1.00, description: 'Stredne veľké plagáty.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'plagaty-b1': { id: 'plagaty-b1', name: 'Plagáty B1', basePrice: 2.50, description: 'Veľkoformátové plagáty.', shipping: { eco: true, standard: true, express: false }, options: productSchema },
  'plagaty-xxl': { id: 'plagaty-xxl', name: 'XXL Plagáty', basePrice: 5.00, description: 'Obrovské plagáty na mieru.', shipping: { eco: true, standard: true, express: false }, options: productSchema },

  // Bannery
  'bannery-pvc': { id: 'bannery-pvc', name: 'PVC Bannery', basePrice: 15.00, description: 'Odolné exteriérové bannery s očkami.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'bannery-mesh': { id: 'bannery-mesh', name: 'Mesh Bannery', basePrice: 18.00, description: 'Priedušné bannery proti vetru.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'roll-up': { id: 'roll-up', name: 'Roll-Up Systém', basePrice: 45.00, description: 'Kompletný systém vrátane tlače a tašky.', shipping: { eco: true, standard: true, express: true }, options: productSchema },

  // Katalogy
  'katalogy-site': { id: 'katalogy-site', name: 'Šité katalógy V1', basePrice: 1.50, description: 'Katalógy so skobami (V1).', shipping: { eco: true, standard: true, express: false }, options: productSchema },
  'katalogy-lepene': { id: 'katalogy-lepene', name: 'Lepené katalógy V2', basePrice: 2.50, description: 'Lepená väzba pre hrubšie publikácie.', shipping: { eco: true, standard: true, express: false }, options: productSchema },
  'katalogy-spirala': { id: 'katalogy-spirala', name: 'Katalógy so špirálou', basePrice: 2.00, description: 'Praktická hrebeňová väzba.', shipping: { eco: true, standard: true, express: true }, options: productSchema },

  // Tasky
  'tasky-papierove': { id: 'tasky-papierove', name: 'Papierové tašky', basePrice: 0.80, description: 'Reklamné tašky s potlačou.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'tasky-bavlnene': { id: 'tasky-bavlnene', name: 'Bavlnené tašky', basePrice: 2.50, description: 'Ekologické plátené tašky.', shipping: { eco: true, standard: true, express: true }, options: productSchema },

  // Kalendare
  'kalendare-naste': { id: 'kalendare-naste', name: 'Nástenné kalendáre', basePrice: 4.50, description: 'Kalendáre s vašimi fotkami.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
  'kalendare-stol': { id: 'kalendare-stol', name: 'Stolové kalendáre', basePrice: 3.50, description: 'Praktické kalendáre na stôl.', shipping: { eco: true, standard: true, express: true }, options: productSchema },
};
