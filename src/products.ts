export interface NaturaProduct {
  id: string;
  name: string;
  line: string; // e.g. "Kaiak", "Homem", "Humor", "Ekos", "Chronos"
  category: "Perfumería Masculina" | "Perfumería Femenina" | "Skincare / Rostro" | "Cuerpo & Hidratación";
  activeOrPath: string; // Camino olfativo o activo principal (e.g. Aromático Herbal, Floral, Concentrado de Jatobá)
  intensity?: "Leve" | "Moderado" | "Intenso";
  notes?: {
    salida: string; // Top notes
    corazon: string; // Heart notes
    fondo: string; // Base notes
  };
  benefits: string[];
  volumeOrContent: string;
  repuestoDisponible: boolean;
  consejoUso: string;
  promociones?: {
    ciclo: string;
    mensaje: string;
    puntosExtra?: number;
  }[];
}

export const NATURA_CYCLES = ["Ciclo 08", "Ciclo 09", "Ciclo 10"];

export const NATURA_PRODUCTS: NaturaProduct[] = [
  {
    id: "kaiak_urbe",
    name: "Kaiak Urbe",
    line: "Kaiak",
    category: "Perfumería Masculina",
    activeOrPath: "Aromático Herbal Moderado",
    intensity: "Moderado",
    notes: {
      salida: "Menta, bergamota, limón, hojas verdes",
      corazon: "Albahaca, nuez moscada, lavanda, geranio",
      fondo: "Sándalo, ámbar, almizcle, notas de maderas exóticas"
    },
    benefits: [
      "Fragancia urbana y audaz ideal para el día a día en la ciudad.",
      "Acompaña el ritmo de la calle con notas herbales y toques cítricos.",
      "Envase sustentable hecho con hasta un 30% de vidrio reciclado y tapa con plástico reciclado del océano."
    ],
    volumeOrContent: "100 ml",
    repuestoDisponible: false,
    consejoUso: "Aplicá en muñecas, cuello y detrás de las orejas para una mayor proyección urbana.",
    promociones: [
      { ciclo: "Ciclo 09", mensaje: "¡20% OFF en este ciclo!", puntosExtra: 5 }
    ]
  },
  {
    id: "kaiak_vital_m",
    name: "Kaiak Vital Masculino",
    line: "Kaiak",
    category: "Perfumería Masculina",
    activeOrPath: "Aromático Herbal Leve/Moderado",
    intensity: "Moderado",
    notes: {
      salida: "Acorde marino, jengibre, mandarina, piper",
      corazon: "Geranio, ciclamen, lavanda, salvia",
      fondo: "Pachulí, sándalo, ámbar, cedro"
    },
    benefits: [
      "Sensación revitalizante inspirada en la frescura azul del océano profundo.",
      "Se ha comprobado científicamente que promueve sentimientos de bienestar y vitalidad.",
      "Sustentable: alcohol 100% orgánico y envase ecológico."
    ],
    volumeOrContent: "100 ml",
    repuestoDisponible: false,
    consejoUso: "Perfecto después de una ducha reparadora por la mañana o antes de hacer deporte.",
    promociones: [
        { ciclo: "Ciclo 10", mensaje: "¡Puntos extra por lanzamiento!", puntosExtra: 10 }
    ]
  },
  {
    id: "kaiak_aventura_m",
    name: "Kaiak Aventura Masculino",
    line: "Kaiak",
    category: "Perfumería Masculina",
    activeOrPath: "Aromático Herbal Leve",
    intensity: "Leve",
    notes: {
      salida: "Bergamota, artemisia, notas acuosas",
      corazon: "Pimienta negra, muguet, dihidromircenol",
      fondo: "Almizcle, sándalo, ámbar"
    },
    benefits: [
      "Explosión de naturaleza con energía limpia y fresca.",
      "Excelente para uso vespertino o climas cálidos por su frescura prolongada.",
      "Aromático herbal ideal para quienes disfrutan el movimiento al aire libre."
    ],
    volumeOrContent: "100 ml",
    repuestoDisponible: false,
    consejoUso: "Rociá generosamente sobre el pecho y hombros para una estela refrescante y aventurera."
  },
  {
    id: "homem_potence",
    name: "Natura Homem Potence",
    line: "Homem",
    category: "Perfumería Masculina",
    activeOrPath: "Amaderado Intenso",
    intensity: "Intenso",
    notes: {
      salida: "Mandarina, pimienta negra, cardamomo",
      corazon: "Ginebra, ciruela, lavándula, madera de cachemira",
      fondo: "Sándalo, vainilla, ámbar, Cedro"
    },
    benefits: [
      "Perfume magnético y sensual con un toque picante de pimienta negra.",
      "Duración prolongada de hasta 10 horas ideal para uso nocturno o climas fríos.",
      "Diseñado para eventos especiales y ocasiones donde buscas destacar."
    ],
    volumeOrContent: "100 ml",
    repuestoDisponible: false,
    consejoUso: "Aplicá en zonas de pulso caliente y evitá frotar las muñecas para no romper las moléculas de salida.",
  },
  {
    id: "humor_proprio",
    name: "Humor Próprio (Cereza en Flor/Humor 5)",
    line: "Humor",
    category: "Perfumería Femenina",
    activeOrPath: "Dulce Oriental Moderado",
    intensity: "Moderado",
    notes: {
      salida: "Manzana colorada, frutilla, cereza, pera",
      corazon: "Rosa, jazmín, lirio del valle",
      fondo: "Ámbar, vainilla, notas lácticas, almizcle, sándalo"
    },
    benefits: [
      "Perfume súper alegre con una adictiva mezcla de cereza en almíbar y flores.",
      "Perfecto para levantar el ánimo y expresar una personalidad divertida y optimista.",
      "Frasco colorido con formas asimétricas que rompe con la rutina diaria."
    ],
    volumeOrContent: "75 ml",
    repuestoDisponible: true,
    consejoUso: "Llevá contigo en la cartera para un retoque rápido durante la tarde.",
  },
  {
    id: "meu_primeiro_humor",
    name: "Meu Primeiro Humor (Humor 1)",
    line: "Humor",
    category: "Perfumería Femenina",
    activeOrPath: "Frutal Leve/Moderado",
    intensity: "Moderado",
    notes: {
      salida: "Pera, casis, cítricos, notas frutales",
      corazon: "Jazmín, lirio, flor de macadamia",
      fondo: "Musgo, sándalo, ámbar"
    },
    benefits: [
      "La fragancia más vendida de la línea Humor por su irresistible frescura de pera.",
      "Ideal para el público joven o quienes aman los aromas frutales jugosos y radiantes.",
      "Envase icónico y juvenil."
    ],
    volumeOrContent: "75 ml",
    repuestoDisponible: true,
    consejoUso: "Aplicálo en ráfagas al salir de la ducha sobre el cuello y escote.",
  },
  {
    id: "ekos_castana_cuerpo",
    name: "Pulpa Hidratante de Manos Ekos Castaña",
    line: "Ekos",
    category: "Cuerpo & Hidratación",
    activeOrPath: "Aceite bruto de Castaña (Nutrición)",
    benefits: [
      "Nutre profundamente la piel de las manos y las cutículas.",
      "Textura cremosa de rápida absorción que combate la resequedad extrema.",
      "Hecho con un 97% de activos de origen natural y comercio ético en la Amazonia."
    ],
    volumeOrContent: "75 g",
    repuestoDisponible: true,
    consejoUso: "Aplicá en las manos limpias masajeando desde los dedos hacia las muñecas, prestando atención a las cutículas.",
  },
  {
    id: "ekos_maracuya_cuerpo",
    name: "Néctar Hidratante Corporal Ekos Maracuyá",
    line: "Ekos",
    category: "Cuerpo & Hidratación",
    activeOrPath: "Aceite de Maracuyá (Anti-estrés cutáneo)",
    benefits: [
      "Calma, suaviza y reequilibra la barrera de tu piel dejándola fresca.",
      "Textura de néctar súper ligera, ideal para usar en verano.",
      "Deja la piel perfumada con notas cítricas, refrescantes y relajantes."
    ],
    volumeOrContent: "400 ml",
    repuestoDisponible: true,
    consejoUso: "Aplicá en todo el cuerpo con movimientos circulares tras el baño diario.",
  },
  {
    id: "chronos_antisenales_45",
    name: "Crema Antiseñales Chronos Firmeza y Luminosidad 45+",
    line: "Chronos",
    category: "Skincare / Rostro",
    activeOrPath: "Extracto de Jatobá + Aminoácidos",
    benefits: [
      "Reduce arrugas profundas y recupera la firmeza natural de la piel.",
      "Estimula la producción de colágeno hasta en un 4x más rápido.",
      "Disponible en versión Día (FPS 30, previene manchas) y versión Noche (nutrición celular)."
    ],
    volumeOrContent: "40 g",
    repuestoDisponible: true,
    consejoUso: "Aplicá por la mañana y noche sobre el rostro limpio y seco con movimientos ascendentes.",
  },
  {
    id: "chronos_antisenales_30",
    name: "Crema Antiseñales Chronos Renovación e Energía 30+",
    line: "Chronos",
    category: "Skincare / Rostro",
    activeOrPath: "Extracto de Jambú + Polifenoles",
    benefits: [
      "Suaviza líneas de expresión tempranas y elimina el aspecto de fatiga de la piel.",
      "Estimula la renovación de células para recuperar el brillo saludable del rostro.",
      "Aporta una hidratación intensa y continua con protección antioxidante."
    ],
    volumeOrContent: "40 g",
    repuestoDisponible: true,
    consejoUso: "Masajeá suavemente sobre la frente, mejillas y cuello limpio desde el centro hacia afuera.",
  }
];
