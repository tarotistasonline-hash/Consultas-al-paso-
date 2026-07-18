import React, { useState } from "react";
import { NATURA_PRODUCTS, NaturaProduct, NATURA_CYCLES } from "../products";
import { Scale, ArrowRightLeft, Sparkles, AlertCircle, Info, Leaf, HelpCircle, Check, BookOpen, Bookmark, Trash2, MessageSquare, Send, Loader2, Share2, Clipboard } from "lucide-react";
import ProductAutocomplete from "./ProductAutocomplete";

interface ProductComparerProps {
  theme: "cruda" | "sober";
  onSendProductComparisonQuery: (prompt: string) => void;
}

export default function ProductComparer({ theme, onSendProductComparisonQuery }: ProductComparerProps) {
  const isCruda = theme === "cruda";

  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [product1Id, setProduct1Id] = useState<string>("kaiak_urbe");
  const [product2Id, setProduct2Id] = useState<string>("kaiak_vital_m");
  const [currentCiclo, setCurrentCiclo] = useState<string>(NATURA_CYCLES[0]);

  // Right sidebar tab toggle state
  const [activeTab, setActiveTab] = useState<"favorites" | "chat">("favorites");

  // Chat message thread state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Local storage quick save state
  const [savedComparisons, setSavedComparisons] = useState<{ id: string; p1Id: string; p2Id: string; p1Name: string; p2Name: string }[]>(() => {
    const cached = localStorage.getItem("natura_saved_comparisons");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    // Default initial fast access pairings
    return [
      { id: "defaults_1", p1Id: "kaiak_urbe", p2Id: "kaiak_vital_m", p1Name: "Kaiak Urbe", p2Name: "Kaiak Vital M." },
      { id: "defaults_2", p1Id: "humor_proprio", p2Id: "meu_primeiro_humor", p1Name: "Humor Próprio", p2Name: "Meu Primero Humor" }
    ];
  });

  // Get categorized categories
  const categories = ["All", "Perfumería Masculina", "Perfumería Femenina", "Skincare / Rostro", "Cuerpo & Hidratación"];

  // Filter products based on selected category filter
  const filteredProducts = categoryFilter === "All" 
    ? NATURA_PRODUCTS 
    : NATURA_PRODUCTS.filter(p => p.category === categoryFilter);

  const product1 = NATURA_PRODUCTS.find(p => p.id === product1Id) || NATURA_PRODUCTS[0];
  const product2 = NATURA_PRODUCTS.find(p => p.id === product2Id) || NATURA_PRODUCTS[1];

  const promo1 = product1.promociones?.find(p => p.ciclo === currentCiclo);
  const promo2 = product2.promociones?.find(p => p.ciclo === currentCiclo);

  // Handler to pin/save current comparison
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleSaveComparison = () => {
    const exists = savedComparisons.some(
      (item) => (item.p1Id === product1Id && item.p2Id === product2Id) || (item.p1Id === product2Id && item.p2Id === product1Id)
    );
    if (exists) return; // Already saved

    const newItem = {
      id: `saved_${Date.now()}`,
      p1Id: product1Id,
      p2Id: product2Id,
      p1Name: product1.name,
      p2Name: product2.name
    };

    const updated = [newItem, ...savedComparisons];
    setSavedComparisons(updated);
    localStorage.setItem("natura_saved_comparisons", JSON.stringify(updated));
  };

  const handleGenerateSalesScript = async () => {
    setIsGeneratingScript(true);
    setGeneratedScript(null);
    try {
      const response = await fetch("/api/generate-sales-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product1, product2 })
      });
      if (!response.ok) throw new Error("Error generando el guion.");
      const { script } = await response.json();
      setGeneratedScript(script);
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el guion, intenta de nuevo.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleShareComparison = () => {
    const text = `*Comparativa Natura*\n\n` +
                 `He comparado: *${product1.name}* vs *${product2.name}*\n\n` +
                 `*Diferencias clave:*\n` +
                 `- ${product1.name}: ${product1.activeOrPath}\n` +
                 `- ${product2.name}: ${product2.activeOrPath}\n\n` +
                 `*Consejo profesional:*\n` +
                 `- ${product1.name}: "${product1.consejoUso}"\n` +
                 `- ${product2.name}: "${product2.consejoUso}"\n\n` +
                 `¿Te gustaría asesoramiento profesional? ¡Pregúntame!`;
    navigator.clipboard.writeText(text);
  };

  const handleCopyMarkdownTable = () => {
    const table = `| Característica | ${product1.name} | ${product2.name} |
| :--- | :--- | :--- |
| **Línea** | ${product1.line} | ${product2.line} |
| **Activo/Base** | ${product1.activeOrPath} | ${product2.activeOrPath} |
| **Contenido** | ${product1.volumeOrContent} | ${product2.volumeOrContent} |
| **Consejo** | ${product1.consejoUso} | ${product2.consejoUso} |`;
    navigator.clipboard.writeText(table);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedComparisons.filter(item => item.id !== id);
    setSavedComparisons(updated);
    localStorage.setItem("natura_saved_comparisons", JSON.stringify(updated));
  };

  const handleSelectSaved = (p1Id: string, p2Id: string) => {
    setProduct1Id(p1Id);
    setProduct2Id(p2Id);
  };

  // Reset/Notify mini chat whenever current compared products change
  React.useEffect(() => {
    setChatHistory([
      {
        role: "assistant",
        content: `¡Hola! He detectado un cambio de selección. Pregúntame lo que gustes sobre **${product1.name}** vs **${product2.name}** y te ayudaré con argumentos de venta de vendedor a comprador de inmediato.`
      }
    ]);
  }, [product1Id, product2Id]);

  // Handle sending inline chat message
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    const newUserMessage = { role: "user" as const, content: userMsg };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    try {
      // Inline system instruction for the particular products pair comparison
      const initialSystemContext = `Estás chateando en el Laboratorio Técnico de Comparación. El usuario está comparando en este momento [Producto A: ${product1.name} (${product1.line.toUpperCase()}), activo principal: ${product1.activeOrPath}] con [Producto B: ${product2.name} (${product2.line.toUpperCase()}), activo principal: ${product2.activeOrPath}].
Responde de una manera súper coloquial, cercana, sincera, hablándole directamente en tono comercial y de consultor experto de catálogo Natura.`;

      const response = await fetch("/api/reality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: initialSystemContext },
            ...updatedHistory
          ],
          category: "libre",
          filterLevel: "directo"
        })
      });

      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status}`);
      }

      const raw = await response.text();
      const parsed = JSON.parse(raw);

      setChatHistory(prev => [
        ...prev,
        { role: "assistant" as const, content: parsed.text || "No obtuve una respuesta técnica para esta pareja." }
      ]);
    } catch (err: any) {
      console.error("Error at inline ProductComparer chat:", err);
      setChatHistory(prev => [
        ...prev,
        { role: "assistant" as const, content: "⚠️ Ocurrió una desconexión. Por favor intenta plantear tu consulta de nuevo." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Helper to generate the prompt that goes directly downstream to Gemini
  const handleAskAIAboutComparison = () => {
    const promptText = `Como Asesor Técnico de Natura, realizá un diagnóstico comparativo exhaustivo entre "${product1.name}" (${product1.category}, activo/ruta: ${product1.activeOrPath}) y "${product2.name}" (${product2.category}, activo/ruta: ${product2.activeOrPath}). 
