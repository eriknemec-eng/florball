export function getVocative(name: string): string {
  if (!name) return '';
  const first = name.split(' ')[0];
  const lower = first.toLowerCase();
  
  // Custom hardcoded exceptions for perfect matching of tricky names
  const exceptions: Record<string, string> = {
    'pavel': 'Pavle',
    'karel': 'Karle',
    'petr': 'Petře',
    'jan': 'Jane',
    'jakub': 'Jakube',
    'vojtěch': 'Vojtěchu',
    'oldřich': 'Oldřichu',
    'marek': 'Marku',
    'radek': 'Radku',
    'hynek': 'Hynku',
    'bořek': 'Bořku',
    'zdeněk': 'Zdeňku',
    'ondřej': 'Ondřeji',
    'matěj': 'Matěji',
    'jiří': 'Jiří',
    'pepa': 'Pepo',
    'honza': 'Honzo',
    'michal': 'Michale',
    'tomáš': 'Tomáši',
    'lukáš': 'Lukáši',
    'matouš': 'Matouši',
    'filip': 'Filipe',
    'martin': 'Martine',
    'roman': 'Romane',
    'milan': 'Milane',
    'adam': 'Adame',
    'david': 'Davide',
    'daniel': 'Danieli',
    'václav': 'Václave',
    'jaroslav': 'Jaroslave',
    'stanislav': 'Stanislave',
    'miroslav': 'Miroslave',
    'josef': 'Josefe',
    'richard': 'Richarde',
    'robert': 'Roberte',
    'vít': 'Víte',
    'patrik': 'Patriku',
    'dominik': 'Dominiku',
    'erik': 'Eriku',
    'šimon': 'Šimone',
    'kuba': 'Kubo',
    'míša': 'Míšo',
    'vojta': 'Vojto',
    'standa': 'Stando',
    'jarda': 'Jardo',
    'vítek': 'Vítku',
    'peta': 'Péťo',
    'péťa': 'Péťo',
  };

  if (exceptions[lower]) {
    return exceptions[lower];
  }

  // General heuristics for other names
  // ends with 'a' -> 'o'
  if (lower.endsWith('a')) {
    return first.slice(0, -1) + 'o';
  }
  // ends with 'ek' -> 'ku'
  if (lower.endsWith('ek')) {
    return first.slice(0, -2) + 'ku';
  }
  // ends with 'š', 'j', 'c', 'č', 'ř', 'ž' -> add 'i'
  if (/[šjcčřž]$/.test(lower)) {
    return first + 'i';
  }
  // ends with 'k', 'h', 'g' -> add 'u'
  if (/[khg]$/.test(lower)) {
    return first + 'u';
  }
  // ends with consonant (b,d,f,l,m,n,p,r,s,t,v,z) -> add 'e'
  if (/[bdfhlmnprstvz]$/.test(lower)) {
    return first + 'e';
  }

  // Fallback - return original
  return first;
}
