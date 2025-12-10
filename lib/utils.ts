/**
 * Normalize text by removing accents/diacritics and converting to lowercase
 * This ensures consistent matching regardless of character encoding
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Map Spanish book names (normalized) to English book names for bible-api.com
 */
export const spanishToEnglishBooks: Record<string, string> = {
  // Old Testament
  'genesis': 'Genesis',
  'exodo': 'Exodus',
  'levitico': 'Leviticus',
  'numeros': 'Numbers',
  'deuteronomio': 'Deuteronomy',
  'josue': 'Joshua',
  'jueces': 'Judges',
  'rut': 'Ruth',
  '1 samuel': '1 Samuel',
  '2 samuel': '2 Samuel',
  '1 reyes': '1 Kings',
  '2 reyes': '2 Kings',
  '1 cronicas': '1 Chronicles',
  '2 cronicas': '2 Chronicles',
  'esdras': 'Ezra',
  'nehemias': 'Nehemiah',
  'ester': 'Esther',
  'job': 'Job',
  'salmos': 'Psalms',
  'proverbios': 'Proverbs',
  'eclesiastes': 'Ecclesiastes',
  'cantares': 'Song of Solomon',
  'isaias': 'Isaiah',
  'jeremias': 'Jeremiah',
  'lamentaciones': 'Lamentations',
  'ezequiel': 'Ezekiel',
  'daniel': 'Daniel',
  'oseas': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'abdias': 'Obadiah',
  'jonas': 'Jonah',
  'miqueas': 'Micah',
  'nahum': 'Nahum',
  'habacuc': 'Habakkuk',
  'sofonias': 'Zephaniah',
  'hageo': 'Haggai',
  'zacarias': 'Zechariah',
  'malaquias': 'Malachi',
  // New Testament
  'mateo': 'Matthew',
  'marcos': 'Mark',
  'lucas': 'Luke',
  'juan': 'John',
  'hechos': 'Acts',
  'romanos': 'Romans',
  '1 corintios': '1 Corinthians',
  '2 corintios': '2 Corinthians',
  'galatas': 'Galatians',
  'efesios': 'Ephesians',
  'filipenses': 'Philippians',
  'colosenses': 'Colossians',
  '1 tesalonicenses': '1 Thessalonians',
  '2 tesalonicenses': '2 Thessalonians',
  '1 timoteo': '1 Timothy',
  '2 timoteo': '2 Timothy',
  'tito': 'Titus',
  'filemon': 'Philemon',
  'hebreos': 'Hebrews',
  'santiago': 'James',
  '1 pedro': '1 Peter',
  '2 pedro': '2 Peter',
  '1 juan': '1 John',
  '2 juan': '2 John',
  '3 juan': '3 John',
  'judas': 'Jude',
  'apocalipsis': 'Revelation'
};