Analizá detalladamente para qué tipo de cliente, ocasión de uso o necesidad de piel/cabello es ideal cada uno. Ayudame con argumentos comerciales sólidos, notas olfativas/activos diferenciales y cómo rebatir dudas del cliente si duda entre ambos.`;
    onSendProductComparisonQuery(promptText);
  };

  return (
    <div id="product-comparer-container" className={`p-5 rounded-lg border transition-all duration-350 shadow-md ${
      isCruda 
        ? "bg-zinc-950/90 border-zinc-800 text-zinc-100" 
        : "bg-stone-50 border-stone-200 text-stone-900 shadow-sm"
    }`}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-dashed border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className={`p-2 rounded-md flex items-center justify-center ${
            isCruda ? "bg-red-950/50 text-red-500 border border-red-900/40" : "bg-stone-200 text-stone-900"
          }`}>
            <Scale className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest font-mono flex items-center gap-1.5">
              Laboratorio de Comparación de Productos
              <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-normal font-sans font-bold ${isCruda ? "bg-red-500 text-black" : "bg-stone-900 text-stone-100"}`}>
                Asesor Técnico
              </span>
            </h3>
            
            {/* Ciclo Selector */}
            <div className="flex items-center gap-2 mt-1">
                <select
                    value={currentCiclo}
                    onChange={(e) => setCurrentCiclo(e.target.value)}
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded cursor-pointer ${
                        isCruda ? "bg-zinc-800 text-zinc-200" : "bg-stone-200 text-stone-700"
                    }`}
                >
                    {NATURA_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                {/* Promo Labels */}
                {(promo1 || promo2) && (
                    <div className="flex gap-1.5">
                        {promo1 && (
                            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">
                                {product1.name.split(' ')[0]} ⮕ {promo1.mensaje}
                            </span>
                        )}
                        {promo2 && (
                            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">
                                {product2.name.split(' ')[0]} ⮕ {promo2.mensaje}
                            </span>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Category filtering pills */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                // Intelligently reset dropdowns if currently selected isn't in filter
                const isCat = cat === "All";
                const isP1In = isCat || NATURA_PRODUCTS.find(p => p.id === product1Id)?.category === cat;
                const isP2In = isCat || NATURA_PRODUCTS.find(p => p.id === product2Id)?.category === cat;
                
                const list = isCat ? NATURA_PRODUCTS : NATURA_PRODUCTS.filter(p => p.category === cat);
                if (list.length > 0) {
                  if (!isP1In) setProduct1Id(list[0].id);
                  if (!isP2In) setProduct2Id(list[Math.min(1, list.length - 1)].id);
                }
              }}
              className={`text-[9px] px-2 py-1 rounded font-mono font-bold transition-all ${
                categoryFilter === cat
                  ? isCruda 
                    ? "bg-red-650 bg-red-600 text-white" 
                    : "bg-stone-900 text-white"
                  : isCruda
                    ? "bg-zinc-900 text-zinc-400 hover:text-white"
                    : "bg-stone-200 text-stone-600 hover:bg-stone-300"
              }`}
            >
              {cat === "All" ? "Todos" : cat.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Comparison Left, Fast Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left main comparison segment */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            {/* Selector 1 */}
            <div className="space-y-1">
              <label className={`text-[9px] font-mono uppercase tracking-wider block font-bold ${isCruda ? "text-zinc-500" : "text-stone-500"}`}>
                Producto Base (1)
              </label>
              <ProductAutocomplete 
                 products={filteredProducts}
                 selectedId={product1Id}
                 onSelect={setProduct1Id}
                 theme={theme}
                 disabledId={product2Id}
              />
            </div>

            {/* Selector 2 */}
            <div className="space-y-1">
              <label className={`text-[9px] font-mono uppercase tracking-wider block font-bold ${isCruda ? "text-zinc-500" : "text-stone-500"}`}>
                Producto a Comparar (2)
              </label>
              <ProductAutocomplete 
                 products={filteredProducts}
                 selectedId={product2Id}
                 onSelect={setProduct2Id}
                 theme={theme}
                 disabledId={product1Id}
              />
            </div>
          </div>

          {/* Quick save button bar */}
          <div className="flex items-center justify-between pb-2">
            <span className={`text-[10px] ${isCruda ? "text-zinc-500" : "text-stone-500"}`}>
              {product1.name} <span className="text-zinc-600 font-mono">VS</span> {product2.name}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateSalesScript}
                disabled={isGeneratingScript}
                className={`px-3 py-1.5 rounded text-[10px] font-mono font-black flex items-center gap-1.5 transition-all uppercase tracking-wider ${
                    isGeneratingScript ? "opacity-50 cursor-not-allowed" : ""
                } ${
                    isCruda
                      ? "bg-red-900 text-red-200 hover:bg-red-800"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                  {isGeneratingScript ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5" />}
                  {isGeneratingScript ? "Generando..." : "Generar Guion"}
              </button>
              <button
                onClick={handleCopyMarkdownTable}
                className={`px-3 py-1.5 rounded text-[10px] font-mono font-black flex items-center gap-1.5 transition-all uppercase tracking-wider ${
                    isCruda
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : "bg-stone-200 text-stone-800 hover:bg-stone-300 hover:text-stone-950 font-bold"
                }`}
              >
                  <Clipboard className="w-3.5 h-3.5" />
                  Copiar Tabla
              </button>
              <button
                onClick={handleShareComparison}
                className={`px-3 py-1.5 rounded text-[10px] font-mono font-black flex items-center gap-1.5 transition-all uppercase tracking-wider ${
                    isCruda
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : "bg-stone-200 text-stone-800 hover:bg-stone-300 hover:text-stone-950 font-bold"
                }`}
              >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartir
              </button>
              <button
                onClick={handleSaveComparison}
                disabled={savedComparisons.some(item => (item.p1Id === product1Id && item.p2Id === product2Id) || (item.p1Id === product2Id && item.p2Id === product1Id))}
                className={`px-3 py-1.5 rounded text-[10px] font-mono font-black flex items-center gap-1.5 transition-all uppercase tracking-wider ${
                    savedComparisons.some(item => (item.p1Id === product1Id && item.p2Id === product2Id) || (item.p1Id === product2Id && item.p2Id === product1Id))
                    ? isCruda
                        ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : isCruda
                        ? "bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/35 hover:text-white"
                        : "bg-stone-200 text-stone-880 hover:bg-stone-300 font-bold"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {savedComparisons.some(item => (item.p1Id === product1Id && item.p2Id === product2Id) || (item.p1Id === product2Id && item.p2Id === product1Id))
                    ? "Fijada"
                    : "Guardar"
                }
              </button>
            </div>
          </div>

      {generatedScript && (
        <div className={`mt-4 p-4 rounded-lg border ${isCruda ? "bg-zinc-900 border-zinc-700" : "bg-stone-100 border-stone-200"}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-xs uppercase">Guion de Venta para WhatsApp</span>
            <button 
              onClick={() => navigator.clipboard.writeText(generatedScript)}
              className="text-[10px] font-bold py-1 px-2 rounded bg-black text-white hover:opacity-80"
            >
              Copiar
            </button>
          </div>
          <p className="text-xs italic whitespace-pre-wrap">{generatedScript}</p>
        </div>
      )}


      {/* Refill Eco-Savings Alerts */}
      {(product1.repuestoDisponible || product2.repuestoDisponible) && (
        <div className={`mb-4 p-3 rounded-lg border flex items-start gap-3 transition-all ${
          isCruda 
            ? "bg-emerald-950/25 border-emerald-500/20 text-emerald-400" 
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          <Leaf className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div className="text-left text-[11px] leading-relaxed">
            <span className="font-mono font-black uppercase tracking-wider text-[9px] block mb-0.5">
              Refuerzo Técnico: Oportunidad de Margen & Fidelización Natura 🌿
            </span>
            <p>
              {product1.repuestoDisponible && product2.repuestoDisponible ? (
                <>¡Ambos productos analizados (<strong>{product1.name}</strong> y <strong>{product2.name}</strong>) cuentan con opciones de repuestos eco-sustentables con un beneficio de hasta un <strong>30% de ahorro directo</strong> para tus clientes!</>
              ) : product1.repuestoDisponible ? (
                <><strong>{product1.name}</strong> cuenta con formato de repuesto disponible. Ofrecer el repuesto en lugar de la copa regular representa un ahorro de hasta el <strong>30% de descuento directo</strong> sin alterar la fórmula premium.</>
              ) : (
                <><strong>{product2.name}</strong> cuenta con formato de repuesto disponible. Úsalo como argumento comercial: tu cliente ahorra hasta un <strong>30% en su recompra</strong> y contribuye a la reducción de plástico.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Structured Comparison Table / Grid */}
      <div className={`overflow-x-auto rounded border ${
        isCruda ? "border-zinc-805 bg-black/40 border-zinc-800" : "border-stone-200 bg-white"
      }`}>
        <table className="w-full text-left border-collapse table-fixed min-w-[500px]">
          <thead>
            <tr className={`border-b ${isCruda ? "border-zinc-800 bg-zinc-900/50" : "border-stone-200 bg-stone-100"}`}>
              <th className="p-3 text-[9px] font-mono uppercase tracking-wider w-[24%] text-zinc-500 font-black">
                Parámetros Técnicos
              </th>
              <th className={`p-3 text-xs font-black font-display text-center border-l w-[38%] ${
                isCruda ? "text-red-400 border-zinc-800" : "text-stone-900 border-stone-200"
              }`}>
                {product1.name}
              </th>
              <th className={`p-3 text-xs font-black font-display text-center border-l w-[38%] ${
                isCruda ? "text-amber-400 border-zinc-800" : "text-stone-900 border-stone-200"
              }`}>
                {product2.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/45 divide-stone-200/50">
            {/* Camino Olfativo / Activo Principal */}
            <tr>
              <td className="p-3 text-[9px] font-mono uppercase font-black text-zinc-500 align-top">
                Activo / Camino Olfativo
              </td>
              <td className={`p-3 text-xs border-l font-bold align-top ${isCruda ? "border-zinc-800 text-zinc-200" : "border-stone-200"}`}>
                <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-semibold ${
                  isCruda ? "bg-zinc-850 bg-zinc-800 text-red-400" : "bg-stone-200 text-stone-850"
                }`}>
                  {product1.activeOrPath}
                </span>
              </td>
              <td className={`p-3 text-xs border-l font-bold align-top ${isCruda ? "border-zinc-800 text-zinc-200" : "border-stone-200"}`}>
                <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-semibold ${
                  isCruda ? "bg-zinc-850 bg-zinc-800 text-amber-400" : "bg-stone-200 text-stone-850"
                }`}>
                  {product2.activeOrPath}
                </span>
              </td>
            </tr>

            {/* Intensity / Stars if applicable */}
            {(product1.intensity || product2.intensity) && (
              <tr>
                <td className="p-3 text-[9px] font-mono uppercase font-black text-zinc-500 align-middle">
                  Intensidad / Fuerza
                </td>
                <td className={`p-3 border-l text-xs align-middle ${isCruda ? "border-zinc-800" : "border-stone-200"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{product1.intensity || "Leve"}</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {product1.intensity === "Intenso" ? "★★★" : product1.intensity === "Moderado" ? "★★☆" : "★☆☆"}
                    </span>
                  </div>
                </td>
                <td className={`p-3 border-l text-xs align-middle ${isCruda ? "border-zinc-800" : "border-stone-200"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{product2.intensity || "Leve"}</span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {product2.intensity === "Intenso" ? "★★★" : product2.intensity === "Moderado" ? "★★☆" : "★☆☆"}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {/* Olfactory Notes Split */}
            {(product1.notes || product2.notes) && (
              <tr>
                <td className="p-3 text-[9px] font-mono uppercase font-black text-zinc-500 align-top">
                  Evolución / Pirámide de Notas
                </td>
                <td className={`p-3 border-l text-[10px] space-y-1.5 align-top ${isCruda ? "border-zinc-800 text-zinc-300" : "border-stone-200 text-stone-700"}`}>
                  {product1.notes ? (
                    <>
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-65 text-red-400 font-bold block">Salida Primaria:</span>
                        <span>{product1.notes.salida}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-65 text-red-400 font-bold block">Cuerpo / Corazón:</span>
                        <span>{product1.notes.corazon}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-65 text-red-400 font-bold block">Fondo Sostén:</span>
                        <span>{product1.notes.fondo}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-zinc-500 italic">No es fragancia regular (fórmula corporal/skincare)</span>
                  )}
                </td>
                <td className={`p-3 border-l text-[10px] space-y-1.5 align-top ${isCruda ? "border-zinc-800 text-zinc-300" : "border-stone-200 text-stone-700"}`}>
                  {product2.notes ? (
                    <>
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-65 text-amber-500 font-bold block">Salida Primaria:</span>
                        <span>{product2.notes.salida}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-65 text-amber-500 font-bold block">Cuerpo / Corazón:</span>
                        <span>{product2.notes.corazon}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono uppercase tracking-wider opacity-65 text-amber-500 font-bold block">Fondo Sostén:</span>
                        <span>{product2.notes.fondo}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-zinc-500 italic">No es fragancia regular (fórmula corporal/skincare)</span>
                  )}
                </td>
              </tr>
            )}

            {/* Main Benefits */}
            <tr>
              <td className="p-3 text-[9px] font-mono uppercase font-black text-zinc-500 align-top">
                Beneficios Principales
              </td>
              <td className={`p-3 border-l text-[11px] align-top ${isCruda ? "border-zinc-800 text-zinc-300" : "border-stone-200 text-stone-700"}`}>
                <ul className="space-y-1.5 pl-3 list-disc">
                  {product1.benefits.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </td>
              <td className={`p-3 border-l text-[11px] align-top ${isCruda ? "border-zinc-800 text-zinc-300" : "border-stone-200 text-stone-700"}`}>
                <ul className="space-y-1.5 pl-3 list-disc">
                  {product2.benefits.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </td>
            </tr>

            {/* Presentation y Refill badge */}
            <tr>
              <td className="p-3 text-[9px] font-mono uppercase font-black text-zinc-500 align-middle">
                Contenido & Repuesto Ecológico
              </td>
              <td className={`p-3 border-l text-xs align-middle ${isCruda ? "border-zinc-800" : "border-stone-200"}`}>
                <div className="flex flex-col gap-1">
                  <span className="font-bold">{product1.volumeOrContent}</span>
                  <div className="flex items-center gap-1 text-[9px]">
                    <Leaf className={`w-3.5 h-3.5 shrink-0 ${product1.repuestoDisponible ? "text-green-500" : "text-zinc-500 opacity-40"}`} />
                    <span className={product1.repuestoDisponible ? "text-green-500 font-semibold" : "text-zinc-500"}>
                      {product1.repuestoDisponible ? "Repuesto Económico Sí" : "Repuesto No Disp."}
                    </span>
                  </div>
                </div>
              </td>
              <td className={`p-3 border-l text-xs align-middle ${isCruda ? "border-zinc-800" : "border-stone-200"}`}>
                <div className="flex flex-col gap-1">
                  <span className="font-bold">{product2.volumeOrContent}</span>
                  <div className="flex items-center gap-1 text-[9px]">
                    <Leaf className={`w-3.5 h-3.5 shrink-0 ${product2.repuestoDisponible ? "text-green-500" : "text-zinc-500 opacity-40"}`} />
                    <span className={product2.repuestoDisponible ? "text-green-500 font-semibold" : "text-zinc-500"}>
                      {product2.repuestoDisponible ? "Repuesto Económico Sí" : "Repuesto No Disp."}
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            {/* Advice of Application */}
            <tr>
              <td className="p-3 text-[9px] font-mono uppercase font-black text-zinc-500 align-top">
                Consejo de Aplicación Profesional
              </td>
              <td className={`p-3 border-l text-[10px] leading-relaxed align-top italic ${isCruda ? "border-zinc-800 text-zinc-400" : "border-stone-200 text-stone-600"}`}>
                "{product1.consejoUso}"
              </td>
              <td className={`p-3 border-l text-[10px] leading-relaxed align-top italic ${isCruda ? "border-zinc-800 text-zinc-400" : "border-stone-200 text-stone-600"}`}>
                "{product2.consejoUso}"
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Integration Call To Action with Gemini AI */}
      <div className={`mt-4 p-3.5 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
        isCruda ? "bg-red-950/20 border border-red-900/35" : "bg-stone-200/55 border border-stone-300/40"
      }`}>
        <div className="flex gap-2">
          <Sparkles className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${isCruda ? "text-red-400" : "text-stone-700"}`} />
          <div className="text-left">
            <span className="text-[10px] font-bold block uppercase tracking-wide">
              ¿Quieres argumentos competitivos afinados por Consultor IA?
            </span>
            <p className={`text-[10px] ${isCruda ? "text-zinc-400" : "text-stone-600"}`}>
              Envía esta comparación a nuestro Consultor Natura para capacitarte sobre cómo rebatir objeciones y aumentar tu comisión de venta de catálogo.
            </p>
          </div>
        </div>
        <button
          onClick={handleAskAIAboutComparison}
          className={`px-3 py-1.5 rounded text-[10px] font-mono font-black flex items-center justify-center gap-1.5 transition-all self-stretch md:self-auto uppercase tracking-wider ${
            isCruda
              ? "bg-red-650 bg-red-600 text-white hover:bg-red-700 active:scale-95 cursor-pointer shadow-red-500/20 shadow"
              : "bg-stone-900 text-stone-50 hover:bg-stone-850 active:scale-95 cursor-pointer shadow"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Consultar a la IA
        </button>
      </div>

    </div> {/* Close Left Column (lg:col-span-3) */}

    {/* Right Sidebar Column: Saved Quicklist & Chat Panel */}
    <div className={`lg:col-span-1 p-4 rounded-lg border flex flex-col h-full justify-between transition-all ${
      isCruda
        ? "bg-zinc-900/60 border-zinc-800 text-zinc-200"
        : "bg-stone-100 border-stone-200 text-stone-800"
    }`}>
      <div>
        {/* Tab Selection Bar */}
        <div className="flex border-b border-dashed border-zinc-850 border-zinc-700/50 pb-2 mb-3 gap-1">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-1 px-1.5 rounded font-mono text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              activeTab === "favorites"
                ? isCruda
                  ? "bg-red-950/40 text-red-400 border border-red-900/40"
                  : "bg-white text-stone-900 shadow-sm border border-stone-250 border-stone-200 font-black"
                : isCruda
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Bookmark className="w-3 h-3" />
            Parejas ({savedComparisons.length})
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-1 px-1.5 rounded font-mono text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all relative ${
              activeTab === "chat"
                ? isCruda
                  ? "bg-red-950/40 text-red-400 border border-red-900/40"
                  : "bg-white text-stone-900 shadow-sm border border-stone-250 border-stone-200 font-black"
                : isCruda
                  ? "text-zinc-500 hover:text-zinc-300"
                  : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            Chat Técnico
            {chatHistory.length > 1 && activeTab !== "chat" && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Tab 1: Favorites Panel */}
        {activeTab === "favorites" && (
          <div>
            {savedComparisons.length === 0 ? (
              <div className="py-8 text-center text-[10px] italic">
                <p className={isCruda ? "text-zinc-500" : "text-stone-500"}>
                  Aún sin parejas guardadas. Usá "Guardar esta comparación" a la izquierda para verlas aquí de forma rápida.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {savedComparisons.map((item) => {
                  const isActive = (item.p1Id === product1Id && item.p2Id === product2Id) || (item.p1Id === product2Id && item.p2Id === product1Id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSaved(item.p1Id, item.p2Id)}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all duration-200 group flex items-start justify-between gap-1.5 ${
                        isActive
                          ? isCruda
                            ? "bg-red-950/20 border-red-500/50 text-red-300 shadow-sm"
                            : "bg-white border-stone-400 shadow-sm text-stone-900 font-bold"
                          : isCruda
                            ? "bg-black/30 border-zinc-850 text-zinc-450 hover:bg-zinc-800/20 hover:text-white"
                            : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-white"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black truncate leading-tight">
                          {item.p1Name}
                        </div>
                        <div className={`text-[8px] font-mono uppercase font-semibold ${isCruda ? "text-zinc-500" : "text-stone-400"} my-0.5`}>
                          versus
                        </div>
                        <div className="text-[10px] font-black truncate leading-tight">
                          {item.p2Name}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0 ${
                          isCruda ? "hover:bg-red-950 text-red-400" : "hover:bg-stone-250 text-red-650"
                        }`}
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Direct Interactive Chat Panel */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[350px] justify-between">
            {/* Chat Thread stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[295px] scrollbar-thin scrollbar-thumb-zinc-800">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-[10.5px] leading-relaxed relative transition-all ${
                    msg.role === "assistant"
                      ? isCruda
                        ? "bg-black/40 border border-zinc-850 text-zinc-350"
                        : "bg-white border border-stone-200 text-stone-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                      : isCruda
                        ? "bg-red-950/25 text-red-300 border border-red-900/30 text-right ml-4 font-bold"
                        : "bg-stone-900 text-stone-50 text-right ml-4 font-bold shadow-sm"
                  }`}
                >
                  <span className={`font-mono text-[8px] uppercase tracking-wider block mb-0.5 ${
                    msg.role === "assistant" 
                      ? isCruda ? "text-red-400" : "text-stone-500"
                      : isCruda ? "text-zinc-500" : "text-stone-400"
                  }`}>
                    {msg.role === "assistant" ? "🌿 Consejero Técnico IA" : "Tu Consulta"}
                  </span>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}

              {isChatLoading && (
                <div className={`p-2.5 rounded flex items-center gap-2 text-[10px] ${
                  isCruda ? "bg-black/40 text-zinc-500" : "bg-white text-stone-500"
                }`}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500 shrink-0" />
                  <span className="italic">Redactando argumento técnico...</span>
                </div>
              )}
            </div>

            {/* Input message form block */}
            <div className="mt-2.5 flex gap-1 items-center bg-transparent pt-1 border-t border-dashed border-zinc-850 border-zinc-700/30">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendChatMessage();
                  }
                }}
                disabled={isChatLoading}
                placeholder="Pregunta o rebatir objeción..."
                className={`flex-1 p-2 text-xs rounded border focus:outline-none focus:ring-1 font-medium select-text ${
                  isCruda
                    ? "bg-zinc-900 border-zinc-805 text-white focus:ring-red-600 focus:border-red-600 placeholder-zinc-650"
                    : "bg-white border-stone-250 border-stone-300 text-stone-900 focus:ring-stone-500 focus:border-stone-500 placeholder-stone-400"
                }`}
              />
              <button
                onClick={handleSendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className={`p-2 rounded flex items-center justify-center transition-all ${
                  isChatLoading || !chatInput.trim()
                    ? isCruda
                      ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : isCruda
                      ? "bg-red-650 bg-red-600 text-white hover:bg-red-750"
                      : "bg-stone-900 text-white hover:bg-stone-850"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`mt-4 pt-3 border-t border-dashed ${isCruda ? "border-zinc-800 text-zinc-500" : "border-stone-200 text-stone-500"} text-[9px] leading-relaxed`}>
        <p>
          💡 {activeTab === "favorites" 
            ? "Con esta sección rápida puedes conmutar comparaciones guardadas en un solo clic. Son persistentes en tu dispositivo."
            : "Chatea directamente aquí sobre los dos productos activos; el Consejero conoce exactamente sus fórmulas y activos seleccionados."}
        </p>
      </div>
    </div>

  </div>
</div>
  );
}


