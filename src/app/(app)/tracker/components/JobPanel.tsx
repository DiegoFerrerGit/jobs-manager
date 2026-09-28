import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TrackerJob, TrackerConfig, SelectOption, OPTION_COLORS } from "../types";
import { X, ExternalLink, Link as LinkIcon, Building2, MapPin, DollarSign, Calendar, Target, Hash, AlignLeft, UserCircle2, GripVertical } from "lucide-react";
import NotionSelect from "./NotionSelect";

interface JobPanelProps {
  job: TrackerJob;
  columnId: string;
  config: TrackerConfig;
  columns: { id: string; title: string; badge: string; cardBg?: string; wrapperBg?: string; }[];
  onClose: () => void;
  onUpdate: (updatedJob: TrackerJob, targetColumnId?: string) => void;
  onUpdateConfig: (newConfig: TrackerConfig) => void;
}

export default function JobPanel({ job, columnId, config, columns, onClose, onUpdate, onUpdateConfig }: JobPanelProps) {
  const [data, setData] = useState<TrackerJob>(job);
  
  useEffect(() => {
    setData(job);
  }, [job]);

  const handleChange = (field: keyof TrackerJob, value: any) => {
    const updated = { ...data, [field]: value };
    
    // Auto-calculate annual salary if monthly is set
    if (field === "salarioMensual") {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        updated.salarioAnual = num * 12;
      } else {
        updated.salarioAnual = undefined;
      }
    }
    
    setData(updated);
    onUpdate(updated);
  };

  const handleAddOption = (field: keyof TrackerConfig["options"], option: SelectOption) => {
    const newConfig = { ...config };
    newConfig.options[field] = [...newConfig.options[field], option];
    onUpdateConfig(newConfig);
  };

  const handleEditOption = (field: keyof TrackerConfig["options"], oldLabel: string, newOption: SelectOption) => {
    const newConfig = { ...config };
    newConfig.options[field] = newConfig.options[field].map(o => o.label === oldLabel ? newOption : o);
    onUpdateConfig(newConfig);
    if (data[field] === oldLabel) {
      handleChange(field, newOption.label);
    }
  };

  const handleDeleteOption = (field: keyof TrackerConfig["options"], label: string) => {
    const newConfig = { ...config };
    newConfig.options[field] = newConfig.options[field].filter(o => o.label !== label);
    onUpdateConfig(newConfig);
    if (data[field] === label) {
      handleChange(field, undefined);
    }
  };

  const handleStageChange = (newColId: string) => {
    onUpdate(data, newColId);
  };

  const DEFAULT_FIELD_ORDER = [
    "linkEmpresa", "linkPosicion", "stage", "contactoRecruiter", "contactoLeader",
    "role", "handsOn", "inglesRequerido", "idiomaPosicion", "location", "plataforma",
    "tipoContratacion", "formaPago", "salarioMensual", "salarioAnual", "beneficios",
    "contras", "motivoRechazo", "instanciaCierre", "categoriaCierre"
  ];

  const FIELD_DEFINITIONS: Record<string, { label: string; icon: React.ReactNode; render: () => React.ReactNode }> = {
    linkEmpresa: { label: "Link Empresa", icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.linkEmpresa} onChange={v => handleChange("linkEmpresa", v)} /> },
    linkPosicion: { label: "Link Posición", icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.linkPosicion} onChange={v => handleChange("linkPosicion", v)} /> },
    stage: { label: "Stage", icon: <Target className="w-4 h-4" />, render: () => <StageSelect value={columnId} columns={columns} onChange={handleStageChange} /> },
    contactoRecruiter: { label: "Contacto Recruiter", icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.contactoRecruiter} onChange={v => handleChange("contactoRecruiter", v)} /> },
    contactoLeader: { label: "Contacto Leader", icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.contactoLeader} onChange={v => handleChange("contactoLeader", v)} /> },
    role: { label: "Role", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.role} options={config.options.role} onChange={v => handleChange("role", v)} onAddOption={o => handleAddOption("role", o)} onEditOption={(oldL, newO) => handleEditOption("role", oldL, newO)} onDeleteOption={l => handleDeleteOption("role", l)} /> },
    handsOn: { label: "Hands ON", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.handsOn} options={config.options.handsOn} onChange={v => handleChange("handsOn", v)} onAddOption={o => handleAddOption("handsOn", o)} onEditOption={(oldL, newO) => handleEditOption("handsOn", oldL, newO)} onDeleteOption={l => handleDeleteOption("handsOn", l)} /> },
    inglesRequerido: { label: "Inglés Requerido", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.inglesRequerido} options={config.options.inglesRequerido} onChange={v => handleChange("inglesRequerido", v)} onAddOption={o => handleAddOption("inglesRequerido", o)} onEditOption={(oldL, newO) => handleEditOption("inglesRequerido", oldL, newO)} onDeleteOption={l => handleDeleteOption("inglesRequerido", l)} /> },
    idiomaPosicion: { label: "Idioma de la posición", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.idiomaPosicion} options={config.options.idiomaPosicion} onChange={v => handleChange("idiomaPosicion", v)} onAddOption={o => handleAddOption("idiomaPosicion", o)} onEditOption={(oldL, newO) => handleEditOption("idiomaPosicion", oldL, newO)} onDeleteOption={l => handleDeleteOption("idiomaPosicion", l)} /> },
    location: { label: "Location", icon: <MapPin className="w-4 h-4" />, render: () => <NotionSelect value={data.location} options={config.options.location} onChange={v => handleChange("location", v)} onAddOption={o => handleAddOption("location", o)} onEditOption={(oldL, newO) => handleEditOption("location", oldL, newO)} onDeleteOption={l => handleDeleteOption("location", l)} /> },
    plataforma: { label: "Plataforma", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.plataforma} options={config.options.plataforma} onChange={v => handleChange("plataforma", v)} onAddOption={o => handleAddOption("plataforma", o)} onEditOption={(oldL, newO) => handleEditOption("plataforma", oldL, newO)} onDeleteOption={l => handleDeleteOption("plataforma", l)} /> },
    tipoContratacion: { label: "Tipo de contratación", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.tipoContratacion} options={config.options.tipoContratacion} onChange={v => handleChange("tipoContratacion", v)} onAddOption={o => handleAddOption("tipoContratacion", o)} onEditOption={(oldL, newO) => handleEditOption("tipoContratacion", oldL, newO)} onDeleteOption={l => handleDeleteOption("tipoContratacion", l)} /> },
    formaPago: { label: "Forma de pago", icon: <AlignLeft className="w-4 h-4" />, render: () => <TextInput value={data.formaPago} onChange={v => handleChange("formaPago", v)} /> },
    salarioMensual: { label: "Salario Mensual", icon: <Hash className="w-4 h-4" />, render: () => <CurrencyInput value={data.salarioMensual} currency={data.monedaSalario || 'USD'} onChange={v => handleChange("salarioMensual", v)} onCurrencyChange={c => handleChange("monedaSalario", c)} /> },
    salarioAnual: { label: "Salario Anual", icon: <Hash className="w-4 h-4" />, render: () => <CurrencyInput value={data.salarioAnual} currency={data.monedaSalario || 'USD'} onChange={v => handleChange("salarioAnual", v)} onCurrencyChange={c => handleChange("monedaSalario", c)} /> },
    beneficios: { label: "Beneficios", icon: <AlignLeft className="w-4 h-4" />, render: () => <textarea rows={1} value={data.beneficios || ""} onChange={e => handleChange("beneficios", e.target.value)} placeholder="Vacío" className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground w-full text-sm resize-y custom-scrollbar min-h-[32px] px-2 py-1.5 rounded transition-all hover:bg-white/5 focus:bg-[#2a2a2a]" /> },
    contras: { label: "Contras", icon: <AlignLeft className="w-4 h-4" />, render: () => <textarea rows={1} value={data.contras || ""} onChange={e => handleChange("contras", e.target.value)} placeholder="Vacío" className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground w-full text-sm resize-y custom-scrollbar min-h-[32px] px-2 py-1.5 rounded transition-all hover:bg-white/5 focus:bg-[#2a2a2a]" /> },
    motivoRechazo: { label: "Motivo Rechazo", icon: <AlignLeft className="w-4 h-4" />, render: () => <TextInput value={data.motivoRechazo} onChange={v => handleChange("motivoRechazo", v)} /> },
    instanciaCierre: { label: "Instancia de Cierre", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.instanciaCierre} options={config.options.instanciaCierre} onChange={v => handleChange("instanciaCierre", v)} onAddOption={o => handleAddOption("instanciaCierre", o)} onEditOption={(oldL, newO) => handleEditOption("instanciaCierre", oldL, newO)} onDeleteOption={l => handleDeleteOption("instanciaCierre", l)} /> },
    categoriaCierre: { label: "Categoria de Cierre", icon: <Target className="w-4 h-4" />, render: () => <NotionSelect value={data.categoriaCierre} options={config.options.categoriaCierre} onChange={v => handleChange("categoriaCierre", v)} onAddOption={o => handleAddOption("categoriaCierre", o)} onEditOption={(oldL, newO) => handleEditOption("categoriaCierre", oldL, newO)} onDeleteOption={l => handleDeleteOption("categoriaCierre", l)} /> },
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 w-[600px] bg-[#1a1a1a] border-l border-[#333] h-screen flex flex-col shadow-2xl z-50 text-[14px] animate-in slide-in-from-right-8 duration-200">
      <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Header - Name */}
        <div className="mb-8">
          <input
            type="text"
            value={data.name || ""}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Untitled"
            className="w-full text-4xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30"
          />
        </div>

        <DragDropContext onDragEnd={(result) => {
          if (!result.destination) return;
          const currentOrder = config.fieldOrder || DEFAULT_FIELD_ORDER;
          const newOrder = Array.from(currentOrder);
          const [reorderedItem] = newOrder.splice(result.source.index, 1);
          newOrder.splice(result.destination.index, 0, reorderedItem);
          onUpdateConfig({ ...config, fieldOrder: newOrder });
        }}>
          <Droppable droppableId="job-fields">
            {(provided) => (
              <div 
                className="flex flex-col gap-3"
                {...provided.droppableProps} 
                ref={provided.innerRef}
              >
                {(config.fieldOrder || DEFAULT_FIELD_ORDER).map((fieldId, index) => {
                  const fieldDef = FIELD_DEFINITIONS[fieldId];
                  if (!fieldDef) return null;
                  return (
                    <Draggable key={fieldId} draggableId={fieldId} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.draggableProps} 
                          className={snapshot.isDragging ? "opacity-90 bg-[#1a1a1a] rounded shadow-2xl z-50" : ""}
                        >
                          <FieldRow 
                            icon={fieldDef.icon} 
                            label={fieldDef.label} 
                            dragHandleProps={provided.dragHandleProps}
                          >
                            {fieldDef.render()}
                          </FieldRow>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      </div>
    </>
  );
}

function FieldRow({ icon, label, children, dragHandleProps }: { icon: React.ReactNode, label: string, children: React.ReactNode, dragHandleProps?: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 group">
      <div 
        {...dragHandleProps}
        className="flex items-center gap-2 text-muted-foreground w-44 shrink-0 pt-1.5 pb-1.5 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-md px-1.5 -ml-1.5 transition-colors"
      >
        {icon}
        <span className="text-[13px] truncate" title={label}>{label}</span>
      </div>
      <div className="flex-1 min-w-0 flex items-center min-h-[32px]">
        {children}
      </div>
    </div>
  );
}

function LinkInput({ value, onChange }: { value?: string, onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 w-full group/link">
      <input
        type="text"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder="Vacío"
        className="w-full bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm"
      />
      {value && (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover/link:opacity-100 text-muted-foreground hover:text-sky-400 transition-all p-1">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function TextInput({ value, onChange }: { value?: string, onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder="Vacío"
      className="w-full bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm"
    />
  );
}

function CurrencyInput({ value, currency, onChange, onCurrencyChange }: { value?: number, currency: 'USD' | 'ARS', onChange: (v: number | undefined) => void, onCurrencyChange: (c: 'USD' | 'ARS') => void }) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    if (!isFocused) setLocalValue(value?.toString() || "");
  }, [value, isFocused]);

  const displayValue = isFocused ? localValue : (value ? value.toLocaleString(currency === 'ARS' ? 'es-AR' : 'en-US') : "");

  return (
    <div className="flex items-center gap-2 w-full group/input focus-within:bg-[#2a2a2a] focus-within:border-[#444] border border-transparent hover:bg-white/5 px-2 rounded transition-all">
      <input
        type="text"
        value={displayValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          const num = parseFloat(localValue);
          onChange(isNaN(num) ? undefined : num);
        }}
        onChange={e => {
          const val = e.target.value.replace(/[^\d.]/g, '');
          setLocalValue(val);
          const num = parseFloat(val);
          onChange(isNaN(num) ? undefined : num);
        }}
        placeholder="Vacío"
        className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full text-sm py-1.5"
      />
      <select 
        value={currency} 
        onChange={e => onCurrencyChange(e.target.value as 'USD' | 'ARS')}
        className="bg-transparent border-none outline-none text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer"
      >
        <option value="USD" className="bg-[#202020] text-foreground">USD</option>
        <option value="ARS" className="bg-[#202020] text-foreground">ARS</option>
      </select>
    </div>
  );
}

function StageSelect({ value, columns = [], onChange }: { value: string, columns?: { id: string; title: string; badge: string; cardBg?: string; wrapperBg?: string; }[], onChange: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCol = (columns || []).find(c => c.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceBelow < 250);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button"
        onClick={toggleOpen}
        className="text-sm py-1 px-2 rounded-md hover:bg-white/5 transition-colors min-h-[28px] min-w-[100px] flex items-center text-left"
      >
        {selectedCol ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs leading-tight ${selectedCol.cardBg} ${selectedCol.wrapperBg?.replace('bg-', 'text-').replace('/10', '')} text-white`}>
            {selectedCol.title}
          </span>
        ) : ""}
      </button>

      {isOpen && (
        <div className={`absolute left-0 ${openUpwards ? "bottom-full mb-1" : "top-full mt-1"} w-56 bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 flex flex-col text-[13px] text-muted-foreground overflow-hidden py-1`}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {columns.map(col => (
              <button
                key={col.id}
                onClick={() => {
                  onChange(col.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-[#303030] flex items-center gap-2 transition-colors"
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs leading-tight ${col.cardBg} text-white`}>
                  {col.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
