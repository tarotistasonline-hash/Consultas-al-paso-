import React, { useState, useRef, useEffect } from "react";
import { NaturaProduct } from "../products";
import { Search } from "lucide-react";

interface ProductAutocompleteProps {
  products: NaturaProduct[];
  selectedId: string;
  onSelect: (id: string) => void;
  theme: "cruda" | "sober";
  disabledId: string;
}

export default function ProductAutocomplete({ products, selectedId, onSelect, theme, disabledId }: ProductAutocompleteProps) {
  const isCruda = theme === "cruda";
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find(p => p.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.line.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className={`w-full p-2.5 text-xs rounded border flex items-center justify-between cursor-pointer transition-colors ${
          isCruda 
            ? "bg-zinc-900 border-zinc-800 text-white hover:border-zinc-600" 
            : "bg-white border-stone-250 border-stone-300 text-stone-900 hover:border-stone-500"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate font-bold">
          {selectedProduct ? `[${selectedProduct.line.toUpperCase()}] ${selectedProduct.name}` : "Seleccionar..."}
        </span>
        <Search className="w-3.5 h-3.5 opacity-50" />
      </div>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 rounded border shadow-lg max-h-60 overflow-y-auto ${
          isCruda ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-stone-300 text-stone-900"
        }`}>
          <input 
            type="text"
            className={`w-full p-2 text-xs border-b focus:outline-none ${
              isCruda ? "bg-zinc-950 border-zinc-800" : "bg-stone-50 border-stone-200"
            }`}
            placeholder="Buscar por nombre o línea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {filtered.length === 0 ? (
            <div className="p-2 text-xs opacity-50">No encontrado</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className={`p-2 text-xs cursor-pointer hover:bg-opacity-50 ${
                  p.id === disabledId ? "opacity-30 cursor-not-allowed" : ""
                } ${
                  isCruda ? "hover:bg-zinc-800" : "hover:bg-stone-100"
                }`}
                onClick={() => {
                  if (p.id !== disabledId) {
                    onSelect(p.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }
                }}
              >
                <div className="font-bold">[{p.line.toUpperCase()}] {p.name}</div>
                <div className="text-[10px] opacity-70">{p.activeOrPath}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
