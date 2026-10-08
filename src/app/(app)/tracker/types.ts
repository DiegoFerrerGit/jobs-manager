export interface TrackerJob {
  id: string;
  name: string; // "Alpaca"
  linkEmpresa?: string;
  linkPosicion?: string;
  contactoRecruiter?: string;
  contactoLeader?: string;
  role?: string;
  handsOn?: string;
  inglesRequerido?: string;
  idiomaPosicion?: string;
  location?: string;
  plataforma?: string;
  tipoContratacion?: string;
  formaPago?: string;
  salarioMensual?: number;
  salarioAnual?: number;
  beneficios?: string;
  contras?: string;
  motivoRechazo?: string;
  instanciaCierre?: string;
  categoriaCierre?: string;
  monedaSalario?: 'USD' | 'ARS';
  score?: number;
  closedAt?: Date | null;
  customProps?: Record<string, CustomPropertyValue>;
  comments?: JobComment[];
  notes?: string;
}

export interface JobComment {
  id: string;
  author: string;
  authorPicture?: string;
  content: string;
  createdAt: Date;
}

export type CustomPropertyType =
  | 'text'
  | 'text_long'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'date'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'created_at'
  | 'location';

export interface CustomPropertyDef {
  id: string;
  name: string;
  type: CustomPropertyType;
  /** For select/multi_select/status: available options */
  options?: SelectOption[];
}

export type CustomPropertyValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export interface SelectOption {
  label: string;
  color: string;
}

export interface TrackerConfig {
  options: {
    role: SelectOption[];
    handsOn: SelectOption[];
    inglesRequerido: SelectOption[];
    idiomaPosicion: SelectOption[];
    location: SelectOption[];
    plataforma: SelectOption[];
    tipoContratacion: SelectOption[];
    instanciaCierre: SelectOption[];
    categoriaCierre: SelectOption[];
  };
  fieldOrder?: string[];
  customProperties?: CustomPropertyDef[];
}

export const DEFAULT_SELECT_OPTIONS: TrackerConfig["options"] = {
  role: [
    { label: "Engineering Manager", color: "bg-[#41688d] text-white/95" },
    { label: "Technical Lead", color: "bg-[#8c4669] text-white/95" },
    { label: "Solutions Engineering", color: "bg-[#457b54] text-white/95" },
    { label: "Tech Manager", color: "bg-[#9d6333] text-white/95" },
    { label: "Technical Director", color: "bg-[#785885] text-white/95" },
    { label: "Angular Lead", color: "bg-[#8b7a37] text-white/95" },
    { label: "Staff Engineer", color: "bg-[#7a5843] text-white/95" },
    { label: "Product Engineer", color: "bg-[#914646] text-white/95" },
    { label: "Head Of Engineering", color: "bg-[#5c5c5c] text-white/95" },
    { label: "Technical Manager", color: "bg-[#41688d] text-white/95" },
    { label: "Director of Engineering", color: "bg-[#785885] text-white/95" }
  ],
  handsOn: [
    { label: "Yes", color: "bg-[#457b54] text-white/95" },
    { label: "Poco", color: "bg-[#8b7a37] text-white/95" },
    { label: "No", color: "bg-[#914646] text-white/95" }
  ],
  inglesRequerido: [
    { label: "B1", color: "bg-[#5c5c5c] text-white/95" },
    { label: "B2", color: "bg-[#9d6333] text-white/95" },
    { label: "C1", color: "bg-[#41688d] text-white/95" },
    { label: "C2", color: "bg-[#785885] text-white/95" }
  ],
  idiomaPosicion: [
    { label: "English", color: "bg-[#41688d] text-white/95" },
    { label: "Spanish", color: "bg-[#5c5c5c] text-white/95" },
    { label: "Híbrido", color: "bg-[#785885] text-white/95" }
  ],
  location: [
    { label: "US 🗽", color: "bg-[#457b54] text-white/95" },
    { label: "Argentina", color: "bg-[#41688d] text-white/95" },
    { label: "Colombia", color: "bg-[#9d6333] text-white/95" },
    { label: "Latam", color: "bg-[#785885] text-white/95" },
    { label: "Uruguay", color: "bg-[#41688d] text-white/95" },
    { label: "London", color: "bg-[#7a5843] text-white/95" }
  ],
  plataforma: [
    { label: "Greenhouse", color: "bg-[#457b54] text-white/95" },
    { label: "Linkedin", color: "bg-[#41688d] text-white/95" }
  ],
  tipoContratacion: [
    { label: "Contractor", color: "bg-[#9d6333] text-white/95" },
    { label: "Relación de dependencia", color: "bg-[#41688d] text-white/95" }
  ],
  instanciaCierre: [
    { label: "People", color: "bg-[#7a5843] text-white/95" },
    { label: "Hiring Manager", color: "bg-[#8c4669] text-white/95" },
    { label: "Tecnica", color: "bg-[#785885] text-white/95" },
    { label: "C-Level / Culture", color: "bg-[#8b7a37] text-white/95" },
    { label: "Oferta", color: "bg-[#41688d] text-white/95" },
    { label: "Proceso completo", color: "bg-[#914646] text-white/95" }
  ],
  categoriaCierre: [
    { label: "Nivel Inglés", color: "bg-[#41688d] text-white/95" },
    { label: "Filtro Técnico/Ambiguo", color: "bg-[#914646] text-white/95" },
    { label: "Ghosting", color: "bg-[#9d6333] text-white/95" },
    { label: "Sin feedback", color: "bg-[#8c4669] text-white/95" },
    { label: "Presupuesto/Salario", color: "bg-[#457b54] text-white/95" },
    { label: "Cerrada por mí/No me gustó", color: "bg-[#785885] text-white/95" },
    { label: "Referido/Interno", color: "bg-[#8b7a37] text-white/95" },
    { label: "Fit especifico", color: "bg-[#5c5c5c] text-white/95" },
    { label: "En Hold", color: "bg-[#5c5c5c] text-white/95" }
  ]
};

export const OPTION_COLORS = [
  { name: "Gris", color: "bg-[#5c5c5c] text-white/95" },
  { name: "Marrón", color: "bg-[#7a5843] text-white/95" },
  { name: "Naranja", color: "bg-[#9d6333] text-white/95" },
  { name: "Amarillo", color: "bg-[#8b7a37] text-white/95" },
  { name: "Verde", color: "bg-[#457b54] text-white/95" },
  { name: "Azul", color: "bg-[#41688d] text-white/95" },
  { name: "Morado", color: "bg-[#785885] text-white/95" },
  { name: "Rosa", color: "bg-[#8c4669] text-white/95" },
  { name: "Rojo", color: "bg-[#914646] text-white/95" }
];
