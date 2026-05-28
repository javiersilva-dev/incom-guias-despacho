import { useState, useEffect, useCallback } from "react";

const SCRIPT_URL_KEY = "incom_script_url";
const CONFIG_KEY = "incom_config";
const PERIODO_KEY = "incom_periodo";

const DEFAULT_CONFIG = {
  peajeRampla: 41600, viatico: 50000, peajeBatea: 13800,
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
    "RKGC82","LRVV86","SSHY46","PPPW78","PJBP94"
  ],
  bateas: [
    "KYPV88","KYPJ52","HGKS68","PTXP75","KYPT47","KYPV87","KDKS78","KYRG45",
    "KYRH78","KYRG46","KDKS88","KDKS72","HGKS91","KDKS89","KYPJ54","KYPR55",
    "KDKS71","KDKS57","KYLG17"
  ],
  supervisores: ["CAMILA MUÑOZ","BORIS GANA","IGNACIO BUSTOS","GONZALO FERNANDEZ"],
  equiposRampla: ["MERCEDES BENZ","FREIGHTLINER","DAF","SCANIA"],
  origenRampla: "CASERONES", destinoRampla: "ANGAMOS", productoRampla: "CATODOS",
  origenBatea: "DOMO CASERONES", destinoBatea: "TOTORALILLO"
};

function getPeriodo() {
  const stored = localStorage.getItem(PERIODO_KEY);
  if (stored) return JSON.parse(stored);
  const hoy = new Date();
  const mes = hoy.getMonth(), anio = hoy.getFullYear();
  let desde, hasta;
  if (hoy.getDate() >= 26) {
    desde = new Date(anio, mes, 26); hasta = new Date(anio, mes + 1, 25);
  } else {
    desde = new Date(anio, mes - 1, 26); hasta = new Date(anio, mes, 25);
  }
  return { desde: desde.toISOString().slice(0,10), hasta: hasta.toISOString().slice(0,10) };
}

function toExcelDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return Math.floor((d - new Date(1899,11,30)) / 86400000);
}

function formatFecha(excelNum) {
  if (!excelNum) return "";
  const d = new Date(1899,11,30); d.setDate(d.getDate() + excelNum);
  return d.toLocaleDateString("es-CL");
}

function formatCLP(n) {
  return "$" + Number(n||0).toLocaleString("es-CL");
}

const TABS = [
  { id: "ingreso", label: "Ingreso", icon: "＋" },
  { id: "ramplas", label: "Ramplas", icon: "🚛" },
  { id: "bateas", label: "Bateas", icon: "⛏" },
  { id: "config", label: "Configuración", icon: "⚙" },
  { id: "informes", label: "Informes", icon: "📊" },
];

