import { useState, useRef, useEffect } from "react";
import { SelectOption, OPTION_COLORS } from "../types";
import { X, Search, MoreHorizontal, Trash2, Check, Info } from "lucide-react";

interface NotionSelectProps {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (val: string) => void;
  onAddOption: (option: SelectOption) => void;
  onEditOption?: (oldLabel: string, newOption: SelectOption) => void;
  onDeleteOption?: (label: string) => void;
}

export default function NotionSelect({ value, options, placeholder, onChange, onAddOption, onEditOption, onDeleteOption }: NotionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingOption, setEditingOption] = useState<SelectOption | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [openUpwards, setOpenUpwards] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.label === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingOption(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  
  const handleAdd = (color: string) => {
    if (!search.trim()) return;
    onAddOption({ label: search.trim(), color });
    onChange(search.trim());
    setIsOpen(false);
    setSearch("");
  };

  const saveEdit = (newColor?: string) => {
    if (!editingOption || !onEditOption) return;
    const finalLabel = editLabel.trim() || editingOption.label;
    const finalColor = newColor || editingOption.color;
    onEditOption(editingOption.label, { label: finalLabel, color: finalColor });
    setEditingOption({ label: finalLabel, color: finalColor });
  };

  const toggleOpen = () => {
    if (!isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceBelow < 320);
      }
    }
    setIsOpen(!isOpen);
    setEditingOption(null);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button"
        onClick={toggleOpen}
        className={`text-sm py-1 px-2 rounded-md hover:bg-white/5 transition-colors min-h-[28px] min-w-[100px] flex items-center text-left ${!selectedOption ? 'text-muted-foreground' : ''}`}
      >
        {selectedOption ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs leading-tight ${selectedOption.color}`}>
            {selectedOption.label}
          </span>
        ) : (
          placeholder || "Vacío"
        )}
      </button>

      {isOpen && (
        <div className={`absolute left-0 ${openUpwards ? "bottom-full mb-1" : "top-full mt-1"} w-64 bg-[#202020] border border-[#303030] rounded-xl shadow-2xl z-50 flex flex-col text-[13px] text-muted-foreground overflow-hidden`}>
          {!editingOption ? (
            <>
              <div className="p-2 border-b border-[#303030]">
                <input 
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar o crear opción..."
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 text-sm"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/50 tracking-wider">
                  Selecciona una opción o crea una
                </div>
                
                {filteredOptions.map(opt => (
                  <div
                    key={opt.label}
                    className="group relative flex items-center justify-between w-full text-left hover:bg-[#303030] rounded transition-colors"
                  >
                    <button
                      onClick={() => {
                        onChange(opt.label);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="flex-1 px-2 py-1.5 flex items-center"
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium text-xs leading-tight ${opt.color}`}>
                        {opt.label}
                      </span>
                    </button>
                    {onEditOption && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOption(opt);
                          setEditLabel(opt.label);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 hover:bg-white/10 rounded-md transition-all text-muted-foreground hover:text-foreground"
                        title="Editar opción"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {search.trim() && !options.find(o => o.label.toLowerCase() === search.trim().toLowerCase()) && (
                  <div className="mt-2 pt-2 border-t border-[#303030] px-2">
                    <div className="text-xs text-muted-foreground/50 mb-2">Crear "{search.trim()}" con color:</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {OPTION_COLORS.map(c => (
                        <button
                          key={c.name}
                          onClick={() => handleAdd(c.color)}
                          className={`w-5 h-5 rounded-sm ${c.color.split(' ')[0]} border border-transparent hover:border-white/50 transition-colors cursor-pointer`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              <div className="p-2 border-b border-[#303030] flex items-center gap-2">
                <button 
                  onClick={() => setEditingOption(null)}
                  className="p-1 hover:bg-white/10 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Volver"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="relative flex items-center w-full">
                  <input
                    autoFocus
                    type="text"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onBlur={() => saveEdit()}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
                    className="w-full bg-transparent border border-[#444] rounded px-2 py-1 outline-none text-foreground text-sm focus:border-blue-500 pr-8"
                  />
                  <Info className="w-3.5 h-3.5 text-muted-foreground absolute right-2 pointer-events-none" />
                </div>
              </div>
              
              {onDeleteOption && (
                <div className="p-1 border-b border-[#303030]">
                  <button
                    onClick={() => {
                      onDeleteOption(editingOption.label);
                      setEditingOption(null);
                      if (value === editingOption.label) onChange("");
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded text-foreground transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                    <span>Eliminar</span>
                  </button>
                </div>
              )}

              <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground/50">
                  Colores
                </div>
                
                <button
                  onClick={() => saveEdit("bg-white/10 text-white/95")}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded transition-colors group"
                >
                  <div className="flex items-center gap-2 text-foreground">
                    <div className="w-4 h-4 rounded-sm bg-white/10 border border-white/5" />
                    <span>Predeterminado</span>
                  </div>
                  {editingOption.color === "bg-white/10 text-white/95" && <Check className="w-3.5 h-3.5 text-foreground" />}
                </button>

                {OPTION_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => saveEdit(c.color)}
                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-foreground">
                      <div className={`w-4 h-4 rounded-sm ${c.color.split(' ')[0]}`} />
                      <span>{c.name}</span>
                    </div>
                    {editingOption.color === c.color && <Check className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
