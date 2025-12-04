// Mock Bible data for development (avoids CORS issues)
export const mockBibleData: Record<string, Record<number, Record<number, string>>> = {
  'génesis': {
    1: {
      1: 'En el principio creó Dios los cielos y la tierra.',
      2: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.',
      3: 'Y dijo Dios: Sea la luz; y fue la luz.',
      4: 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.',
      5: 'Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.',
      6: 'Y dijo Dios: Haya expansión en medio de las aguas, y separe las aguas de las aguas.',
      7: 'E hizo Dios la expansión, y separó las aguas que estaban debajo de la expansión, de las aguas que estaban sobre la expansión: y fue así.',
      8: 'Y llamó Dios a la expansión Cielos. Y fue la tarde y la mañana el día segundo.',
      9: 'Y dijo Dios: Juntense las aguas que están debajo de los cielos en un lugar, y descúbrase lo seco: y fue así.',
      10: 'Y llamó Dios a lo seco Tierra, y a la reunión de las aguas llamó Mares. Y vio Dios que era bueno.',
      11: 'Y dijo Dios: Produzca la tierra hierba verde, hierba que dé semilla; árbol de fruto que dé fruto según su género, que tenga su simiente en él, sobre la tierra: y fue así.',
      12: 'Y produjo la tierra hierba verde, hierba que da semilla según su naturaleza, y árbol que da fruto, cuya simiente está en él, según su género. Y vio Dios que era bueno.',
      13: 'Y fue la tarde y la mañana el día tercero.',
      14: 'Y dijo Dios: Sean lumbreras en la expansión de los cielos para apartar el día y la noche; y sean por señales, y para las estaciones, y para días y años;',
      15: 'y sean por lumbreras en la expansión de los cielos para alumbrar sobre la tierra: y fue así.',
      16: 'E hizo Dios las dos grandes lumbreras; la lumbrera mayor para que señorease en el día, y la lumbrera menor para que señorease en la noche: hizo también las estrellas.',
      17: 'Y púsolas Dios en la expansión de los cielos, para que alumbren sobre la tierra,',
      18: 'y señoreen en el día y en la noche, y aparten la luz y las tinieblas. Y vio Dios que era bueno.',
      19: 'Y fue la tarde y la mañana el día cuarto.',
      20: 'Y dijo Dios: Sean las aguas prolificas de reptiles animados, que vuelen sobre la tierra, en la abierta expansión de los cielos.',
      21: 'Y creó Dios las grandes ballenas, y todas las animas vivientes que se mueven, que producen en abundancia las aguas según sus géneros, y toda ave alada según su especie. Y vio Dios que era bueno.',
      22: 'Y Dios los bendijo, diciendo: Fructificad y multiplicaos, y henchid las aguas en los mares, y multiplíquense las aves en la tierra.',
      23: 'Y fue la tarde y la mañana el día quinto.',
      24: 'Y dijo Dios: Produzca la tierra seres vivientes según su género, bestias y serpientes y animales de la tierra según su especie: y fue así.',
      25: 'E hizo Dios animales de la tierra según su género, y ganado según su género, y todo animal que se arrastra sobre la tierra según su género. Y vio Dios que era bueno.',
      26: 'Y dijo Dios: Hagamos al hombre a nuestra imagen, conforme a nuestra semejanza; y señoree en los peces del mar, y en las aves de los cielos, y en las bestias, y en toda la tierra, y en todo animal que se arrastra sobre la tierra.',
      27: 'Y crió Dios al hombre a su imagen, a imagen de Dios le crió; varón y hembra los crió.',
      28: 'Y los bendijo Dios; y díjoles Dios: Fructificad y multiplicaos; llenad la tierra, y sojuzgadla, y señoread en los peces del mar, y en las aves de los cielos, y en todas las bestias que se mueven sobre la tierra.',
      29: 'Y dijo Dios: He aquí que os he dado toda hierba que da semilla, que está sobre la faz de toda la tierra, y todo árbol en que hay fruto de árbol que da semilla; os será para comer.',
      30: 'Y a toda bestia de la tierra, y a todas las aves de los cielos, y a todo lo que se arrastra sobre la tierra, en lo que hay vida, toda hierba verde les será para comer: y fue así.',
      31: 'Y vio Dios todo lo que había hecho, y era bueno en gran manera. Y fue la tarde y la mañana el día sexto.'
    },
    2: {
      1: 'Fueron, pues, acabados los cielos y la tierra, y todo el ejército de ellos.',
      2: 'Y acabó Dios en el día séptimo la obra que hizo; y reposó el día séptimo de toda la obra que hizo.',
      3: 'Y bendijo Dios al día séptimo, y lo santificó; porque en él reposó de toda la obra que había creado y hecho.'
    }
  },
  'juan': {
    3: {
      16: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      17: 'Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él.',
      18: 'El que en él cree, no es condenado; pero el que no cree, ya ha sido condenado, porque no ha creído en el nombre del unigénito Hijo de Dios.'
    }
  },
  'salmos': {
    23: {
      1: 'Jehová es mi pastor; nada me faltará.',
      2: 'En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.',
      3: 'Confortará mi alma; me guiará por sendas de justicia por amor de su nombre.',
      4: 'Aunque pase por el valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infunden aliento.',
      5: 'Aderezas mesa delante de mí, contra mis adversarios; unges mi cabeza con aceite, mi copa está rebosando.'
    }
  }
};

// Mock books list
export const mockBooks: string[] = [
  'Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio',
  'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel',
  '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras',
  'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios',
  'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones',
  'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós',
  'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc',
  'Sofonías', 'Hageo', 'Zacarías', 'Malaquías', 'Mateo',
  'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos',
  '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses',
  'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo',
  'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro',
  '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas',
  'Apocalipsis'
];

