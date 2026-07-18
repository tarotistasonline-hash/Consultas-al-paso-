import { Category, Preset } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "rutina",
    name: "Consulta Preliminar",
    icon: "Activity",
    description: "Orientador inteligente de pautas de alarma y cuidados para síntomas comunes como fiebre, dolores corporales, digestión o resfríos.",
    placeholder: "Hola, contame qué síntomas tenés y te guiaré con pautas de alarma y alivio general..."
  },
  {
    id: "sales_copy",
    name: "Análisis de Estudios",
    icon: "FileText",
    description: "Subí o escribí los resultados de tus análisis de sangre, orina u otros reportes para que la IA los interprete sobre valores de referencia.",
    placeholder: "Subí una foto o archivo de tu estudio, o escribí los valores clínicos acá abajo para analizarlos..."
  },
  {
    id: "negocio",
    name: "Tips de Bienestar",
    icon: "Heart",
    description: "Consejos científicos de salud que se actualizan permanentemente sobre nutrición, hábitos diarios de vida, prevención y bienestar físico.",
    placeholder: "Consultá acá sobre consejos de salud, hábitos saludables, prevención y nutrición..."
  }
];

export const PRESETS: Preset[] = [
  {
    id: "p1",
    categoryId: "rutina",
    title: "Tengo fiebre",
    prompt: "Tengo fiebre de 38.5 grados desde hace un día, dolor de cuerpo leve y cansancio. ¿Cuáles son las pautas de alarma que debo tener en cuenta y qué medidas de hidratación y cuidado casero puedo tomar en San Juan?",
    badge: "Fiebre"
  },
  {
    id: "p2",
    categoryId: "rutina",
    title: "Me duele la garganta",
    prompt: "Tengo un dolor de garganta fuerte al tragar, ganglios inflamados en el cuello y un poco de congestión nasal. No tengo fiebre alta. ¿Qué cuidados generales o de alivio sintomático me sugerís?",
    badge: "Garganta"
  },
  {
    id: "p3",
    categoryId: "rutina",
    title: "Tengo dolor de cabeza",
    prompt: "Sufro de un dolor de cabeza pulsante en un solo lado, acompañado de sensibilidad a la luz y náuseas leves. ¿Cómo puedo diferenciar una migraña de una cefalea común y qué cuidados puedo seguir?",
    badge: "Dolor"
  }
];

export const DEFAULT_STATS: {
  resolvedDilemas: number;
  charactersOfTruth: number;
  categories: Record<string, number>;
  trend: { date: string; dilemmas: number; characters: number }[];
  monthlyTrend: { date: string; dilemmas: number; characters: number }[];
  helpfulCount: number;
  unhelpfulCount: number;
} = {
  resolvedDilemas: 124,
  charactersOfTruth: 145900,
  helpfulCount: 0,
  unhelpfulCount: 0,
  categories: {
    rutina: 42,
    sales_copy: 35,
    negocio: 24,
    libre: 8
  },
  trend: [
    { date: "Lun", dilemmas: 8, characters: 9800 },
    { date: "Mar", dilemmas: 12, characters: 15400 },
    { date: "Mié", dilemmas: 9, characters: 11100 },
    { date: "Jue", dilemmas: 15, characters: 18700 },
    { date: "Vie", dilemmas: 14, characters: 17200 }
  ],
  monthlyTrend: [
    { date: "Ene", dilemmas: 55, characters: 62000 },
    { date: "Feb", dilemmas: 68, characters: 78000 },
    { date: "Mar", dilemmas: 85, characters: 94000 },
    { date: "Abr", dilemmas: 102, characters: 112000 },
    { date: "May", dilemmas: 124, characters: 145900 }
  ]
};

