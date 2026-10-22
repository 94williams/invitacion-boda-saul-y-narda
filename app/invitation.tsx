"use client";
import { useEffect, useRef, useState } from "react";
import SoftText from "./SoftText";
import PhotoGallery from "./PhotoGallery";
import SectionIllustration from "./SectionIllustration";
import useInvitationMotion from "./useInvitationMotion";
import OpeningFlorals from "./OpeningFlorals";
import { giftRegistryConfig, giftRegistryEntries, type GiftRegistrySettings } from "./gift-registry-config";
import { ArrowDown, ArrowRight, CalendarDays, Check, Church, Gift, Heart, Landmark, Mail, MapPin, Music2, Pause, Share2, Wine, X } from "lucide-react";
type Settings = { eventDate: string; ceremonyTime: string; receptionTime: string; venueName: string; address: string; mapsUrl: string; audioUrl: string } & GiftRegistrySettings;
const blank: Settings = { eventDate: "2026-10-31", ceremonyTime: "", receptionTime: "", venueName: "Casa de los Padrinos", address: "", mapsUrl: "https://www.google.com/maps?q=19.291965,-98.853241", audioUrl: "", giftRegistryTitle: "Mesa de regalos", giftRegistryIntro: "", giftRegistryCurrency: "MXN", allowGuestMessages: false, guestMessageTitle: "Mensaje para los novios", guestMessagePlaceholder: "Escribe un mensaje especial", guestMessageMaxLength: 250, giftRegistryItems: [], giftRegistryUrl: "", giftRegistryNote: "", mailTo: "" };
const OPENING_DURATION_MS = 3200;
function Monogram() { return <span className="monogram" aria-label="Narda y Saúl"><span>N</span><i>&</i><span>S</span></span>; }
const weddingDate = (value:string) => new Date(value + (value.length===10 ? "T00:00:00-06:00" : /[Zz]|[+-]\d{2}:\d{2}$/.test(value) ? "" : "-06:00"));
export default function Invitation({previewOnly=false}:{previewOnly?:boolean}={}) {
  const [settings,setSettings] = useState<Settings>(blank), [welcome,setWelcome] = useState(true), [music,setMusic] = useState(false), [toast,setToast] = useState(""), [remaining,setRemaining] = useState<[number,number,number,number]>([0,0,0,0]), [attendance,setAttendance] = useState(""), [guests,setGuests] = useState("1"), [name,setName] = useState(""), [email,setEmail] = useState(""), [message,setMessage] = useState(""), [error,setError] = useState(""), [isSubmitting,setIsSubmitting] = useState(false), [submitted,setSubmitted] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const guestToken = useRef("");
  const [opening,setOpening] = useState(false);
  const [introResolved,setIntroResolved] = useState(false);
  const openingLock = useRef(false);
  const sessionWasOpened = useRef(false);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  useInvitationMotion(introResolved && (opening || !welcome));
  const safeRead = (storage: "localStorage" | "sessionStorage", key:string) => {try{return window[storage].getItem(key)}catch{return null}};
  const safeWrite = (storage: "localStorage" | "sessionStorage", key:string,value:string) => {try{window[storage].setItem(key,value)}catch{}};
  useEffect(()=>{
   const controller = new AbortController();
   if(!previewOnly)fetch("/api/settings", {signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<Settings>}).then(s=>setSettings({...blank,...s,audioUrl:s.audioUrl||""})).catch(()=>setSettings(blank));
   sessionWasOpened.current=safeRead("sessionStorage","ns-opened")==="1";
   setWelcome(!sessionWasOpened.current);
   setIntroResolved(true);
   return()=>{controller.abort();if(openingTimer.current)clearTimeout(openingTimer.current)};
  },[previewOnly]);
  useEffect(()=>{
   if(!sessionWasOpened.current||!settings.audioUrl||!audio.current)return;
   let cancelled=false;
   void audio.current.play().then(()=>{
    if(!cancelled)setMusic(true);
   }).catch(error=>{
    if(cancelled)return;
    setMusic(false);
    setToast(error instanceof DOMException&&error.name==="NotAllowedError"
     ?"El navegador bloqueó la reproducción automática. Toca el botón de música para escucharla."
     :"No se pudo iniciar la canción automáticamente. Toca el botón de música para intentarlo.");
   });
   return()=>{cancelled=true};
  },[settings.audioUrl]);
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
  useEffect(()=>{if(!settings.eventDate)return;const tick=()=>{const ms=Math.max(0,weddingDate(settings.eventDate).getTime()-Date.now());setRemaining([Math.floor(ms/86400000),Math.floor(ms/3600000)%24,Math.floor(ms/60000)%60,Math.floor(ms/1000)%60]);};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[settings.eventDate]);
  async function toggleMusic(){if(!settings.audioUrl){setToast("Nuestra canción estará disponible muy pronto.");return}if(!audio.current)return;if(music){audio.current.pause();setMusic(false)}else{try{await audio.current.play();setMusic(true)}catch(error){setMusic(false);setToast(error instanceof DOMException&&error.name==="NotAllowedError"?"El navegador bloqueó la reproducción automática. Toca el botón de música para escucharla.":"No se pudo iniciar la canción automáticamente. Toca el botón de música para intentarlo.")}}}
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
   // Let the envelope and page crossfade finish before removing the dialog.
   openingTimer.current=setTimeout(finish,matchMedia("(prefers-reduced-motion: reduce)").matches?0:OPENING_DURATION_MS);
  }
  function replayOpening(){openingLock.current=false;setOpening(false);window.scrollTo({top:0,behavior:"instant"});setWelcome(true)}
  async function share(){try{if(navigator.share)await navigator.share({title:"Narda & Saúl · Nuestra boda",text:"Nos encantaría compartir este día contigo.",url:location.origin+location.pathname});else{await navigator.clipboard.writeText(location.origin+location.pathname);setToast("Enlace copiado al portapapeles.")}}catch{return}}
  function calendar(){
   if(!settings.eventDate)return;
   const date=weddingDate(settings.eventDate),stamp=(d:Date)=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z"),escape=(s:string)=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,");
   const dateOnly=settings.eventDate.length===10;
   const nextDay=new Date(Date.UTC(Number(settings.eventDate.slice(0,4)),Number(settings.eventDate.slice(5,7))-1,Number(settings.eventDate.slice(8,10))+1)).toISOString().slice(0,10).replace(/-/g,"");
   const eventDates=dateOnly?[`DTSTART;VALUE=DATE:${settings.eventDate.replace(/-/g,"")}`,`DTEND;VALUE=DATE:${nextDay}`]:[`DTSTART:${stamp(date)}`];
   const content=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Narda y Saul//Boda//ES","BEGIN:VEVENT","UID:narda-saul-wedding@invitation",`DTSTAMP:${stamp(new Date())}`,...eventDates,"SUMMARY:Boda de Narda y Saúl","DESCRIPTION:Nos encantaría celebrarlo contigo.","LOCATION:" + escape(settings.venueName || "Casa de los Padrinos"),"END:VEVENT","END:VCALENDAR"];
   const url=URL.createObjectURL(new Blob([content],{type:"text/calendar;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download="Boda-Narda-y-Saul.ics";a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  async function submitRSVP(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setError("");if(previewOnly){setError("La confirmación aún no está habilitada en esta vista previa. No se guardará tu respuesta.");return}if(!attendance){setError("Elige si vienes o no.");return}if(!name.trim()){setError("Escribe tu nombre para confirmar tu asistencia.");return}if(!email.trim()&&!settings.mailTo){setError("Agrega un correo para la confirmación.");return}setIsSubmitting(true);try{const body=JSON.stringify({name:name.trim(),email:email.trim(),guests:Number(guests)||1,attendance,message:message.trim(),guestToken:guestToken.current||undefined});const res=await fetch("/api/rsvp",{method:"POST",headers:{"Content-Type":"application/json"},body});if(!res.ok){const data=await res.json().catch(()=>({}));throw new Error(data.error||"No se pudo registrar la confirmación.");}guestToken.current=`${Date.now()}`;setSubmitted(true);setError("");setToast("¡Gracias! Tu confirmación quedó registrada.");}catch(err){setError(err instanceof Error ? err.message : "No se pudo enviar la confirmación. Inténtalo de nuevo.");}finally{setIsSubmitting(false)}}
  const dateLabel=settings.eventDate?weddingDate(settings.eventDate).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric",timeZone:"America/Mexico_City"}):"Fecha por confirmar";
  const registries = giftRegistryEntries(settings);
  const itinerary = [
   {Icon:Landmark,number:"01",title:"La ceremonia civil",text:"Ante la ley, celebraremos el compromiso de unir nuestras vidas y comenzar esta nueva etapa juntos.",time:""},
   {Icon:Church,number:"02",title:"La ceremonia religiosa",text:"Con la bendición de Dios, celebraremos nuestra unión en una ceremonia llena de fe, amor y esperanza.",time:settings.ceremonyTime},
   {Icon:Wine,number:"03",title:"La recepción",text:"Después de dar el sí, brindaremos y compartiremos la alegría de este día contigo.",time:settings.receptionTime},
  ];
  return <>
  <div className={"invitation-content"+(opening?" is-unveiling":"")} inert={welcome} aria-hidden={welcome || undefined}>
  <a className="skip-link" href="#inicio">Ir a la invitación</a>
  <header className="site-header"><a href="#inicio" className="brand" aria-label="Inicio"><Monogram/><span>{previewOnly?"VISTA PREVIA":"NUESTRA BODA"}</span></a><nav aria-label="Navegación principal"><a href="#historia">Nuestra historia</a><a href="#dia">El día</a><a href="#detalles">Detalles</a><a href="#regalos">Regalos</a><a href="#confirmar" className="header-rsvp">Confirmar <ArrowRight size={12} /></a></nav></header>
  <main id="inicio">
  <section className="hero" aria-labelledby="hero-title"><div className="hero-image" aria-hidden="true"/><div className="hero-copy"><h1 id="hero-title" ref={heroTitleRef} className="hero-title">Narda <span>&</span> Saúl</h1><div className="hero-rule"><span/><Heart size={12} /><span/></div><p className="hero-subtitle">Nos casamos y queremos compartir ese día contigo.</p><p className="hero-date">{dateLabel}<br/>{settings.venueName}</p><a href="#confirmar" className="button button-dark">Confirmar asistencia <ArrowRight size={15}/></a><div className="hero-bottom"><span>{settings.venueName}</span><a href="#historia" aria-label="Ir a la historia"><ArrowDown size={15}/></a><span>{dateLabel}</span></div></div></section>
  <section id="historia" className="story section-shell reveal"><div><p className="eyebrow section-no">01 / UNA NUEVA ETAPA</p><SectionIllustration kind="story"/><h2><SoftText text="El comienzo de"/><br/><em><SoftText text="un camino juntos."/></em></h2></div><div className="story-copy"><span className="tiny-star">✦</span><p>Con el corazón lleno de gratitud y amor, celebramos el inicio de una nueva etapa: nuestra vida en pareja, con sueños compartidos, alegría y la certeza de que el mejor camino es caminarlo juntos.</p><p>Así como cada paso nos ha llevado a este momento, hoy nos alegra invitarte a formar parte de este día tan especial. Gracias por acompañarnos en esta historia que comienza con un sí.</p><p className="signature">Narda &amp; Saúl</p></div></section>
  <section id="dia" className="day-section reveal"><p className="eyebrow">02 / EL GRAN DÍA</p><h2><SoftText text="Un sí."/> <em><SoftText text="Para siempre."/></em></h2><div className="section-intro"><p>Con la presencia de quienes más queremos, celebraremos nuestra unión rodeados de amor, música, buen vino y recuerdos que quedarán para siempre.</p></div><div className="countdown" aria-label="Cuenta regresiva para la boda"><div><strong>{remaining[0]}</strong><span>Días</span></div><div><strong>{remaining[1]}</strong><span>Horas</span></div><div><strong>{remaining[2]}</strong><span>Min</span></div><div><strong>{remaining[3]}</strong><span>Seg</span></div></div><p className="date-note"><CalendarDays size={13} />{dateLabel}</p><div className="itinerary"><p className="section-caption"><span>03 / ITINERARIO</span><span>Un día lleno de momentos</span></p><div className="itinerary-grid">{itinerary.map(({Icon,number,title,text,time}) => <article key={number}><div className="itinerary-card-top"><span>{number}</span><Icon /></div><h3>{title}</h3><p>{text}</p>{time && <span className="time-label">{time}</span>}</article>)}</div></div></section>
  <section className="venue section-shell reveal" aria-labelledby="venue-title"><div className="venue-art" aria-hidden="true"><div className="venue-arch"><Monogram/><span>UN LUGAR PARA CELEBRAR</span><p>La historia continúa.</p></div><div className="venue-flower" aria-hidden="true"/></div><div className="venue-copy"><p className="eyebrow section-no">04 / NOS VEMOS ALLÁ</p><h2 id="venue-title">Un espacio pensado para compartirlo todo.</h2><p>En un ambiente que combina la calidez del hogar con la belleza del lugar, celebraremos este momento con quienes nos acompañan en esta nueva etapa.</p><div className="venue-address"><MapPin size={18} /><div><strong>{settings.venueName}</strong><p>{settings.address || "Dirección por confirmar"}</p></div></div><button className="button button-outline" onClick={calendar}>Agregar al calendario <CalendarDays size={15}/></button></div></section>
  <section className="interlude reveal"><span>DONDE HAY AMOR, TODO FLORECE.</span><blockquote>La alegría de este día<br/><em>será aún mayor al compartirla.</em></blockquote><Heart size={20} /><p>Con cariño, Narda &amp; Saúl</p></section>
  <section id="galeria" className="gallery section-shell reveal" aria-labelledby="gallery-title"><div className="gallery-heading"><p className="eyebrow">05 / NUESTROS RECUERDOS</p><SectionIllustration kind="gallery"/><h2 id="gallery-title"><SoftText text="Recuerdos que"/><br/><em><SoftText text="atesoramos."/></em></h2><p>Instantes de nuestra vida juntos que hoy compartimos con cariño.</p></div><PhotoGallery/></section>
  <section id="detalles" className="details-section reveal"><div className="section-shell"><p className="eyebrow">06 / LOS PEQUEÑOS DETALLES</p><SectionIllustration kind="details"/><h2><SoftText text="Todo está pensado"/><br/><em><SoftText text="para este momento."/></em></h2><div className="details-grid">{[{Icon:Music2,title:"Música y ambiente",text:"Un ambiente cálido, elegante y lleno de canciones que nos representan.",small:"Todo pensado para celebrar."},{Icon:Gift,title:"Regalos",text:"Tu presencia es lo más valioso para nosotros, pero si deseas regalarnos algo, aquí encontrarás opciones.",small:"Con cariño, siempre."},{Icon:Mail,title:"Confirmación",text:"Te pedimos que confirmes tu asistencia para coordinar la celebración.",small:"Será un honor recibirte."},{Icon:CalendarDays,title:"Agenda",text:"La ceremonia y la recepción se vivirán en un solo gran momento para recordar.",small:"Nos vemos pronto."}].map(({Icon,title,text,small}) => <article key={title}><Icon/><h3>{title}</h3><p>{text}</p><span className="detail-small">{small}</span></article>)}</div></div></section>
  <section id="regalos" className="gifts-section section-shell reveal" aria-labelledby="gifts-title"><div className="gifts-heading"><p className="eyebrow">07 / DETALLES DE CARIÑO</p><SectionIllustration kind="gifts"/><h2 id="gifts-title"><SoftText text="Tu presencia"/><br/><em><SoftText text="es nuestro regalo."/></em></h2></div>{registries.length > 0 ? <div className="gifts-list">{registries.map(item => <a key={item.title} href={item.url} target="_blank" rel="noreferrer" className="gift-card"><span>{item.title}</span><strong>{item.amount}</strong></a>)}</div> : <p className="gift-note">Tu presencia en este día tan especial es el mejor regalo que podríamos recibir.</p>}<div className="gifts-cta"><button className="button button-outline" onClick={()=>document.getElementById("confirmar")?.scrollIntoView({behavior:"smooth",block:"start"})}>Confirmar asistencia <ArrowRight size={15}/></button></div></section>
  <section id="confirmar" className={"rsvp-section section-shell reveal"+(previewOnly?" rsvp-unavailable":"")}><div className="rsvp-copy"><p className="eyebrow">CONFIRMACIÓN DE ASISTENCIA</p><SectionIllustration kind="rsvp"/><h2>Tu presencia hará que este día sea aún más especial.</h2><p>Queremos celebrarlo contigo. Confirma si podrás acompañarnos y nos ayudará a organizar esta alegría con todo el cariño que merecen.</p><div className="rsvp-mini"><CalendarDays size={17} /><div><strong>{dateLabel}</strong><p>{settings.venueName}</p></div></div></div>{previewOnly ? <div className="rsvp-pending-card rsvp-form-wrap"><div className="rsvp-pending-notice"><div className="pending-confirmation-icon"><Check size={25} /></div><strong>CONFIRMACIÓN</strong><h3>Próximamente disponible</h3><p>La sección de asistencia se habilitará una vez que la invitación esté lista para compartir.</p></div></div> : <div className="rsvp-form-wrap"><{submitted ? "div" : "form"} onSubmit={submitted ? undefined : submitRSVP} className={submitted ? "rsvp-success" : ""}>{submitted ? <><div className="success-circle"><Check size={25} /></div><h3>¡Gracias por confirmar!</h3><p>Nos alegra muchísimo saber que podrás acompañarnos en este gran día.</p><button type="button" className="text-button" onClick={()=>setSubmitted(false)}>Registrar otra respuesta <ArrowRight size={14} /></button></> : <><div className="form-intro"><h3>Confirmar asistencia</h3><p>Te esperamos con mucho cariño.</p></div>{error && <p className="form-error" role="alert">{error}</p>}<fieldset><legend>¿Asistirás?</legend><div className="attendance-options">{["Sí, asistiré","Tal vez","No podré asistir"].map(option => <label key={option} className={attendance===option?"selected":""}><input type="radio" name="attendance" value={option} checked={attendance===option} onChange={()=>setAttendance(option)} />{option === "Sí, asistiré" ? <Check size={12} /> : option === "Tal vez" ? <CalendarDays size={12} /> : <X size={12} />} {option}</label>)}</div></fieldset><label>Nombre completo<input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre" /></label><label>Correo electrónico<span className="optional"> (opcional)</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com" /></label><label>Cantidad de personas<select value={guests} onChange={e=>setGuests(e.target.value)}><option value="1">1 persona</option><option value="2">2 personas</option><option value="3">3 personas</option><option value="4">4 personas</option></select></label><label>Mensaje para los novios <span className="optional">(opcional)</span><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Escribe un mensaje especial" /></label><button type="submit" className="button button-dark form-submit" disabled={isSubmitting}>{isSubmitting?"Enviando...":"Confirmar asistencia"}<ArrowRight size={15}/></button><p className="privacy-note"><Check size={9} />Tu información será usada solo para la confirmación del evento.</p></>}{submitted && <button type="button" className="button button-outline" onClick={()=>setSubmitted(false)}>Cerrar</button>}</{submitted ? "div" : "form"}>}</div>}</section>
  </main>
  <footer className="footer"><Monogram/><h2><SoftText text="Gracias por acompañarnos"/><br/><em><SoftText text="con tu cariño."/></em></h2><p>NARDA &amp; SAÚL · CON AMOR, SIEMPRE.</p><div className="footer-bottom"><span>{dateLabel}</span><a href="#inicio">Volver arriba <ArrowUp size={12}/></a></div></footer>
  <div className="floating-tools"><button onClick={share} aria-label="Compartir invitación"><Share2 size={17} strokeWidth={1.3}/></button>{settings.audioUrl&&<button onClick={toggleMusic} aria-label={music?"Pausar música":"Reproducir música"} className={music?"playing":""}>{music?<Pause size={17} strokeWidth={1.3}/> : <Music2 size={17} strokeWidth={1.3}/>}</button>}</div>
  <audio ref={audio} src={settings.audioUrl||undefined} loop preload="auto" onError={()=>{if(settings.audioUrl){setMusic(false);setToast("La canción no está disponible en este momento.")}}}/>
  {toast&&<div className="toast" role="status">{toast}<button onClick={()=>setToast("")} aria-label="Cerrar aviso"><X size={15}/></button></div>}
  </div>
  {welcome&&<div ref={welcomeRef} className={"welcome-overlay"+(opening?" is-opening":"")} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
   <div className="welcome-atmosphere" aria-hidden="true"><OpeningFlorals position="top"/><OpeningFlorals position="bottom"/><span className="welcome-light"/></div>
   <div className="welcome-card">
    <span className="welcome-caption">UNA INVITACIÓN CON CARIÑO</span>
    <div className="envelope-stage">
    <div className="envelope" aria-hidden="true">
     <div className="envelope-back"/>
     <div className="envelope-letter"><Monogram/><span>NUESTRA BODA</span><p>Nos casamos.</p></div>
     <div className="envelope-pocket"/>
     <div className="envelope-flap"><svg viewBox="0 0 300 140" preserveAspectRatio="none"><path d="M0 0H300L150 119Z" fill="#faf5e8" stroke="#d9cbb0" strokeWidth=".8"/><path d="M9 4H291L150 111Z" fill="#fdfaf3"/></svg></div>
     <div className="wax-seal"><Monogram/></div>
     <span className="envelope-shimmer"/>
    </div>
    </div>
    <h2 id="welcome-title">Narda <em>&</em> Saúl</h2>
    <p>Tenemos la alegría de invitarte<br/>a celebrar nuestra boda.</p>
    <button autoFocus disabled={opening} className="button button-dark" onClick={()=>openInvitation(true)}>{opening?"Abriendo tu invitación…":"Abrir invitación"}<ArrowRight size={15}/></button>
    {settings.audioUrl&&<button disabled={opening} className="welcome-silent" onClick={()=>openInvitation(false)}>Entrar sin música</button>}
    <span className="welcome-foot">CON CARIÑO, NARDA Y SAÚL</span>
    <span className="opening-status" role="status">{opening?"Abriendo el sobre de tu invitación":""}</span>
   </div>
  </div>}
  </>;
}