export default function App() {
  const [tab, setTab] = useState(0);
  const [config, setConfig] = useState(() => {
    try { return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem(CONFIG_KEY)||"{}") }; }
    catch { return DEFAULT_CONFIG; }
  });
  const [scriptUrl, setScriptUrl] = useState(() => localStorage.getItem(SCRIPT_URL_KEY)||"");
  const [periodo, setPeriodo] = useState(getPeriodo);
  const [ramplas, setRamplas] = useState([]);
  const [bateas, setBateas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [ingresoTipo, setIngresoTipo] = useState("batea");
  const [ingresoFecha, setIngresoFecha] = useState(() => {
    const ayer = new Date(); ayer.setDate(ayer.getDate()-1); return ayer.toISOString().slice(0,10);
  });
  const [ingresos, setIngresos] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const saveConfig = (c) => { setConfig(c); localStorage.setItem(CONFIG_KEY,JSON.stringify(c)); showToast("Configuración guardada"); };

  const callScript = useCallback(async (payload) => {
    if (!scriptUrl) { showToast("Falta URL del Apps Script","err"); return null; }
    const r = await fetch(scriptUrl, { method:"POST", body:JSON.stringify(payload) });
    return r.json();
  }, [scriptUrl]);

  const fetchData = useCallback(async () => {
    if (!scriptUrl) return;
    setLoading(true);
    try {
      const res = await callScript({ action:"getAll", periodo });
      if (res?.ramplas) setRamplas(res.ramplas);
      if (res?.bateas) setBateas(res.bateas);
    } catch { showToast("Error al cargar datos","err"); }
    setLoading(false);
  }, [scriptUrl, periodo, callScript]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const buildFilaRampla = () => ({
    fecha: toExcelDate(ingresoFecha), guia:"", tracto:"", rampla:"", conductor:"",
    producto: config.productoRampla, origen: config.origenRampla, destino: config.destinoRampla,
    bruto:"", tara:"", neto:"", paquetes:11,
    recepcionPuerto:"", llegadaTaller:"",
    viatico: config.viatico, peajes: config.peajeRampla,
    consumo:"", km:"", equipo:"", supervisor: config.supervisores[0]||"", obs:""
  });

  const buildFilaBatea = () => ({
    fecha: toExcelDate(ingresoFecha), guia:"", tracto:"", batea:"", conductor:"",
    bruto:"", tara:"", neto:"", ticket:"", netoPuerto:"",
    origen: config.origenBatea, destino: config.destinoBatea,
    peajes: config.peajeBatea, supervisor: config.supervisores[0]||"", revisadoPor:""
  });

  const prepararFilas = () => {
    const n = parseInt(cantidad);
    if (!n||n<1||n>60) { showToast("Ingrese entre 1 y 60 servicios","err"); return; }
    const builder = ingresoTipo==="rampla" ? buildFilaRampla : buildFilaBatea;
    setIngresos(Array.from({length:n}, builder));
  };

  const updateIngreso = (i,k,v) => setIngresos(prev => prev.map((row,idx) => idx===i ? {...row,[k]:v} : row));

  const guardarIngresos = async () => {
    if (!ingresos.length) return;
    setSaving(true);
    try {
      const res = await callScript({ action:"save", tipo:ingresoTipo, rows:ingresos });
      if (res?.ok) { showToast(`${ingresos.length} guías guardadas`); setIngresos([]); setCantidad(""); fetchData(); }
      else showToast(res?.msg||"Error al guardar","err");
    } catch { showToast("Error de conexión","err"); }
    setSaving(false);
  };

  const exportCSV = (tipo) => {
    const data = tipo==="rampla" ? ramplas : bateas;
    if (!data.length) { showToast("Sin datos","err"); return; }
    const headers = tipo==="rampla"
      ? ["N°","Fecha","Guía","Tracto","Rampla","Conductor","Producto","Origen","Destino","Bruto","Tara","Neto","Paquetes","Rec.Puerto","Lleg.Taller","Viático","Peajes","Consumo","KM","Rendimiento","Equipo","Total","Supervisor","Obs"]
      : ["N°","Fecha","N° Guía","Tracto","Batea","Conductor","Bruto","Tara","Neto","N° Ticket","Neto Puerto","Dif.Puerto","Origen","Destino","Peajes","Supervisor","Revisado"];
    const rows = data.map((r,i) => tipo==="rampla"
      ? [i+1,formatFecha(r.fecha),r.guia,r.tracto,r.rampla,r.conductor,r.producto,r.origen,r.destino,r.bruto,r.tara,r.neto,r.paquetes,formatFecha(r.recepcionPuerto),formatFecha(r.llegadaTaller),r.viatico,r.peajes,r.consumo,r.km,r.km&&r.consumo?(r.km/r.consumo).toFixed(2):"",r.equipo,Number(r.viatico||0)+Number(r.peajes||0),r.supervisor,r.obs]
      : [i+1,formatFecha(r.fecha),r.guia,r.tracto,r.batea,r.conductor,r.bruto,r.tara,r.neto,r.ticket,r.netoPuerto,((r.netoPuerto||0)-(r.neto||0)).toFixed(3),r.origen,r.destino,r.peajes,r.supervisor,r.revisadoPor]
    );
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`INCOM_${tipo.toUpperCase()}_${periodo.desde}_${periodo.hasta}.csv`; a.click();
  };

  const totalNeto = bateas.reduce((s,r)=>s+Number(r.neto||0),0);

  // ── ESTILOS GLOBALES ──
  const G = {
    bg: "#0f1117",
    bgCard: "#181c27",
    bgInput: "#0d1018",
    border: "#2a2f3e",
    borderHover: "#3d4560",
    accent: "#f97316",
    accentDim: "#7c3a0d",
    accentGlow: "rgba(249,115,22,0.15)",
    text: "#e8eaf0",
    textMuted: "#6b7280",
    textDim: "#9ca3af",
    success: "#10b981",
    danger: "#ef4444",
    blue: "#3b82f6",
    blueDim: "#1e3a5f",
  };

  return (
    <div style={{ minHeight:"100vh", background:G.bg, color:G.text, fontFamily:"'IBM Plex Mono', 'Courier New', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${G.bg}; }
        ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }
        .inp {
          width: 100%; background: ${G.bgInput}; border: 1px solid ${G.border};
          border-radius: 4px; color: ${G.text}; font-family: 'IBM Plex Mono', monospace;
          font-size: 12px; padding: 7px 10px; outline: none; transition: border 0.15s;
        }
        .inp:focus { border-color: ${G.accent}; box-shadow: 0 0 0 2px ${G.accentGlow}; }
        .inp::placeholder { color: ${G.textMuted}; }
        select.inp { cursor: pointer; }
        .btn-acc {
          background: ${G.accent}; color: #000; border: none; border-radius: 4px;
          padding: 8px 18px; font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.05em;
          transition: all 0.15s; text-transform: uppercase;
        }
        .btn-acc:hover { background: #fb923c; transform: translateY(-1px); box-shadow: 0 4px 12px ${G.accentGlow}; }
        .btn-acc:disabled { background: ${G.border}; color: ${G.textMuted}; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-ghost {
          background: transparent; border: 1px solid ${G.border}; border-radius: 4px;
          color: ${G.textDim}; padding: 7px 16px; font-size: 12px; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; transition: all 0.15s; text-transform: uppercase;
        }
        .btn-ghost:hover { border-color: ${G.accent}; color: ${G.accent}; }
        .card {
          background: ${G.bgCard}; border: 1px solid ${G.border}; border-radius: 6px;
          padding: 20px;
        }
        .card-accent { border-left: 3px solid ${G.accent}; }
        .lbl {
          font-size: 10px; color: ${G.textMuted}; letter-spacing: 0.1em;
          text-transform: uppercase; display: block; margin-bottom: 5px; font-weight: 500;
        }
        .tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
        .tbl th {
          background: #0d1018; padding: 8px 10px; text-align: left;
          color: ${G.textMuted}; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          border-bottom: 1px solid ${G.border}; font-weight: 500; white-space: nowrap;
          position: sticky; top: 0; z-index: 1;
        }
        .tbl td { padding: 7px 10px; border-bottom: 1px solid rgba(42,47,62,0.5); color: ${G.textDim}; }
        .tbl tr:hover td { background: rgba(249,115,22,0.04); color: ${G.text}; }
        .metric-card {
          background: ${G.bgCard}; border: 1px solid ${G.border}; border-radius: 6px;
          padding: 16px 20px; position: relative; overflow: hidden;
        }
        .metric-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, ${G.accent}, transparent);
        }
        .metric-val { font-size: 32px; font-weight: 600; color: ${G.text}; line-height: 1; margin: 6px 0 4px; }
        .metric-lbl { font-size: 10px; color: ${G.textMuted}; letter-spacing: 0.1em; text-transform: uppercase; }
        .metric-sub { font-size: 11px; color: ${G.textMuted}; }
        .tab-nav {
          display: flex; border-bottom: 1px solid ${G.border}; background: ${G.bgCard};
          padding: 0 24px; gap: 0; overflow-x: auto;
        }
        .tab-btn {
          background: none; border: none; color: ${G.textMuted}; cursor: pointer;
          padding: 14px 20px; font-size: 11px; font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 2px solid transparent;
          transition: all 0.15s; white-space: nowrap; display: flex; align-items: center; gap: 8px;
        }
        .tab-btn:hover { color: ${G.text}; }
        .tab-btn.active { color: ${G.accent}; border-bottom-color: ${G.accent}; }
        .tipo-btn {
          background: transparent; border: 1px solid ${G.border}; border-radius: 4px;
          color: ${G.textMuted}; padding: 6px 16px; font-size: 11px; cursor: pointer;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase;
          transition: all 0.15s;
        }
        .tipo-btn.active-r { background: rgba(59,130,246,0.1); border-color: ${G.blue}; color: ${G.blue}; }
        .tipo-btn.active-b { background: ${G.accentGlow}; border-color: ${G.accent}; color: ${G.accent}; }
        .fila-num {
          display: inline-flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; background: ${G.accentGlow}; border: 1px solid ${G.accentDim};
          border-radius: 3px; font-size: 10px; font-weight: 600; color: ${G.accent};
        }
        .badge-r { background: rgba(59,130,246,0.1); color: ${G.blue}; border: 1px solid #1e3a5f; border-radius: 3px; padding: 2px 8px; font-size: 10px; letter-spacing: 0.06em; }
        .badge-b { background: ${G.accentGlow}; color: ${G.accent}; border: 1px solid ${G.accentDim}; border-radius: 3px; padding: 2px 8px; font-size: 10px; letter-spacing: 0.06em; }
        .toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          padding: 10px 20px; border-radius: 4px; font-size: 11px; font-weight: 500;
          z-index: 999; letter-spacing: 0.06em; text-transform: uppercase;
          font-family: 'IBM Plex Mono', monospace; animation: slideup 0.2s ease;
          border: 1px solid;
        }
        .toast-ok { background: rgba(16,185,129,0.1); color: ${G.success}; border-color: #064e3b; }
        .toast-err { background: rgba(239,68,68,0.1); color: ${G.danger}; border-color: #7f1d1d; }
        @keyframes slideup { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .tbl-wrap { overflow-x: auto; max-height: 460px; overflow-y: auto; border-radius: 6px; border: 1px solid ${G.border}; }
        .divider { border: none; border-top: 1px solid ${G.border}; margin: 16px 0; }
        .tag {
          display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px;
          background: rgba(42,47,62,0.6); border: 1px solid ${G.border}; border-radius: 3px;
          font-size: 10px; color: ${G.textDim}; letter-spacing: 0.04em;
        }
        .tag button { background:none; border:none; cursor:pointer; color: ${G.textMuted}; font-size:12px; padding:0; line-height:1; }
        .tag button:hover { color: ${G.danger}; }
        .section-title {
          font-size: 11px; color: ${G.textMuted}; letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 14px; display: flex; align-items: center; gap: 10px;
        }
        .section-title::after { content:''; flex:1; height:1px; background: ${G.border}; }
        .neto-pos { color: ${G.success}; }
        .neto-neg { color: ${G.danger}; }
      `}</style>

      {/* HEADER */}
      <div style={{ background:G.bgCard, borderBottom:`1px solid ${G.border}` }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ padding:"16px 24px 0", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, background:G.accent, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📋</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, letterSpacing:"0.04em", color:G.text }}>CONTROL GUÍAS DE DESPACHO</div>
                <div style={{ fontSize:10, color:G.textMuted, letterSpacing:"0.08em", marginTop:2 }}>
                  INCOM · RAMPLAS &amp; BATEAS · {periodo.desde} → {periodo.hasta}
                </div>
              </div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
              {loading && <span style={{ fontSize:10, color:G.textMuted, letterSpacing:"0.06em" }}>⟳ CARGANDO...</span>}
              <button className="btn-ghost" onClick={fetchData} style={{ padding:"6px 12px" }}>⟳ SYNC</button>
            </div>
          </div>
          <div className="tab-nav" style={{ paddingLeft:0, marginLeft:24 }}>
            {TABS.map((t,i) => (
              <button key={i} className={`tab-btn${tab===i?" active":""}`} onClick={()=>setTab(i)}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>

        {/* ── TAB 0: INGRESO ── */}
        {tab===0 && (
          <div style={{ display:"grid", gap:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {/* Panel ingreso */}
              <div className="card card-accent">
                <div className="section-title">Nuevo ingreso de guías</div>
                <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                  {[["rampla","🚛 Rampla","active-r"],["batea","⛏ Batea","active-b"]].map(([k,label,cls])=>(
                    <button key={k} className={`tipo-btn${ingresoTipo===k?" "+cls:""}`} onClick={()=>{setIngresoTipo(k);setIngresos([]);setCantidad("");}}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  <div>
                    <span className="lbl">Fecha del servicio</span>
                    <input type="date" className="inp" value={ingresoFecha} onChange={e=>setIngresoFecha(e.target.value)} />
                  </div>
                  <div>
                    <span className="lbl">Cantidad de servicios</span>
                    <input type="number" className="inp" min={1} max={60} placeholder="ej: 14" value={cantidad}
                      onChange={e=>setCantidad(e.target.value)} onKeyDown={e=>e.key==="Enter"&&prepararFilas()} />
                  </div>
                </div>
                <button className="btn-acc" onClick={prepararFilas} style={{ width:"100%" }}>
                  ▶ Preparar {cantidad||"N"} filas de {ingresoTipo}
                </button>
              </div>
              {/* Métricas */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  ["VUELTAS PERÍODO", ramplas.length, "", G.blue],
                  ["TONELAJE PERÍODO", totalNeto.toFixed(1), " t", G.accent],
                  ["GUÍAS RAMPLA", ramplas.length, "", G.textDim],
                  ["GUÍAS BATEA", bateas.length, "", G.textDim],
                ].map(([lbl,val,suf,col])=>(
                  <div key={lbl} className="metric-card">
                    <div className="metric-lbl">{lbl}</div>
                    <div className="metric-val" style={{ color:col }}>{val}{suf}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filas de ingreso */}
            {ingresos.length>0 && (
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span className={ingresoTipo==="rampla"?"badge-r":"badge-b"}>{ingresoTipo.toUpperCase()}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{ingresos.length} guías</span>
                    <span style={{ fontSize:11, color:G.textMuted }}>— {new Date(ingresoFecha+"T12:00:00").toLocaleDateString("es-CL")}</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="btn-ghost" onClick={()=>{setIngresos([]);setCantidad("");}}>✕ Cancelar</button>
                    <button className="btn-acc" onClick={guardarIngresos} disabled={saving}>
                      {saving?"⟳ Guardando...":"💾 Guardar "+ingresos.length+" guías"}
                    </button>
                  </div>
                </div>

                {ingresos.map((fila,i)=>(
                  <div key={i} style={{ marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${G.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span className="fila-num">#{i+1}</span>
                      {fila.conductor && <span style={{ fontSize:11, color:G.accent }}>{fila.conductor}</span>}
                    </div>
                    {ingresoTipo==="rampla" ? (
                      <div className="grid-3">
                        <div><span className="lbl">N° Guía *</span><input className="inp" placeholder="184734" value={fila.guia} onChange={e=>updateIngreso(i,"guia",e.target.value)} /></div>
                        <div><span className="lbl">Tracto</span>
                          <select className="inp" value={fila.tracto} onChange={e=>updateIngreso(i,"tracto",e.target.value)}>
                            <option value="">— seleccionar</option>{config.tractosRampla.map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div><span className="lbl">Rampla</span>
                          <select className="inp" value={fila.rampla} onChange={e=>updateIngreso(i,"rampla",e.target.value)}>
                            <option value="">— seleccionar</option>{config.ramplas.map(r=><option key={r}>{r}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn:"span 2" }}><span className="lbl">Conductor</span>
                          <select className="inp" value={fila.conductor} onChange={e=>updateIngreso(i,"conductor",e.target.value)}>
                            <option value="">— seleccionar</option>{config.conductores.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><span className="lbl">Paquetes</span><input className="inp" type="number" value={fila.paquetes} onChange={e=>updateIngreso(i,"paquetes",e.target.value)} /></div>
                        <div><span className="lbl">Bruto (kg)</span><input className="inp" type="number" placeholder="42830" value={fila.bruto} onChange={e=>{const b=e.target.value;const neto=b&&fila.tara?b-fila.tara:"";updateIngreso(i,"bruto",b);if(neto!=="")updateIngreso(i,"neto",neto);}} /></div>
                        <div><span className="lbl">Tara (kg)</span><input className="inp" type="number" placeholder="16424" value={fila.tara} onChange={e=>{const t=e.target.value;const neto=fila.bruto&&t?fila.bruto-t:"";updateIngreso(i,"tara",t);if(neto!=="")updateIngreso(i,"neto",neto);}} /></div>
                        <div><span className="lbl">Neto (kg)</span><input className="inp" value={fila.neto} readOnly style={{ opacity:0.6 }} /></div>
                        <div><span className="lbl">Rec. Puerto</span><input className="inp" type="date" onChange={e=>updateIngreso(i,"recepcionPuerto",toExcelDate(e.target.value))} /></div>
                        <div><span className="lbl">Lleg. Taller</span><input className="inp" type="date" onChange={e=>updateIngreso(i,"llegadaTaller",toExcelDate(e.target.value))} /></div>
                        <div><span className="lbl">Viático $</span><input className="inp" type="number" value={fila.viatico} onChange={e=>updateIngreso(i,"viatico",e.target.value)} /></div>
                        <div><span className="lbl">Peajes $</span><input className="inp" type="number" value={fila.peajes} onChange={e=>updateIngreso(i,"peajes",e.target.value)} /></div>
                        <div><span className="lbl">Consumo (L)</span><input className="inp" type="number" value={fila.consumo} onChange={e=>updateIngreso(i,"consumo",e.target.value)} /></div>
                        <div><span className="lbl">KM</span><input className="inp" type="number" value={fila.km} onChange={e=>updateIngreso(i,"km",e.target.value)} /></div>
                        <div><span className="lbl">Equipo</span>
                          <select className="inp" value={fila.equipo} onChange={e=>updateIngreso(i,"equipo",e.target.value)}>
                            <option value="">—</option>{config.equiposRampla.map(eq=><option key={eq}>{eq}</option>)}
                          </select>
                        </div>
                        <div><span className="lbl">Supervisor</span>
                          <select className="inp" value={fila.supervisor} onChange={e=>updateIngreso(i,"supervisor",e.target.value)}>
                            {config.supervisores.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn:"span 2" }}><span className="lbl">Observaciones</span><input className="inp" value={fila.obs} onChange={e=>updateIngreso(i,"obs",e.target.value)} /></div>
                        <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                          <div style={{ background:G.accentGlow, border:`1px solid ${G.accentDim}`, borderRadius:4, padding:"8px 12px" }}>
                            <div style={{ fontSize:9, color:G.textMuted, letterSpacing:"0.08em" }}>TOTAL</div>
                            <div style={{ fontSize:16, fontWeight:600, color:G.accent }}>{formatCLP(Number(fila.viatico||0)+Number(fila.peajes||0))}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid-3">
                        <div><span className="lbl">N° Guía *</span><input className="inp" placeholder="185994" value={fila.guia} onChange={e=>updateIngreso(i,"guia",e.target.value)} /></div>
                        <div><span className="lbl">PPU Tracto</span>
                          <select className="inp" value={fila.tracto} onChange={e=>updateIngreso(i,"tracto",e.target.value)}>
                            <option value="">— seleccionar</option>{config.tractosBatea.map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div><span className="lbl">PPU Batea</span>
                          <select className="inp" value={fila.batea} onChange={e=>updateIngreso(i,"batea",e.target.value)}>
                            <option value="">— seleccionar</option>{config.bateas.map(b=><option key={b}>{b}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn:"span 2" }}><span className="lbl">Conductor</span>
                          <select className="inp" value={fila.conductor} onChange={e=>updateIngreso(i,"conductor",e.target.value)}>
                            <option value="">— seleccionar</option>{config.conductores.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div><span className="lbl">N° Ticket</span><input className="inp" value={fila.ticket} onChange={e=>updateIngreso(i,"ticket",e.target.value)} /></div>
                        <div><span className="lbl">Bruto (t)</span><input className="inp" type="number" step="0.01" placeholder="44.67" value={fila.bruto} onChange={e=>{const b=e.target.value;const neto=b&&fila.tara?(parseFloat(b)-parseFloat(fila.tara)).toFixed(2):"";updateIngreso(i,"bruto",b);if(neto!=="")updateIngreso(i,"neto",neto);}} /></div>
                        <div><span className="lbl">Tara (t)</span><input className="inp" type="number" step="0.01" placeholder="15.83" value={fila.tara} onChange={e=>{const t=e.target.value;const neto=fila.bruto&&t?(parseFloat(fila.bruto)-parseFloat(t)).toFixed(2):"";updateIngreso(i,"tara",t);if(neto!=="")updateIngreso(i,"neto",neto);}} /></div>
                        <div><span className="lbl">Neto (t)</span><input className="inp" value={fila.neto} readOnly style={{ opacity:0.6 }} /></div>
                        <div><span className="lbl">Neto Puerto (t)</span><input className="inp" type="number" step="0.01" value={fila.netoPuerto} onChange={e=>updateIngreso(i,"netoPuerto",e.target.value)} /></div>
                        <div><span className="lbl">Peajes $</span><input className="inp" type="number" value={fila.peajes} onChange={e=>updateIngreso(i,"peajes",e.target.value)} /></div>
                        <div><span className="lbl">Supervisor</span>
                          <select className="inp" value={fila.supervisor} onChange={e=>updateIngreso(i,"supervisor",e.target.value)}>
                            {config.supervisores.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div><span className="lbl">Revisado por</span>
                          <select className="inp" value={fila.revisadoPor} onChange={e=>updateIngreso(i,"revisadoPor",e.target.value)}>
                            <option value="">—</option>{config.supervisores.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {ingresos.length>3 && (
                  <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:8 }}>
                    <button className="btn-acc" onClick={guardarIngresos} disabled={saving}>
                      {saving?"⟳ Guardando...":"💾 Guardar "+ingresos.length+" guías"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1: RAMPLAS ── */}
        {tab===1 && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:G.text }}>🚛 RAMPLAS — {ramplas.length} guías registradas</div>
              <button className="btn-ghost" onClick={()=>exportCSV("rampla")}>↓ Exportar CSV</button>
            </div>
            <div className="grid-4" style={{ marginBottom:20 }}>
              {[
                ["VUELTAS",ramplas.length,"",G.blue],
                ["VIÁTICOS",formatCLP(ramplas.reduce((s,r)=>s+Number(r.viatico||0),0)),"",G.accent],
                ["PEAJES",formatCLP(ramplas.reduce((s,r)=>s+Number(r.peajes||0),0)),"",G.textDim],
                ["TOTAL",formatCLP(ramplas.reduce((s,r)=>s+Number(r.viatico||0)+Number(r.peajes||0),0)),"",G.accent],
              ].map(([lbl,val,,col])=>(
                <div key={lbl} className="metric-card">
                  <div className="metric-lbl">{lbl}</div>
                  <div style={{ fontSize:20, fontWeight:600, color:col, margin:"6px 0 0" }}>{val}</div>
                </div>
              ))}
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  {["#","FECHA","GUÍA","TRACTO","RAMPLA","CONDUCTOR","PAQ","BRUTO","TARA","NETO","VIÁTICO","PEAJES","TOTAL","KM","EQUIPO","SUPERVISOR"].map(h=><th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {ramplas.map((r,i)=>(
                    <tr key={i}>
                      <td style={{ color:G.textMuted }}>{i+1}</td>
                      <td>{formatFecha(r.fecha)}</td>
                      <td style={{ color:G.accent, fontWeight:600 }}>{r.guia}</td>
                      <td>{r.tracto}</td><td>{r.rampla}</td>
                      <td style={{ color:G.text }}>{r.conductor}</td>
                      <td style={{ textAlign:"center" }}>{r.paquetes}</td>
                      <td style={{ textAlign:"right" }}>{Number(r.bruto||0).toLocaleString("es-CL")}</td>
                      <td style={{ textAlign:"right" }}>{Number(r.tara||0).toLocaleString("es-CL")}</td>
                      <td style={{ textAlign:"right", color:G.text, fontWeight:500 }}>{Number(r.neto||0).toLocaleString("es-CL")}</td>
                      <td style={{ textAlign:"right" }}>{formatCLP(r.viatico)}</td>
                      <td style={{ textAlign:"right" }}>{formatCLP(r.peajes)}</td>
                      <td style={{ textAlign:"right", color:G.accent, fontWeight:600 }}>{formatCLP(Number(r.viatico||0)+Number(r.peajes||0))}</td>
                      <td style={{ textAlign:"right" }}>{r.km}</td>
                      <td>{r.equipo}</td>
                      <td style={{ color:G.textMuted }}>{r.supervisor}</td>
                    </tr>
                  ))}
                  {!ramplas.length && <tr><td colSpan={16} style={{ textAlign:"center", padding:40, color:G.textMuted }}>— Sin guías en el período —</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: BATEAS ── */}
        {tab===2 && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:G.text }}>⛏ BATEAS — {bateas.length} guías registradas</div>
              <button className="btn-ghost" onClick={()=>exportCSV("batea")}>↓ Exportar CSV</button>
            </div>
            <div className="grid-4" style={{ marginBottom:20 }}>
              {[
                ["VIAJES",bateas.length,G.blue],
                ["TONELAJE NETO",totalNeto.toFixed(2)+" t",G.accent],
                ["PROM / VIAJE",(bateas.length?(totalNeto/bateas.length).toFixed(2):0)+" t",G.textDim],
                ["PEAJES",formatCLP(bateas.reduce((s,r)=>s+Number(r.peajes||0),0)),G.textDim],
              ].map(([lbl,val,col])=>(
                <div key={lbl} className="metric-card">
                  <div className="metric-lbl">{lbl}</div>
                  <div style={{ fontSize:20, fontWeight:600, color:col, margin:"6px 0 0" }}>{val}</div>
                </div>
              ))}
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr>
                  {["#","FECHA","GUÍA","TRACTO","BATEA","CONDUCTOR","BRUTO","TARA","NETO","TICKET","NETO PTO","DIF.PTO","PEAJES","SUPERVISOR"].map(h=><th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {bateas.map((r,i)=>{
                    const dif=((r.netoPuerto||0)-(r.neto||0)).toFixed(3);
                    return (
                      <tr key={i}>
                        <td style={{ color:G.textMuted }}>{i+1}</td>
                        <td>{formatFecha(r.fecha)}</td>
                        <td style={{ color:G.accent, fontWeight:600 }}>{r.guia}</td>
                        <td>{r.tracto}</td><td>{r.batea}</td>
                        <td style={{ color:G.text }}>{r.conductor}</td>
                        <td style={{ textAlign:"right" }}>{Number(r.bruto||0).toFixed(2)}</td>
                        <td style={{ textAlign:"right" }}>{Number(r.tara||0).toFixed(2)}</td>
                        <td style={{ textAlign:"right", color:G.text, fontWeight:500 }}>{Number(r.neto||0).toFixed(2)}</td>
                        <td>{r.ticket}</td>
                        <td style={{ textAlign:"right" }}>{Number(r.netoPuerto||0).toFixed(2)}</td>
                        <td style={{ textAlign:"right" }} className={parseFloat(dif)<-0.1?"neto-neg":parseFloat(dif)>0.1?"neto-pos":""}>{dif}</td>
                        <td style={{ textAlign:"right" }}>{formatCLP(r.peajes)}</td>
                        <td style={{ color:G.textMuted }}>{r.supervisor}</td>
                      </tr>
                    );
                  })}
                  {!bateas.length && <tr><td colSpan={14} style={{ textAlign:"center", padding:40, color:G.textMuted }}>— Sin guías en el período —</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: CONFIGURACIÓN ── */}
        {tab===3 && <ConfigTab config={config} saveConfig={saveConfig} scriptUrl={scriptUrl}
          setScriptUrl={v=>{setScriptUrl(v);localStorage.setItem(SCRIPT_URL_KEY,v);}}
          periodo={periodo} setPeriodo={p=>{setPeriodo(p);localStorage.setItem(PERIODO_KEY,JSON.stringify(p));}}
          G={G} />}

        {/* ── TAB 4: INFORMES ── */}
        {tab===4 && <InformesTab ramplas={ramplas} bateas={bateas} periodo={periodo} formatCLP={formatCLP} exportCSV={exportCSV} G={G} totalNeto={totalNeto} />}

      </div>

      {toast && <div className={`toast toast-${toast.type==="err"?"err":"ok"}`}>{toast.msg}</div>}
    </div>
  );
}

function ConfigTab({ config, saveConfig, scriptUrl, setScriptUrl, periodo, setPeriodo, G }) {
  const [local, setLocal] = useState({...config});
  const [newVals, setNewVals] = useState({});
  const fields = [
    ["conductores","Conductores","conductor"],
    ["tractosRampla","Tractos Rampla","PPU"],
    ["ramplas","Ramplas (PPU)","PPU"],
    ["tractosBatea","Tractos Batea","PPU"],
    ["bateas","Bateas (PPU)","PPU"],
    ["supervisores","Supervisores","nombre"],
    ["equiposRampla","Equipos Rampla","tipo"],
  ];
  const add = (key) => {
    const v = (newVals[key]||"").trim().toUpperCase();
    if (!v) return;
    if (!local[key].includes(v)) setLocal(p=>({...p,[key]:[...p[key],v]}));
    setNewVals(p=>({...p,[key]:""}));
  };
  const remove = (key,val) => setLocal(p=>({...p,[key]:p[key].filter(x=>x!==val)}));

  return (
    <div style={{ display:"grid", gap:16 }}>
      <div className="card card-accent">
        <div className="section-title">Conexión Google Sheets</div>
        <div>
          <span className="lbl">URL del Apps Script (Web App)</span>
          <input className="inp" placeholder="https://script.google.com/macros/s/..." value={scriptUrl} onChange={e=>setScriptUrl(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="section-title">Período activo</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div><span className="lbl">Desde (día 26)</span><input type="date" className="inp" value={periodo.desde} onChange={e=>setPeriodo({...periodo,desde:e.target.value})} /></div>
          <div><span className="lbl">Hasta (día 25)</span><input type="date" className="inp" value={periodo.hasta} onChange={e=>setPeriodo({...periodo,hasta:e.target.value})} /></div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Valores por defecto</div>
        <div className="grid-3">
          {[["viatico","Viático Rampla $"],["peajeRampla","Peaje Rampla $"],["peajeBatea","Peaje Batea $"],
            ["origenRampla","Origen Rampla"],["destinoRampla","Destino Rampla"],["productoRampla","Producto Rampla"],
            ["origenBatea","Origen Batea"],["destinoBatea","Destino Batea"]].map(([k,lbl])=>(
            <div key={k}>
              <span className="lbl">{lbl}</span>
              <input className="inp" value={local[k]} onChange={e=>setLocal(p=>({...p,[k]:e.target.value}))} />
            </div>
          ))}
        </div>
      </div>

      {fields.map(([key,title,ph])=>(
        <div key={key} className="card">
          <div className="section-title">{title}</div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <input className="inp" placeholder={`Agregar ${ph}...`} value={newVals[key]||""} style={{ flex:1 }}
              onChange={e=>setNewVals(p=>({...p,[key]:e.target.value.toUpperCase()}))}
              onKeyDown={e=>e.key==="Enter"&&add(key)} />
            <button className="btn-acc" onClick={()=>add(key)} style={{ padding:"7px 14px" }}>＋</button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {local[key].map(item=>(
              <span key={item} className="tag">
                {item}
                <button onClick={()=>remove(key,item)}>×</button>
              </span>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button className="btn-acc" onClick={()=>saveConfig(local)}>💾 Guardar configuración</button>
      </div>
    </div>
  );
}

function InformesTab({ ramplas, bateas, periodo, formatCLP, exportCSV, G, totalNeto }) {
  const byC = (arr,netoKey) => {
    const m={};
    arr.forEach(r=>{
      const k=r.conductor||"Sin asignar";
      if(!m[k])m[k]={count:0,neto:0,total:0};
      m[k].count++;
      m[k].neto+=Number(r[netoKey]||0);
      m[k].total+=Number(r.viatico||0)+Number(r.peajes||0);
    });
    return Object.entries(m).sort((a,b)=>b[1].count-a[1].count);
  };
  const rByC = byC(ramplas,"neto");
  const bByC = byC(bateas,"neto");
  const maxR = rByC[0]?.[1]?.count||1;
  const maxB = bByC[0]?.[1]?.neto||1;

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:20, justifyContent:"flex-end" }}>
        <button className="btn-ghost" onClick={()=>exportCSV("rampla")}>↓ CSV Ramplas</button>
        <button className="btn-ghost" onClick={()=>exportCSV("batea")}>↓ CSV Bateas</button>
        <button className="btn-ghost" onClick={()=>window.print()}>🖨 Imprimir / PDF</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Ramplas por conductor */}
        <div className="card">
          <div className="section-title">🚛 Ramplas por conductor</div>
          {rByC.map(([c,v])=>(
            <div key={c} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:11, color:G.textDim }}>{c}</span>
                <span style={{ fontSize:11, fontWeight:600, color:G.blue }}>{v.count} vueltas</span>
              </div>
              <div style={{ height:4, background:G.border, borderRadius:2 }}>
                <div style={{ height:4, background:G.blue, borderRadius:2, width:`${(v.count/maxR)*100}%`, transition:"width 0.3s" }} />
              </div>
              <div style={{ fontSize:10, color:G.textMuted, marginTop:2 }}>{formatCLP(v.total)}</div>
            </div>
          ))}
          {!ramplas.length && <div style={{ textAlign:"center", color:G.textMuted, padding:20, fontSize:11 }}>Sin datos</div>}
          {ramplas.length>0 && (
            <div style={{ borderTop:`1px solid ${G.border}`, paddingTop:10, marginTop:10, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:600, color:G.text }}>TOTAL</span>
              <span style={{ fontSize:11, fontWeight:600, color:G.blue }}>{ramplas.length} vueltas</span>
            </div>
          )}
        </div>

        {/* Bateas por conductor */}
        <div className="card">
          <div className="section-title">⛏ Bateas por conductor</div>
          {bByC.map(([c,v])=>(
            <div key={c} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:11, color:G.textDim }}>{c}</span>
                <span style={{ fontSize:11, fontWeight:600, color:G.accent }}>{v.neto.toFixed(2)} t</span>
              </div>
              <div style={{ height:4, background:G.border, borderRadius:2 }}>
                <div style={{ height:4, background:G.accent, borderRadius:2, width:`${(v.neto/maxB)*100}%`, transition:"width 0.3s" }} />
              </div>
              <div style={{ fontSize:10, color:G.textMuted, marginTop:2 }}>{v.count} viajes</div>
            </div>
          ))}
          {!bateas.length && <div style={{ textAlign:"center", color:G.textMuted, padding:20, fontSize:11 }}>Sin datos</div>}
          {bateas.length>0 && (
            <div style={{ borderTop:`1px solid ${G.border}`, paddingTop:10, marginTop:10, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:600, color:G.text }}>TOTAL</span>
              <span style={{ fontSize:11, fontWeight:600, color:G.accent }}>{totalNeto.toFixed(2)} t</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen por fecha */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[["ramplas","🚛 Ramplas por fecha",ramplas,G.blue,false],["bateas","⛏ Bateas por fecha",bateas,G.accent,true]].map(([key,title,data,col,showNeto])=>{
          const byDate = Object.entries(data.reduce((m,r)=>{
            const f=r.fecha||0;
            if(!m[f])m[f]={c:0,n:0};m[f].c++;m[f].n+=Number(r.neto||0);return m;
          },{})).sort();
          return (
            <div key={key} className="card">
              <div className="section-title">{title}</div>
              <table className="tbl">
                <thead><tr>
                  <th>Fecha</th><th style={{ textAlign:"right" }}>Servicios</th>
                  {showNeto&&<th style={{ textAlign:"right" }}>Neto (t)</th>}
                </tr></thead>
                <tbody>
                  {byDate.map(([f,v])=>{
                    const d=new Date(1899,11,30);d.setDate(d.getDate()+Number(f));
                    return (
                      <tr key={f}>
                        <td>{d.toLocaleDateString("es-CL")}</td>
                        <td style={{ textAlign:"right", color:col, fontWeight:500 }}>{v.c}</td>
                        {showNeto&&<td style={{ textAlign:"right", color:G.accent, fontWeight:500 }}>{v.n.toFixed(2)}</td>}
                      </tr>
                    );
                  })}
                  {!byDate.length&&<tr><td colSpan={3} style={{ textAlign:"center", color:G.textMuted, padding:20 }}>Sin datos</td></tr>}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
