import React, { useMemo, useState } from "react";

// === FRONTEND (React) ===
// Genera código corto: BLR + 1 letra + 3 dígitos (máx. 6 chars visibles)
function genShortCode(prefix = "BLR") {
  const rand = Math.floor(100 + Math.random() * 900); // 3 dígitos
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // 1 letra
  return `${prefix}${letter}${rand}`; // p.ej. BLRA456
}

export default function FormEnvioNuevoOrdenado() {
  // ⚠️ Reemplaza por tu URL de Web App de Apps Script (Deployment → Web app → URL)
  const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";

  const [form, setForm] = useState({
    // Remitente
    remitente_nombre: "",
    remitente_direccion: "",
    remitente_telefono: "",
    // Destinatario
    destinatario_nombre: "",
    destinatario_cedula: "",
    destinatario_direccion: "",
    destinatario_telefono: "",
    // Envío
    detalle_envio: "",
    valor_estimado: "",
    peso_lb: "8.00",
    estado_inicial: "Recibido en Arlington",
    observacion: "",
    consolidado: true,
  });

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [creado, setCreado] = useState(null as null | { codigo: string; pdfUrl?: string });

  const estados = useMemo(
    () => [
      "Recibido en Arlington",
      "En tránsito a Miami",
      "Recibido en Miami",
      "En vuelo a Ecuador",
      "En aduana (EC)",
      "En ruta a ciudad destino",
      "Entregado",
    ],
    []
  );

  const handle = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const validar = () => {
    if (!form.remitente_nombre.trim()) return "Ingresa el nombre del remitente.";
    if (!form.remitente_direccion.trim()) return "Ingresa la dirección del remitente.";
    if (!form.remitente_telefono.trim()) return "Ingresa el teléfono del remitente.";
    if (!form.destinatario_nombre.trim()) return "Ingresa el nombre del destinatario.";
    if (!form.destinatario_cedula.trim()) return "Ingresa la cédula del destinatario.";
    if (!form.destinatario_direccion.trim()) return "Ingresa la dirección del destinatario.";
    if (!form.destinatario_telefono.trim()) return "Ingresa el teléfono del destinatario.";
    if (!form.detalle_envio.trim()) return "Describe lo que se envía.";
    if (!form.valor_estimado || isNaN(Number(form.valor_estimado))) return "Valor estimado inválido.";
    if (!form.peso_lb || isNaN(Number(form.peso_lb))) return "Peso inválido (lb).";
    return null;
  };

  const onCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validar();
    if (err) return setMensaje(err);

    try {
      setLoading(true);
      setMensaje("");
      // Enviar al backend para: asignar código + guardar en Sheets + crear PDF
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", payload: form }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al crear envío");
      setCreado({ codigo: data.code, pdfUrl: data.pdfUrl });
    } catch (err: any) {
      setMensaje(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const generarFactura = async () => {
    const err = validar();
    if (err) return setMensaje(err);

    try {
      setLoading(true);
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invoice", payload: form, code: creado?.codigo || genShortCode() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "No se pudo generar la factura");
      setCreado((c) => (c ? { ...c, codigo: data.code, pdfUrl: data.pdfUrl } : { codigo: data.code, pdfUrl: data.pdfUrl }));
      if (data.pdfUrl) window.open(data.pdfUrl, "_blank");
    } catch (err: any) {
      setMensaje(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-center">BELOURA • Nuevo Ingreso de Envíos</h1>
        <p className="text-center text-slate-300 mt-2">Formulario con código corto y factura PDF automática en Drive.</p>

        <form onSubmit={onCrear} className="mt-8 bg-slate-800/60 rounded-2xl p-6 shadow-xl border border-slate-700">
          {/* Remitente */}
          <h2 className="text-slate-200 text-sm font-semibold mb-2">Remitente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre del Remitente *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.remitente_nombre} onChange={(e)=>handle('remitente_nombre',e.target.value)} />
            <input placeholder="Teléfono del Remitente *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.remitente_telefono} onChange={(e)=>handle('remitente_telefono',e.target.value)} />
            <input placeholder="Dirección del Remitente *" className="md:col-span-2 rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.remitente_direccion} onChange={(e)=>handle('remitente_direccion',e.target.value)} />
          </div>

          {/* Destinatario */}
          <h2 className="text-slate-200 text-sm font-semibold mt-6 mb-2">Destinatario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre del Destinatario *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.destinatario_nombre} onChange={(e)=>handle('destinatario_nombre',e.target.value)} />
            <input placeholder="Cédula del Destinatario *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.destinatario_cedula} onChange={(e)=>handle('destinatario_cedula',e.target.value)} />
            <input placeholder="Dirección del Destinatario *" className="md:col-span-2 rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.destinatario_direccion} onChange={(e)=>handle('destinatario_direccion',e.target.value)} />
            <input placeholder="Teléfono del Destinatario *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.destinatario_telefono} onChange={(e)=>handle('destinatario_telefono',e.target.value)} />
          </div>

          {/* Envío */}
          <h2 className="text-slate-200 text-sm font-semibold mt-6 mb-2">Envío</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Detalle de lo que se envía *" className="md:col-span-2 rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.detalle_envio} onChange={(e)=>handle('detalle_envio',e.target.value)} />
            <input placeholder="Valor estimado (USD) *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.valor_estimado} onChange={(e)=>handle('valor_estimado',e.target.value)} />
            <input placeholder="Peso (lb) *" className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.peso_lb} onChange={(e)=>handle('peso_lb',e.target.value)} />
            <select className="rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.estado_inicial} onChange={(e)=>handle('estado_inicial',e.target.value)}>
              {estados.map((s)=> <option key={s}>{s}</option>)}
            </select>
            <textarea placeholder="Observación (opcional)" rows={3} className="md:col-span-2 rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3" value={form.observacion} onChange={(e)=>handle('observacion',e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.consolidado} onChange={(e)=>handle('consolidado',e.target.checked)} /> Ocultar nombres en rastreo público (consolidado)</label>
          </div>

          {mensaje && <div className="mt-4 rounded-xl border border-red-600/60 bg-red-900/20 px-4 py-3 text-red-200">{mensaje}</div>}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <button disabled={loading} type="submit" className="rounded-xl bg-teal-500/80 hover:bg-teal-400 text-slate-900 font-semibold py-3 disabled:opacity-60">{loading? 'Guardando...' : 'Crear envío (Sheets + PDF)'}</button>
            <button disabled={loading} type="button" onClick={generarFactura} className="rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-3 disabled:opacity-60">{loading? 'Generando...' : 'Generar factura (abrir PDF)'}</button>
          </div>

          {creado && (
            <div className="mt-6 rounded-xl border border-emerald-700 bg-emerald-900/20 px-4 py-4 text-emerald-200">
              <strong>Éxito:</strong> Envío creado con código <span className="font-mono text-emerald-100">{creado.codigo}</span> {creado.pdfUrl && (<>
                · <a className="underline" href={creado.pdfUrl} target="_blank">Abrir PDF</a>
              </>)}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