export const NEWS_ARTICLES = [
  // Avances Científicos (8 items starting with 'news-d')
  {
    id: "news-d1",
    category: "Inmunoterapia",
    title: "Vacunas de ARNm Personalizadas contra el Cáncer entran en Fase III",
    date: "7 de Junio, 2026",
    summary: "Los ensayos clínicos de fase avanzada ratifican una reducción del 44% en el riesgo de recurrencia o muerte en melanoma grave mediante vacunas diseñadas a medida.",
    source: "Clinical Cancer Research / NEJM",
    content: [
      "La oncología de precisión está viviendo una revolución histórica. Los últimos resultados presentados en simposios internacionales revelan que las vacunas terapéuticas personalizadas de ARN mensajero (ARNm) están logrando entrenar con éxito al sistema inmunológico de los pacientes para identificar y destruir células tumorales específicas.",
      "A diferencia de las vacunas preventivas tradicionales, este tratamiento se fabrica a medida para cada persona. Se secuencia el genoma del tumor extraído tras la cirugía para identificar sus mutaciones únicas (neoantígenos) y se sintetiza una molécula de ARNm específica en pocas semanas.",
      "Al inyectarse en combinación con anticuerpos monoclonales inmunomoduladores (como el Pembrolizumab), las células dendríticas del paciente presentan estas firmas tumorales a los linfocitos T, activando un ejército sumamente específico capaz de eliminar cualquier residuo microscópico del cáncer y prevenir metástasis."
    ]
  },
  {
    id: "news-d2",
    category: "Edición Génica",
    title: "Hito de la Medicina: Primera Terapia con CRISPR Aprobada para Uso Humano",
    date: "6 de Junio, 2026",
    summary: "Se autoriza oficialmente Casgevy, la primera cura génica basada en 'tijeras biológicas' CRISPR-Cas9 para corregir enfermedades hereditarias de la sangre de forma definitiva.",
    source: "US Food and Drug Administration (FDA) / EMA",
    content: [
      "La tecnología de edición genómica CRISPR que valió el Premio Nobel a Jennifer Doudna y Emmanuelle Charpentier ha completado su transición del laboratorio a la clínica diaria. Entes regulatorios internacionales han aprobado la primera terapia comercial basada en CRISPR-Cas9, denominada comercialmente Casgevy.",
      "Esta terapia está indicada para pacientes con anemia de células falciformes (drepanocitosis) y beta-talasemia mayor, dos anemias congénitas graves que provocaban dolores sistémicos extremos y requerían transfusiones de sangre constantes de por vida.",
      "El procedimiento consiste en extraer células madre hematopoyéticas del propio paciente, editarlas en el laboratorio cortando selectivamente el gen supresor BCL11A para reactivar la producción de hemoglobina fetal sana, y reintroducirlas mediante autotrasplante. Esto constituye una cura definitiva e integral, transformando radicalmente el porvenir de la hematología mundial."
    ]
  },
  {
    id: "news-d3",
    category: "Neurología",
    title: "Anticuerpos contra el Alzheimer: Fármacos Clínicos Logran Retrasar el Deterioro Cognitivo",
    date: "Hace 2 horas",
    summary: "La confirmación de la eficacia terapéutica de Lecanemab y Donanemab marca un punto de inflexión al atacar la raíz biológica de la enfermedad.",
    source: "The New England Journal of Medicine (NEJM)",
    content: [
      "Por primera vez en la historia de la neurología molecular, dos tratamientos con anticuerpos monoclonales diseñados en laboratorio han demostrado ralentizar de manera estadísticamente significativa el progreso clínico del Alzheimer en etapas iniciales o de deterioro cognitivo leve.",
      "Tanto el Lecanemab como el Donanemab funcionan adhiriéndose selectivamente a las proteínas solubles beta-amiloides insolubles y facilitando su eliminación por parte de la microglia cerebral antes de que formen placas seniles que destruyen las conexiones neuronales.",
      "Los ensayos de fase III confirmaron una ralentización de hasta el 27% y 35% respectivamente en las escalas de deterioro funcional y cognitivo durante 18 meses de terapia endovenosa. Aunque no representa una cura mágica, abre la puerta a cronificar y detener selectivamente el avance de la demencia."
    ]
  },
  {
    id: "news-d4",
    category: "Biotecnología",
    title: "Biocompatibilidad Extrema: Éxito en Xenotrasplantes de Órganos Porcinos con CRISPR",
    date: "Hace 15 horas",
    summary: "Científicos logran transplantar riñones y corazones de cerdos genéticamente modificados a seres humanos sin rechazo hiperagudo.",
    source: "Massachusetts General Hospital / Nature Medicine",
    content: [
      "La escasez de donantes de órganos humanos para trasplante podría tener los días contados gracias a la biotecnología aplicada de xenotrasplantes. Equipos quirúrgicos renombrados han reportado supervivencias prolongadas y función hemodinámica perfecta utilizando riñones de cerdos genéticamente modificados.",
      "La clave del éxito reside en la eliminación de tres genes porcinos responsables del azúcar alfa-gal (causante del temido rechazo hiperagudo inmediato en primates) y la inserción de siete genes humanos reguladores de la coagulación y la inflamación mediante CRISPR.",
      "El órgano modificado no solo funcionó de inmediato produciendo orina y depurando creatinina celular, sino que las biopsias celulares de control demostraron ausencia completa de daño tisular por anticuerpos humanos a mediano plazo, pavimentando el camino para ensayos clínicos regulados a nivel masivo."
    ]
  },
  {
    id: "news-d5",
    category: "Inteligencia Artificial",
    title: "IA descubre un nuevo Antibiótico capaz de aniquilar Superbacterias hospitalarias",
    date: "5 de Junio, 2026",
    summary: "Mediante modelos de Deep Learning, biólogos aíslan una molécula inédita llamada 'Abaucina' que elimina de raíz la Acinetobacter baumannii.",
    source: "Revista Science / MIT",
    content: [
      "El aumento de la resistencia microbiana a los antibióticos es una de las mayores amenazas para la salud pública. Científicos del MIT acaban de anunciar el descubrimiento de un compuesto bactericida altamente selectivo utilizando redes neuronales artificiales de última generación.",
      "La inteligencia artificial analizó de forma virtual más de 7,500 compuestos químicos en busca de estructuras capaces de interrumpir el transporte de lipoproteínas en la membrana externa de la superbacteria 'Acinetobacter baumannii', causante de neumonías graves y sepsis intratables en entornos hospitalarios.",
      "El antibiótico resultante demostró una eficacia rotunda en cultivos biológicos y modelos inflamatorios sin alterar la flora bacteriana comensal benigna, representando la primera molécula antibiótica con mecanismo de acción novedoso diseñada de forma asistida por IA lista para fases clínicas aceleradas."
    ]
  },
  {
    id: "news-d6",
    category: "Neurología",
    title: "Implante de Interfaz Cerebro-Computadora restaura el habla en pacientes con parálisis",
    date: "Hace 1 día",
    summary: "Sensores corticales combinados con modelos de lenguaje de IA traducen impulsos del pensamiento a texto en una pantalla a 80 palabras por minuto.",
    source: "Nature Biotechnology / Stanford University",
    content: [
      "Un hito sin precedentes en la neuroestimulación clínica. Pacientes que perdieron completamente la capacidad del habla a causa de accidentes cerebrovasculares severos o esclerosis lateral amiotrófica (ELA) han recuperado la facultad de comunicarse con fluidez en tiempo real.",
      "El implante consiste en una red microscópica de microelectrodos colocada en áreas premotoras del habla de la corteza cerebral. Al intentar vocalizar mentalmente palabras, el software de IA decodifica las señales bioeléctricas neuronales, convirtiéndolas en texto instantáneo de alta fidelidad.",
      "La precisión del sistema supera un porcentaje promedio del 92% con un vocabulario de miles de términos, permitiendo además reproducir las frases escritas mediante un sintetizador de audio personalizado con su timbre de voz original pre-patología."
    ]
  },
  {
    id: "news-d7",
    category: "Biotecnología",
    title: "Terapia Génica revierte la Sordera Congénita por mutación de Otoferlina en ensayos clínicos",
    date: "Reciente (2026)",
    summary: "Niños nacidos con hipoacusia profunda recuperan una audición funcional óptima semanas después de una sola inyección coclear.",
    source: "The Lancet / Escuela de Medicina de Harvard",
    content: [
      "Por primera vez en la historia de la otología regenerativa, una única intervención génica ha devuelto la audición bilateral de manera integral a niños diagnosticados de nacimiento con sordera profunda causada por mutaciones raras en el gen OTOF (otoferlina), encargado de liberar neurotransmisores en las células ciliadas del oído interno.",
      "La técnica utiliza un virus adenoasociado (AAV) modificado genéticamente para transportar de forma segura una copia completamente funcional del gen de la otoferlina dentro de la cóclea del paciente a través de una cirugía mínimamente invasiva.",
      "A las pocas semanas, todos los pacientes tratados mostraron respuestas notables a los estímulos auditivos, alcanzando umbrales de audición cercanos a la normalidad y logrando desarrollar el lenguaje de forma fluida."
    ]
  },
  {
    id: "news-d8",
    category: "Cardiología",
    title: "Primer Marcapasos Biológico creado a partir de Células Madre cura Arritmias severas",
    date: "Mayo 2026",
    summary: "Se reprograman células miocárdicas comunes para comportarse como células de marcapasos natural, devolviendo el ritmo sinusal libre de cables.",
    source: "European Heart Journal / Cedars-Sinai Medical",
    content: [
      "La cardiología regenerativa ha dado un paso de proporciones de ciencia ficción. Un ensayo preclínico líder ha demostrado la viabilidad de crear marcapasos humanos biológicos reprogramando células del miocardio de soporte en el propio corazón del paciente.",
      "Mediante un vector viral desactivado cargado con un gen específico de transcripción biológica (TBX18), los cirujanos reprograman células musculares comunes para asimilar perfectamente el comportamiento químico y eléctrico del nodo sinusal natural, el marcapasos primario del corazón.",
      "Este avance elimina la necesidad de intervenciones complejas de recambio de batería, implante de electrodos endovenosos estresantes o riesgo de septicemia, estabilizando la frecuencia cardíaca de forma permanente y orgánica."
    ]
  },

  // Tips de Bienestar (8 items starting with 'news-t')
  {
    id: "news-t1",
    category: "Nutrición",
    title: "Alimentación Saludable y el Método del Plato",
    date: "Reciente (2026)",
    summary: "Estructurá de manera fácil tus porciones asociando verduras de temporada, hidratos complejos y proteínas sanas.",
    source: "Guías Alimentarias para la Población Argentina / OMS",
    content: [
      "Una alimentación equilibrada y rica en nutrientes reales previene de forma activa la incidencia de enfermedades cardiovasculares y diabetes tipo II.",
      "Para lograrlo de modo sencillo sin contar calorías, podés usar el método del plato: llená la mitad del plato con verduras variadas de estación (crudas o cocidas), un cuarto con proteínas de alta calidad (huevo, legumbres, pollo o pescado) y el cuarto restante con carbohidratos complejos (arroz integral, fideos integrales o calabaza).",
      "Recordá también preferir siempre frutas frescas como postre en lugar de snacks azucarados, y complementar tus comidas reduciendo el uso de sal agregada."
    ]
  },
  {
    id: "news-t2",
    category: "Hidratación",
    title: "La Importancia del Agua para tu Vitalidad Diaria",
    date: "Hace 4 horas",
    summary: "El consumo ideal de agua regula la digestión, disminuye la fatiga muscular y protege tus riñones.",
    source: "Organización Mundial de la Salud (OMS)",
    content: [
      "Nuestro organismo se compone en gran parte de agua, la cual interviene en casi todas las funciones metabólicas básicas de estimación diaria.",
      "Consumir entre 2 y 2.5 litros de agua pura al día favorece la eliminación de toxinas metabólicas, mejora la concentración mental y optimiza el tránsito intestinal de modo notable. Intentá no reemplazarla de forma masiva con mate, café o gaseosas, ya que el agua sola es irreemplazable para la hidratación celular.",
      "Si te cuesta tomar agua pura, probá saborizándola de forma natural con rodajas de limón, hojas de menta fresca o un toque de pepino bien frío."
    ]
  },
  {
    id: "news-t3",
    category: "Descanso",
    title: "Higiene del Sueño: Claves para una Noche Reparadora",
    date: "Reciente",
    summary: "Sincronizá tu reloj biológico natural disminuyendo pantallas y regulando horarios de descanso.",
    source: "Asociación Argentina de Medicina del Sueño",
    content: [
      "Dormir bien no se trata únicamente de cantidad de horas, sino de lograr fases de sueño profundo verdaderamente reparadoras para tu cerebro.",
      "Para optimizar tu descanso, apagá o alejá teléfonos celulares, tablets y computadoras al menos 45 minutos antes de irte a la cama. Esto permite que tu cerebro libere melatonina de forma óptima sin interferencia de luces azules.",
      "Mantené tu habitación lo más oscura y fresca posible, y evitá comidas abundantes o cargadas de condimentos o cafeína avanzada la tarde."
    ]
  },
  {
    id: "news-t4",
    category: "Prevención",
    title: "Consejos Prácticos de Postura en tu Trabajo y Hogar",
    date: "Hace 10 horas",
    summary: "Evitá tensiones crónicas regulando la posición de tu pantalla e incorporando pausas recomendadas.",
    source: "Consenso de Kinesiología y Ergonomía del Trabajo",
    content: [
      "Pasar largas jornadas sentado frente a dispositivos de pantalla suele generar contracturas cervicales, dorsales y dolor lumbar prevenible.",
      "Te sugerimos regular el monitor de modo que el borde superior quede alineado horizontalmente con tu mirada, permitiendo un cuello relajado. Apoyá ambos pies rectos en el suelo y mantené los hombros relajados sin encorvar la parte media.",
      "Cada una hora de actividad estática, acostumbrate a levantarte y estirar suavemente por 3 minutos: rotá hombros, estirá cervicales y caminá unos pasos."
    ]
  },
  {
    id: "news-t5",
    category: "Ejercicio",
    title: "Los 15 Minutos de Caminata Diaria que reducen tu inflamación",
    date: "Ayer (2026)",
    summary: "Caminar a paso ligero después del almuerzo o la cena modulación metabólica clave de glucosa e insulina.",
    source: "Sociedad Argentina de Cardiología / AHA",
    content: [
      "No necesitás pasarte horas extenuantes en un gimnasio para proteger tu sistema circulatorio e inmunológico de forma diario.",
      "Una caminata de apenas 15 minutos a un ritmo donde puedas hablar pero te sientas activo disminuye notablemente el cortisol, activa la microcirculación capilar profunda y facilita que los músculos absorban la glucosa circulante de manera inmediata.",
      "Es un hábito ideal para personas sedentarias o con resistencia a la insulina preexistente, protegiendo tus arterias y tu salud muscular."
    ]
  },
  {
    id: "news-t6",
    category: "Bienestar",
    title: "Ventilación Cruzada: Clave infalible contra virus en el hogar",
    date: "Hace 1 día",
    summary: "Abrir ventanas opuestas por 5 minutos regenera la calidad del aire de forma total reduciendo alérgenos.",
    source: "Organización Panamericana de la Salud (OPS)",
    content: [
      "La concentración de virus respiratorios, partículas de ácaros y alérgenos en ambientes cerrados es habitualmente hasta 5 veces superior que en el exterior.",
      "Para proteger la salud pulmonar de tu familia y evitar contagios encadenados, acostumbrate a realizar ventilaciones cruzadas abriendo ventanas o puertas opuestas al menos 5 o 10 minutos rotando dos veces al día.",
      "Esto reemplaza la carga de dióxido de carbono acumulada por oxígeno fresco, previniendo dolores de cabeza, alergias ambientales y sequedad de mucosas corporales."
    ]
  },
  {
    id: "news-t7",
    category: "Nutrición",
    title: "El Poder Cardio-Protector de un puñado de Frutos Secos",
    date: "Mayo 2026",
    summary: "Consumir nueces o almendras diariamente aporta grasas monoinsaturadas y fitoesteroles saludables.",
    source: "Revista de Nutrición Aplicada / AHA",
    content: [
      "Los fitoesteroles y ácidos grasos Omega-3 de las nueces y almendras naturales son protectores de primer nivel para la salud arterial.",
      "Un simple puñado diario (aproximadamente 30 gramos) disminuye los niveles circulantes de colesterol LDL (popularmente llamado malo) e inhibe la cascada inflamatoria celular de las arterias.",
      "Evitá aquellos frutos secos fritos, con exceso de sal o cubiertos en azúcar refinada para conservar intactos sus beneficios antioxidantes y proteicos."
    ]
  },
  {
    id: "news-t8",
    category: "Prevención",
    title: "Uso adecuado del Paracetamol: No sobrepases los límites seguros",
    date: "Hace pocas horas",
    summary: "Evitá la toxicidad hepática dosificando según recomendación y respetando los intervalos de tomas.",
    source: "ANMAT / Ministerio de Salud Argentina",
    content: [
      "Aunque el Paracetamol es un analgésico sumamente noble y seguro de venta libre, superponer dosis o automedicarse de forma descuidada compromete tu hígado.",
      "El límite absoluto diario seguro para un adulto sano es de 3 gramos (repartido en tomas separadas por un mínimo de 6 u 8 horas); nunca dupliques las tomas si sentís que la fiebre tarda en descender.",
      "Si consumís alcohol regularmente o padecés alguna patología hepática previa, consultá a tu médico antes de emplearlo habitualmente para evitar el riesgo de falla hepática."
    ]
  }
];

