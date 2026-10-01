import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TrackerJob, TrackerConfig, SelectOption, OPTION_COLORS, CustomPropertyDef, CustomPropertyType, CustomPropertyValue } from "../types";
import { X, ExternalLink, Link as LinkIcon, MapPin, Target, Hash, AlignLeft, GripVertical, Plus, Type, ToggleLeft, Globe, Mail, Phone, List, CheckSquare, Clock, Check, Trash2, Calendar } from "lucide-react";
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

const PROPERTY_TYPES: { type: CustomPropertyType; label: string; icon: React.ReactNode }[] = [
  { type: "text",         label: "Texto",              icon: <AlignLeft className="w-4 h-4" /> },
  { type: "number",       label: "Número",             icon: <Hash className="w-4 h-4" /> },
  { type: "select",       label: "Seleccionar",        icon: <List className="w-4 h-4" /> },
  { type: "multi_select", label: "Selección múltiple", icon: <List className="w-4 h-4" /> },
  { type: "status",       label: "Estado",             icon: <ToggleLeft className="w-4 h-4" /> },
  { type: "date",         label: "Fecha",              icon: <Calendar className="w-4 h-4" /> },
  { type: "checkbox",     label: "Casilla",            icon: <CheckSquare className="w-4 h-4" /> },
  { type: "url",          label: "Link",               icon: <LinkIcon className="w-4 h-4" /> },
  { type: "email",        label: "Correo electrónico", icon: <Mail className="w-4 h-4" /> },
  { type: "phone",        label: "Teléfono",           icon: <Phone className="w-4 h-4" /> },
  { type: "created_at",   label: "Fecha de creación",  icon: <Clock className="w-4 h-4" /> },
  { type: "location",     label: "Lugar",              icon: <MapPin className="w-4 h-4" /> },
];

function getTypeIcon(type: CustomPropertyType) {
  return PROPERTY_TYPES.find(p => p.type === type)?.icon ?? <AlignLeft className="w-4 h-4" />;
}