// Mock chapters per book
export const mockChapters: Record<string, number> = {
  'Génesis': 50,
  'Éxodo': 40,
  'Levítico': 27,
  'Números': 36,
  'Deuteronomio': 34,
  'Josué': 24,
  'Jueces': 21,
  'Rut': 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Reyes': 22,
  '2 Reyes': 25,
  '1 Crónicas': 29,
  '2 Crónicas': 36,
  'Esdras': 10,
  'Nehemías': 13,
  'Ester': 10,
  'Job': 42,
  'Salmos': 150,
  'Proverbios': 31,
  'Eclesiastés': 12,
  'Cantares': 8,
  'Isaías': 66,
  'Jeremías': 52,
  'Lamentaciones': 5,
  'Ezequiel': 48,
  'Daniel': 12,
  'Oseas': 14,
  'Joel': 3,
  'Amós': 9,
  'Abdías': 1,
  'Jonás': 4,
  'Miqueas': 7,
  'Nahúm': 3,
  'Habacuc': 3,
  'Sofonías': 3,
  'Hageo': 2,
  'Zacarías': 14,
  'Malaquías': 4,
  'Mateo': 28,
  'Marcos': 16,
  'Lucas': 24,
  'Juan': 21,
  'Hechos': 28,
  'Romanos': 16,
  '1 Corintios': 16,
  '2 Corintios': 13,
  'Gálatas': 6,
  'Efesios': 6,
  'Filipenses': 4,
  'Colosenses': 4,
  '1 Tesalonicenses': 5,
  '2 Tesalonicenses': 3,
  '1 Timoteo': 6,
  '2 Timoteo': 4,
  'Tito': 3,
  'Filemón': 1,
  'Hebreos': 13,
  'Santiago': 5,
  '1 Pedro': 5,
  '2 Pedro': 3,
  '1 Juan': 5,
  '2 Juan': 1,
  '3 Juan': 1,
  'Judas': 1,
  'Apocalipsis': 22
};

// Mock verses per chapter per book (for verse selector population)
export const mockChapterVerses: Record<string, Record<number, number>> = {
  'Génesis': {
    1: 31, 2: 25, 3: 24, 4: 26, 5: 32, 6: 22, 7: 24, 8: 22, 9: 29, 10: 32,
    11: 32, 12: 20, 13: 18, 14: 24, 15: 21, 16: 16, 17: 27, 18: 33, 19: 38, 20: 18,
    21: 34, 22: 24, 23: 20, 24: 67, 25: 34, 26: 35, 27: 46, 28: 22, 29: 35, 30: 43,
    31: 55, 32: 32, 33: 20, 34: 31, 35: 29, 36: 43, 37: 36, 38: 30, 39: 23, 40: 23,
    41: 57, 42: 38, 43: 34, 44: 34, 45: 28, 46: 34, 47: 31, 48: 22, 49: 33, 50: 26
  },
  'Juan': {
    1: 51, 2: 25, 3: 36, 4: 54, 5: 47, 6: 71, 7: 53, 8: 59, 9: 41, 10: 42,
    11: 57, 12: 50, 13: 38, 14: 31, 15: 27, 16: 33, 17: 26, 18: 40, 19: 42, 20: 31, 21: 25
  },
  'Salmos': {
    1: 6, 2: 12, 3: 8, 4: 8, 5: 12, 6: 10, 7: 17, 8: 9, 9: 20, 10: 18,
    11: 7, 12: 8, 13: 6, 14: 7, 15: 5, 16: 11, 17: 15, 18: 50, 19: 14, 20: 9,
    21: 13, 22: 31, 23: 6, 24: 10, 25: 22, 26: 12, 27: 14, 28: 9, 29: 11, 30: 12,
    31: 24, 32: 11, 33: 22, 34: 23, 35: 28, 36: 12, 37: 40, 38: 22, 39: 13, 40: 17,
    41: 13, 42: 11, 43: 5, 44: 26, 45: 24, 46: 11, 47: 9, 48: 14, 49: 9, 50: 23,
    51: 19, 52: 9, 53: 6, 54: 7, 55: 23, 56: 12, 57: 11, 58: 11, 59: 17, 60: 12,
    61: 8, 62: 12, 63: 11, 64: 10, 65: 13, 66: 20, 67: 35, 68: 35, 69: 36, 70: 5,
    71: 24, 72: 20, 73: 28, 74: 23, 75: 10, 76: 12, 77: 28, 78: 72, 79: 13, 80: 19,
    81: 16, 82: 8, 83: 18, 84: 12, 85: 13, 86: 17, 87: 7, 88: 18, 89: 52, 90: 17,
    91: 16, 92: 15, 93: 5, 94: 23, 95: 11, 96: 13, 97: 12, 98: 9, 99: 9, 100: 5,
    101: 8, 102: 28, 103: 22, 104: 35, 105: 45, 106: 48, 107: 43, 108: 13, 109: 31, 110: 5,
    111: 10, 112: 10, 113: 9, 114: 8, 115: 18, 116: 19, 117: 2, 118: 176, 119: 176, 120: 5,
    121: 8, 122: 5, 123: 4, 124: 8, 125: 5, 126: 5, 127: 5, 128: 6, 129: 5, 130: 8,
    131: 8, 132: 10, 133: 3, 134: 3, 135: 21, 136: 24, 137: 9, 138: 8, 139: 24, 140: 13,
    141: 10, 142: 7, 143: 12, 144: 15, 145: 7, 146: 10, 147: 11, 148: 14, 149: 9, 150: 6
  }
};