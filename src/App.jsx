import { useState, useEffect, useCallback, useRef } from "react";

const SCRIPT_URL_KEY = "incom_script_url";
const CONFIG_KEY = "incom_config";
const PERIODO_KEY = "incom_periodo";
const PLANTILLA_KEY = "incom_plantilla";

// ── 19 registros del concentrado 26-05 al 25-06 (precargados) ──
const DATOS_INICIALES_BATEAS = [
  {fecha:46168,guia:"185994",tracto:"RVFK47",batea:"KDKS72",conductor:"JOSE GONZALEZ GUEVARA",bruto:44.67,tara:15.83,neto:28.84,diferencia:"",dif:0,ticket:"263516",netoPuerto:28.63,difPuerto:-0.21,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"185995",tracto:"RVFK46",batea:"KDKS78",conductor:"ABELINO CARRIZO VALLEJO",bruto:44.64,tara:15.98,neto:28.66,diferencia:"",dif:0,ticket:"263517",netoPuerto:28.63,difPuerto:-0.03,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"185996",tracto:"PJBP94",batea:"KYPJ54",conductor:"RENE PAEZ REBOLLEDO",bruto:44.65,tara:15.55,neto:29.10,diferencia:"",dif:0,ticket:"263521",netoPuerto:28.99,difPuerto:-0.11,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"185997",tracto:"PJFD81",batea:"KYLG17",conductor:"ENRIQUE ROJAS GARCIA",bruto:44.71,tara:14.74,neto:29.97,diferencia:"",dif:0,ticket:"263522",netoPuerto:29.93,difPuerto:-0.04,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"185998",tracto:"RTRJ40",batea:"PTXP75",conductor:"CRISTIAN LANAS DIAZ",bruto:44.68,tara:16.37,neto:28.31,diferencia:"",dif:0,ticket:"263524",netoPuerto:28.33,difPuerto:0.02,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186000",tracto:"SYPL10",batea:"KYRH78",conductor:"DAMM CRUZ GARRIDO",bruto:44.69,tara:16.02,neto:28.67,diferencia:"",dif:0,ticket:"263525",netoPuerto:28.53,difPuerto:-0.14,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186001",tracto:"RVFK45",batea:"KDKS88",conductor:"RICARDO CONTRERAS PAEZ",bruto:44.69,tara:15.67,neto:29.02,diferencia:"",dif:0,ticket:"263533",netoPuerto:28.97,difPuerto:-0.05,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186002",tracto:"SHLL37",batea:"KYPR55",conductor:"CRISTIAN OLIVARES ROJAS",bruto:44.70,tara:15.70,neto:29.00,diferencia:"",dif:0,ticket:"263534",netoPuerto:28.92,difPuerto:-0.08,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186006",tracto:"PJFD76",batea:"KYPT47",conductor:"ROBERTO FAJARDO SALINAS",bruto:44.67,tara:15.59,neto:29.08,diferencia:"",dif:0,ticket:"263544",netoPuerto:29.04,difPuerto:-0.04,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186007",tracto:"RKGC82",batea:"HGKS68",conductor:"JUAN MUÑOZ TIMBLE",bruto:44.66,tara:16.12,neto:28.54,diferencia:"",dif:0,ticket:"263545",netoPuerto:28.44,difPuerto:-0.10,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186008",tracto:"SSHY46",batea:"KYPV88",conductor:"RICARDO RAMIREZ MIRANDA",bruto:44.66,tara:15.84,neto:28.82,diferencia:"",dif:0,ticket:"263549",netoPuerto:28.78,difPuerto:-0.04,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186009",tracto:"RVXB98",batea:"KDKS89",conductor:"FELIPE CORTES ZEPEDA",bruto:44.73,tara:15.71,neto:29.02,diferencia:"",dif:0,ticket:"263555",netoPuerto:28.95,difPuerto:-0.07,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186010",tracto:"RVXC10",batea:"KYPV87",conductor:"JAVIER CORTES BRUNA",bruto:44.67,tara:15.74,neto:28.93,diferencia:"",dif:0,ticket:"263560",netoPuerto:28.89,difPuerto:-0.04,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186011",tracto:"PJBP95",batea:"KDKS57",conductor:"EDUARDO LEDESMA LEDESMA",bruto:44.70,tara:15.58,neto:29.12,diferencia:"",dif:0,ticket:"263559",netoPuerto:29.11,difPuerto:-0.01,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186012",tracto:"LRVV85",batea:"HGKS91",conductor:"MARCO QUIROGA ESQUIVEL",bruto:44.69,tara:16.37,neto:28.32,diferencia:"",dif:0,ticket:"263562",netoPuerto:28.28,difPuerto:-0.04,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186013",tracto:"PJFD83",batea:"KDKS71",conductor:"BRAYAN GUEVARA ALBORNOZ",bruto:44.68,tara:15.70,neto:28.98,diferencia:"",dif:0,ticket:"263556",netoPuerto:28.98,difPuerto:0.00,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:6900,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186014",tracto:"PPPW78",batea:"KYRG45",conductor:"JUAN VALENZUELA CASTRO",bruto:44.66,tara:15.82,neto:28.84,diferencia:"",dif:0,ticket:"263557",netoPuerto:28.84,difPuerto:0.00,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186015",tracto:"PJFD98",batea:"KYRG46",conductor:"DANIEL VEGA PEREIRA",bruto:44.70,tara:15.75,neto:28.95,diferencia:"",dif:0,ticket:"263568",netoPuerto:28.92,difPuerto:-0.03,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
  {fecha:46168,guia:"186016",tracto:"RVFF13",batea:"KYPJ52",conductor:"LUIS MUÑOZ ALMONACID",bruto:44.65,tara:16.18,neto:28.47,diferencia:"",dif:0,ticket:"263569",netoPuerto:28.42,difPuerto:-0.05,origen:"DOMO CASERONES",destino:"TOTORALILLO",peajes:13800,supervisor:"BORIS GANA",revisadoPor:""},
];

const DEFAULT_CONFIG = {
  peajeRampla:41600, viatico:50000, peajeBatea:13800,
  destinosRampla:[
    {nombre:"ANGAMOS",     peaje:41600},
    {nombre:"TOTORALILLO", peaje:41600},
  ],
  destinosBatea:[
    {nombre:"TOTORALILLO", peaje:13800},
    {nombre:"ANGAMOS",     peaje:13800},
  ],
  conductoresBatea:["BRAYAN GUEVARA ALBORNOZ","DANIEL VEGA PEREIRA","ROBERTO FAJARDO SALINAS","CRISTIAN LANAS DIAZ","CRISTIAN OLIVARES ROJAS","LUIS MADARIAGA ALCOTA","JUAN VALENZUELA CASTRO","UBER ZAMORA MONARDES","RENE PAEZ REBOLLEDO","JOSE GONZALEZ GUEVARA","ABELINO CARRIZO VALLEJO","FRANCISCO HANSHING VEGA","RICARDO CONTRERAS PAEZ","JAVIER SANCHEZ SAAVEDRA","LUIS MUÑOZ ALMONACID","FELIPE CORTES ZEPEDA","JAVIER CORTES BRUNA","RICARDO RAMIREZ MIRANDA","EDUARDO LEDESMA LEDESMA","MARCO QUIROGA ESQUIVEL","ORLANDO BUGUEÑO RIVERA","ENRIQUE ROJAS GARCIA","BORIS ROJAS FLORES","PEDRO ARRIAGADA TAPIA","PEDRO SAEZ GONZALEZ","ALBERTO ASTORGA MONTAÑA","DAMM CRUZ GARRIDO","ROLANDO GUZMAN ACUÑA","JUAN MUÑOZ TIMBLE","WILFRIDO OLIVARES LEON","MARCO RIQUELME INOSTROZA","JOSE URIZAR ESCOBAR"],
  conductoresRampla:["BRAYAN GUEVARA ALBORNOZ","DANIEL VEGA PEREIRA","ROBERTO FAJARDO SALINAS","CRISTIAN LANAS DIAZ","CRISTIAN OLIVARES ROJAS","LUIS MADARIAGA ALCOTA","JUAN VALENZUELA CASTRO","UBER ZAMORA MONARDES","RENE PAEZ REBOLLEDO","JOSE GONZALEZ GUEVARA","ABELINO CARRIZO VALLEJO","FRANCISCO HANSHING VEGA","RICARDO CONTRERAS PAEZ","JAVIER SANCHEZ SAAVEDRA","LUIS MUÑOZ ALMONACID","FELIPE CORTES ZEPEDA","JAVIER CORTES BRUNA","RICARDO RAMIREZ MIRANDA","EDUARDO LEDESMA LEDESMA","MARCO QUIROGA ESQUIVEL","ORLANDO BUGUEÑO RIVERA","ENRIQUE ROJAS GARCIA","BORIS ROJAS FLORES","PEDRO ARRIAGADA TAPIA","PEDRO SAEZ GONZALEZ","ALBERTO ASTORGA MONTAÑA","DAMM CRUZ GARRIDO","ROLANDO GUZMAN ACUÑA","JUAN MUÑOZ TIMBLE","WILFRIDO OLIVARES LEON","MARCO RIQUELME INOSTROZA","JOSE URIZAR ESCOBAR"],
  tractosRampla:["SPSH74","SSHY46","RJBV35","RVFF14","RJBV34","RVFF13","RTRJ40"],
  ramplas:["PWXW81","PWVW82","PWVW57","PWVW58","PWVW56","PWVX89","PWVX90"],
  tractosBatea:["PJFD83","LXXL81","RVFK45","RTRJ40","PJFD76","RVXC10","PJFD98","PJBP95","RVXB98","RVFK46","PPPW79","RVFK47","LRVV85","SYPL10","PJFD81","SHLL37","RKGC82","LRVV86","SSHY46","PPPW78","PJBP94","RVFF13","RVXB98","RVXC10"],
  bateas:["KYPV88","KYPJ52","HGKS68","PTXP75","KYPT47","KYPV87","KDKS78","KYRG45","KYRH78","KYRG46","KDKS88","KDKS72","HGKS91","KDKS89","KYPJ54","KYPR55","KDKS71","KDKS57","KYLG17"],
  supervisores:["CAMILA MUÑOZ","BORIS GANA","IGNACIO BUSTOS","GONZALO FERNANDEZ"],
  equiposRampla:["MERCEDES BENZ","FREIGHTLINER","DAF","SCANIA"],
  origenRampla:"CASERONES",destinoRampla:"ANGAMOS",productoRampla:"CATODOS",
  origenBatea:"DOMO CASERONES",destinoBatea:"TOTORALILLO"
};

function getPeriodo(){
  const s=localStorage.getItem(PERIODO_KEY);
  if(s) return JSON.parse(s);
  return {desde:"2026-05-26",hasta:"2026-06-25"};
}
function toExcelDate(ds){const d=new Date(ds+"T12:00:00");return Math.floor((d-new Date(1899,11,30))/86400000);}
function excelToDate(n){if(!n)return"";const d=new Date(1899,11,30);d.setDate(d.getDate()+Number(n));return d.toLocaleDateString("es-CL");}
function clp(n){return"$"+Number(n||0).toLocaleString("es-CL");}
function n2(n){return Number(n||0).toFixed(2);}
function n3(n){return Number(n||0).toFixed(3);}

export default function App(){
  const [tab,setTab]=useState(0);
  const [config,setConfig]=useState(()=>{try{return{...DEFAULT_CONFIG,...JSON.parse(localStorage.getItem(CONFIG_KEY)||"{}")}}catch{return DEFAULT_CONFIG}});
  const [scriptUrl,setScriptUrl]=useState(()=>localStorage.getItem(SCRIPT_URL_KEY)||"");
  const [periodo,setPeriodo]=useState(getPeriodo);
  const [bateas,setBateas]=useState(DATOS_INICIALES_BATEAS);
  const [ramplas,setRamplas]=useState([]);
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState(null);
  const [saving,setSaving]=useState(false);
  const [tipo,setTipo]=useState("batea");
  const [fecha,setFecha]=useState(()=>{const a=new Date();a.setDate(a.getDate()-1);return a.toISOString().slice(0,10);});
  const [rows,setRows]=useState([]);
  const [n,setN]=useState("");
  const [supGlobal,setSupGlobal]=useState("");
  const [dataLoaded,setDataLoaded]=useState(false);

  const toast2=(msg,t="ok")=>{setToast({msg,t});setTimeout(()=>setToast(null),3500);};
  const saveConf=(c)=>{setConfig(c);localStorage.setItem(CONFIG_KEY,JSON.stringify(c));toast2("Configuración guardada");};

  const call=useCallback(async(payload)=>{
    if(!scriptUrl){toast2("Falta URL del Apps Script","err");return null;}

    if(payload.action==="save"){
      // Enviar via formulario para evitar CORS — mismo método que otras apps INCOM
      return new Promise((resolve)=>{
        const form=document.createElement("form");
        form.method="POST";
        form.action=scriptUrl;
        form.target="_blank_incom"; // iframe oculto
        const inp=document.createElement("input");
        inp.type="hidden";
        inp.name="payload";
        inp.value=JSON.stringify(payload);
        form.appendChild(inp);
        // iframe oculto para no abrir ventana
        let iframe=document.getElementById("_incom_iframe");
        if(!iframe){
          iframe=document.createElement("iframe");
          iframe.name="_blank_incom";
          iframe.id="_incom_iframe";
          iframe.style.display="none";
          document.body.appendChild(iframe);
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        // Asumimos éxito tras 2s
        setTimeout(()=>resolve({ok:true}),2000);
      });
    }

    // Lectura: GET con parámetros (datos pequeños, sin problema)
    const params=new URLSearchParams({data:JSON.stringify(payload)});
    const r=await fetch(`${scriptUrl}?${params}`);
    return r.json();
  },[scriptUrl]);

  const fetchData=useCallback(async()=>{
    if(!scriptUrl)return;
    setLoading(true);
    try{
      const res=await call({action:"getAll",periodo});
      if(res?.bateas?.length){setBateas(res.bateas);setDataLoaded(true);}
      if(res?.ramplas?.length) setRamplas(res.ramplas);
    }catch{toast2("Error al cargar","err");}
    setLoading(false);
  },[scriptUrl,periodo,call]);

  useEffect(()=>{fetchData();},[fetchData]);

  const getPlant=(t)=>{try{const p=JSON.parse(localStorage.getItem(PLANTILLA_KEY)||"{}");return p[t]||[];}catch{return[];}};
  const savePlant=(t,fs)=>{try{const p=JSON.parse(localStorage.getItem(PLANTILLA_KEY)||"{}");p[t]=fs.map(f=>t==="rampla"?{tracto:f.tracto,rampla:f.rampla,conductor:f.conductor,equipo:f.equipo,supervisor:f.supervisor,viatico:f.viatico,peajes:f.peajes,paquetes:f.paquetes}:{tracto:f.tracto,batea:f.batea,conductor:f.conductor,supervisor:f.supervisor,revisadoPor:f.revisadoPor,peajes:f.peajes});localStorage.setItem(PLANTILLA_KEY,JSON.stringify(p));}catch{}};

  const newBatea=(pl={})=>({fecha:toExcelDate(fecha),guia:"",tracto:pl.tracto||"",batea:pl.batea||"",conductor:pl.conductor||"",bruto:"",tara:"",neto:"",diferencia:"",dif:0,ticket:"",netoPuerto:"",difPuerto:0,origen:config.origenBatea,destino:config.destinoBatea,peajes:pl.peajes||config.peajeBatea,supervisor:pl.supervisor||config.supervisores[0]||"",revisadoPor:pl.revisadoPor||""});
  const newRampla=(pl={})=>({fecha:toExcelDate(fecha),guia:"",tracto:pl.tracto||"",rampla:pl.rampla||"",conductor:pl.conductor||"",producto:config.productoRampla,origen:config.origenRampla,destino:config.destinoRampla,bruto:"",tara:"",neto:"",paquetes:pl.paquetes||11,recepcionPuerto:"",llegadaTaller:"",viatico:pl.viatico||config.viatico,peajes:pl.peajes||config.peajeRampla,consumo:"",km:"",equipo:pl.equipo||"",supervisor:pl.supervisor||config.supervisores[0]||"",obs:""});

  const [avisoFecha, setAvisoFecha] = useState(null);
  const [guiasDuplicadas, setGuiasDuplicadas] = useState(new Set());

  const prepararFilas=()=>{
    const cnt=parseInt(n);
    if(!cnt||cnt<1||cnt>60){toast2("Entre 1 y 60","err");return;}

    // VALIDACIÓN 1 — revisar si ya hay guías del mismo día y tipo
    const fechaExcel=toExcelDate(fecha);
    const dataActual=tipo==="rampla"?ramplas:bateas;
    const guiasDelDia=dataActual.filter(r=>Number(r.fecha)===fechaExcel);
    if(guiasDelDia.length>0){
      setAvisoFecha({
        fecha: new Date(fecha+"T12:00:00").toLocaleDateString("es-CL"),
        tipo, cantidad: guiasDelDia.length,
        guias: guiasDelDia.map(r=>r.guia).join(", ")
      });
      return; // No prepara filas hasta que el usuario confirme
    }

    const pl=getPlant(tipo);
    const fn=tipo==="rampla"?newRampla:newBatea;
    const filas=Array.from({length:cnt},(_,i)=>fn(pl[i]||{}));
    // Aplicar supervisor global si está seleccionado
    setRows(supGlobal ? filas.map(f=>({...f,supervisor:supGlobal})) : filas);
    setGuiasDuplicadas(new Set());
  };

  const confirmarIngresoDuplicado=()=>{
    setAvisoFecha(null);
    const pl=getPlant(tipo);
    const fn=tipo==="rampla"?newRampla:newBatea;
    const filas=Array.from({length:parseInt(n)},(_,i)=>fn(pl[i]||{}));
    setRows(supGlobal ? filas.map(f=>({...f,supervisor:supGlobal})) : filas);
    setGuiasDuplicadas(new Set());
  };

  const guardar=async()=>{
    if(!rows.length)return;

    // VALIDACIÓN 2 — revisar N° de guía duplicado antes de guardar
    const dataActual=tipo==="rampla"?ramplas:bateas;
    const guiasExistentes=new Set(dataActual.map(r=>String(r.guia).trim()).filter(Boolean));
    const duplicadas=new Set(rows.map((r,i)=>({guia:String(r.guia).trim(),i}))
      .filter(({guia})=>guia&&guiasExistentes.has(guia))
      .map(({i})=>i));

    if(duplicadas.size>0){
      setGuiasDuplicadas(duplicadas);
      const nums=rows.filter((_,i)=>duplicadas.has(i)).map(r=>r.guia).join(", ");
      toast2(`⚠️ Guías ya registradas: ${nums} — corrígelas antes de guardar`,"err");
      return;
    }

    setSaving(true);
    try{
      savePlant(tipo,rows);
      const res=await call({action:"save",tipo,rows});
      if(res?.ok){
        toast2(`${rows.length} guías guardadas ✓`);
        setRows([]);setN("");setGuiasDuplicadas(new Set());fetchData();
      } else toast2(res?.msg||"Error","err");
    }catch{toast2("Error de conexión","err");}
    setSaving(false);
  };

  const upd=(i,k,v)=>setRows(prev=>prev.map((r,idx)=>{
    if(idx!==i)return r;
    const u={...r,[k]:v};
    if(tipo==="batea"){
      const b=k==="bruto"?parseFloat(v)||0:parseFloat(u.bruto)||0;
      const t=k==="tara"?parseFloat(v)||0:parseFloat(u.tara)||0;
      const np=k==="netoPuerto"?parseFloat(v)||0:parseFloat(u.netoPuerto)||0;
      if(k==="bruto"||k==="tara") u.neto=b>0&&t>0?parseFloat((b-t).toFixed(3)):"";
      const neto=parseFloat(u.neto)||0;
      if(k==="netoPuerto"||k==="bruto"||k==="tara") u.difPuerto=np>0&&neto>0?parseFloat((np-neto).toFixed(3)):0;
      u.dif=u.difPuerto;
    } else {
      const b=k==="bruto"?parseFloat(v)||0:parseFloat(u.bruto)||0;
      const t=k==="tara"?parseFloat(v)||0:parseFloat(u.tara)||0;
      if(k==="bruto"||k==="tara") u.neto=b>0&&t>0?b-t:"";
    }
    return u;
  }));

  const exportXLSX=(t)=>{
    const data=t==="rampla"?ramplas:bateas;
    if(!data.length){toast2("Sin datos","err");return;}

    const H=t==="rampla"
      ?["N°","FECHA","GUIA","TRACTO","RAMPLA","CONDUCTOR","PRODUCTO","ORIGEN","DESTINO","BRUTO","TARA","NETO","PAQUETES","RECEPCION PUERTO","LLEGADA TALLER","VIATICO","PEAJES","CONSUMO GPS","KM RECORRIDOS","RENDIMIENTO (KM/L)","EQUIPO","TOTAL","SUPERVISOR","OBSERVACIONES"]
      :["N°","FECHA","N° GUIA","PPU TRACTO","PPU BATEA","NOMBRE CONDUCTOR","BRUTO","TARA","NETO","DIFERENCIA","DIF","N° TICKET","NETO PUERTO","DIF. PUERTO","ORIGEN","DESTINO","PEAJES","SUPERVISOR QUE INGRESA","REVISADO POR"];

    const toDate=(excelNum)=>{
      if(!excelNum)return"";
      const d=new Date(1899,11,30);d.setDate(d.getDate()+Number(excelNum));
      return d.toLocaleDateString("es-CL");
    };

    const R=data.map((r,i)=>t==="rampla"
      ?[i+1,toDate(r.fecha),r.guia,r.tracto,r.rampla,r.conductor,r.producto,r.origen,r.destino,
        Number(r.bruto||0),Number(r.tara||0),Number(r.neto||0),Number(r.paquetes||0),
        toDate(r.recepcionPuerto),toDate(r.llegadaTaller),
        Number(r.viatico||0),Number(r.peajes||0),Number(r.consumo||0),Number(r.km||0),
        r.km&&r.consumo?parseFloat((r.km/r.consumo).toFixed(2)):0,
        r.equipo,Number(r.viatico||0)+Number(r.peajes||0),r.supervisor,r.obs||""]
      :[i+1,toDate(r.fecha),r.guia,r.tracto,r.batea,r.conductor,
        Number(r.bruto||0),Number(r.tara||0),Number(r.neto||0),
        "","",r.ticket,
        Number(r.netoPuerto||0),Number(r.difPuerto||0),
        r.origen,r.destino,Number(r.peajes||0),r.supervisor,r.revisadoPor||""]
    );

    // Construir XLSX usando SheetJS desde CDN
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload=()=>{
      const wb=XLSX.utils.book_new();
      const ws=XLSX.utils.aoa_to_sheet([H,...R]);

      // Ancho de columnas
      ws["!cols"]=t==="rampla"
        ?[{wch:4},{wch:12},{wch:10},{wch:9},{wch:9},{wch:28},{wch:10},{wch:12},{wch:10},{wch:10},{wch:10},{wch:10},{wch:8},{wch:12},{wch:12},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:14},{wch:10},{wch:20},{wch:20}]
        :[{wch:4},{wch:12},{wch:10},{wch:10},{wch:10},{wch:28},{wch:9},{wch:9},{wch:9},{wch:9},{wch:6},{wch:10},{wch:11},{wch:10},{wch:16},{wch:12},{wch:9},{wch:22},{wch:14}];

      // Estilo encabezado (fila 1)
      const range=XLSX.utils.decode_range(ws["!ref"]);
      for(let c=range.s.c;c<=range.e.c;c++){
        const cell=XLSX.utils.encode_cell({r:0,c});
        if(!ws[cell])continue;
        ws[cell].s={
          fill:{fgColor:{rgb:"1A3FA4"}},
          font:{bold:true,color:{rgb:"FFFFFF"},sz:10},
          alignment:{horizontal:"center",vertical:"center"},
          border:{bottom:{style:"medium",color:{rgb:"C0001A"}}}
        };
      }

      XLSX.utils.book_append_sheet(wb,ws,t==="rampla"?"RAMPLAS":"BATEAS");
      XLSX.writeFile(wb,`INCOM_${t.toUpperCase()}_${periodo.desde}_${periodo.hasta}.xlsx`);
    };
    if(!window.XLSX){document.head.appendChild(script);}
    else{
      const wb=XLSX.utils.book_new();
      const ws=XLSX.utils.aoa_to_sheet([H,...R]);
      ws["!cols"]=t==="rampla"
        ?[{wch:4},{wch:12},{wch:10},{wch:9},{wch:9},{wch:28},{wch:10},{wch:12},{wch:10},{wch:10},{wch:10},{wch:10},{wch:8},{wch:12},{wch:12},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:14},{wch:10},{wch:20},{wch:20}]
        :[{wch:4},{wch:12},{wch:10},{wch:10},{wch:10},{wch:28},{wch:9},{wch:9},{wch:9},{wch:9},{wch:6},{wch:10},{wch:11},{wch:10},{wch:16},{wch:12},{wch:9},{wch:22},{wch:14}];
      XLSX.utils.book_append_sheet(wb,ws,t==="rampla"?"RAMPLAS":"BATEAS");
      XLSX.writeFile(wb,`INCOM_${t.toUpperCase()}_${periodo.desde}_${periodo.hasta}.xlsx`);
    }
  };

  // Alias para compatibilidad con componentes que usan exportCSV
  const exportCSV=exportXLSX;


  const totalNeto=bateas.reduce((s,r)=>s+Number(r.neto||0),0);
  const totalTonPeriodo=bateas.reduce((s,r)=>s+Number(r.neto||0),0);

  return(
    <div style={{minHeight:"100vh",background:"#f2f4f8",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#f2f4f8;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
        body{background:#f2f4f8;}

        /* INPUTS */
        .fi{width:100%;background:#fff;border:1.5px solid #e2e8f0;border-radius:8px;color:#1e293b;font-family:'Inter',sans-serif;font-size:13px;padding:9px 12px;outline:none;transition:border 0.15s,box-shadow 0.15s;}
        .fi:focus{border-color:#1a3fa4;box-shadow:0 0 0 3px rgba(26,63,164,0.10);}
        .fi::placeholder{color:#94a3b8;}
        select.fi{cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;appearance:none;padding-right:28px;}

        /* CELDAS TABLA */
        .ci{width:100%;background:#fff;border:none;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-family:'Inter',sans-serif;font-size:12px;padding:5px 8px;outline:none;height:32px;}
        .ci:focus{background:#e6ebf7;border-bottom:2px solid #1a3fa4;z-index:1;position:relative;}
        .ci-sel{width:100%;background:#fff;border:none;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-family:'Inter',sans-serif;font-size:12px;height:32px;padding:0 6px;outline:none;cursor:pointer;appearance:none;}
        .ci-sel:focus{background:#e6ebf7;border-bottom:2px solid #1a3fa4;}
        .ci-ac{width:100%;background:#fff;border:none;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-family:'Inter',sans-serif;font-size:12px;height:32px;padding:0 6px;outline:none;}
        .ci-ac:focus{background:#e6ebf7;border-bottom:2px solid #1a3fa4;}
        .ci-ac::placeholder{color:#cbd5e1;}
        .ci-ro{width:100%;background:#f8fafc;border:none;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;color:#1a3fa4;font-family:'Inter',sans-serif;font-size:12px;padding:5px 8px;height:32px;font-weight:600;text-align:right;display:flex;align-items:center;justify-content:flex-end;}
        .ci-num{text-align:right;}
        .tr-e:hover .ci,.tr-e:hover .ci-sel,.tr-e:hover .ci-ro{background:#fafbff;}

        /* BOTONES */
        .btn-p{background:linear-gradient(135deg,#1a3fa4,#1a3fa4);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;box-shadow:0 2px 8px rgba(26,63,164,0.25);}
        .btn-p:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(26,63,164,0.35);}
        .btn-p:disabled{background:#94a3b8;cursor:not-allowed;transform:none;box-shadow:none;}
        .btn-s{background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;color:#64748b;padding:9px 16px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;}
        .btn-s:hover{border-color:#1a3fa4;color:#1a3fa4;background:#f5f3ff;}
        .btn-d{background:none;border:none;color:#cbd5e1;cursor:pointer;font-size:16px;line-height:1;transition:color 0.15s;padding:0 4px;}
        .btn-d:hover{color:#ef4444;}

        /* CARDS */
        .card{background:#fff;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);}
        .card-sm{background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);}

        /* MÉTRICAS */
        .mc{background:#fff;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06);position:relative;overflow:hidden;}
        .mc-val{font-size:28px;font-weight:700;margin:8px 0 4px;letter-spacing:-0.5px;}
        .mc-lbl{font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;}
        .mc-icon{position:absolute;right:16px;top:16px;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}

        /* TABS */
        .tab-bar{display:flex;gap:4px;background:#fff;border-radius:16px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);}
        .tab-btn{background:none;border:none;border-radius:10px;color:#94a3b8;cursor:pointer;padding:10px 18px;font-size:13px;font-weight:500;font-family:'Inter',sans-serif;transition:all 0.2s;white-space:nowrap;display:flex;align-items:center;gap:7px;}
        .tab-btn:hover{color:#1e293b;background:#f8fafc;}
        .tab-btn.active{background:linear-gradient(135deg,#1a3fa4,#1a3fa4);color:#fff;box-shadow:0 2px 8px rgba(26,63,164,0.25);}

        /* TIPO PILL */
        .pill{background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;color:#64748b;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s;display:flex;align-items:center;gap:6px;}
        .pill.a-r{background:#1a3fa4;border-color:#1a3fa4;color:#fff;}
        .pill.a-b{background:#1a3fa4;border-color:#1a3fa4;color:#fff;}

        /* TABLA PRINCIPAL */
        .tbl-wrap{overflow-x:auto;overflow-y:auto;max-height:500px;border-radius:12px;border:1px solid #e2e8f0;}
        .tbl-e{width:100%;border-collapse:collapse;table-layout:fixed;}
        .th-e{background:#f8fafc;padding:8px 8px;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;font-weight:600;border-bottom:2px solid #e2e8f0;border-right:1px solid #e2e8f0;white-space:nowrap;position:sticky;top:0;z-index:2;}
        .rn{background:#f8fafc;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:11px;text-align:center;width:32px;min-width:32px;padding:0;vertical-align:middle;font-weight:600;}

        /* TABLA VISTA */
        .tbl-v{width:100%;border-collapse:collapse;font-size:12px;}
        .tbl-v th{background:#f8fafc;padding:10px 12px;text-align:left;color:#94a3b8;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid #e2e8f0;font-weight:600;white-space:nowrap;position:sticky;top:0;z-index:1;}
        .tbl-v td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#475569;}
        .tbl-v tr:hover td{background:#fafbff;color:#1e293b;}

        /* BADGE */
        .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;}
        .badge-b{background:#fce8eb;color:#1a3fa4;}
        .badge-r{background:#e6ebf7;color:#1a3fa4;}

        /* TOAST */
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:12px;font-size:13px;font-weight:600;z-index:999;font-family:'Inter',sans-serif;animation:up 0.25s ease;box-shadow:0 8px 24px rgba(0,0,0,0.12);}
        .t-ok{background:#10b981;color:#fff;}
        .t-err{background:#ef4444;color:#fff;}
        @keyframes up{from{opacity:0;transform:translateX(-50%) translateY(12px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

        /* HEADER */
        .hdr{background:#fff;box-shadow:0 1px 0 #e2e8f0,0 3px 0 #c0001a;padding:0 28px;position:sticky;top:0;z-index:10;}
        .section-lbl{font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;}
        .tag-item{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;color:#475569;}
        .tag-item button{background:none;border:none;cursor:pointer;color:#94a3b8;font-size:13px;line-height:1;}
        .tag-item button:hover{color:#ef4444;}
        .dif-neg{color:#ef4444;font-weight:600;}
        .dif-pos{color:#10b981;font-weight:600;}
        .dif-zer{color:#94a3b8;}
      `}</style>

      {/* HEADER */}
      <div className="hdr">
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",gap:20,padding:"14px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <svg height="36" viewBox="0 0 220 60" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="58" height="52" rx="8" fill="none" stroke="#c0001a" strokeWidth="4"/>
              <text x="31" y="42" textAnchor="middle" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="38" fill="#1a3fa4">IN</text>
              <text x="130" y="48" textAnchor="middle" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="46" fill="#1a3fa4">COM</text>
            </svg>
            <div style={{borderLeft:"1.5px solid #e2e8f0",paddingLeft:14,marginLeft:4}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",letterSpacing:"-0.2px"}}>Control Guías de Despacho</div>
              <div style={{fontSize:11,color:"#94a3b8",fontWeight:500,marginTop:1}}>Período {periodo.desde} → {periodo.hasta}</div>
            </div>
          </div>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            <div className="tab-bar">
              {[["＋","Ingreso"],["🚛","Ramplas"],["🚛","Bateas"],["⚙","Config"],["📊","Informes"]].map(([ic,lb],i)=>(
                <button key={i} className={`tab-btn${tab===i?" active":""}`} onClick={()=>setTab(i)}>
                  <span>{ic}</span>{lb}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {loading&&<span style={{fontSize:12,color:"#94a3b8"}}>Cargando...</span>}
            <button className="btn-s" onClick={fetchData} style={{padding:"8px 14px",fontSize:12}}>↻ Sync</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 28px"}}>

        {/* ══ INGRESO ══ */}
        {tab===0&&(
          <div style={{display:"grid",gap:20}}>
            {/* Control bar */}
            <div className="card" style={{padding:"16px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:8}}>
                  {[["rampla","🚛 Rampla","a-r"],["batea","🚛 Batea","a-b"]].map(([k,l,c])=>(
                    <button key={k} className={`pill${tipo===k?" "+c:""}`} onClick={()=>{setTipo(k);setRows([]);setN("");}}>
                      {l}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <label style={{fontSize:13,color:"#64748b",fontWeight:500,whiteSpace:"nowrap"}}>Fecha servicio:</label>
                  <input type="date" className="fi" value={fecha} style={{width:150}}
                    onChange={e=>{setFecha(e.target.value);setRows(prev=>prev.map(r=>({...r,fecha:toExcelDate(e.target.value)})));}} />
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <label style={{fontSize:13,color:"#64748b",fontWeight:500,whiteSpace:"nowrap"}}>Supervisor:</label>
                  <select className="fi" value={supGlobal} style={{width:160}}
                    onChange={e=>{
                      setSupGlobal(e.target.value);
                      setRows(prev=>prev.map(r=>({...r,supervisor:e.target.value})));
                    }}>
                    <option value="">— elegir</option>
                    {config.supervisores.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input type="number" className="fi" min={1} max={60} placeholder="Cantidad" value={n}
                    style={{width:110}} onChange={e=>setN(e.target.value)} onKeyDown={e=>e.key==="Enter"&&prepararFilas()} />
                  <button className="btn-p" onClick={prepararFilas} style={{whiteSpace:"nowrap"}}>▶ Preparar filas</button>
                </div>
                {rows.length>0&&(
                  <>
                    <button className="btn-s" onClick={()=>setRows(p=>[...p,tipo==="rampla"?newRampla(getPlant(tipo)[p.length]||{}):newBatea(getPlant(tipo)[p.length]||{})])} style={{padding:"9px 14px"}}>+ Fila</button>
                    <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:12,color:"#94a3b8",fontWeight:500}}>{rows.length} filas</span>
                      <button className="btn-s" onClick={()=>{setRows([]);setN("");}}>✕</button>
                      <button className="btn-p" onClick={guardar} disabled={saving}>
                        {saving?"Guardando...":"💾 Guardar "+rows.length+" guías"}
                      </button>
                    </div>
                  </>
                )}
              </div>
              {rows.length>0&&(
                <div style={{marginTop:10,fontSize:12,color:"#94a3b8"}}>
                  <span style={{background:"#e6ebf7",color:"#0369a1",padding:"3px 10px",borderRadius:6,fontWeight:500}}>
                    Tab → avanzar celda &nbsp;·&nbsp; Enter → bajar fila &nbsp;·&nbsp; 🟣 campos calculados automáticamente
                  </span>
                </div>
              )}
            </div>

            {/* TABLA EDITABLE */}
            {rows.length>0&&(
              <div className="card" style={{padding:0,overflow:"hidden"}}>
                {tipo==="batea"
                  ?<TblBateas rows={rows} upd={upd} del={i=>setRows(p=>p.filter((_,x)=>x!==i))} cfg={config} duplicadas={guiasDuplicadas}/>
                  :<TblRamplas rows={rows} upd={upd} del={i=>setRows(p=>p.filter((_,x)=>x!==i))} cfg={config} duplicadas={guiasDuplicadas}/>
                }
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#f8fafc",borderTop:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#475569"}}>
                    {tipo==="batea"
                      ?<>Total neto: <span style={{color:"#1a3fa4"}}>{rows.reduce((s,r)=>s+Number(r.neto||0),0).toFixed(2)} t</span></>
                      :<>Total viáticos+peajes: <span style={{color:"#1a3fa4"}}>{clp(rows.reduce((s,r)=>s+Number(r.viatico||0)+Number(r.peajes||0),0))}</span></>
                    }
                  </div>
                  <button className="btn-p" onClick={guardar} disabled={saving}>
                    {saving?"Guardando...":"💾 Guardar "+rows.length+" guías"}
                  </button>
                </div>
              </div>
            )}

            {/* Métricas */}
            {rows.length===0&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
                {[
                  {lbl:"Vueltas rampla",sub:ramplas.length===1?"1 vuelta":ramplas.length+" vueltas",val:ramplas.length,col:"#1a3fa4",bg:"#e6ebf7",ic:"🚛"},
                  {lbl:"Tonelaje batea",sub:bateas.length+" viajes · "+totalTonPeriodo.toFixed(1)+" t",val:totalTonPeriodo.toFixed(1)+" t",col:"#1a3fa4",bg:"#fce8eb",ic:"⚖️"},
                  {lbl:"Guías rampla período",sub:"contrato cátodos/molibdeno",val:ramplas.length,col:"#0284c7",bg:"#e6ebf7",ic:"📄"},
                  {lbl:"Guías batea período",sub:"contrato concentrado",val:bateas.length,col:"#c0001a",bg:"#fce8eb",ic:"📋"},
                ].map(({lbl,sub,val,col,bg,ic})=>(
                  <div key={lbl} className="mc">
                    <div className="mc-icon" style={{background:bg}}>{ic}</div>
                    <div className="mc-lbl">{lbl}</div>
                    <div className="mc-val" style={{color:col}}>{val}</div>
                    {sub&&<div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{sub}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ RAMPLAS ══ */}
        {tab===1&&<VistaRamplas data={ramplas} exportCSV={exportCSV} clp={clp} excelToDate={excelToDate}/>}

        {/* ══ BATEAS ══ */}
        {tab===2&&<VistaBateas data={bateas} exportCSV={exportCSV} clp={clp} excelToDate={excelToDate} totalNeto={totalNeto} n2={n2} n3={n3}/>}

        {/* ══ CONFIG ══ */}
        {tab===3&&<Cfg config={config} saveConf={saveConf} scriptUrl={scriptUrl}
          setSU={v=>{setScriptUrl(v);localStorage.setItem(SCRIPT_URL_KEY,v);}}
          periodo={periodo} setP={p=>{setPeriodo(p);localStorage.setItem(PERIODO_KEY,JSON.stringify(p));}}/>}

        {/* ══ INFORMES ══ */}
        {tab===4&&<Informes ramplas={ramplas} bateas={bateas} periodo={periodo} clp={clp} exportCSV={exportCSV} totalNeto={totalNeto}/>}
      </div>

      {/* MODAL AVISO FECHA DUPLICADA */}
      {avisoFecha&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:16,padding:28,maxWidth:460,width:"90%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:40,height:40,borderRadius:10,background:"#fff3cd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚠️</div>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"#1e293b"}}>Guías ya registradas para este día</div>
                <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Posible duplicado detectado</div>
              </div>
            </div>
            <div style={{background:"#fff8e1",border:"1px solid #ffd54f",borderRadius:8,padding:"12px 14px",marginBottom:20,fontSize:13,color:"#5f4a00"}}>
              El <strong>{avisoFecha.fecha}</strong> ya tiene <strong>{avisoFecha.cantidad} guía{avisoFecha.cantidad>1?"s":""} de {avisoFecha.tipo}</strong> registrada{avisoFecha.cantidad>1?"s":""}:
              <div style={{marginTop:6,fontFamily:"monospace",fontSize:12,color:"#1a3fa4",wordBreak:"break-all"}}>{avisoFecha.guias}</div>
            </div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>
              ¿Quieres continuar ingresando guías para ese día de todas formas?
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setAvisoFecha(null)} style={{background:"none",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:500,cursor:"pointer",color:"#64748b"}}>
                Cancelar — cambiar fecha
              </button>
              <button onClick={confirmarIngresoDuplicado} style={{background:"#c0001a",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",color:"#fff"}}>
                Sí, continuar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className={`toast ${toast.t==="err"?"t-err":"t-ok"}`}>{toast.msg}</div>}
    </div>
  );
}

/* TABLA EDITABLE BATEAS */
// Celda con autocompletado tipo datalist
function CeldaAC({value,opts,onChange,onKeyDown,dataR,dataC,placeholder=""}){
  const id=`dl-${dataR}-${dataC}`;
  return(
    <>
      <input
        className="ci-ac"
        list={id}
        value={value||""}
        placeholder={placeholder}
        data-r={dataR} data-c={dataC}
        onChange={e=>onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      <datalist id={id}>
        {opts.map(o=><option key={o} value={o}/>)}
      </datalist>
    </>
  );
}

function TblBateas({rows,upd,del,cfg,duplicadas=new Set()}){
  const ref=useRef();
  const cols=[
    {k:"guia",      l:"N° Guía",    w:85,  t:"txt"},
    {k:"tracto",    l:"PPU Tracto", w:100, t:"sel",o:()=>cfg.tractosBatea},
    {k:"batea",     l:"PPU Batea",  w:100, t:"sel",o:()=>cfg.bateas},
    {k:"conductor", l:"Conductor",  w:175, t:"sel",o:()=>cfg.conductoresBatea},
    {k:"destino",   l:"Destino",    w:115, t:"dst",o:()=>cfg.destinosBatea||[]},
    {k:"bruto",     l:"Bruto (t)",  w:80,  t:"num"},
    {k:"tara",      l:"Tara (t)",   w:75,  t:"num"},
    {k:"neto",      l:"Neto (t)",   w:75,  t:"ro"},
    {k:"ticket",    l:"N° Ticket",  w:85,  t:"txt"},
    {k:"netoPuerto",l:"Neto Pto",   w:80,  t:"num"},
    {k:"difPuerto", l:"Dif Pto",    w:70,  t:"ro"},
    {k:"peajes",    l:"Peajes $",   w:80,  t:"num"},
    {k:"supervisor",l:"Supervisor", w:130, t:"sel",o:()=>cfg.supervisores},
    {k:"revisadoPor",l:"Revisado",  w:130, t:"sel",o:()=>cfg.supervisores},
  ];
  const hk=(e,ri,ci)=>{if(e.key==="Enter"){e.preventDefault();ref.current?.querySelector(`[data-r="${ri+1}"][data-c="${ci}"]`)?.focus();}};
  return(
    <div className="tbl-wrap" ref={ref} style={{borderRadius:0,border:"none"}}>
      <table className="tbl-e">
        <colgroup><col style={{width:32}}/>{cols.map(c=><col key={c.k} style={{width:c.w}}/>)}<col style={{width:36}}/></colgroup>
        <thead><tr>
          <th className="th-e">#</th>
          {cols.map(c=><th key={c.k} className="th-e">{c.l}</th>)}
          <th className="th-e"></th>
        </tr></thead>
        <tbody>
          {rows.map((row,ri)=>(
            <tr key={ri} className="tr-e" style={{outline:duplicadas.has(ri)?"2px solid #c0001a":"none",outlineOffset:"-1px",background:duplicadas.has(ri)?"#fff0f0":""}}>
              <td className="rn">{ri+1}</td>
              {cols.map((col,ci)=>(
                <td key={col.k} style={{padding:0}}>
                  {col.t==="ro"
                    ?<div className="ci-ro" style={{
                        color: col.k==="difPuerto"
                          ? (Number(row[col.k])>0.005?"#16a34a": Number(row[col.k])<-0.005?"#dc2626":"#1a3fa4")
                          : "#1a3fa4"
                      }}>
                        {row[col.k]!==undefined&&row[col.k]!==""?Number(row[col.k]).toFixed(3):""}
                      </div>
                    :col.t==="dst"
                    ?<CeldaAC value={row[col.k]} opts={col.o().map(d=>d.nombre)} dataR={ri} dataC={ci}
                        onChange={v=>{
                          upd(ri,col.k,v);
                          const dest=col.o().find(d=>d.nombre===v);
                          if(dest) upd(ri,"peajes",dest.peaje);
                        }} onKeyDown={e=>hk(e,ri,ci)}/>
                    :col.t==="sel"
                    ?<CeldaAC value={row[col.k]} opts={col.o()} dataR={ri} dataC={ci}
                        onChange={v=>upd(ri,col.k,v)} onKeyDown={e=>hk(e,ri,ci)}/>
                    :<input className={`ci${col.t==="num"?" ci-num":""}`} type={col.t==="num"?"number":"text"} step={col.t==="num"?"0.001":undefined}
                      value={row[col.k]||""} data-r={ri} data-c={ci} onChange={e=>upd(ri,col.k,e.target.value)} onKeyDown={e=>hk(e,ri,ci)}/>
                  }
                </td>
              ))}
              <td style={{padding:"0 4px",textAlign:"center",background:"#fff",borderBottom:"1px solid #e2e8f0",verticalAlign:"middle"}}>
                <button className="btn-d" onClick={()=>del(ri)}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* TABLA EDITABLE RAMPLAS */
function TblRamplas({rows,upd,del,cfg,duplicadas=new Set()}){
  const ref=useRef();
  const cols=[
    {k:"guia",           l:"N° Guía",    w:85,  t:"txt"},
    {k:"tracto",         l:"Tracto",     w:90,  t:"sel",o:()=>cfg.tractosRampla},
    {k:"rampla",         l:"Rampla",     w:90,  t:"sel",o:()=>cfg.ramplas},
    {k:"conductor",      l:"Conductor",  w:175, t:"sel",o:()=>cfg.conductoresRampla},
    {k:"destino",        l:"Destino",    w:115, t:"dst",o:()=>cfg.destinosRampla||[]},
    {k:"bruto",          l:"Bruto (kg)", w:85,  t:"num"},
    {k:"tara",           l:"Tara (kg)",  w:80,  t:"num"},
    {k:"neto",           l:"Neto (kg)",  w:80,  t:"ro"},
    {k:"paquetes",       l:"Paquetes",   w:70,  t:"num"},
    {k:"recepcionPuerto",l:"Rec.Puerto", w:105, t:"date"},
    {k:"llegadaTaller",  l:"Lleg.Taller",w:105, t:"date"},
    {k:"viatico",        l:"Viático $",  w:85,  t:"num"},
    {k:"peajes",         l:"Peajes $",   w:80,  t:"num"},
    {k:"consumo",        l:"Consumo (L)",w:85,  t:"num"},
    {k:"km",             l:"KM",         w:65,  t:"num"},
    {k:"equipo",         l:"Equipo",     w:120, t:"sel",o:()=>cfg.equiposRampla},
    {k:"supervisor",     l:"Supervisor", w:130, t:"sel",o:()=>cfg.supervisores},
    {k:"obs",            l:"Obs",        w:120, t:"txt"},
  ];
  const hk=(e,ri,ci)=>{if(e.key==="Enter"){e.preventDefault();ref.current?.querySelector(`[data-r="${ri+1}"][data-c="${ci}"]`)?.focus();}};
  return(
    <div className="tbl-wrap" ref={ref} style={{borderRadius:0,border:"none"}}>
      <table className="tbl-e">
        <colgroup><col style={{width:32}}/>{cols.map(c=><col key={c.k} style={{width:c.w}}/>)}<col style={{width:36}}/></colgroup>
        <thead><tr>
          <th className="th-e">#</th>
          {cols.map(c=><th key={c.k} className="th-e">{c.l}</th>)}
          <th className="th-e"></th>
        </tr></thead>
        <tbody>
          {rows.map((row,ri)=>(
            <tr key={ri} className="tr-e">
              <td className="rn">{ri+1}</td>
              {cols.map((col,ci)=>(
                <td key={col.k} style={{padding:0}}>
                  {col.t==="ro"
                    ?<div className="ci-ro">{row[col.k]!==undefined&&row[col.k]!==""?Number(row[col.k]).toLocaleString("es-CL"):""}</div>
                    :col.t==="dst"
                    ?<CeldaAC value={row[col.k]} opts={col.o().map(d=>d.nombre)} dataR={ri} dataC={ci}
                        onChange={v=>{
                          upd(ri,col.k,v);
                          const dest=col.o().find(d=>d.nombre===v);
                          if(dest) upd(ri,"peajes",dest.peaje);
                        }} onKeyDown={e=>hk(e,ri,ci)}/>
                    :col.t==="sel"
                    ?<CeldaAC value={row[col.k]} opts={col.o()} dataR={ri} dataC={ci}
                        onChange={v=>upd(ri,col.k,v)} onKeyDown={e=>hk(e,ri,ci)}/>
                    :col.t==="date"
                    ?<input className="ci" type="date" data-r={ri} data-c={ci} onKeyDown={e=>hk(e,ri,ci)}
                      onChange={e=>upd(ri,col.k,e.target.value?toExcelDate(e.target.value):"")}/>
                    :<input className={`ci${col.t==="num"?" ci-num":""}`} type={col.t==="num"?"number":"text"}
                      value={row[col.k]||""} data-r={ri} data-c={ci} onChange={e=>upd(ri,col.k,e.target.value)} onKeyDown={e=>hk(e,ri,ci)}/>
                  }
                </td>
              ))}
              <td style={{padding:"0 4px",textAlign:"center",background:"#fff",borderBottom:"1px solid #e2e8f0",verticalAlign:"middle"}}>
                <button className="btn-d" onClick={()=>del(ri)}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* VISTA RAMPLAS */
function VistaRamplas({data,exportCSV,clp,excelToDate}){
  const [busq,setBusq]=useState("");
  const [sortCol,setSortCol]=useState(null);
  const [sortDir,setSortDir]=useState("desc");

  const cols=[
    {k:"fecha",l:"Fecha",fn:r=>Number(r.fecha||0)},
    {k:"guia",l:"Guía",fn:r=>String(r.guia||"")},
    {k:"tracto",l:"Tracto",fn:r=>String(r.tracto||"")},
    {k:"rampla",l:"Rampla",fn:r=>String(r.rampla||"")},
    {k:"conductor",l:"Conductor",fn:r=>String(r.conductor||"")},
    {k:"paquetes",l:"Paq",fn:r=>Number(r.paquetes||0)},
    {k:"bruto",l:"Bruto",fn:r=>Number(r.bruto||0)},
    {k:"tara",l:"Tara",fn:r=>Number(r.tara||0)},
    {k:"neto",l:"Neto",fn:r=>Number(r.neto||0)},
    {k:"viatico",l:"Viático",fn:r=>Number(r.viatico||0)},
    {k:"peajes",l:"Peajes",fn:r=>Number(r.peajes||0)},
    {k:"total",l:"Total",fn:r=>Number(r.viatico||0)+Number(r.peajes||0)},
    {k:"km",l:"KM",fn:r=>Number(r.km||0)},
    {k:"equipo",l:"Equipo",fn:r=>String(r.equipo||"")},
    {k:"supervisor",l:"Supervisor",fn:r=>String(r.supervisor||"")},
  ];

  const toggleSort=(k)=>{
    if(sortCol===k) setSortDir(d=>d==="asc"?"desc":"asc");
    else{ setSortCol(k); setSortDir("desc"); }
  };

  const colFn=cols.find(c=>c.k===sortCol)?.fn;
  const filtered=data.filter(r=>{
    if(!busq)return true;
    const q=busq.toLowerCase();
    return [r.guia,r.conductor,r.tracto,r.rampla,r.equipo,r.supervisor].some(v=>String(v||"").toLowerCase().includes(q));
  });
  const sorted=colFn ? [...filtered].sort((a,b)=>{
    const va=colFn(a), vb=colFn(b);
    return sortDir==="asc"?(va>vb?1:va<vb?-1:0):(va<vb?1:va>vb?-1:0);
  }) : filtered;

  const SortIcon=({k})=>{
    if(sortCol!==k) return <span style={{opacity:0.25,fontSize:9}}> ⇅</span>;
    return <span style={{color:"#1a3fa4",fontSize:9}}>{sortDir==="asc"?" ↑":" ↓"}</span>;
  };

  return(
    <div style={{display:"grid",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b"}}>🚛 Ramplas — {sorted.length}{sorted.length!==data.length?` de ${data.length}`:""} guías</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input className="fi" placeholder="🔍 Buscar conductor, guía, equipo..." value={busq}
            onChange={e=>setBusq(e.target.value)} style={{width:260,padding:"7px 12px",fontSize:12}}/>
          {busq&&<button className="btn-s" onClick={()=>setBusq("")} style={{padding:"6px 10px",fontSize:12}}>✕</button>}
          <button className="btn-s" onClick={()=>exportCSV("rampla")}>↓ Exportar XLSX</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[
          {l:"Vueltas",v:sorted.length,c:"#1a3fa4"},
          {l:"Viáticos",v:clp(sorted.reduce((s,r)=>s+Number(r.viatico||0),0)),c:"#1a3fa4"},
          {l:"Peajes",v:clp(sorted.reduce((s,r)=>s+Number(r.peajes||0),0)),c:"#0284c7"},
          {l:"Total General",v:clp(sorted.reduce((s,r)=>s+Number(r.viatico||0)+Number(r.peajes||0),0)),c:"#1a3fa4"},
        ].map(({l,v,c})=>(
          <div key={l} className="mc">
            <div className="mc-lbl">{l}</div>
            <div className="mc-val" style={{color:c,fontSize:22}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="tbl-wrap" style={{borderRadius:0,border:"none",maxHeight:520}}>
          <table className="tbl-v">
            <thead><tr>
              <th style={{cursor:"default"}}>#</th>
              {cols.map(c=>(
                <th key={c.k} onClick={()=>toggleSort(c.k)}
                  style={{cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",
                    background:sortCol===c.k?"#dce6f5":"",color:sortCol===c.k?"#1a3fa4":""}}>
                  {c.l}<SortIcon k={c.k}/>
                </th>
              ))}
              <th>Obs</th>
            </tr></thead>
            <tbody>
              {sorted.map((r,i)=>(
                <tr key={i}>
                  <td style={{color:"#94a3b8",fontWeight:500}}>{i+1}</td>
                  <td>{excelToDate(r.fecha)}</td>
                  <td style={{color:"#1a3fa4",fontWeight:600}}>{r.guia}</td>
                  <td>{r.tracto}</td><td>{r.rampla}</td>
                  <td style={{color:"#1e293b",fontWeight:500}}>{r.conductor}</td>
                  <td style={{textAlign:"center"}}>{r.paquetes}</td>
                  <td style={{textAlign:"right"}}>{Number(r.bruto||0).toLocaleString("es-CL")}</td>
                  <td style={{textAlign:"right"}}>{Number(r.tara||0).toLocaleString("es-CL")}</td>
                  <td style={{textAlign:"right",fontWeight:600,color:"#1e293b"}}>{Number(r.neto||0).toLocaleString("es-CL")}</td>
                  <td style={{textAlign:"right"}}>{clp(r.viatico)}</td>
                  <td style={{textAlign:"right"}}>{clp(r.peajes)}</td>
                  <td style={{textAlign:"right",fontWeight:700,color:"#1a3fa4"}}>{clp(Number(r.viatico||0)+Number(r.peajes||0))}</td>
                  <td style={{textAlign:"right"}}>{r.km}</td>
                  <td>{r.equipo}</td>
                  <td style={{color:"#94a3b8"}}>{r.supervisor}</td>
                  <td style={{color:"#94a3b8",fontSize:11}}>{r.obs}</td>
                </tr>
              ))}
              {!sorted.length&&<tr><td colSpan={17} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>
                {busq?"No hay resultados para esa búsqueda":"Sin guías en el período"}
              </td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* VISTA BATEAS */
function VistaBateas({data,exportCSV,clp,excelToDate,totalNeto,n2,n3}){
  const [busq,setBusq]=useState("");
  const [sortCol,setSortCol]=useState(null);
  const [sortDir,setSortDir]=useState("desc");

  const cols=[
    {k:"fecha",l:"Fecha",fn:r=>Number(r.fecha||0)},
    {k:"guia",l:"Guía",fn:r=>String(r.guia||"")},
    {k:"tracto",l:"PPU Tracto",fn:r=>String(r.tracto||"")},
    {k:"batea",l:"PPU Batea",fn:r=>String(r.batea||"")},
    {k:"conductor",l:"Conductor",fn:r=>String(r.conductor||"")},
    {k:"bruto",l:"Bruto",fn:r=>Number(r.bruto||0)},
    {k:"tara",l:"Tara",fn:r=>Number(r.tara||0)},
    {k:"neto",l:"Neto",fn:r=>Number(r.neto||0)},
    {k:"ticket",l:"N° Ticket",fn:r=>String(r.ticket||"")},
    {k:"netoPuerto",l:"Neto Pto",fn:r=>Number(r.netoPuerto||0)},
    {k:"difPuerto",l:"Dif. Pto",fn:r=>Number(r.difPuerto||0)},
    {k:"peajes",l:"Peajes",fn:r=>Number(r.peajes||0)},
    {k:"supervisor",l:"Supervisor",fn:r=>String(r.supervisor||"")},
  ];

  const toggleSort=(k)=>{
    if(sortCol===k) setSortDir(d=>d==="asc"?"desc":"asc");
    else{ setSortCol(k); setSortDir("desc"); }
  };

  const colFn=cols.find(c=>c.k===sortCol)?.fn;
  const filtered=data.filter(r=>{
    if(!busq)return true;
    const q=busq.toLowerCase();
    return [r.guia,r.conductor,r.tracto,r.batea,r.ticket,r.supervisor].some(v=>String(v||"").toLowerCase().includes(q));
  });
  const sorted=colFn?[...filtered].sort((a,b)=>{
    const va=colFn(a),vb=colFn(b);
    return sortDir==="asc"?(va>vb?1:va<vb?-1:0):(va<vb?1:va>vb?-1:0);
  }):filtered;

  const netoFiltrado=sorted.reduce((s,r)=>s+Number(r.neto||0),0);

  const SortIcon=({k})=>{
    if(sortCol!==k)return <span style={{opacity:0.25,fontSize:9}}> ⇅</span>;
    return <span style={{color:"#c0001a",fontSize:9}}>{sortDir==="asc"?" ↑":" ↓"}</span>;
  };

  return(
    <div style={{display:"grid",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b"}}>🚛 Bateas — {sorted.length}{sorted.length!==data.length?` de ${data.length}`:""} guías</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input className="fi" placeholder="🔍 Buscar conductor, guía, tracto, batea..." value={busq}
            onChange={e=>setBusq(e.target.value)} style={{width:290,padding:"7px 12px",fontSize:12}}/>
          {busq&&<button className="btn-s" onClick={()=>setBusq("")} style={{padding:"6px 10px",fontSize:12}}>✕</button>}
          <button className="btn-s" onClick={()=>exportCSV("batea")}>↓ Exportar XLSX</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        {[
          {l:"Total viajes",v:sorted.length,c:"#1a3fa4"},
          {l:"Tonelaje neto",v:netoFiltrado.toFixed(2)+" t",c:"#c0001a"},
          {l:"Prom / viaje",v:sorted.length?(netoFiltrado/sorted.length).toFixed(2)+" t":"0 t",c:"#0284c7"},
          {l:"Peajes totales",v:clp(sorted.reduce((s,r)=>s+Number(r.peajes||0),0)),c:"#64748b"},
        ].map(({l,v,c})=>(
          <div key={l} className="mc">
            <div className="mc-lbl">{l}</div>
            <div className="mc-val" style={{color:c,fontSize:22}}>{v}</div>
          </div>
        ))}
      </div>
      {sortCol&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"#e6ebf7",borderRadius:8,fontSize:12,color:"#1a3fa4",fontWeight:500}}>
          <span>Ordenado por: <strong>{cols.find(c=>c.k===sortCol)?.l}</strong> {sortDir==="asc"?"↑ (menor a mayor)":"↓ (mayor a menor)"}</span>
          <button onClick={()=>{setSortCol(null);setSortDir("desc");}} style={{background:"none",border:"none",cursor:"pointer",color:"#c0001a",fontSize:13,fontWeight:700,padding:"0 4px"}}>✕ Quitar orden</button>
        </div>
      )}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="tbl-wrap" style={{borderRadius:0,border:"none",maxHeight:520}}>
          <table className="tbl-v">
            <thead><tr>
              <th style={{cursor:"default"}}>#</th>
              {cols.map(c=>(
                <th key={c.k} onClick={()=>toggleSort(c.k)}
                  style={{cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",
                    background:sortCol===c.k?"#fce8eb":"",color:sortCol===c.k?"#c0001a":""}}>
                  {c.l}<SortIcon k={c.k}/>
                </th>
              ))}
              <th>Revisado</th>
            </tr></thead>
            <tbody>
              {sorted.map((r,i)=>{
                const dif=Number(r.difPuerto||0);
                return(
                  <tr key={i}>
                    <td style={{color:"#94a3b8",fontWeight:500}}>{i+1}</td>
                    <td>{excelToDate(r.fecha)}</td>
                    <td style={{color:"#1a3fa4",fontWeight:600}}>{r.guia}</td>
                    <td style={{fontWeight:500}}>{r.tracto}</td>
                    <td style={{fontWeight:500}}>{r.batea}</td>
                    <td style={{color:"#1e293b",fontWeight:500}}>{r.conductor}</td>
                    <td style={{textAlign:"right"}}>{n2(r.bruto)}</td>
                    <td style={{textAlign:"right"}}>{n2(r.tara)}</td>
                    <td style={{textAlign:"right",fontWeight:700,color:"#1e293b"}}>{n2(r.neto)}</td>
                    <td>{r.ticket}</td>
                    <td style={{textAlign:"right",fontWeight:500}}>{n2(r.netoPuerto)}</td>
                    <td style={{textAlign:"right"}} className={dif<-0.05?"dif-neg":dif>0.05?"dif-pos":"dif-zer"}>{n3(dif)}</td>
                    <td style={{textAlign:"right"}}>{clp(r.peajes)}</td>
                    <td style={{color:"#94a3b8"}}>{r.supervisor}</td>
                    <td style={{color:"#94a3b8"}}>{r.revisadoPor}</td>
                  </tr>
                );
              })}
              {!sorted.length&&<tr><td colSpan={15} style={{textAlign:"center",padding:40,color:"#94a3b8"}}>
                {busq?"No hay resultados para esa búsqueda":"Sin guías en el período"}
              </td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* CONFIGURACIÓN */
function Cfg({config,saveConf,scriptUrl,setSU,periodo,setP}){
  const [loc,setLoc]=useState({...config});
  const [nv,setNv]=useState({});
  const campos=[["conductoresBatea","Conductores Batea"],["conductoresRampla","Conductores Rampla"],["tractosRampla","Tractos Rampla"],["ramplas","Ramplas (PPU)"],["tractosBatea","Tractos Batea"],["bateas","Bateas (PPU)"],["supervisores","Supervisores"],["equiposRampla","Equipos"]];
  const [newDstR,setNewDstR]=useState({nombre:"",peaje:""});
  const [newDstB,setNewDstB]=useState({nombre:"",peaje:""});
  const addDst=(tipo,val,setter)=>{
    if(!val.nombre.trim()||!val.peaje)return;
    const key=tipo==="rampla"?"destinosRampla":"destinosBatea";
    if(!loc[key].find(d=>d.nombre===val.nombre.toUpperCase()))
      setLoc(p=>({...p,[key]:[...p[key],{nombre:val.nombre.toUpperCase(),peaje:Number(val.peaje)}]}));
    setter({nombre:"",peaje:""});
  };
  const rmDst=(key,nombre)=>setLoc(p=>({...p,[key]:p[key].filter(d=>d.nombre!==nombre)}));
  const add=(k)=>{const v=(nv[k]||"").trim().toUpperCase();if(!v)return;if(!loc[k].includes(v))setLoc(p=>({...p,[k]:[...p[k],v]}));setNv(p=>({...p,[k]:""}));};
  const rm=(k,v)=>setLoc(p=>({...p,[k]:p[k].filter(x=>x!==v)}));
  return(
    <div style={{display:"grid",gap:16}}>
      <div className="card">
        <div className="section-lbl">Conexión Google Sheets</div>
        <input className="fi" placeholder="https://script.google.com/macros/s/..." value={scriptUrl} onChange={e=>setSU(e.target.value)}/>
      </div>
      <div className="card">
        <div className="section-lbl">Período activo</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:6}}>Desde (día 26)</label><input type="date" className="fi" value={periodo.desde} onChange={e=>setP({...periodo,desde:e.target.value})}/></div>
          <div><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:6}}>Hasta (día 25)</label><input type="date" className="fi" value={periodo.hasta} onChange={e=>setP({...periodo,hasta:e.target.value})}/></div>
        </div>
      </div>
      <div className="card">
        <div className="section-lbl">Valores por defecto</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
          {[["viatico","Viático Rampla $"],["peajeRampla","Peaje Rampla $"],["peajeBatea","Peaje Batea $"],["origenRampla","Origen Rampla"],["destinoRampla","Destino Rampla"],["productoRampla","Producto"],["origenBatea","Origen Batea"],["destinoBatea","Destino Batea"]].map(([k,l])=>(
            <div key={k}><label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:6}}>{l}</label><input className="fi" value={loc[k]} onChange={e=>setLoc(p=>({...p,[k]:e.target.value}))}/></div>
          ))}
        </div>
      </div>
      {campos.map(([key,title])=>(
        <div key={key} className="card">
          <div className="section-lbl">{title}</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input className="fi" style={{flex:1}} placeholder="Agregar..." value={nv[key]||""} onChange={e=>setNv(p=>({...p,[key]:e.target.value.toUpperCase()}))} onKeyDown={e=>e.key==="Enter"&&add(key)}/>
            <button className="btn-p" onClick={()=>add(key)} style={{padding:"9px 16px"}}>＋</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {loc[key].map(item=><span key={item} className="tag-item">{item}<button onClick={()=>rm(key,item)}>×</button></span>)}
          </div>
        </div>
      ))}
      {/* DESTINOS RAMPLA */}
      <div className="card">
        <div className="section-lbl">Destinos Rampla — con peaje</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 140px auto",gap:8,marginBottom:12,alignItems:"end"}}>
          <div>
            <label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:4}}>Nombre destino</label>
            <input className="fi" placeholder="Ej: ANGAMOS" value={newDstR.nombre}
              onChange={e=>setNewDstR(p=>({...p,nombre:e.target.value.toUpperCase()}))}/>
          </div>
          <div>
            <label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:4}}>Peaje $</label>
            <input className="fi" type="number" placeholder="41600" value={newDstR.peaje}
              onChange={e=>setNewDstR(p=>({...p,peaje:e.target.value}))}/>
          </div>
          <button className="btn-p" onClick={()=>addDst("rampla",newDstR,setNewDstR)} style={{padding:"9px 14px"}}>＋</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {(loc.destinosRampla||[]).map(d=>(
            <div key={d.nombre} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"#e6ebf7",border:"1px solid #c0d0f0",borderRadius:8}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"#1a3fa4"}}>{d.nombre}</div>
                <div style={{fontSize:11,color:"#64748b"}}>${Number(d.peaje).toLocaleString("es-CL")}</div>
              </div>
              <button onClick={()=>rmDst("destinosRampla",d.nombre)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:14}}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* DESTINOS BATEA */}
      <div className="card">
        <div className="section-lbl">Destinos Batea — con peaje</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 140px auto",gap:8,marginBottom:12,alignItems:"end"}}>
          <div>
            <label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:4}}>Nombre destino</label>
            <input className="fi" placeholder="Ej: TOTORALILLO" value={newDstB.nombre}
              onChange={e=>setNewDstB(p=>({...p,nombre:e.target.value.toUpperCase()}))}/>
          </div>
          <div>
            <label style={{fontSize:12,color:"#64748b",fontWeight:500,display:"block",marginBottom:4}}>Peaje $</label>
            <input className="fi" type="number" placeholder="13800" value={newDstB.peaje}
              onChange={e=>setNewDstB(p=>({...p,peaje:e.target.value}))}/>
          </div>
          <button className="btn-p" onClick={()=>addDst("batea",newDstB,setNewDstB)} style={{padding:"9px 14px"}}>＋</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {(loc.destinosBatea||[]).map(d=>(
            <div key={d.nombre} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"#fce8eb",border:"1px solid #f0c0c8",borderRadius:8}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"#c0001a"}}>{d.nombre}</div>
                <div style={{fontSize:11,color:"#64748b"}}>${Number(d.peaje).toLocaleString("es-CL")}</div>
              </div>
              <button onClick={()=>rmDst("destinosBatea",d.nombre)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:14}}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button className="btn-p" onClick={()=>saveConf(loc)}>💾 Guardar configuración</button>
      </div>
    </div>
  );
}

/* INFORMES */
function Informes({ramplas,bateas,periodo,clp,exportCSV,totalNeto}){
  const [subtab,setSubtab]=useState(0);
  const byKey=(arr,key,nk)=>{const m={};arr.forEach(r=>{const k=r[key]||"Sin asignar";if(!m[k])m[k]={c:0,n:0,tot:0,peajes:0};m[k].c++;m[k].n+=Number(r[nk]||0);m[k].tot+=Number(r.viatico||0)+Number(r.peajes||0);m[k].peajes+=Number(r.peajes||0);});return m;};
  const bCond=Object.entries(byKey(bateas,"conductor","neto")).sort((a,b)=>b[1].n-a[1].n);
  const rCond=Object.entries(byKey(ramplas,"conductor","neto")).sort((a,b)=>b[1].c-a[1].c);
  const rEquipo=Object.entries(byKey(ramplas,"tracto","neto")).sort((a,b)=>b[1].c-a[1].c);
  const maxRcond=rCond[0]?.[1]?.c||1,maxRequip=rEquipo[0]?.[1]?.c||1;

  // Ranking combinado TRACTO+BATEA (la unidad real de transporte)
  const bUnidad=(()=>{
    const m={};
    bateas.forEach(r=>{
      const k=`${r.tracto||"?"} + ${r.batea||"?"}`;
      if(!m[k])m[k]={tracto:r.tracto,batea:r.batea,c:0,n:0,peajes:0};
      m[k].c++; m[k].n+=Number(r.neto||0); m[k].peajes+=Number(r.peajes||0);
    });
    return Object.entries(m).sort((a,b)=>b[1].n-a[1].n);
  })();
  const maxBcond=bCond[0]?.[1]?.n||1;
  const maxBunidad=bUnidad[0]?.[1]?.n||1;
  const byFecha=(arr,nk)=>Object.entries(arr.reduce((m,r)=>{const f=r.fecha||0;if(!m[f])m[f]={c:0,n:0};m[f].c++;m[f].n+=Number(r[nk]||0);return m;},{})).sort();
  const medal=(i)=>i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}°`;

  const RankBar=({label,val,valLabel,sub,max,col,pos})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
      <div style={{width:28,textAlign:"center",fontSize:pos<3?16:12,fontWeight:700,color:pos<3?["#f59e0b","#94a3b8","#cd7c3c"][pos]:"#cbd5e1",flexShrink:0}}>{medal(pos)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"baseline"}}>
          <span style={{fontSize:12,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{label}</span>
          <span style={{fontSize:13,fontWeight:700,color:col,flexShrink:0}}>{valLabel}</span>
        </div>
        <div style={{height:5,background:"#f1f5f9",borderRadius:3}}>
          <div style={{height:5,borderRadius:3,width:`${(val/max)*100}%`,transition:"width 0.5s",background:pos===0?`linear-gradient(90deg,${col},#fbbf24)`:pos===1?`linear-gradient(90deg,${col},${col}88)`:`linear-gradient(90deg,${col}88,${col}44)`}}/>
        </div>
        <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{sub}</div>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20,justifyContent:"space-between",alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,background:"#fff",borderRadius:12,padding:5,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
          {["🏆 Rankings","📅 Por fecha","📋 Resumen"].map((l,i)=>(
            <button key={i} onClick={()=>setSubtab(i)} style={{background:subtab===i?"linear-gradient(135deg,#1a3fa4,#1a3fa4)":"none",color:subtab===i?"#fff":"#64748b",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.2s",boxShadow:subtab===i?"0 2px 8px rgba(26,63,164,0.25)":"none"}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-s" onClick={()=>exportCSV("rampla")} style={{fontSize:12}}>↓ XLSX Ramplas</button>
          <button className="btn-s" onClick={()=>exportCSV("batea")} style={{fontSize:12}}>↓ XLSX Bateas</button>
          <button className="btn-s" onClick={()=>window.print()} style={{fontSize:12}}>🖨 PDF</button>
        </div>
      </div>

      {subtab===0&&(
        <div style={{display:"grid",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {[
              {l:"Top conductor bateas",v:bCond[0]?bCond[0][0].split(" ").slice(0,2).join(" "):"—",s:bCond[0]?bCond[0][1].n.toFixed(1)+" t":"",c:"#1a3fa4"},
              {l:"Top unidad tracto+batea",v:bUnidad[0]?bUnidad[0][1].tracto+" / "+bUnidad[0][1].batea:"—",s:bUnidad[0]?bUnidad[0][1].n.toFixed(1)+" t":"",c:"#c0001a"},
              {l:"Top conductor ramplas",v:rCond[0]?rCond[0][0].split(" ").slice(0,2).join(" "):"—",s:rCond[0]?rCond[0][1].c+" vueltas":"",c:"#1a3fa4"},
              {l:"Unidades activas",v:bUnidad.length+rEquipo.length,s:"duplas en operación",c:"#0284c7"},
            ].map(({l,v,s,c})=>(
              <div key={l} className="mc">
                <div className="mc-lbl">{l}</div>
                <div style={{fontSize:16,fontWeight:700,color:c,margin:"6px 0 2px",letterSpacing:"-0.3px"}}>{v}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            <div className="card">
              <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:4}}>🚛 Conductores — Tonelaje</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>Ranking por neto transportado (t)</div>
              {bCond.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:20,fontSize:12}}>Sin datos</div>}
              {bCond.map(([c,v],i)=><RankBar key={c} pos={i} label={c} val={v.n} valLabel={v.n.toFixed(2)+" t"} sub={v.c+" viajes"} max={maxBcond} col="#1a3fa4"/>)}
              {bCond.length>0&&<div style={{paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:"#1e293b"}}><span>TOTAL</span><span style={{color:"#1a3fa4"}}>{totalNeto.toFixed(2)} t</span></div>}
            </div>
            <div className="card" style={{gridColumn:"span 2"}}>
              <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:4}}>🚛 Unidades de transporte — Tracto + Batea</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>Ranking por neto transportado · la dupla que más carga mueve</div>
              {bUnidad.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:20,fontSize:12}}>Sin datos</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 24px"}}>
                {bUnidad.map(([key,v],i)=>(
                  <div key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <div style={{width:28,textAlign:"center",fontSize:i<3?15:11,fontWeight:700,color:i<3?["#f59e0b","#94a3b8","#cd7c3c"][i]:"#cbd5e1",flexShrink:0}}>{medal(i)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,alignItems:"baseline"}}>
                        <div style={{minWidth:0}}>
                          <span style={{fontSize:11,fontWeight:600,color:"#1e293b",display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.tracto}</span>
                          <span style={{fontSize:10,color:"#94a3b8"}}>{v.batea}</span>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:"#c0001a",flexShrink:0,marginLeft:8}}>{v.n.toFixed(2)} t</span>
                      </div>
                      <div style={{height:4,background:"#f1f5f9",borderRadius:2}}>
                        <div style={{height:4,borderRadius:2,width:`${(v.n/maxBunidad)*100}%`,background:i===0?"linear-gradient(90deg,#c0001a,#f59e0b)":i===1?"linear-gradient(90deg,#1a3fa4,#4a6fd4)":"linear-gradient(90deg,#4a6fd488,#4a6fd444)"}}/>
                      </div>
                      <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{v.c} viajes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="card">
              <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:4}}>🚛 Conductores Rampla — Vueltas</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>Ranking por cantidad de vueltas realizadas</div>
              {rCond.length===0&&<div style={{textAlign:"center",color:"#94a3b8",padding:20,fontSize:12}}>Sin datos</div>}
              {rCond.map(([c,v],i)=><RankBar key={c} pos={i} label={c} val={v.c} valLabel={v.c+" vueltas"} sub={clp(v.tot)} max={maxRcond} col="#1a3fa4"/>)}
              {rCond.length>0&&<div style={{paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:"#1e293b"}}><span>TOTAL</span><span style={{color:"#1a3fa4"}}>{ramplas.length} vueltas</span></div>}
            </div>
            <div className="card">
              <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:4}}>🔩 Unidades Rampla — Tracto + Rampla</div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:14}}>Ranking por vueltas realizadas como dupla</div>
              {(()=>{
                const m={};
                ramplas.forEach(r=>{
                  const k=`${r.tracto||"?"} + ${r.rampla||"?"}`;
                  if(!m[k])m[k]={tracto:r.tracto,rampla:r.rampla,c:0,tot:0};
                  m[k].c++; m[k].tot+=Number(r.viatico||0)+Number(r.peajes||0);
                });
                const sorted=Object.entries(m).sort((a,b)=>b[1].c-a[1].c);
                const maxV=sorted[0]?.[1]?.c||1;
                if(!sorted.length) return <div style={{textAlign:"center",color:"#94a3b8",padding:20,fontSize:12}}>Sin datos</div>;
                return sorted.map(([key,v],i)=>(
                  <div key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <div style={{width:28,textAlign:"center",fontSize:i<3?15:11,fontWeight:700,color:i<3?["#f59e0b","#94a3b8","#cd7c3c"][i]:"#cbd5e1",flexShrink:0}}>{medal(i)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <div><span style={{fontSize:11,fontWeight:600,color:"#1e293b",display:"block"}}>{v.tracto}</span><span style={{fontSize:10,color:"#94a3b8"}}>{v.rampla}</span></div>
                        <span style={{fontSize:12,fontWeight:700,color:"#1a3fa4"}}>{v.c} vueltas</span>
                      </div>
                      <div style={{height:4,background:"#f1f5f9",borderRadius:2}}>
                        <div style={{height:4,borderRadius:2,width:`${(v.c/maxV)*100}%`,background:i===0?"linear-gradient(90deg,#1a3fa4,#f59e0b)":"#4a6fd4"}}/>
                      </div>
                      <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{clp(v.tot)}</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {subtab===1&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[["b","🚛 Bateas por fecha",bateas,"#1a3fa4",true],["r","🚛 Ramplas por fecha",ramplas,"#1a3fa4",false]].map(([key,title,data,col,showN])=>{
            const bd=byFecha(data,"neto");
            const totalC=bd.reduce((s,[,v])=>s+v.c,0),totalN=bd.reduce((s,[,v])=>s+v.n,0);
            return(
              <div key={key} className="card">
                <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:14}}>{title}</div>
                <table className="tbl-v">
                  <thead><tr><th>Fecha</th><th style={{textAlign:"right"}}>Servicios</th>{showN&&<th style={{textAlign:"right"}}>Neto (t)</th>}{showN&&<th style={{textAlign:"right"}}>% total</th>}</tr></thead>
                  <tbody>
                    {bd.map(([f,v])=>{const d=new Date(1899,11,30);d.setDate(d.getDate()+Number(f));return(
                      <tr key={f}>
                        <td style={{fontWeight:500}}>{d.toLocaleDateString("es-CL")}</td>
                        <td style={{textAlign:"right",fontWeight:600,color:col}}>{v.c}</td>
                        {showN&&<td style={{textAlign:"right",fontWeight:600,color:"#1a3fa4"}}>{v.n.toFixed(2)}</td>}
                        {showN&&<td style={{textAlign:"right",color:"#94a3b8"}}>{totalN>0?((v.n/totalN)*100).toFixed(1)+"%":"—"}</td>}
                      </tr>
                    );})
                    }
                    {!bd.length&&<tr><td colSpan={4} style={{textAlign:"center",color:"#94a3b8",padding:20,fontSize:12}}>Sin datos</td></tr>}
                    {bd.length>0&&<tr style={{background:"#f8fafc",fontWeight:700}}><td style={{color:"#1e293b"}}>TOTAL</td><td style={{textAlign:"right",color:col}}>{totalC}</td>{showN&&<td style={{textAlign:"right",color:"#1a3fa4"}}>{totalN.toFixed(2)}</td>}{showN&&<td style={{textAlign:"right",color:"#94a3b8"}}>100%</td>}</tr>}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {subtab===2&&(
        <div style={{display:"grid",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {l:"Total guías bateas",v:bateas.length,c:"#1a3fa4"},
              {l:"Total tonelaje neto",v:totalNeto.toFixed(2)+" t",c:"#c0001a"},
              {l:"Promedio por viaje",v:bateas.length?(totalNeto/bateas.length).toFixed(2)+" t":"0 t",c:"#c0001a"},
              {l:"Total guías rampla",v:ramplas.length,c:"#1a3fa4"},
              {l:"Total viáticos",v:clp(ramplas.reduce((s,r)=>s+Number(r.viatico||0),0)),c:"#1a3fa4"},
              {l:"Total peajes (ambos)",v:clp([...ramplas,...bateas].reduce((s,r)=>s+Number(r.peajes||0),0)),c:"#0284c7"},
            ].map(({l,v,c})=>(
              <div key={l} className="mc"><div className="mc-lbl">{l}</div><div style={{fontSize:20,fontWeight:700,color:c,margin:"6px 0 0",letterSpacing:"-0.3px"}}>{v}</div></div>
            ))}
          </div>
          <div className="card">
            <div style={{fontWeight:700,fontSize:13,color:"#1e293b",marginBottom:14}}>📋 Resumen completo por conductor — Bateas</div>
            <table className="tbl-v">
              <thead><tr><th>#</th><th>Conductor</th><th style={{textAlign:"right"}}>Viajes</th><th style={{textAlign:"right"}}>Bruto prom</th><th style={{textAlign:"right"}}>Neto total (t)</th><th style={{textAlign:"right"}}>Neto prom (t)</th><th style={{textAlign:"right"}}>Neto Pto (t)</th><th style={{textAlign:"right"}}>Dif prom (t)</th><th style={{textAlign:"right"}}>Peajes</th><th style={{textAlign:"right"}}>% total</th></tr></thead>
              <tbody>
                {bCond.map(([cond,],i)=>{
                  const vj=bateas.filter(r=>r.conductor===cond);
                  const neto=vj.reduce((s,r)=>s+Number(r.neto||0),0);
                  const netoPto=vj.reduce((s,r)=>s+Number(r.netoPuerto||0),0);
                  const bruto=vj.reduce((s,r)=>s+Number(r.bruto||0),0);
                  const peajes=vj.reduce((s,r)=>s+Number(r.peajes||0),0);
                  const dif=netoPto-neto;
                  return(
                    <tr key={cond}>
                      <td style={{color:"#94a3b8",fontWeight:600}}>{medal(i)}</td>
                      <td style={{fontWeight:600,color:"#1e293b"}}>{cond}</td>
                      <td style={{textAlign:"right",color:"#1a3fa4",fontWeight:600}}>{vj.length}</td>
                      <td style={{textAlign:"right"}}>{vj.length?(bruto/vj.length).toFixed(2):"—"}</td>
                      <td style={{textAlign:"right",fontWeight:700,color:"#c0001a"}}>{neto.toFixed(2)}</td>
                      <td style={{textAlign:"right"}}>{vj.length?(neto/vj.length).toFixed(2):"—"}</td>
                      <td style={{textAlign:"right"}}>{netoPto.toFixed(2)}</td>
                      <td style={{textAlign:"right",color:dif<-0.1?"#ef4444":dif>0.1?"#10b981":"#94a3b8",fontWeight:600}}>{dif.toFixed(3)}</td>
                      <td style={{textAlign:"right"}}>{clp(peajes)}</td>
                      <td style={{textAlign:"right",color:"#94a3b8"}}>{totalNeto>0?((neto/totalNeto)*100).toFixed(1)+"%":"—"}</td>
                    </tr>
                  );
                })}
                {bCond.length===0&&<tr><td colSpan={10} style={{textAlign:"center",color:"#94a3b8",padding:24}}>Sin datos</td></tr>}
                {bCond.length>0&&(
                  <tr style={{background:"#f8fafc",fontWeight:700,color:"#1e293b"}}>
                    <td></td><td>TOTAL</td>
                    <td style={{textAlign:"right",color:"#1a3fa4"}}>{bateas.length}</td><td></td>
                    <td style={{textAlign:"right",color:"#c0001a"}}>{totalNeto.toFixed(2)}</td>
                    <td style={{textAlign:"right"}}>{bateas.length?(totalNeto/bateas.length).toFixed(2):"—"}</td>
                    <td style={{textAlign:"right"}}>{bateas.reduce((s,r)=>s+Number(r.netoPuerto||0),0).toFixed(2)}</td>
                    <td></td>
                    <td style={{textAlign:"right"}}>{clp(bateas.reduce((s,r)=>s+Number(r.peajes||0),0))}</td>
                    <td style={{textAlign:"right"}}>100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
