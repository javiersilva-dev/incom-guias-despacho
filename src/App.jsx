import { useState, useEffect, useCallback } from "react";

const SCRIPT_URL_KEY = "incom_script_url";
const CONFIG_KEY = "incom_config";
const PERIODO_KEY = "incom_periodo";

const DEFAULT_CONFIG = {
  peajeRampla: 41600,
  viatico: 50000,
  peajeBatea: 13800,
  conductores: [
    "BRAYAN GUEVARA ALBORNOZ","DANIEL VEGA PEREIRA","ROBERTO FAJARDO SALINAS",
    "CRISTIAN LANAS DIAZ","CRISTIAN OLIVARES ROJAS","LUIS MADARIAGA ALCOTA",
    "JUAN VALENZUELA CASTRO","UBER ZAMORA MONARDES","RENE PAEZ REBOLLEDO",
    "JOSE GONZALEZ GUEVARA","ABELINO CARRIZO VALLEJO","FRANCISCO HANSHING VEGA",
    "RICARDO CONTRERAS PAEZ","JAVIER SANCHEZ SAAVEDRA","LUIS MUÑOZ ALMONACID",
    "FELIPE CORTES ZEPEDA","JAVIER CORTES BRUNA","RICARDO RAMIREZ MIRANDA",
    "EDUARDO LEDESMA LEDESMA","MARCO QUIROGA ESQUIVEL","ORLANDO BUGUEÑO RIVERA",
    "ENRIQUE ROJAS GARCIA","BORIS ROJAS FLORES","PEDRO ARRIAGADA TAPIA",
    "PEDRO SAEZ GONZALEZ","ALBERTO ASTORGA MONTAÑA","DAMM CRUZ GARRIDO",
    "ROLANDO GUZMAN ACUÑA","JUAN MUÑOZ TIMBLE","WILFRIDO OLIVARES LEON",
    "MARCO RIQUELME INOSTROZA","JOSE URIZAR ESCOBAR"
  ],
  tractosRampla: ["SPSH74","SSHY46","RJBV35","RVFF14","RJBV34","RVFF13","RTRJ40"],
  ramplas: ["PWXW81","PWVW82","PWVW57","PWVW58","PWVW56","PWVX89","PWVX90"],
  tractosBatea: [
    "PJFD83","LXXL81","RVFK45","RTRJ40","PJFD76","RVXC10","PJFD98","PJBP95",
    "RVXB98","RVFK46","PPPW79","RVFK47","LRVV85","SYPL10","PJFD81","SHLL37",
    "RKGC82","LRVV86","SSHY46","PPPW78","PJBP94","PJFD83"
  ],
  bateas: [
    "KYPV88","KYPJ52","HGKS68","PTXP75","KYPT47","KYPV87","KDKS78","KYRG45",
    "KYRH78","KYRG46","KDKS88","KDKS72","HGKS91","KDKS89","KYPJ54","KYPR55",
    "KYRH78","KYPJ53","KDKS71","KDKS57"
  ],
  supervisores: ["CAMILA MUÑOZ","BORIS GANA","IGNACIO BUSTOS","GONZALO FERNANDEZ"],
  equiposRampla: ["MERCEDES BENZ","FREIGHTLINER","DAF","SCANIA"],
  origenRampla: "CASERONES",
  destinoRampla: "ANGAMOS",
  productoRampla: "CATODOS",
  origenBatea: "DOMO CASERONES",
  destinoBatea: "TOTORALILLO"
};

function getPeriodo() {
  const stored = localStorage.getItem(PERIODO_KEY);
  if (stored) return JSON.parse(stored);
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();
  let desde, hasta;
  if (hoy.getDate() >= 26) {
    desde = new Date(anio, mes, 26);
    hasta = new Date(anio, mes + 1, 25);
  } else {
    desde = new Date(anio, mes - 1, 26);
    hasta = new Date(anio, mes, 25);
  }
  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hasta.toISOString().slice(0, 10)
  };
}

function toExcelDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return Math.floor((d - new Date(1899, 11, 30)) / 86400000);
}

function formatFecha(excelNum) {
  if (!excelNum) return "";
  const d = new Date(1899, 11, 30);
  d.setDate(d.getDate() + excelNum);
  return d.toLocaleDateString("es-CL");
}

