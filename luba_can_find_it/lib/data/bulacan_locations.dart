// Complete and official list of the 51 Barangays in the City of Malolos, Bulacan.
// Coordinates and administration: City Engineering Office, City of Malolos.

class BulacanLocations {
  BulacanLocations._();

  /// The official 51 Barangays of the City of Malolos, Bulacan.
  static const List<String> malolosBarangays = [
    'Anilao',
    'Atlag',
    'Babatnin',
    'Bagna',
    'Bagong Bayan (Poblacion)',
    'Balayong',
    'Balite',
    'Bangkal',
    'Barihan',
    'Bulihan',
    'Bungahan',
    'Caingin',
    'Calero',
    'Caliligawan',
    'Canalate',
    'Caniogan',
    'Catmon',
    'Cofradia',
    'Dakila',
    'Guinhawa',
    'Liang',
    'Ligas',
    'Longos',
    'Look 1st',
    'Look 2nd',
    'Lugam',
    'Mabolo',
    'Mambog',
    'Masile',
    'Matimbo',
    'Mojon',
    'Namayan',
    'Niugan',
    'Pamarawan',
    'Panasahan',
    'Pinagbakahan',
    'San Agustin',
    'San Gabriel',
    'San Juan',
    'San Pablo',
    'San Vicente (Poblacion)',
    'Santiago',
    'Santisima Trinidad',
    'Santo Cristo',
    'Santo Niño (Poblacion)',
    'Santo Rosario (Poblacion)',
    'Santor',
    'Sumapang Bata',
    'Sumapang Matanda',
    'Taal',
    'Tikay',
  ];

  static const Map<String, List<String>> locations = {
    'Malolos': malolosBarangays,
  };

  static List<String> get municipalities => locations.keys.toList();

  static List<String> getBarangays(String? municipality) {
    if (municipality == null || municipality.isEmpty) return malolosBarangays;
    final normalized = municipality.trim().toLowerCase();
    if (normalized.contains('malolos')) return malolosBarangays;
    return locations[municipality] ?? malolosBarangays;
  }
}
