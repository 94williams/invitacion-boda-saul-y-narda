"use client";
import { useEffect, useRef, useState } from "react";
import SoftText from "./SoftText";
import SectionIllustration from "./SectionIllustration";
import useInvitationMotion from "./useInvitationMotion";
import { ArrowDown, ArrowRight, CalendarDays, Check, ChevronRight, Church, Gift, Heart, Mail, MapPin, Music2, Pause, Share2, Sparkles, Wine, X } from "lucide-react";
type Settings = { eventDate: string; ceremonyTime: string; receptionTime: string; venueName: string; address: string; mapsUrl: string; audioUrl: string; giftRegistryName: string; giftRegistryUrl: string };
const blank: Settings = { eventDate: "2026-10-31", ceremonyTime: "", receptionTime: "", venueName: "Casa de los Padrinos", address: "", mapsUrl: "https://www.google.com/maps?q=19.291965,-98.853241", audioUrl: "", giftRegistryName: "", giftRegistryUrl: "" };
function Monogram() { return <span className="monogram" aria-label="Narda y Saúl"><span>N</span><i>&</i><span>S</span></span>; }
const weddingDate = (value:string) => new Date(value + (value.length===10 ? "T00:00:00-06:00" : /[Zz]|[+-]\d{2}:\d{2}$/.test(value) ? "" : "-06:00"));
export default function Invitation({previewOnly=false}:{previewOnly?:boolean}={}) {
 const [settings,setSettings] = useState<Settings>(blank), [welcome,setWelcome] = useState(true), [music,setMusic] = useState(false), [toast,setToast] = useState(""), [remaining,setRemaining] = useState([0,0,0,0]), [attendance,setAttendance] = useState("yes"), [sending,setSending] = useState(false), [sent,setSent] = useState(false), [error,setError] = useState("");
 const audio = useRef<HTMLAudioElement>(null);
 const guestToken = useRef("");
 const [opening,setOpening] = useState(false);
 const [introResolved,setIntroResolved] = useState(false);
 const openingLock = useRef(false);
 const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const welcomeRef = useRef<HTMLDivElement>(null);
 const heroTitleRef = useRef<HTMLHeadingElement>(null);
 useInvitationMotion(introResolved && !welcome);
 const safeRead = (storage: "localStorage" | "sessionStorage", key:string) => {try{return window[storage].getItem(key)}catch{return null}};
 const safeWrite = (storage: "localStorage" | "sessionStorage", key:string,value:string) => {try{window[storage].setItem(key,value)}catch{}};
 useEffect(()=>{
  const controller = new AbortController();
  if(!previewOnly)fetch("/api/settings", {signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<Settings>}).then(s=>setSettings({...blank,...s})).catch(()=>{});
  setWelcome(!safeRead("sessionStorage","ns-opened"));
  setIntroResolved(true);
  return()=>{controller.abort();if(openingTimer.current)clearTimeout(openingTimer.current)};
 },[previewOnly]);
 useEffect(()=>{
  if(!welcome)return;
  const dialog=welcomeRef.current;
  function trapFocus(event:KeyboardEvent){
   if(event.key!=="Tab")return;
   const buttons=Array.from(dialog?.querySelectorAll<HTMLButtonElement>("button:not([disabled])")||[]);
   if(!buttons.length){event.preventDefault();return}
   const first=buttons[0],last=buttons[buttons.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
  document.addEventListener("keydown",trapFocus);
  return()=>document.removeEventListener("keydown",trapFocus);
 },[welcome]);
 useEffect(()=>{document.body.style.overflow=welcome?"hidden":"";return()=>{document.body.style.overflow=""}},[welcome]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),5000);return()=>clearTimeout(t)},[toast]);
 useEffect(()=>{if(!settings.eventDate)return;const tick=()=>{const ms=Math.max(0,weddingDate(settings.eventDate).getTime()-Date.now());setRemaining([Math.floor(ms/86400000),Math.floor(ms/3600000)%24,Math.floor(ms/60000)%60,Math.floor(ms/1000)%60])};tick();const t=setInterval(tick,1000);return()=>clearInterval(t)},[settings.eventDate]);
 async function toggleMusic(){if(!settings.audioUrl){setToast("Nuestra canción estará disponible muy pronto.");return}if(!audio.current)return;if(music){audio.current.pause();setMusic(false)}else{try{await audio.current.play();setMusic(true)}catch{setToast("No se pudo reproducir la canción. Inténtalo de nuevo.")}}}
 function openInvitation(withMusic:boolean){
  if(openingLock.current)return;
  openingLock.current=true;
  setOpening(true);
  window.scrollTo({top:0,behavior:"instant"});
  if(withMusic&&settings.audioUrl&&!music)void toggleMusic();
  const finish=()=>{
   safeWrite("sessionStorage","ns-opened","1");setWelcome(false);setOpening(false);openingLock.current=false;
   requestAnimationFrame(()=>heroTitleRef.current?.focus({preventScroll:true}));
  };
  openingTimer.current=setTimeout(finish,matchMedia("(prefers-reduced-motion: reduce)").matches?0:1900);
 }
 function replayOpening(){openingLock.current=false;setOpening(false);setWelcome(true)}
 async function share(){try{if(navigator.share)await navigator.share({title:"Narda & Saúl · Nuestra boda",text:"Nos encantaría compartir este día contigo.",url:location.origin+location.pathname});else{await navigator.clipboard.writeText(location.origin+location.pathname);setToast("Enlace copiado. Compártelo con alguien especial.")}}catch(err){if((err as Error).name!=="AbortError")setToast("Comparte la invitación copiando el enlace del navegador.")}}
 function calendar(){
  if(!settings.eventDate)return;
  const date=weddingDate(settings.eventDate),stamp=(d:Date)=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),escape=(s:string)=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
  const dateOnly=settings.eventDate.length===10;
  const nextDay=new Date(Date.UTC(Number(settings.eventDate.slice(0,4)),Number(settings.eventDate.slice(5,7))-1,Number(settings.eventDate.slice(8,10))+1)).toISOString().slice(0,10).replace(/-/g,"");
  const eventDates=dateOnly?[`DTSTART;VALUE=DATE:${settings.eventDate.replace(/-/g,"")}`,`DTEND;VALUE=DATE:${nextDay}`]:[`DTSTART:${stamp(date)}`];
  const content=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Narda y Saul//Boda//ES","BEGIN:VEVENT","UID:narda-saul-wedding@invitation",`DTSTAMP:${stamp(new Date())}`,...eventDates,"SUMMARY:Boda de Narda y Saúl",`LOCATION:${escape([settings.venueName,settings.address].filter(Boolean).join(", "))}`,`DESCRIPTION:${dateOnly?"Hora por confirmar. ":""}Celebremos juntos. ${escape(settings.mapsUrl)}`,"END:VEVENT","END:VCALENDAR"].join("\r\n");
  const url=URL.createObjectURL(new Blob([content],{type:"text/calendar;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download="Boda-Narda-y-Saul.ics";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 async function submitRSVP(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setError("");if(previewOnly){setError("La confirmación aún no está habilitada en esta vista previa. No se ha guardado ninguna respuesta.");return}setSending(true);const fields=new FormData(event.currentTarget);try{let token=guestToken.current||safeRead("localStorage","ns-rsvp-token");if(!token){token=crypto.randomUUID()+crypto.randomUUID();safeWrite("localStorage","ns-rsvp-token",token)}guestToken.current=token;const response=await fetch("/api/rsvp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:fields.get("name"),attendance,guests:attendance==="yes"?Number(fields.get("guests")):0,notes:fields.get("notes"),token})});const result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error||"No pudimos guardar tu respuesta. Inténtalo de nuevo.");setSent(true)}catch(err){setError((err as Error).message||"Revisa tu conexión e inténtalo de nuevo.")}finally{setSending(false)}}
 const dateLabel=settings.eventDate?weddingDate(settings.eventDate).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric",timeZone:"America/Mexico_City"}):"Fecha por confirmar";
 return <>
 <div className="invitation-content" inert={welcome} aria-hidden={welcome || undefined}>
 <a className="skip-link" href="#inicio">Ir a la invitación</a>
 <header className="site-header"><a href="#inicio" className="brand" aria-label="Inicio"><Monogram/><span>{previewOnly?"VISTA PREVIA":"NUESTRA BODA"}</span></a><nav aria-label="Navegación principal"><a href="#historia">Nuestra historia</a><a href="#dia">El gran día</a><a href="#detalles">Los detalles</a></nav><a className="header-rsvp" href="#confirmar">Confirmar asistencia <ArrowRight size={15}/></a></header>
 <main id="inicio">
 <section className="hero" aria-labelledby="hero-title"><div className="hero-image" aria-hidden="true"/><div className="hero-copy"><p className="eyebrow">CON EL CORAZÓN LLENO DE AMOR</p><h1 id="hero-title" tabIndex={-1} ref={heroTitleRef}><span className="name-word"><SoftText text="Narda"/></span> <span>&</span> <span className="name-word"><SoftText text="Saúl"/></span></h1><div className="hero-rule"><span/><Heart size={13} strokeWidth={1.1}/><span/></div><p className="hero-subtitle">Elegimos para siempre.<br/>Y queremos celebrarlo contigo.</p><p className="hero-date">{dateLabel}</p></div><div className="hero-bottom"><span>EL COMIENZO DE NUESTRO PARA SIEMPRE</span><a href="#historia" aria-label="Descubrir la invitación"><ArrowDown size={17} strokeWidth={1}/></a><span>HECHO CON AMOR, PARA TI</span></div></section>
 <section id="historia" className="story section-shell reveal"><div><p className="eyebrow section-no">01 / NUESTRA HISTORIA</p><SectionIllustration kind="story"/><h2><SoftText text="El mejor lugar es"/><br/><em><SoftText text="a tu lado."/></em></h2></div><div className="story-copy"><span className="tiny-star">✧</span><p>Hay momentos que se vuelven eternos.<br/>Y personas que se convierten en hogar.</p><p>Hoy elegimos caminar juntos y escribir un nuevo capítulo. Nos haría muy felices que formaras parte de él.</p><p className="signature">Con amor, Narda y Saúl</p></div></section>
 <section id="dia" className="day-section reveal"><p className="eyebrow">02 / EL GRAN DÍA</p><SectionIllustration kind="day"/><h2><SoftText text="Un sí."/> <em><SoftText text="Para siempre."/></em></h2><p className="section-intro">Cada vez falta menos para celebrar juntos.</p><div className="countdown" aria-label={settings.eventDate?"Cuenta regresiva a nuestra boda":"Cuenta regresiva pendiente de la fecha"}>{["DÍAS","HORAS","MINUTOS","SEGUNDOS"].map((label,i)=><div key={label}><strong>{settings.eventDate?String(remaining[i]).padStart(2,"0"):"—"}</strong><span>{label}</span></div>)}</div><p className="date-note"><CalendarDays size={15}/>{settings.eventDate?dateLabel:"Pronto compartiremos contigo nuestra fecha"}</p>{settings.eventDate&&<button className="text-button" onClick={calendar}>Guardar en mi calendario <ArrowRight size={14}/></button>}<div className="itinerary section-shell"><div className="section-caption"><span className="eyebrow">ASÍ LO CELEBRAREMOS</span><span>Momentos para recordar</span></div><div className="itinerary-grid">{[{Icon:Church,number:"01",title:"La ceremonia",text:"El momento de decir sí.",time:settings.ceremonyTime},{Icon:Wine,number:"02",title:"La recepción",text:"Brindemos por lo que viene.",time:settings.receptionTime},{Icon:Sparkles,number:"03",title:"La celebración",text:"Que no nos falten los abrazos.",time:""}].map(({Icon,number,title,text,time})=><article key={number}><div className="itinerary-card-top"><span>{number}</span><Icon size={29} strokeWidth={1}/></div><h3>{title}</h3><p>{text}</p><span className="time-label">{time||"Horario por confirmar"}</span></article>)}</div></div></section>
 <section className="venue section-shell reveal" aria-labelledby="venue-title"><div className="venue-art" aria-hidden="true"><div className="venue-arch"><Monogram/><span>NUESTRO LUGAR FAVORITO<br/>SERÁ DONDE ESTEMOS JUNTOS</span></div><span className="venue-flower">✧</span></div><div className="venue-copy"><p className="eyebrow">03 / EL ENCUENTRO</p><SectionIllustration kind="venue"/><h2 id="venue-title"><SoftText text="Un lugar para"/><br/><em><SoftText text="hacer recuerdos."/></em></h2><p>Nuestros padrinos nos abren las puertas para compartir este día tan especial.</p><div className="venue-address"><MapPin size={20} strokeWidth={1.1}/><div><strong>{settings.venueName||"Lugar por confirmar"}</strong><p>{settings.address||(settings.mapsUrl?"Un encuentro lleno de amor, en un lugar con un significado especial. Consulta la ubicación en el mapa.":"Pronto te compartiremos la dirección y todos los detalles para llegar.")}</p></div></div>{settings.mapsUrl?<a className="button button-outline" href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">Cómo llegar <ArrowRight size={15}/></a>:<span className="pending-tag">DIRECCIÓN POR CONFIRMAR</span>}</div></section>
 <section className="interlude reveal"><span>DONDE HAY AMOR, TODO FLORECE.</span><blockquote>“Y entre todas las vidas,<br/><em>volvería a elegir la nuestra.”</em></blockquote><Heart size={20} strokeWidth={1}/></section>
 <section id="galeria" className="gallery section-shell reveal"><div className="gallery-heading"><div><p className="eyebrow">04 / LO QUE NOS UNE</p><SectionIllustration kind="gallery"/><h2><SoftText text="Pequeños instantes."/><br/><em><SoftText text="Un amor inmenso."/></em></h2></div><p>Un espacio para nuestros recuerdos.<br/>Pronto, nuestras fotos favoritas.</p></div><div className="gallery-grid"><div className="gallery-floral" role="img" aria-label="Rosas blancas sobre seda marfil"/><div className="gallery-paper"><Monogram/><span>NUESTRA HISTORIA<br/>CONTINÚA…</span><p>Aquí florecerán<br/>nuestros recuerdos.</p></div><div className="gallery-detail" role="img" aria-label="Flores blancas y tela de seda"/></div></section>
 <section id="detalles" className="details-section reveal"><div className="section-shell"><p className="eyebrow">05 / LOS PEQUEÑOS DETALLES</p><SectionIllustration kind="details"/><h2><SoftText text="Todo pensado"/> <em><SoftText text="con amor."/></em></h2><div className="details-grid"><article><span className="detail-symbol">♧</span><h3>Para vestir el momento</h3><p>Pronto compartiremos el código de vestimenta para este día tan especial.</p><span className="detail-small">DETALLES POR CONFIRMAR</span></article><article><Heart size={29} strokeWidth={1}/><h3>El mejor regalo</h3><p>Celebrar contigo será lo más especial. Cada detalle de cariño forma parte de nuestra historia.</p><span className="detail-small">TU PRESENCIA ES LO ESENCIAL</span></article><article><Music2 size={29} strokeWidth={1}/><h3>La banda sonora</h3><p>Un poco de música para acompañar nuestra historia y este momento contigo.</p><button className="text-button" onClick={toggleMusic}>{music?"Pausar nuestra canción":"Escuchar nuestra canción"}<ChevronRight size={14}/></button></article></div></div></section>

 <section id="regalos" className="gifts-section section-shell reveal" aria-labelledby="gifts-title"><div className="gifts-heading"><p className="eyebrow">06 / DETALLES QUE NACEN DEL CORAZÓN</p><SectionIllustration kind="gifts"/><h2 id="gifts-title"><SoftText text="Tu compañía es"/><br/><em><SoftText text="nuestro mejor regalo."/></em></h2><p>Lo más importante es celebrar contigo. Si deseas tener un detalle con nosotros,<br className="desktop-break"/> estas dos opciones serán recibidas con mucho cariño.</p></div><div className="gifts-grid"><article><div className="gift-icon"><Gift size={27} strokeWidth={1}/></div><span className="eyebrow">PARA NUESTRO NUEVO HOGAR</span><h3>Mesa de regalos</h3><p>Pequeños detalles para acompañar el comienzo de nuestra vida juntos.</p>{settings.giftRegistryUrl?<a className="button button-outline" href={settings.giftRegistryUrl} target="_blank" rel="noopener noreferrer">{settings.giftRegistryName||"Ver nuestra mesa"}<ArrowRight size={14}/></a>:<span className="gift-pending">Pronto compartiremos nuestra mesa de regalos</span>}</article><article><div className="gift-icon"><Mail size={27} strokeWidth={1}/></div><span className="eyebrow">PARA LOS SUEÑOS QUE VIENEN</span><h3>Un presente en sobre</h3><p>Si prefieres obsequiarnos una aportación en efectivo, puedes entregarla en un sobre el día de nuestra boda.</p><span className="envelope-note">Un gesto de cariño para nuestra nueva etapa.</span></article></div><p className="gifts-note"><Heart size={12} strokeWidth={1}/>Ambas opciones son voluntarias. Tu presencia es lo que más nos ilusiona.</p></section>
 <section id="confirmar" className="rsvp-section section-shell reveal"><div className="rsvp-copy"><p className="eyebrow">07 / NOS ENCANTARÍA VERTE</p><SectionIllustration kind="rsvp"/><h2><SoftText text="La celebración"/><br/><SoftText text="está completa"/><br/><em><SoftText text="contigo."/></em></h2><p>Confírmanos si podrás acompañarnos.<br/>Tu respuesta nos ayuda a preparar<br/>cada detalle con mucho cariño.</p><div className="rsvp-mini"><Heart size={15} strokeWidth={1.2}/><span>Una invitación hecha con el corazón</span></div></div><div className="rsvp-form-wrap">{previewOnly&&<div className="preview-rsvp-notice" role="note"><strong>VISTA PREVIA DE LA INVITACIÓN</strong><p>Muy pronto abriremos las confirmaciones. Por ahora, las respuestas de este formulario no se guardan.</p></div>}{sent?<div className="rsvp-success" role="status"><span className="success-circle"><Check size={28} strokeWidth={1.2}/></span><p className="eyebrow">RESPUESTA GUARDADA</p><h3>{attendance==="yes"?"¡Qué alegría contar contigo!":"Gracias por hacérnoslo saber."}</h3><p>{attendance==="yes"?"Tu confirmación ya forma parte de nuestra lista. Será un día aún más especial contigo.":"Te llevaremos con nosotros en este día tan especial."}</p><button className="text-button" onClick={()=>setSent(false)}>Actualizar mi respuesta <ArrowRight size={14}/></button></div>:<form onSubmit={submitRSVP}><h3>¿Nos acompañas?</h3><p className="form-intro">Reserva un lugar en nuestra historia.</p><label htmlFor="guest-name">Tu nombre completo <span>*</span></label><input id="guest-name" name="name" placeholder="Nombre y apellidos" required minLength={2} maxLength={100} autoComplete="name"/><fieldset><legend>¿Podrás asistir? <span>*</span></legend><div className="attendance-options"><label className={attendance==="yes"?"selected":""}><input type="radio" name="attendance" checked={attendance==="yes"} onChange={()=>setAttendance("yes")}/><Heart size={15}/>Sí, con mucho gusto</label><label className={attendance==="no"?"selected":""}><input type="radio" name="attendance" checked={attendance==="no"} onChange={()=>setAttendance("no")}/>No podré asistir</label></div></fieldset>{attendance==="yes"&&<><label htmlFor="guest-count">Personas que asistirán, incluyéndote</label><select id="guest-count" name="guests" defaultValue="1">{Array.from({length:8},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} {n===1?"persona":"personas"}</option>)}</select><p className="field-help">Considera únicamente a las personas incluidas en tu invitación.</p></>}<label htmlFor="guest-notes">Un mensaje para nosotros <span className="optional">(opcional)</span></label><textarea id="guest-notes" name="notes" placeholder="Unas palabras bonitas, alguna alergia o un detalle que debamos saber…" maxLength={600} rows={3}/>{error&&<p role="alert" className="form-error">{error}</p>}<button disabled={sending||previewOnly} className="button button-dark form-submit" type="submit">{previewOnly?"Confirmaciones próximamente":sending?"Guardando tu respuesta…":"Enviar mi confirmación"}<ArrowRight size={16}/></button><p className="privacy-note">Tu respuesta solo será visible para los organizadores.</p></form>}</div></section>
 </main>
 <footer className="footer"><Monogram/><h2><SoftText text="Nuestro para siempre"/><br/><em><SoftText text="comienza contigo."/></em></h2><p>NARDA & SAÚL · CON AMOR, SIEMPRE.</p><div className="footer-bottom"><span>Gracias por ser parte de nuestra historia.</span><button onClick={share}>Compartir invitación <Share2 size={13}/></button><button className="welcome-replay" onClick={replayOpening}>Volver a ver la apertura <Mail size={13}/></button>{!previewOnly&&<a href="/admin">Acceso de los anfitriones <ArrowRight size={12}/></a>}</div></footer>
 <div className="floating-tools"><button onClick={share} aria-label="Compartir invitación"><Share2 size={17} strokeWidth={1.3}/></button><button onClick={toggleMusic} aria-label={music?"Pausar música":"Reproducir música"} aria-pressed={music} className={music?"playing":""}>{music?<Pause size={17}/>:<Music2 size={18} strokeWidth={1.3}/>}</button></div><a className="mobile-rsvp" href="#confirmar">Confirmar asistencia <ArrowRight size={15}/></a>
 <audio ref={audio} src={settings.audioUrl||undefined} loop preload="none" onError={()=>{if(settings.audioUrl){setMusic(false);setToast("La canción no está disponible en este momento.")}}}/>
 {toast&&<div className="toast" role="status">{toast}<button onClick={()=>setToast("")} aria-label="Cerrar aviso"><X size={15}/></button></div>}
 </div>
 {welcome&&<div ref={welcomeRef} className={"welcome-overlay"+(opening?" is-opening":"")} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
  <div className="welcome-card">
   <span className="welcome-caption">UNA INVITACIÓN MUY ESPECIAL</span>
   <div className="envelope" aria-hidden="true">
    <div className="envelope-back"/>
    <div className="envelope-letter"><Monogram/><span>NUESTRA BODA</span><p>Para siempre, contigo.</p></div>
    <div className="envelope-pocket"/>
    <div className="envelope-flap"><svg viewBox="0 0 300 140" preserveAspectRatio="none"><path d="M0 0H300L150 119Z" fill="#faf5e8" stroke="#d9cbb0" strokeWidth=".8"/><path d="M9 4H291L150 111Z" fill="none" stroke="#e8dec9" strokeWidth=".7"/></svg></div>
    <div className="wax-seal"><Monogram/></div>
   </div>
   <h2 id="welcome-title">Narda <em>&</em> Saúl</h2>
   <p>Hay días que merecen<br/>compartirse con quienes más queremos.</p>
   <button autoFocus disabled={opening} className="button button-dark" onClick={()=>openInvitation(true)}>{opening?"Abriendo tu invitación…":"Abrir invitación"}<ArrowRight size={15}/></button>
   <button disabled={opening} className="welcome-silent" onClick={()=>openInvitation(false)}>Entrar sin música</button>
   <span className="welcome-foot">CON MUCHO AMOR, PARA TI</span>
   <span className="opening-status" role="status">{opening?"Abriendo el sobre de tu invitación":""}</span>
  </div>
 </div>}
 </>;
}