function formatCLP(n) {
  return Number(n || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

const TABS = ["Ingreso", "Ramplas", "Bateas", "Configuración", "Informes"];
const TAB_ICONS = ["ti-plus-circle","ti-truck","ti-crane","ti-settings","ti-chart-bar"];

export default function App() {
  const [tab, setTab] = useState(0);
  const [config, setConfig] = useState(() => {
    try { return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") }; }
    catch { return DEFAULT_CONFIG; }
  });
  const [scriptUrl, setScriptUrl] = useState(() => localStorage.getItem(SCRIPT_URL_KEY) || "");
  const [periodo, setPeriodo] = useState(getPeriodo);
  const [ramplas, setRamplas] = useState([]);
  const [bateas, setBateas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [ingresoTipo, setIngresoTipo] = useState("batea");
  const [ingresoFecha, setIngresoFecha] = useState(() => {
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    return ayer.toISOString().slice(0, 10);
  });
  const [ingresos, setIngresos] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveConfig = (c) => {
    setConfig(c);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
    showToast("Configuración guardada");
  };

  const callScript = useCallback(async (payload) => {
    if (!scriptUrl) { showToast("Falta URL del Apps Script", "err"); return null; }
    const r = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return r.json();
  }, [scriptUrl]);

  const fetchData = useCallback(async () => {
    if (!scriptUrl) return;
    setLoading(true);
    try {
      const res = await callScript({ action: "getAll", periodo });
      if (res?.ramplas) setRamplas(res.ramplas);
      if (res?.bateas) setBateas(res.bateas);
    } catch (e) { showToast("Error al cargar datos", "err"); }
    setLoading(false);
  }, [scriptUrl, periodo, callScript]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const buildFilaRampla = () => ({
    fecha: toExcelDate(ingresoFecha),
    guia: "", tracto: "", rampla: "", conductor: "",
    producto: config.productoRampla, origen: config.origenRampla, destino: config.destinoRampla,
    bruto: "", tara: "", neto: "", paquetes: 11,
    recepcionPuerto: "", llegadaTaller: "",
    viatico: config.viatico, peajes: config.peajeRampla,
    consumo: "", km: "", equipo: "", supervisor: config.supervisores[0] || "", obs: ""
  });

  const buildFilaBatea = () => ({
    fecha: toExcelDate(ingresoFecha),
    guia: "", tracto: "", batea: "", conductor: "",
    bruto: "", tara: "", neto: "",
    ticket: "", netoPuerto: "",
    origen: config.origenBatea, destino: config.destinoBatea,
    peajes: config.peajeBatea, supervisor: config.supervisores[0] || "", revisadoPor: ""
  });

  const prepararFilas = () => {
    const n = parseInt(cantidad);
    if (!n || n < 1 || n > 50) { showToast("Ingrese entre 1 y 50 servicios", "err"); return; }
    const builder = ingresoTipo === "rampla" ? buildFilaRampla : buildFilaBatea;
    setIngresos(Array.from({ length: n }, builder));
  };

  const updateIngreso = (i, k, v) => {
    setIngresos(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  };

  const guardarIngresos = async () => {
    if (!ingresos.length) return;
    setSaving(true);
    try {
      const res = await callScript({ action: "save", tipo: ingresoTipo, rows: ingresos });
      if (res?.ok) {
        showToast(`${ingresos.length} guías guardadas`);
        setIngresos([]);
        setCantidad("");
        fetchData();
      } else { showToast(res?.msg || "Error al guardar", "err"); }
    } catch { showToast("Error de conexión", "err"); }
    setSaving(false);
  };

  const exportExcel = (tipo) => {
    const data = tipo === "rampla" ? ramplas : bateas;
    if (!data.length) { showToast("Sin datos para exportar", "err"); return; }
    const headers = tipo === "rampla"
      ? ["N°","Fecha","Guía","Tracto","Rampla","Conductor","Producto","Origen","Destino","Bruto","Tara","Neto","Paquetes","Rec.Puerto","Lleg.Taller","Viático","Peajes","Consumo","KM","Rendimiento","Equipo","Total","Supervisor","Obs"]
      : ["N°","Fecha","N° Guía","Tracto","Batea","Conductor","Bruto","Tara","Neto","Dif.","N° Ticket","Neto Puerto","Dif.Puerto","Origen","Destino","Peajes","Supervisor","Revisado"];
    const rows = data.map((r, i) => tipo === "rampla"
      ? [i+1, formatFecha(r.fecha), r.guia, r.tracto, r.rampla, r.conductor, r.producto, r.origen, r.destino, r.bruto, r.tara, r.neto, r.paquetes, formatFecha(r.recepcionPuerto), formatFecha(r.llegadaTaller), r.viatico, r.peajes, r.consumo, r.km, r.km && r.consumo ? (r.km/r.consumo).toFixed(2) : "", r.equipo, Number(r.viatico||0)+Number(r.peajes||0), r.supervisor, r.obs]
      : [i+1, formatFecha(r.fecha), r.guia, r.tracto, r.batea, r.conductor, r.bruto, r.tara, r.neto, ((r.neto||0)-(r.netoPuerto||0)).toFixed(3), r.ticket, r.netoPuerto, ((r.netoPuerto||0)-(r.neto||0)).toFixed(3), r.origen, r.destino, r.peajes, r.supervisor, r.revisadoPor]
    );
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `INCOM_${tipo.toUpperCase()}_${periodo.desde}_${periodo.hasta}.csv`; a.click();
  };

  const totalNeto = bateas.reduce((s, r) => s + Number(r.neto || 0), 0);
  const totalVueltas = ramplas.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)" }}>
      <style>{`
        .tab-btn { border: none; background: none; cursor: pointer; padding: 10px 18px; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px; border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; }
        .tab-btn.active { color: var(--color-text-primary); border-bottom-color: #185FA5; }
        .tab-btn:hover:not(.active) { color: var(--color-text-primary); background: var(--color-background-secondary); }
        .card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1.25rem; }
        .inp { width: 100%; box-sizing: border-box; font-size: 13px; padding: 5px 8px; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); background: var(--color-background-primary); color: var(--color-text-primary); }
        .inp:focus { outline: none; border-color: #378ADD; }
        select.inp { cursor: pointer; }
        .btn-primary { background: #185FA5; color: #fff; border: none; border-radius: var(--border-radius-md); padding: 8px 18px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
        .btn-primary:hover { background: #0C447C; }
        .btn-primary:disabled { background: var(--color-border-secondary); cursor: not-allowed; }
        .btn-outline { background: none; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); padding: 7px 16px; font-size: 13px; cursor: pointer; color: var(--color-text-primary); transition: all 0.15s; }
        .btn-outline:hover { background: var(--color-background-secondary); }
        .label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 3px; display: block; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
        .tbl th { background: var(--color-background-secondary); padding: 7px 8px; text-align: left; font-weight: 500; font-size: 11px; color: var(--color-text-secondary); border-bottom: 0.5px solid var(--color-border-tertiary); white-space: nowrap; position: sticky; top: 0; z-index: 1; }
        .tbl td { padding: 5px 8px; border-bottom: 0.5px solid var(--color-border-tertiary); color: var(--color-text-primary); }
        .tbl tr:hover td { background: var(--color-background-secondary); }
        .metric { background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 14px 16px; }
        .metric-label { font-size: 11px; color: var(--color-text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .metric-value { font-size: 28px; font-weight: 500; color: var(--color-text-primary); margin-top: 2px; }
        .tag-tipo { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 0.5px solid var(--color-border-secondary); transition: all 0.15s; }
        .tag-tipo.active-r { background: #E6F1FB; color: #185FA5; border-color: #185FA5; }
        .tag-tipo.active-b { background: #E1F5EE; color: #0F6E56; border-color: #0F6E56; }
        .tag-tipo:not(.active-r):not(.active-b):hover { background: var(--color-background-secondary); }
        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 20px; border-radius: var(--border-radius-md); font-size: 13px; font-weight: 500; z-index: 999; animation: fadeup 0.2s; }
        .toast-ok { background: #0F6E56; color: #E1F5EE; }
        .toast-err { background: #A32D2D; color: #FCEBEB; }
        @keyframes fadeup { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        .grid-form { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .grid-form-wide { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
        .fila-header { background: #E6F1FB; padding: 8px 12px; border-radius: var(--border-radius-md); font-size: 12px; font-weight: 500; color: #185FA5; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .tbl-scroll { overflow-x: auto; max-height: 420px; overflow-y: auto; }
      `}</style>

      {/* Header */}
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, paddingBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-file-invoice" style={{ color: "#fff", fontSize: 16 }} aria-hidden />
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>Control de Guías de Despacho</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>INCOM · Ramplas &amp; Bateas · Período {periodo.desde} → {periodo.hasta}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              {loading && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}><i className="ti ti-loader-2" /> cargando...</span>}
              <button className="btn-outline" onClick={fetchData} title="Recargar datos">
                <i className="ti ti-refresh" />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {TABS.map((t, i) => (
              <button key={i} className={`tab-btn${tab === i ? " active" : ""}`} onClick={() => setTab(i)}>
                <i className={`ti ${TAB_ICONS[i]}`} aria-hidden /> {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── TAB 0: INGRESO ── */}
        {tab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="card">
                <div style={{ marginBottom: 12, fontWeight: 500, fontSize: 14 }}>Nuevo ingreso de guías</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                  {[["rampla","Ramplas","ti-truck"],["batea","Bateas","ti-crane"]].map(([k, label, icon]) => (
                    <button key={k} className={`tag-tipo${ingresoTipo === k ? (k === "rampla" ? " active-r" : " active-b") : ""}`}
                      onClick={() => { setIngresoTipo(k); setIngresos([]); setCantidad(""); }}>
                      <i className={`ti ${icon}`} aria-hidden /> {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
                  <div>
                    <span className="label">Fecha del servicio</span>
                    <input type="date" className="inp" value={ingresoFecha} onChange={e => setIngresoFecha(e.target.value)} />
                  </div>
                  <div>
                    <span className="label">Cantidad de servicios</span>
                    <input type="number" className="inp" min={1} max={50} placeholder="ej: 14" value={cantidad}
                      onChange={e => setCantidad(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && prepararFilas()} />
                  </div>
                  <button className="btn-primary" onClick={prepararFilas}>
                    <i className="ti ti-table-plus" /> Preparar filas
                  </button>
                </div>
              </div>
              <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="metric"><div className="metric-label">Vueltas período</div><div className="metric-value">{totalVueltas}</div></div>
                <div className="metric"><div className="metric-label">Tonelaje período</div><div className="metric-value" style={{ fontSize: 20 }}>{totalNeto.toFixed(1)} t</div></div>
                <div className="metric"><div className="metric-label">Guías rampla</div><div className="metric-value" style={{ fontSize: 20 }}>{ramplas.length}</div></div>
                <div className="metric"><div className="metric-label">Guías batea</div><div className="metric-value" style={{ fontSize: 20 }}>{bateas.length}</div></div>
              </div>
            </div>

            {/* Filas de ingreso */}
            {ingresos.length > 0 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    <i className={`ti ${ingresoTipo === "rampla" ? "ti-truck" : "ti-crane"}`} aria-hidden /> &nbsp;
                    {ingresos.length} guías de {ingresoTipo === "rampla" ? "Rampla" : "Batea"} — {new Date(ingresoFecha + "T12:00:00").toLocaleDateString("es-CL")}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-outline" onClick={() => { setIngresos([]); setCantidad(""); }}>Cancelar</button>
                    <button className="btn-primary" onClick={guardarIngresos} disabled={saving}>
                      {saving ? <><i className="ti ti-loader-2" /> Guardando...</> : <><i className="ti ti-device-floppy" /> Guardar {ingresos.length} guías</>}
                    </button>
                  </div>
                </div>

                {ingresos.map((fila, i) => (
                  <div key={i} style={{ marginBottom: 14, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 14 }}>
                    <div className="fila-header">
                      <span>#{i + 1}</span>
                    </div>
                    {ingresoTipo === "rampla" ? (
                      <div className="grid-form">
                        <div><span className="label">N° Guía *</span><input className="inp" placeholder="184734" value={fila.guia} onChange={e => updateIngreso(i,"guia",e.target.value)} /></div>
                        <div><span className="label">Tracto</span>
                          <select className="inp" value={fila.tracto} onChange={e => updateIngreso(i,"tracto",e.target.value)}>
                            <option value="">—</option>{config.tractosRampla.map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Rampla</span>
                          <select className="inp" value={fila.rampla} onChange={e => updateIngreso(i,"rampla",e.target.value)}>
                            <option value="">—</option>{config.ramplas.map(r=><option key={r}>{r}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Conductor</span>
                          <select className="inp" value={fila.conductor} onChange={e => updateIngreso(i,"conductor",e.target.value)}>
                            <option value="">—</option>{config.conductores.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Bruto (kg)</span><input className="inp" type="number" placeholder="42830" value={fila.bruto} onChange={e => {
                          const b = e.target.value; const neto = b && fila.tara ? b - fila.tara : "";
                          updateIngreso(i,"bruto",b); if(neto !== "") updateIngreso(i,"neto",neto);
                        }} /></div>
                        <div><span className="label">Tara (kg)</span><input className="inp" type="number" placeholder="16424" value={fila.tara} onChange={e => {
                          const t = e.target.value; const neto = fila.bruto && t ? fila.bruto - t : "";
                          updateIngreso(i,"tara",t); if(neto !== "") updateIngreso(i,"neto",neto);
                        }} /></div>
                        <div><span className="label">Neto (kg)</span><input className="inp" type="number" value={fila.neto} readOnly style={{ background: "var(--color-background-secondary)" }} /></div>
                        <div><span className="label">Paquetes</span><input className="inp" type="number" value={fila.paquetes} onChange={e => updateIngreso(i,"paquetes",e.target.value)} /></div>
                        <div><span className="label">Rec. Puerto</span><input className="inp" type="date" onChange={e => updateIngreso(i,"recepcionPuerto",toExcelDate(e.target.value))} /></div>
                        <div><span className="label">Lleg. Taller</span><input className="inp" type="date" onChange={e => updateIngreso(i,"llegadaTaller",toExcelDate(e.target.value))} /></div>
                        <div><span className="label">Viático $</span><input className="inp" type="number" value={fila.viatico} onChange={e => updateIngreso(i,"viatico",e.target.value)} /></div>
                        <div><span className="label">Peajes $</span><input className="inp" type="number" value={fila.peajes} onChange={e => updateIngreso(i,"peajes",e.target.value)} /></div>
                        <div><span className="label">Consumo (L)</span><input className="inp" type="number" value={fila.consumo} onChange={e => updateIngreso(i,"consumo",e.target.value)} /></div>
                        <div><span className="label">KM</span><input className="inp" type="number" value={fila.km} onChange={e => updateIngreso(i,"km",e.target.value)} /></div>
                        <div><span className="label">Equipo</span>
                          <select className="inp" value={fila.equipo} onChange={e => updateIngreso(i,"equipo",e.target.value)}>
                            <option value="">—</option>{config.equiposRampla.map(eq=><option key={eq}>{eq}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Supervisor</span>
                          <select className="inp" value={fila.supervisor} onChange={e => updateIngreso(i,"supervisor",e.target.value)}>
                            {config.supervisores.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: "span 2" }}><span className="label">Observaciones</span><input className="inp" value={fila.obs} onChange={e => updateIngreso(i,"obs",e.target.value)} /></div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                          <div className="metric" style={{ padding: "6px 10px" }}>
                            <div className="metric-label">Total</div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>{formatCLP(Number(fila.viatico||0)+Number(fila.peajes||0))}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid-form">
                        <div><span className="label">N° Guía *</span><input className="inp" placeholder="185994" value={fila.guia} onChange={e => updateIngreso(i,"guia",e.target.value)} /></div>
                        <div><span className="label">PPU Tracto</span>
                          <select className="inp" value={fila.tracto} onChange={e => updateIngreso(i,"tracto",e.target.value)}>
                            <option value="">—</option>{config.tractosBatea.map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div><span className="label">PPU Batea</span>
                          <select className="inp" value={fila.batea} onChange={e => updateIngreso(i,"batea",e.target.value)}>
                            <option value="">—</option>{config.bateas.map(b=><option key={b}>{b}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Conductor</span>
                          <select className="inp" value={fila.conductor} onChange={e => updateIngreso(i,"conductor",e.target.value)}>
                            <option value="">—</option>{config.conductores.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Bruto (t)</span><input className="inp" type="number" step="0.01" placeholder="44.67" value={fila.bruto} onChange={e => {
                          const b = e.target.value; const neto = b && fila.tara ? (parseFloat(b)-parseFloat(fila.tara)).toFixed(2) : "";
                          updateIngreso(i,"bruto",b); if(neto !== "") updateIngreso(i,"neto",neto);
                        }} /></div>
                        <div><span className="label">Tara (t)</span><input className="inp" type="number" step="0.01" placeholder="15.83" value={fila.tara} onChange={e => {
                          const t = e.target.value; const neto = fila.bruto && t ? (parseFloat(fila.bruto)-parseFloat(t)).toFixed(2) : "";
                          updateIngreso(i,"tara",t); if(neto !== "") updateIngreso(i,"neto",neto);
                        }} /></div>
                        <div><span className="label">Neto (t)</span><input className="inp" type="number" step="0.01" value={fila.neto} readOnly style={{ background: "var(--color-background-secondary)" }} /></div>
                        <div><span className="label">N° Ticket</span><input className="inp" value={fila.ticket} onChange={e => updateIngreso(i,"ticket",e.target.value)} /></div>
                        <div><span className="label">Neto Puerto (t)</span><input className="inp" type="number" step="0.01" value={fila.netoPuerto} onChange={e => updateIngreso(i,"netoPuerto",e.target.value)} /></div>
                        <div><span className="label">Peajes $</span><input className="inp" type="number" value={fila.peajes} onChange={e => updateIngreso(i,"peajes",e.target.value)} /></div>
                        <div><span className="label">Supervisor</span>
                          <select className="inp" value={fila.supervisor} onChange={e => updateIngreso(i,"supervisor",e.target.value)}>
                            {config.supervisores.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div><span className="label">Revisado por</span>
                          <select className="inp" value={fila.revisadoPor} onChange={e => updateIngreso(i,"revisadoPor",e.target.value)}>
                            <option value="">—</option>{config.supervisores.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {ingresos.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
                    <button className="btn-primary" onClick={guardarIngresos} disabled={saving}>
                      {saving ? "Guardando..." : `Guardar ${ingresos.length} guías`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: RAMPLAS ── */}
        {tab === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                <i className="ti ti-truck" aria-hidden /> Ramplas — {ramplas.length} guías
              </div>
              <button className="btn-outline" onClick={() => exportExcel("rampla")}>
                <i className="ti ti-download" /> Exportar CSV
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
              <div className="metric"><div className="metric-label">Total vueltas</div><div className="metric-value">{ramplas.length}</div></div>
              <div className="metric"><div className="metric-label">Total viáticos</div><div className="metric-value" style={{ fontSize: 18 }}>{formatCLP(ramplas.reduce((s,r)=>s+Number(r.viatico||0),0))}</div></div>
              <div className="metric"><div className="metric-label">Total peajes</div><div className="metric-value" style={{ fontSize: 18 }}>{formatCLP(ramplas.reduce((s,r)=>s+Number(r.peajes||0),0))}</div></div>
              <div className="metric"><div className="metric-label">Total general</div><div className="metric-value" style={{ fontSize: 18 }}>{formatCLP(ramplas.reduce((s,r)=>s+Number(r.viatico||0)+Number(r.peajes||0),0))}</div></div>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead><tr>
                    {["#","Fecha","Guía","Tracto","Rampla","Conductor","Paq.","Bruto","Tara","Neto","Viático","Peajes","Total","KM","Equipo","Supervisor","Obs"].map(h=><th key={h}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {ramplas.map((r, i) => (
                      <tr key={i}>
                        <td>{i+1}</td>
                        <td>{formatFecha(r.fecha)}</td>
                        <td style={{ fontWeight: 500 }}>{r.guia}</td>
                        <td>{r.tracto}</td>
                        <td>{r.rampla}</td>
                        <td>{r.conductor}</td>
                        <td style={{ textAlign: "center" }}>{r.paquetes}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.bruto||0).toLocaleString("es-CL")}</td>
                        <td style={{ textAlign: "right" }}>{Number(r.tara||0).toLocaleString("es-CL")}</td>
                        <td style={{ textAlign: "right", fontWeight: 500 }}>{Number(r.neto||0).toLocaleString("es-CL")}</td>
                        <td style={{ textAlign: "right" }}>{formatCLP(r.viatico)}</td>
                        <td style={{ textAlign: "right" }}>{formatCLP(r.peajes)}</td>
                        <td style={{ textAlign: "right", fontWeight: 500, color: "#185FA5" }}>{formatCLP(Number(r.viatico||0)+Number(r.peajes||0))}</td>
                        <td style={{ textAlign: "right" }}>{r.km}</td>
                        <td>{r.equipo}</td>
                        <td>{r.supervisor}</td>
                        <td style={{ color: "var(--color-text-secondary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.obs}</td>
                      </tr>
                    ))}
                    {ramplas.length === 0 && <tr><td colSpan={17} style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 32 }}>Sin datos para el período</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BATEAS ── */}
        {tab === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                <i className="ti ti-crane" aria-hidden /> Bateas — {bateas.length} guías
              </div>
              <button className="btn-outline" onClick={() => exportExcel("batea")}>
                <i className="ti ti-download" /> Exportar CSV
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
              <div className="metric"><div className="metric-label">Total guías</div><div className="metric-value">{bateas.length}</div></div>
              <div className="metric"><div className="metric-label">Tonelaje neto</div><div className="metric-value" style={{ fontSize: 18 }}>{totalNeto.toFixed(2)} t</div></div>
              <div className="metric"><div className="metric-label">Prom. por viaje</div><div className="metric-value" style={{ fontSize: 18 }}>{bateas.length ? (totalNeto/bateas.length).toFixed(2) : "0"} t</div></div>
              <div className="metric"><div className="metric-label">Total peajes</div><div className="metric-value" style={{ fontSize: 18 }}>{formatCLP(bateas.reduce((s,r)=>s+Number(r.peajes||0),0))}</div></div>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead><tr>
                    {["#","Fecha","Guía","Tracto","Batea","Conductor","Bruto","Tara","Neto","N° Ticket","Neto Puerto","Dif.Puerto","Peajes","Supervisor"].map(h=><th key={h}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {bateas.map((r, i) => {
                      const dif = ((r.netoPuerto||0) - (r.neto||0)).toFixed(3);
                      return (
                        <tr key={i}>
                          <td>{i+1}</td>
                          <td>{formatFecha(r.fecha)}</td>
                          <td style={{ fontWeight: 500 }}>{r.guia}</td>
                          <td>{r.tracto}</td>
                          <td>{r.batea}</td>
                          <td>{r.conductor}</td>
                          <td style={{ textAlign: "right" }}>{Number(r.bruto||0).toFixed(2)}</td>
                          <td style={{ textAlign: "right" }}>{Number(r.tara||0).toFixed(2)}</td>
                          <td style={{ textAlign: "right", fontWeight: 500 }}>{Number(r.neto||0).toFixed(2)}</td>
                          <td>{r.ticket}</td>
                          <td style={{ textAlign: "right" }}>{Number(r.netoPuerto||0).toFixed(2)}</td>
                          <td style={{ textAlign: "right", color: parseFloat(dif) < -0.1 ? "#A32D2D" : "var(--color-text-secondary)" }}>{dif}</td>
                          <td style={{ textAlign: "right" }}>{formatCLP(r.peajes)}</td>
                          <td>{r.supervisor}</td>
                        </tr>
                      );
                    })}
                    {bateas.length === 0 && <tr><td colSpan={14} style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 32 }}>Sin datos para el período</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CONFIGURACIÓN ── */}
        {tab === 3 && <ConfigTab config={config} saveConfig={saveConfig} scriptUrl={scriptUrl} setScriptUrl={v => { setScriptUrl(v); localStorage.setItem(SCRIPT_URL_KEY, v); }} periodo={periodo} setPeriodo={p => { setPeriodo(p); localStorage.setItem(PERIODO_KEY, JSON.stringify(p)); }} />}

        {/* ── TAB 4: INFORMES ── */}
        {tab === 4 && <InformesTab ramplas={ramplas} bateas={bateas} periodo={periodo} formatCLP={formatCLP} exportExcel={exportExcel} />}

      </div>

      {toast && <div className={`toast toast-${toast.type === "err" ? "err" : "ok"}`}>{toast.msg}</div>}
    </div>
  );
}

function ConfigTab({ config, saveConfig, scriptUrl, setScriptUrl, periodo, setPeriodo }) {
  const [local, setLocal] = useState({ ...config });
  const [newConductor, setNewConductor] = useState("");
  const [newTractoR, setNewTractoR] = useState("");
  const [newRampla, setNewRampla] = useState("");
  const [newTractoB, setNewTractoB] = useState("");
  const [newBatea, setNewBatea] = useState("");

  const addToList = (key, val, setter) => {
    if (!val.trim()) return;
    const v = val.trim().toUpperCase();
    if (!local[key].includes(v)) setLocal(p => ({ ...p, [key]: [...p[key], v] }));
    setter("");
  };
  const removeFromList = (key, val) => setLocal(p => ({ ...p, [key]: p[key].filter(x => x !== val) }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 12 }}>Conexión Google Sheets</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }}>
          <div>
            <span className="label">URL del Apps Script (Web App)</span>
            <input className="inp" placeholder="https://script.google.com/macros/s/..." value={scriptUrl} onChange={e => setScriptUrl(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 12 }}>Período activo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><span className="label">Desde (día 26)</span><input type="date" className="inp" value={periodo.desde} onChange={e => setPeriodo({ ...periodo, desde: e.target.value })} /></div>
          <div><span className="label">Hasta (día 25)</span><input type="date" className="inp" value={periodo.hasta} onChange={e => setPeriodo({ ...periodo, hasta: e.target.value })} /></div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 500, marginBottom: 12 }}>Valores por defecto</div>
        <div className="grid-form-wide">
          <div><span className="label">Viático Rampla $</span><input type="number" className="inp" value={local.viatico} onChange={e => setLocal(p=>({...p,viatico:e.target.value}))} /></div>
          <div><span className="label">Peaje Rampla $</span><input type="number" className="inp" value={local.peajeRampla} onChange={e => setLocal(p=>({...p,peajeRampla:e.target.value}))} /></div>
          <div><span className="label">Peaje Batea $</span><input type="number" className="inp" value={local.peajeBatea} onChange={e => setLocal(p=>({...p,peajeBatea:e.target.value}))} /></div>
          <div><span className="label">Origen Rampla</span><input className="inp" value={local.origenRampla} onChange={e => setLocal(p=>({...p,origenRampla:e.target.value}))} /></div>
          <div><span className="label">Destino Rampla</span><input className="inp" value={local.destinoRampla} onChange={e => setLocal(p=>({...p,destinoRampla:e.target.value}))} /></div>
          <div><span className="label">Producto Rampla</span><input className="inp" value={local.productoRampla} onChange={e => setLocal(p=>({...p,productoRampla:e.target.value}))} /></div>
          <div><span className="label">Origen Batea</span><input className="inp" value={local.origenBatea} onChange={e => setLocal(p=>({...p,origenBatea:e.target.value}))} /></div>
          <div><span className="label">Destino Batea</span><input className="inp" value={local.destinoBatea} onChange={e => setLocal(p=>({...p,destinoBatea:e.target.value}))} /></div>
        </div>
      </div>

      {[
        ["conductores","Conductores","conductor",newConductor,setNewConductor],
        ["tractosRampla","Tractos Rampla","tracto",newTractoR,setNewTractoR],
        ["ramplas","Ramplas (PPU)","rampla",newRampla,setNewRampla],
        ["tractosBatea","Tractos Batea","tracto",newTractoB,setNewTractoB],
        ["bateas","Bateas (PPU)","batea",newBatea,setNewBatea],
      ].map(([key, title, ph, val, setter]) => (
        <div key={key} className="card">
          <div style={{ fontWeight: 500, marginBottom: 10 }}>{title}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="inp" placeholder={`Agregar ${ph}...`} value={val} onChange={e => setter(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && addToList(key, val, setter)} style={{ flex: 1 }} />
            <button className="btn-outline" onClick={() => addToList(key, val, setter)}><i className="ti ti-plus" /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {local[key].map(item => (
              <span key={item} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "var(--color-background-secondary)", borderRadius: 20, fontSize: 12, border: "0.5px solid var(--color-border-tertiary)" }}>
                {item}
                <button onClick={() => removeFromList(key, item)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={() => saveConfig(local)}>
          <i className="ti ti-device-floppy" /> Guardar configuración
        </button>
      </div>
    </div>
  );
}

function InformesTab({ ramplas, bateas, periodo, formatCLP, exportExcel }) {
  const byKey = (arr, key) => {
    const m = {};
    arr.forEach(r => {
      const k = r[key] || "Sin asignar";
      if (!m[k]) m[k] = { count: 0, neto: 0, total: 0 };
      m[k].count += 1;
      m[k].neto += Number(r.neto || 0);
      m[k].total += Number(r.viatico || 0) + Number(r.peajes || 0);
    });
    return Object.entries(m).sort((a,b) => b[1].count - a[1].count);
  };

  const rByC = byKey(ramplas, "conductor");
  const bByC = byKey(bateas, "conductor");

  const printReport = () => window.print();

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button className="btn-outline" onClick={() => exportExcel("rampla")}><i className="ti ti-download" /> CSV Ramplas</button>
        <button className="btn-outline" onClick={() => exportExcel("batea")}><i className="ti ti-download" /> CSV Bateas</button>
        <button className="btn-outline" onClick={printReport}><i className="ti ti-printer" /> Imprimir / PDF</button>
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
        Período: {periodo.desde} → {periodo.hasta}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-truck" aria-hidden /> Ramplas por conductor — Vueltas
          </div>
          <table className="tbl">
            <thead><tr><th>Conductor</th><th style={{ textAlign:"right" }}>Vueltas</th><th style={{ textAlign:"right" }}>Total $</th></tr></thead>
            <tbody>
              {rByC.map(([c, v]) => (
                <tr key={c}>
                  <td style={{ fontSize: 12 }}>{c}</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{v.count}</td>
                  <td style={{ textAlign: "right" }}>{formatCLP(v.total)}</td>
                </tr>
              ))}
              {ramplas.length > 0 && (
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  <td style={{ fontWeight: 500 }}>TOTAL</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{ramplas.length}</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{formatCLP(ramplas.reduce((s,r)=>s+Number(r.viatico||0)+Number(r.peajes||0),0))}</td>
                </tr>
              )}
              {ramplas.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 24 }}>Sin datos</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-crane" aria-hidden /> Bateas por conductor — Tonelaje
          </div>
          <table className="tbl">
            <thead><tr><th>Conductor</th><th style={{ textAlign:"right" }}>Viajes</th><th style={{ textAlign:"right" }}>Neto (t)</th></tr></thead>
            <tbody>
              {bByC.map(([c, v]) => (
                <tr key={c}>
                  <td style={{ fontSize: 12 }}>{c}</td>
                  <td style={{ textAlign: "right" }}>{v.count}</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{v.neto.toFixed(2)}</td>
                </tr>
              ))}
              {bateas.length > 0 && (
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  <td style={{ fontWeight: 500 }}>TOTAL</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{bateas.length}</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{bateas.reduce((s,r)=>s+Number(r.neto||0),0).toFixed(2)}</td>
                </tr>
              )}
              {bateas.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: 24 }}>Sin datos</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Ramplas por fecha</div>
          <table className="tbl">
            <thead><tr><th>Fecha</th><th style={{ textAlign:"right" }}>Vueltas</th></tr></thead>
            <tbody>
              {Object.entries(ramplas.reduce((m,r) => {
                const f = r.fecha || 0;
                if (!m[f]) m[f] = 0; m[f]++; return m;
              }, {})).sort().map(([f, c]) => (
                <tr key={f}><td>{f ? (() => { const d = new Date(1899,11,30); d.setDate(d.getDate()+Number(f)); return d.toLocaleDateString("es-CL"); })() : ""}</td><td style={{ textAlign: "right", fontWeight: 500 }}>{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 12 }}>Bateas por fecha</div>
          <table className="tbl">
            <thead><tr><th>Fecha</th><th style={{ textAlign:"right" }}>Viajes</th><th style={{ textAlign:"right" }}>Neto (t)</th></tr></thead>
            <tbody>
              {Object.entries(bateas.reduce((m,r) => {
                const f = r.fecha || 0;
                if (!m[f]) m[f] = { c:0, n:0 }; m[f].c++; m[f].n += Number(r.neto||0); return m;
              }, {})).sort().map(([f, v]) => (
                <tr key={f}>
                  <td>{f ? (() => { const d = new Date(1899,11,30); d.setDate(d.getDate()+Number(f)); return d.toLocaleDateString("es-CL"); })() : ""}</td>
                  <td style={{ textAlign: "right" }}>{v.c}</td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>{v.n.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