export default function JobPanel({ job, columnId, config, columns, onClose, onUpdate, onUpdateConfig }: JobPanelProps) {
  const [data, setData] = useState<TrackerJob>(job);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropName, setNewPropName] = useState("");
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [newlyAddedPropId, setNewlyAddedPropId] = useState<string | null>(null);
  const addPropBtnRef = useRef<HTMLButtonElement>(null);
  const addPropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setData(job); }, [job]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addPropRef.current && !addPropRef.current.contains(e.target as Node)) {
        setShowAddProperty(false);
      }
    };
    if (showAddProperty) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAddProperty]);

  const handleChange = (field: keyof TrackerJob, value: any) => {
    const updated = { ...data, [field]: value };
    if (field === "salarioMensual") {
      const num = typeof value === "number" ? value : parseFloat(value);
      updated.salarioAnual = isNaN(num) ? undefined : num * 12;
    }
    setData(updated);
    onUpdate(updated);
  };

  const handleCustomPropChange = (propId: string, value: CustomPropertyValue) => {
    const updated = { ...data, customProps: { ...data.customProps, [propId]: value } };
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
    if ((data as any)[field] === oldLabel) handleChange(field, newOption.label);
  };

  const handleDeleteOption = (field: keyof TrackerConfig["options"], label: string) => {
    const newConfig = { ...config };
    newConfig.options[field] = newConfig.options[field].filter(o => o.label !== label);
    onUpdateConfig(newConfig);
    if ((data as any)[field] === label) handleChange(field, undefined);
  };

  const handleStageChange = (newColId: string) => onUpdate(data, newColId);

  const handleAddProperty = (type: CustomPropertyType) => {
    const name = newPropName.trim() || PROPERTY_TYPES.find(p => p.type === type)?.label || type;
    const id = `custom_${Date.now()}`;
    const newDef: CustomPropertyDef = { id, name, type, options: [] };
    const currentOrder = config.fieldOrder || DEFAULT_FIELD_ORDER;
    onUpdateConfig({ 
      ...config, 
      customProperties: [...(config.customProperties || []), newDef],
      fieldOrder: [...currentOrder, id]
    });
    setNewPropName("");
    setShowAddProperty(false);
    setNewlyAddedPropId(id);
  };

  const openAddPropertyPanel = () => {
    if (addPropBtnRef.current) {
      const rect = addPropBtnRef.current.getBoundingClientRect();
      const panelH = 480; // estimated panel height
      const panelW = 280;
      const vp = window.innerHeight;
      const vpW = window.innerWidth;
      
      // Vertical: prefer below, if not enough space go above, if not center
      let top: number | undefined;
      let bottom: number | undefined;
      if (vp - rect.bottom > panelH + 8) {
        top = rect.bottom + 4;
      } else if (rect.top > panelH + 8) {
        bottom = vp - rect.top + 4;
      } else {
        top = Math.max(8, (vp - panelH) / 2);
      }
      
      // Horizontal: align to left of button, clamp within viewport
      let left = Math.min(rect.left, vpW - panelW - 8);
      left = Math.max(8, left);
      
      const style: React.CSSProperties = { position: "fixed", left, width: panelW };
      if (top !== undefined) style.top = top;
      if (bottom !== undefined) style.bottom = bottom;
      setPanelStyle(style);
    }
    setShowAddProperty(true);
  };

  const handleDeleteProperty = (propId: string) => {
    onUpdateConfig({ 
      ...config, 
      customProperties: (config.customProperties || []).filter(p => p.id !== propId),
      fieldOrder: (config.fieldOrder || []).filter(id => id !== propId)
    });
  };

  const handleRenameProperty = (propId: string, newName: string) => {
    if (!newName.trim()) return;
    onUpdateConfig({
      ...config,
      customProperties: config.customProperties?.map(p => p.id === propId ? { ...p, name: newName } : p) || []
    });
  };

  const handleCustomSelectOptionAdd = (propId: string, option: SelectOption) => {
    onUpdateConfig({
      ...config,
      customProperties: (config.customProperties || []).map(p =>
        p.id === propId ? { ...p, options: [...(p.options || []), option] } : p
      ),
    });
  };

  const handleCustomSelectOptionEdit = (propId: string, oldLabel: string, newOption: SelectOption) => {
    onUpdateConfig({
      ...config,
      customProperties: (config.customProperties || []).map(p =>
        p.id === propId ? { ...p, options: (p.options || []).map(o => o.label === oldLabel ? newOption : o) } : p
      ),
    });
    if (data.customProps?.[propId] === oldLabel) handleCustomPropChange(propId, newOption.label);
  };

  const handleCustomSelectOptionDelete = (propId: string, label: string) => {
    onUpdateConfig({
      ...config,
      customProperties: (config.customProperties || []).map(p =>
        p.id === propId ? { ...p, options: (p.options || []).filter(o => o.label !== label) } : p
      ),
    });
    if (data.customProps?.[propId] === label) handleCustomPropChange(propId, null);
  };

  const DEFAULT_FIELD_ORDER = [
    "linkEmpresa", "linkPosicion", "stage", "contactoRecruiter", "contactoLeader",
    "role", "handsOn", "inglesRequerido", "idiomaPosicion", "location", "plataforma",
    "tipoContratacion", "formaPago", "salarioMensual", "salarioAnual", "beneficios",
    "contras", "motivoRechazo", "instanciaCierre", "categoriaCierre",
  ];

  const FIELD_DEFINITIONS: Record<string, { label: string; icon: React.ReactNode; render: () => React.ReactNode }> = {
    linkEmpresa:       { label: "Link Empresa",           icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.linkEmpresa} onChange={v => handleChange("linkEmpresa", v)} /> },
    linkPosicion:      { label: "Link Posición",          icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.linkPosicion} onChange={v => handleChange("linkPosicion", v)} /> },
    stage:             { label: "Stage",                  icon: <Target className="w-4 h-4" />,   render: () => <StageSelect value={columnId} columns={columns} onChange={handleStageChange} /> },
    contactoRecruiter: { label: "Contacto Recruiter",     icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.contactoRecruiter} onChange={v => handleChange("contactoRecruiter", v)} /> },
    contactoLeader:    { label: "Contacto Leader",        icon: <LinkIcon className="w-4 h-4" />, render: () => <LinkInput value={data.contactoLeader} onChange={v => handleChange("contactoLeader", v)} /> },
    role:              { label: "Role",                   icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.role} options={config.options.role} onChange={v => handleChange("role", v)} onAddOption={o => handleAddOption("role", o)} onEditOption={(ol, no) => handleEditOption("role", ol, no)} onDeleteOption={l => handleDeleteOption("role", l)} /> },
    handsOn:           { label: "Hands ON",               icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.handsOn} options={config.options.handsOn} onChange={v => handleChange("handsOn", v)} onAddOption={o => handleAddOption("handsOn", o)} onEditOption={(ol, no) => handleEditOption("handsOn", ol, no)} onDeleteOption={l => handleDeleteOption("handsOn", l)} /> },
    inglesRequerido:   { label: "Inglés Requerido",       icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.inglesRequerido} options={config.options.inglesRequerido} onChange={v => handleChange("inglesRequerido", v)} onAddOption={o => handleAddOption("inglesRequerido", o)} onEditOption={(ol, no) => handleEditOption("inglesRequerido", ol, no)} onDeleteOption={l => handleDeleteOption("inglesRequerido", l)} /> },
    idiomaPosicion:    { label: "Idioma de la posición",  icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.idiomaPosicion} options={config.options.idiomaPosicion} onChange={v => handleChange("idiomaPosicion", v)} onAddOption={o => handleAddOption("idiomaPosicion", o)} onEditOption={(ol, no) => handleEditOption("idiomaPosicion", ol, no)} onDeleteOption={l => handleDeleteOption("idiomaPosicion", l)} /> },
    location:          { label: "Location",               icon: <MapPin className="w-4 h-4" />,   render: () => <NotionSelect value={data.location} options={config.options.location} onChange={v => handleChange("location", v)} onAddOption={o => handleAddOption("location", o)} onEditOption={(ol, no) => handleEditOption("location", ol, no)} onDeleteOption={l => handleDeleteOption("location", l)} /> },
    plataforma:        { label: "Plataforma",             icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.plataforma} options={config.options.plataforma} onChange={v => handleChange("plataforma", v)} onAddOption={o => handleAddOption("plataforma", o)} onEditOption={(ol, no) => handleEditOption("plataforma", ol, no)} onDeleteOption={l => handleDeleteOption("plataforma", l)} /> },
    tipoContratacion:  { label: "Tipo de contratación",  icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.tipoContratacion} options={config.options.tipoContratacion} onChange={v => handleChange("tipoContratacion", v)} onAddOption={o => handleAddOption("tipoContratacion", o)} onEditOption={(ol, no) => handleEditOption("tipoContratacion", ol, no)} onDeleteOption={l => handleDeleteOption("tipoContratacion", l)} /> },
    formaPago:         { label: "Forma de pago",          icon: <AlignLeft className="w-4 h-4" />, render: () => <TextInput value={data.formaPago} onChange={v => handleChange("formaPago", v)} /> },
    salarioMensual:    { label: "Salario Mensual",        icon: <Hash className="w-4 h-4" />,     render: () => <CurrencyInput value={data.salarioMensual} currency={data.monedaSalario || "USD"} onChange={v => handleChange("salarioMensual", v)} onCurrencyChange={c => handleChange("monedaSalario", c)} /> },
    salarioAnual:      { label: "Salario Anual",          icon: <Hash className="w-4 h-4" />,     render: () => <CurrencyInput value={data.salarioAnual} currency={data.monedaSalario || "USD"} onChange={v => handleChange("salarioAnual", v)} onCurrencyChange={c => handleChange("monedaSalario", c)} /> },
    beneficios:        { label: "Beneficios",             icon: <AlignLeft className="w-4 h-4" />, render: () => <TextareaAutosize minRows={1} value={data.beneficios || ""} onChange={e => handleChange("beneficios", e.target.value)} placeholder="Vacío" className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground w-full text-sm resize-none custom-scrollbar min-h-[32px] px-2 py-1.5 rounded transition-all hover:bg-white/5 focus:bg-[#2a2a2a]" /> },
    contras:           { label: "Contras",                icon: <AlignLeft className="w-4 h-4" />, render: () => <TextareaAutosize minRows={1} value={data.contras || ""} onChange={e => handleChange("contras", e.target.value)} placeholder="Vacío" className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground w-full text-sm resize-none custom-scrollbar min-h-[32px] px-2 py-1.5 rounded transition-all hover:bg-white/5 focus:bg-[#2a2a2a]" /> },
    motivoRechazo:     { label: "Motivo Rechazo",         icon: <AlignLeft className="w-4 h-4" />, render: () => <TextInput value={data.motivoRechazo} onChange={v => handleChange("motivoRechazo", v)} /> },
    instanciaCierre:   { label: "Instancia de Cierre",    icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.instanciaCierre} options={config.options.instanciaCierre} onChange={v => handleChange("instanciaCierre", v)} onAddOption={o => handleAddOption("instanciaCierre", o)} onEditOption={(ol, no) => handleEditOption("instanciaCierre", ol, no)} onDeleteOption={l => handleDeleteOption("instanciaCierre", l)} /> },
    categoriaCierre:   { label: "Categoria de Cierre",    icon: <Target className="w-4 h-4" />,   render: () => <NotionSelect value={data.categoriaCierre} options={config.options.categoriaCierre} onChange={v => handleChange("categoriaCierre", v)} onAddOption={o => handleAddOption("categoriaCierre", o)} onEditOption={(ol, no) => handleEditOption("categoriaCierre", ol, no)} onDeleteOption={l => handleDeleteOption("categoriaCierre", l)} /> },
  };

  const customProperties = config.customProperties || [];

  const currentOrder = config.fieldOrder || DEFAULT_FIELD_ORDER;
  const unifiedOrder = [...currentOrder];
  for (const p of customProperties) {
    if (!unifiedOrder.includes(p.id)) {
      unifiedOrder.push(p.id);
    }
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed top-0 right-0 w-[600px] max-w-[100vw] bg-[#1a1a1a] border-l border-[#333] h-screen flex flex-col shadow-2xl z-50 text-[14px]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Header - Name */}
          <div className="mb-8">
            <TextareaAutosize
              minRows={1}
              value={data.name || ""}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Untitled"
              className="w-full text-4xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30 resize-none overflow-hidden"
            />
          </div>

          {/* All fields with drag-to-reorder */}
          <DragDropContext onDragEnd={(result: DropResult) => {
            if (!result.destination) return;
            const newOrder = Array.from(unifiedOrder);
            const [item] = newOrder.splice(result.source.index, 1);
            newOrder.splice(result.destination.index, 0, item);
            onUpdateConfig({ ...config, fieldOrder: newOrder });
          }}>
            <Droppable droppableId="job-fields">
              {(provided) => (
                <div className="flex flex-col gap-3" {...provided.droppableProps} ref={provided.innerRef}>
                  {unifiedOrder.map((fieldId, index) => {
                    const fieldDef = FIELD_DEFINITIONS[fieldId];
                    const customProp = customProperties.find(p => p.id === fieldId);
                    
                    if (!fieldDef && !customProp) return null;

                    if (columnId !== 'col-rejected' && ['motivoRechazo', 'instanciaCierre', 'categoriaCierre'].includes(fieldId)) {
                      return null;
                    }

                    return (
                      <Draggable key={fieldId} draggableId={fieldId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={snapshot.isDragging ? "opacity-90 bg-[#1a1a1a] rounded shadow-2xl z-50" : ""}
                          >
                            {fieldDef ? (
                              <FieldRow icon={fieldDef.icon} label={fieldDef.label} dragHandleProps={provided.dragHandleProps}>
                                {fieldDef.render()}
                              </FieldRow>
                            ) : customProp ? (
                              <CustomPropertyRow
                                prop={customProp}
                                value={data.customProps?.[customProp.id]}
                                job={data}
                                onChange={v => handleCustomPropChange(customProp.id, v)}
                                onDelete={() => handleDeleteProperty(customProp.id)}
                                onRename={newName => handleRenameProperty(customProp.id, newName)}
                                autoFocusName={newlyAddedPropId === customProp.id}
                                onAddOption={o => handleCustomSelectOptionAdd(customProp.id, o)}
                                onEditOption={(ol, no) => handleCustomSelectOptionEdit(customProp.id, ol, no)}
                                onDeleteOption={l => handleCustomSelectOptionDelete(customProp.id, l)}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            ) : null}
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

          {/* Add a property button */}
          <div className="mt-4">
            <button
              ref={addPropBtnRef}
              onClick={openAddPropertyPanel}
              className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground text-sm px-2 py-1.5 rounded-md hover:bg-white/5 transition-all w-full"
            >
              <Plus className="w-4 h-4" />
              <span>Add a property</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Property floating panel (portal-style, positioned intelligently) */}
      <AnimatePresence>
        {showAddProperty && (
          <motion.div
            ref={addPropRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={panelStyle}
            className="bg-[#202020] border border-[#333] rounded-xl shadow-2xl z-[60] flex flex-col overflow-hidden"
          >
            {/* Name input */}
            <div className="p-3 pb-2">
              <input
                autoFocus
                type="text"
                value={newPropName}
                onChange={e => setNewPropName(e.target.value)}
                placeholder="Nombre de la propiedad"
                className="w-full bg-[#2a2a2a] border border-[#333] focus:border-[#555] rounded-lg px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors"
              />
            </div>

            {/* Divider + Type label */}
            <div className="px-3 pb-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Tipo</p>
            </div>

            {/* All property types */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-1.5 max-h-[380px]">
              {PROPERTY_TYPES.map(pt => (
                <button
                  key={pt.type}
                  type="button"
                  onClick={() => handleAddProperty(pt.type)}
                  className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] hover:bg-white/5 transition-colors text-left text-muted-foreground hover:text-foreground"
                >
                  <span className="text-muted-foreground/70 shrink-0">{pt.icon}</span>
                  <span>{pt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CustomPropertyRow({ prop, value, job, onChange, onDelete, onRename, onAddOption, onEditOption, onDeleteOption, autoFocusName, dragHandleProps }: {
  prop: CustomPropertyDef;
  value: CustomPropertyValue;
  job: TrackerJob;
  onChange: (v: CustomPropertyValue) => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onAddOption: (o: SelectOption) => void;
  onEditOption: (oldLabel: string, newOpt: SelectOption) => void;
  onDeleteOption: (label: string) => void;
  autoFocusName?: boolean;
  dragHandleProps?: any;
}) {
  const [isEditingName, setIsEditingName] = useState(autoFocusName || false);
  const [editName, setEditName] = useState(prop.name);
  
  useEffect(() => { setEditName(prop.name); }, [prop.name]);
  
  const handleRenameSubmit = () => {
    if (editName.trim() !== prop.name) {
      onRename(editName);
    }
    setIsEditingName(false);
  };

  const renderInput = () => {
    switch (prop.type) {
      case "text":
        return (
          <TextareaAutosize
            minRows={1}
            value={(value as string) || ""}
            onChange={e => onChange(e.target.value)}
            placeholder="Vacío"
            className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground w-full text-sm resize-none custom-scrollbar min-h-[32px] px-2 py-1.5 rounded transition-all hover:bg-white/5 focus:bg-[#2a2a2a]"
          />
        );
      case "location":
        return <TextInput value={value as string | undefined} onChange={v => onChange(v)} />;
      case "number":
        return (
          <input
            type="number"
            value={value as number ?? ""}
            onChange={e => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
            placeholder="Vacío"
            className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm w-full"
          />
        );
      case "select":
      case "status":
        return (
          <NotionSelect
            value={value as string | undefined}
            options={prop.options || []}
            onChange={v => onChange(v)}
            onAddOption={onAddOption}
            onEditOption={onEditOption}
            onDeleteOption={onDeleteOption}
          />
        );
      case "multi_select":
        return (
          <MultiSelectInput
            value={(value as string[] | undefined) || []}
            options={prop.options || []}
            onChange={v => onChange(v)}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={value as string ?? ""}
            onChange={e => onChange(e.target.value || null)}
            className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm w-full [color-scheme:dark]"
          />
        );
      case "checkbox":
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${value ? "bg-blue-500 border-blue-500" : "border-[#444] hover:border-[#666]"}`}
          >
            {value && <Check className="w-3 h-3 text-white" />}
          </button>
        );
      case "url":
        return <LinkInput value={value as string | undefined} onChange={v => onChange(v)} />;
      case "email":
        return (
          <input
            type="email"
            value={value as string ?? ""}
            onChange={e => onChange(e.target.value)}
            placeholder="Vacío"
            className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm w-full"
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            value={value as string ?? ""}
            onChange={e => onChange(e.target.value)}
            placeholder="Vacío"
            className="bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm w-full"
          />
        );
      case "created_at":
        return (
          <span className="text-sm text-muted-foreground px-2 py-1.5">
            {job.closedAt ? new Date(job.closedAt).toLocaleDateString("es-AR") : "—"}
          </span>
        );
      default:
        return <TextInput value={value as string | undefined} onChange={v => onChange(v)} />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 group/customrow">
      <div 
        {...dragHandleProps}
        className={`flex items-center gap-2 text-muted-foreground w-44 shrink-0 pt-1.5 pb-1.5 px-1.5 -ml-1.5 ${dragHandleProps ? "cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-md transition-colors" : ""}`}
      >
        <span className="text-muted-foreground/60 shrink-0">{getTypeIcon(prop.type)}</span>
        {isEditingName ? (
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => e.key === 'Enter' && handleRenameSubmit()}
            className="flex-1 bg-[#2a2a2a] border border-[#555] rounded px-1.5 py-0.5 text-[13px] text-foreground outline-none"
          />
        ) : (
          <span 
            className="text-[13px] truncate flex-1 cursor-pointer hover:bg-white/5 rounded px-1 -ml-1 transition-colors" 
            title={prop.name}
            onClick={() => setIsEditingName(true)}
          >
            {prop.name}
          </span>
        )}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover/customrow:opacity-100 p-0.5 hover:text-red-400 transition-all text-muted-foreground/40 shrink-0"
          title="Eliminar propiedad"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex-1 min-w-0 flex items-center min-h-[32px]">
        {renderInput()}
      </div>
    </div>
  );
}

function MultiSelectInput({ value, options, onChange }: {
  value: string[];
  options: SelectOption[];
  onChange: (v: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (label: string) => {
    onChange(value.includes(label) ? value.filter(v => v !== label) : [...value, label]);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 transition-all text-sm min-h-[32px] flex items-center flex-wrap gap-1"
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">Vacío</span>
        ) : (
          value.map(v => {
            const opt = options.find(o => o.label === v);
            return (
              <span key={v} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${opt?.color || "bg-[#5c5c5c] text-white/95"}`}>
                {v}
              </span>
            );
          })
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map(opt => (
            <button
              key={opt.label}
              onClick={() => toggle(opt.label)}
              className="w-full text-left px-2 py-1.5 hover:bg-[#303030] flex items-center gap-2 transition-colors"
            >
              {value.includes(opt.label) && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${opt.color}`}>{opt.label}</span>
            </button>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2">Sin opciones disponibles.</p>
          )}
        </div>
      )}
    </div>
  );
}

function FieldRow({ icon, label, children, dragHandleProps }: { icon: React.ReactNode; label: string; children: React.ReactNode; dragHandleProps?: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 group">
      <div
        {...dragHandleProps}
        className="flex items-center gap-2 text-muted-foreground w-44 shrink-0 pt-1.5 pb-1.5 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-md px-1.5 -ml-1.5 transition-colors"
      >
        {icon}
        <span className="text-[13px] truncate" title={label}>{label}</span>
      </div>
      <div className="flex-1 min-w-0 flex items-center min-h-[32px]">{children}</div>
    </div>
  );
}

function LinkInput({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing && value) {
    const cleanValue = value.trim();
    const href = cleanValue.startsWith("http") ? cleanValue : `https://${cleanValue}`;
    
    return (
      <div 
        className="flex items-center w-full group/link min-h-[32px] px-2 py-1.5 hover:bg-white/5 rounded transition-all cursor-text"
        onClick={() => setIsEditing(true)}
      >
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-sky-400 hover:underline break-all w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {cleanValue}
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full group/link">
      <TextareaAutosize
        minRows={1}
        autoFocus={isEditing}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        onBlur={() => { if (value) setIsEditing(false); }}
        placeholder="Vacío"
        className="w-full bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm resize-none custom-scrollbar min-h-[32px]"
      />
    </div>
  );
}

function TextInput({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <TextareaAutosize
      minRows={1}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder="Vacío"
      className="w-full bg-transparent border border-transparent focus:border-[#444] outline-none text-foreground placeholder:text-muted-foreground hover:bg-white/5 focus:bg-[#2a2a2a] px-2 py-1.5 rounded transition-all text-sm resize-none custom-scrollbar min-h-[32px]"
    />
  );
}

function CurrencyInput({ value, currency, onChange, onCurrencyChange }: { value?: number; currency: "USD" | "ARS"; onChange: (v: number | undefined) => void; onCurrencyChange: (c: "USD" | "ARS") => void }) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    if (!isFocused) setLocalValue(value?.toString() || "");
  }, [value, isFocused]);

  const displayValue = isFocused ? localValue : (value ? value.toLocaleString(currency === "ARS" ? "es-AR" : "en-US") : "");

  return (
    <div className="flex items-center gap-2 w-full focus-within:bg-[#2a2a2a] focus-within:border-[#444] border border-transparent hover:bg-white/5 px-2 rounded transition-all">
      <input
        type="text"
        value={displayValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { setIsFocused(false); const num = parseFloat(localValue); onChange(isNaN(num) ? undefined : num); }}
        onChange={e => { const val = e.target.value.replace(/[^\d.]/g, ""); setLocalValue(val); const num = parseFloat(val); onChange(isNaN(num) ? undefined : num); }}
        placeholder="Vacío"
        className={`bg-transparent border-none outline-none ${value ? (currency === "ARS" ? "text-sky-400 font-medium" : "text-emerald-400 font-medium") : "text-foreground"} placeholder:text-muted-foreground w-full text-sm py-1.5`}
      />
      <select value={currency} onChange={e => onCurrencyChange(e.target.value as "USD" | "ARS")} className={`bg-transparent border-none outline-none ${currency === "ARS" ? "text-sky-400" : "text-emerald-400"} hover:opacity-80 text-xs font-bold cursor-pointer`}>
        <option value="USD" className="bg-[#202020] text-foreground">USD</option>
        <option value="ARS" className="bg-[#202020] text-foreground">ARS</option>
      </select>
    </div>
  );
}

function StageSelect({ value, columns = [], onChange }: { value: string; columns?: { id: string; title: string; badge: string; cardBg?: string; wrapperBg?: string }[]; onChange: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCol = (columns || []).find(c => c.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOpenUpwards(window.innerHeight - rect.bottom < 250);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" onClick={toggleOpen} className="text-sm py-1 px-2 rounded-md hover:bg-white/5 transition-colors min-h-[28px] min-w-[100px] flex items-center text-left">
        {selectedCol ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs leading-tight ${selectedCol.cardBg} text-white`}>
            {selectedCol.title}
          </span>
        ) : ""}
      </button>
      {isOpen && (
        <div className={`absolute left-0 ${openUpwards ? "bottom-full mb-1" : "top-full mt-1"} w-56 bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 flex flex-col text-[13px] text-muted-foreground overflow-hidden py-1`}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {columns.map(col => (
              <button key={col.id} onClick={() => { onChange(col.id); setIsOpen(false); }} className="w-full text-left px-2 py-1.5 hover:bg-[#303030] flex items-center gap-2 transition-colors">
                <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs leading-tight ${col.cardBg} text-white`}>{col.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
