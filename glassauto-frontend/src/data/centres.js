export const HEADQUARTERS = 'Siège';

export const centres = [
  { nom: 'Agadir', region: 'Souss-Massa', effectif: 9 },
  { nom: 'Arsalane', region: 'Casablanca-Settat', effectif: 12 },
  { nom: 'Ben Guerir', region: 'Marrakech-Safi', effectif: 2 },
  { nom: 'Beni Mellal', region: 'Béni Mellal-Khénifra', effectif: 6 },
  { nom: 'Berrechid', region: 'Casablanca-Settat', effectif: 3 },
  { nom: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab', effectif: 3 },
  { nom: 'Essaouira', region: 'Marrakech-Safi', effectif: 2 },
  { nom: 'Fès', region: 'Fès-Meknès', effectif: 8 },
  { nom: 'Guelmim', region: 'Guelmim-Oued Noun', effectif: 2 },
  { nom: 'Jorf El Melha', region: 'Rabat-Salé-Kénitra', effectif: 2 },
  { nom: 'Kénitra', region: 'Rabat-Salé-Kénitra', effectif: 3 },
  { nom: 'Khénifra', region: 'Béni Mellal-Khénifra', effectif: 2 },
  { nom: 'Khémisset', region: 'Rabat-Salé-Kénitra', effectif: 2 },
  { nom: 'Khouribga', region: 'Béni Mellal-Khénifra', effectif: 3 },
  { nom: 'Laâyoune', region: 'Laâyoune-Sakia El Hamra', effectif: 3 },
  { nom: 'Maarif', region: 'Casablanca-Settat', effectif: 10 },
  { nom: 'Marrakech', region: 'Marrakech-Safi', effectif: 11 },
  { nom: 'Meknès', region: 'Fès-Meknès', effectif: 4 },
  { nom: 'Nador', region: 'Oriental', effectif: 3 },
  { nom: 'Oujda', region: 'Oriental', effectif: 4 },
  { nom: 'Rabat', region: 'Rabat-Salé-Kénitra', effectif: 5 },
  { nom: 'Rabat (RMA)', region: 'Rabat-Salé-Kénitra', effectif: 3 },
  { nom: 'Safi', region: 'Marrakech-Safi', effectif: 5 },
  { nom: 'Salé', region: 'Rabat-Salé-Kénitra', effectif: 3 },
  { nom: 'Settat', region: 'Casablanca-Settat', effectif: 3 },
  { nom: 'Sidi Slimane', region: 'Rabat-Salé-Kénitra', effectif: 3 },
  { nom: 'Tanger', region: 'Tanger-Tétouan-Al Hoceïma', effectif: 6 },
  { nom: 'Taroudant', region: 'Souss-Massa', effectif: 3 },
  { nom: 'Témara', region: 'Rabat-Salé-Kénitra', effectif: 3 },
  { nom: 'Tétouan', region: 'Tanger-Tétouan-Al Hoceïma', effectif: 4 },
  { nom: 'Tiznit', region: 'Souss-Massa', effectif: 3 },
];

export const departments = [
  { nom: 'Direction', effectif: 2 },
  { nom: 'Commercial et Développement', effectif: 10 },
  { nom: 'Management de réseau', effectif: 8 },
  { nom: 'Satisfaction clients et Marketing', effectif: 7 },
  { nom: 'SMQE et Compliance', effectif: 6 },
  { nom: 'Comptabilité et Finance', effectif: 11 },
  { nom: 'Contrôle de gestion et Audit', effectif: 5 },
  { nom: 'IT et Digitalisation', effectif: 5 },
  { nom: 'Ressources humaines', effectif: 5 },
  { nom: 'Prise en charge et Service client', effectif: 12 },
  { nom: 'Prise en charge technique', effectif: 5 },
  { nom: 'Logistique', effectif: 4 },
  { nom: 'Achats', effectif: 3 },
  { nom: 'Stock', effectif: 2 },
];

export const regionOf = (centreNom) => {
  const found = centres.find((centre) => centre.nom === centreNom);
  return found ? found.region : null;
};
