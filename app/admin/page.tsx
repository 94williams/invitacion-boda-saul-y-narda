"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowLeft, CalendarDays, Check, CheckCheck, ChevronRight, Gift, Heart, LoaderCircle, LockKeyhole, LogOut, MapPin, Music2, RefreshCw, Search, Settings2, Trash2, Users, X } from "lucide-react";
import styles from "./admin.module.css";
import type { WeddingSettings } from "../lib/settings";

type Guest = { id: number; name: string; attendance: "yes" | "no"; guests: number; notes: string; createdAt: string; updatedAt: string };
const defaults: WeddingSettings = { eventDate: "", civilTime: "", ceremonyTime: "", receptionTime: "", venueName: "", address: "", mapsUrl: "", giftRegistryName: "", giftRegistryUrl: "", giftRegistryName2: "", giftRegistryUrl2: "", audioUrl: "" };
class RequestError extends Error { constructor(message: string, public status: number) { super(message); } }

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new RequestError(data.error || "No fue posible completar la solicitud. Inténtalo de nuevo.", response.status);
  return data as T;
}
const jsonBody = (data: unknown) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
const normalized = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dateLabel = (date: string) => new Date(date).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminPage() {
  const [auth, setAuth] = useState<"checking" | "login" | "ready">("checking");
  const [password, setPassword] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [settings, setSettings] = useState<WeddingSettings>(defaults);
  const [tab, setTab] = useState<"guests" | "settings">("guests");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);

  const reportError = useCallback((caught: unknown) => {
    if (caught instanceof RequestError && caught.status === 401) setAuth("login");
    setError(caught instanceof Error ? caught.message : "No fue posible completar la solicitud. Inténtalo de nuevo.");
  }, []);

  const load = useCallback(async () => {
    const [guestData, settingsData] = await Promise.all([api<{ guests: Guest[] }>("/api/admin/guests"), api<WeddingSettings>("/api/admin/settings")]);
    setGuests(guestData.guests); setSettings({ ...defaults, ...settingsData }); setAuth("ready");
  }, []);

  useEffect(() => { load().catch(caught => { setAuth("login"); if (!(caught instanceof RequestError && caught.status === 401)) reportError(caught); }); }, [load, reportError]);

  const totals = useMemo(() => {
    const yes = guests.filter(guest => guest.attendance === "yes");
    return { invitations: yes.length, people: yes.reduce((sum, guest) => sum + guest.guests, 0), no: guests.length - yes.length };
  }, [guests]);
  const visible = useMemo(() => guests.filter(guest => (filter === "all" || guest.attendance === filter) && normalized(`${guest.name} ${guest.notes}`).includes(normalized(query))), [guests, filter, query]);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy("login"); setError(""); setNotice("");
    try { await api("/api/admin/login", { method: "POST", ...jsonBody({ password }) }); setPassword(""); await load(); }
    catch (caught) { reportError(caught); } finally { setBusy(""); }
  }
  async function logout() {
    setBusy("logout"); setError("");
    try { await api("/api/admin/login", { method: "DELETE" }); setAuth("login"); setGuests([]); setSettings(defaults); setNotice(""); }
    catch (caught) { reportError(caught); } finally { setBusy(""); }
  }
  async function refresh() {
    setBusy("refresh"); setError(""); setNotice("");
    try { await load(); setNotice("La lista está actualizada."); } catch (caught) { reportError(caught); } finally { setBusy(""); }
  }
  async function removeGuest() {
    if (!deleteTarget) return;
    setBusy("delete"); setError(""); setNotice("");
    try { await api("/api/admin/guests", { method: "DELETE", ...jsonBody({ id: deleteTarget.id }) }); setGuests(previous => previous.filter(guest => guest.id !== deleteTarget.id)); setDeleteTarget(null); setNotice("Confirmación eliminada."); }
    catch (caught) { reportError(caught); } finally { setBusy(""); }
  }
  async function exportCsv() {
    setBusy("export"); setError("");
    try {
      const response = await fetch("/api/admin/export", { cache: "no-store" });
      if (!response.ok) { const data = await response.json().catch(() => ({})) as { error?: string }; throw new RequestError(data.error || "No fue posible descargar la lista.", response.status); }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "confirmados-narda-saul.csv"; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) { reportError(caught); } finally { setBusy(""); }
  }
  async function saveSettings(event: FormEvent) {
    event.preventDefault(); setBusy("settings"); setError(""); setNotice("");
    try { const saved = await api<WeddingSettings>("/api/admin/settings", { method: "PUT", ...jsonBody(settings) }); setSettings({ ...defaults, ...saved }); setNotice("Los detalles de la invitación se guardaron."); }
    catch (caught) { reportError(caught); } finally { setBusy(""); }
  }
  function field(name: keyof WeddingSettings, value: string) { setSettings(previous => ({ ...previous, [name]: value })); }
  function changeEventDate(date: string) {
    setSettings(previous => ({ ...previous, eventDate: date ? `${date}${previous.eventDate.includes("T") ? previous.eventDate.slice(10) : ""}` : "" }));
  }
  function changeEventTime(time: string) {
    setSettings(previous => ({ ...previous, eventDate: previous.eventDate ? `${previous.eventDate.slice(0, 10)}${time ? `T${time}` : ""}` : "" }));
  }

  if (auth === "checking") return <main className={styles.shell}><div className={styles.loading}><LoaderCircle className={styles.spin} size={24} /><p>Preparando tu espacio…</p></div></main>;

  if (auth === "login") return <main className={styles.shell}>
    <a className={styles.back} href="/"><ArrowLeft size={16} /> Volver a la invitación</a>
    <section className={styles.loginCard}>
      <div className={styles.monogram}>N<span>&</span>S</div>
      <p className={styles.eyebrow}>NARDA & SAÚL · ESPACIO PRIVADO</p>
      <h1>Todo para su gran día.</h1>
      <p className={styles.muted}>Consulta sus confirmaciones y dale los últimos toques a la invitación.</p>
      <form onSubmit={login} className={styles.loginForm}>
        <label htmlFor="admin-password">Clave de acceso</label>
        <div className={styles.passwordInput}><LockKeyhole size={17} /><input id="admin-password" type="password" autoComplete="current-password" placeholder="Escribe tu clave privada" required value={password} onChange={event => setPassword(event.target.value)} maxLength={500} /></div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.primary} type="submit" disabled={!!busy}>{busy === "login" ? <LoaderCircle className={styles.spin} size={17} /> : <ChevronRight size={17} />} Entrar al panel</button>
      </form>
      <p className={styles.privacy}><LockKeyhole size={13} /> La lista de invitados es privada.</p>
    </section>
    <p className={styles.loginFoot}>UNA CELEBRACIÓN. MIL RECUERDOS.</p>
  </main>;

  return <main className={styles.shell}>
    <header className={styles.header}>
      <a className={styles.brand} href="/"><span className={styles.smallMonogram}>N<span>&</span>S</span><span>NARDA & SAÚL<small>EL ESPACIO DE SU BODA</small></span></a>
      <div className={styles.headerActions}><a className={styles.preview} href="/" target="_blank" rel="noreferrer">Ver invitación <ChevronRight size={15} /></a><button className={styles.iconButton} title="Cerrar sesión" aria-label="Cerrar sesión" disabled={!!busy} onClick={logout}><LogOut size={18} /></button></div>
    </header>
    <div className={styles.content}>
      <div className={styles.intro}><div><p className={styles.eyebrow}>CADA DETALLE, EN SU LUGAR</p><h1>Su gran día, organizado.</h1><p className={styles.muted}>Un espacio para cuidar de quienes los acompañarán.</p></div><span className={styles.privateBadge}><LockKeyhole size={13} /> PANEL PRIVADO</span></div>
      <div className={styles.stats}>
        <article><div className={styles.statIcon}><CheckCheck size={19} /></div><p>Invitaciones confirmadas</p><strong>{totals.invitations}</strong><span>Registros que dijeron “sí”</span></article>
        <article><div className={styles.statIcon}><Users size={19} /></div><p>Personas esperadas</p><strong>{totals.people}</strong><span>Incluye titulares y acompañantes</span></article>
        <article><div className={styles.statIcon}><Heart size={19} /></div><p>No podrán asistir</p><strong>{totals.no}</strong><span>Respuestas recibidas con cariño</span></article>
      </div>
      <div className={styles.tabs}><button aria-pressed={tab === "guests"} className={tab === "guests" ? styles.activeTab : ""} onClick={() => { setTab("guests"); setNotice(""); }}><Users size={16} /> Invitados</button><button aria-pressed={tab === "settings"} className={tab === "settings" ? styles.activeTab : ""} onClick={() => { setTab("settings"); setNotice(""); }}><Settings2 size={16} /> Detalles de la invitación</button></div>
      {error && <div className={styles.alertError} role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Cerrar aviso"><X size={16} /></button></div>}
      {notice && <div className={styles.notice} role="status"><Check size={16} /> {notice}<button onClick={() => setNotice("")} aria-label="Cerrar aviso"><X size={15} /></button></div>}
      {tab === "guests" ? <section className={styles.panel} aria-label="Lista de confirmaciones">
        <div className={styles.panelTop}><div><h2>La lista de sus personas favoritas</h2><p>{guests.length} {guests.length === 1 ? "respuesta recibida" : "respuestas recibidas"}</p></div><div className={styles.actions}><button className={styles.secondary} disabled={!!busy} onClick={refresh}>{busy === "refresh" ? <LoaderCircle className={styles.spin} size={15} /> : <RefreshCw size={15} />} Actualizar</button><button className={styles.primary} disabled={!!busy || guests.length === 0} onClick={exportCsv}>{busy === "export" ? <LoaderCircle className={styles.spin} size={15} /> : <ArrowDownToLine size={15} />} Descargar CSV</button></div></div>
        <div className={styles.filters}><label className={styles.search}><Search size={17} /><input aria-label="Buscar por nombre o notas" placeholder="Buscar por nombre o notas…" value={query} onChange={event => setQuery(event.target.value)} /></label><select value={filter} aria-label="Filtrar por asistencia" onChange={event => setFilter(event.target.value as "all" | "yes" | "no")}><option value="all">Todas las respuestas</option><option value="yes">Confirmados</option><option value="no">No asistirán</option></select></div>
        {visible.length ? <div className={styles.tableScroll}><table><thead><tr><th>INVITADO</th><th>RESPUESTA</th><th>PERSONAS</th><th>NOTAS</th><th>ACTUALIZACIÓN</th><th><span className={styles.srOnly}>Acciones</span></th></tr></thead><tbody>{visible.map(guest => <tr key={guest.id}><td><strong>{guest.name}</strong></td><td><span className={guest.attendance === "yes" ? styles.statusYes : styles.statusNo}>{guest.attendance === "yes" ? <Check size={12} /> : <X size={12} />}{guest.attendance === "yes" ? "Confirmado" : "No asistirá"}</span></td><td>{guest.guests}</td><td className={styles.notes}>{guest.notes || <span className={styles.faint}>Sin notas</span>}</td><td className={styles.date}>{dateLabel(guest.updatedAt)}</td><td><button className={styles.deleteButton} aria-label={`Eliminar confirmación de ${guest.name}`} title="Eliminar confirmación" onClick={() => setDeleteTarget(guest)} disabled={!!busy}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div> : <div className={styles.empty}><div><Users size={28} strokeWidth={1.1} /></div><h3>{guests.length ? "No encontramos coincidencias" : "Aquí comienza su lista"}</h3><p>{guests.length ? "Prueba con otro nombre o cambia el filtro." : "Las confirmaciones aparecerán aquí cuando sus invitados respondan desde la invitación."}</p></div>}
        <div className={styles.tableFoot}><LockKeyhole size={12} /><p>Solo ustedes pueden consultar esta lista. Las personas incluyen a quien confirma.</p><span>{visible.length} de {guests.length} registros</span></div>
      </section> : <div className={styles.settingsGrid}>
        <form className={styles.panel} onSubmit={saveSettings}>
          <div className={styles.settingsTitle}><CalendarDays size={20} /><div><h2>Los detalles del encuentro</h2><p>Los campos vacíos se mostrarán como pendientes.</p></div></div>
          <div className={styles.formBody}>
            <div className={styles.formRow}><label>Fecha de la boda<input type="date" value={settings.eventDate.slice(0, 10)} onChange={event => changeEventDate(event.target.value)} /></label><label>Hora de inicio · opcional<input type="time" value={settings.eventDate.includes("T") ? settings.eventDate.slice(11, 16) : ""} disabled={!settings.eventDate} onChange={event => changeEventTime(event.target.value)} /></label></div><p className={styles.help}>Hora de Ciudad de México (UTC−6). Pueden guardar solo la fecha y agregar la hora cuando esté confirmada.</p>
            <div className={styles.formRow}><label>Hora de boda civil<input type="time" value={settings.civilTime} onChange={event => field("civilTime", event.target.value)} /></label><label>Hora de ceremonia religiosa<input type="time" value={settings.ceremonyTime} onChange={event => field("ceremonyTime", event.target.value)} /></label></div>
            <label>Hora de recepción · opcional<input type="time" value={settings.receptionTime} onChange={event => field("receptionTime", event.target.value)} /></label>
            <div className={styles.divider} />
            <p className={styles.formSection}><MapPin size={16} /> EL LUGAR</p>
            <label>Nombre del lugar<input type="text" maxLength={160} placeholder="Por confirmar" value={settings.venueName} onChange={event => field("venueName", event.target.value)} /></label>
            <label>Dirección<textarea rows={3} maxLength={400} placeholder="Agrega la dirección cuando esté confirmada" value={settings.address} onChange={event => field("address", event.target.value)} /></label>
            <label>Enlace de ubicación<input type="url" maxLength={1000} placeholder="https://maps.google.com/…" value={settings.mapsUrl} onChange={event => field("mapsUrl", event.target.value)} /></label><p className={styles.help}>Pega el enlace compartido desde Google Maps.</p>
            <div className={styles.divider} />
            <p className={styles.formSection}><Gift size={16} /> MESA DE REGALOS</p>
            <label>Nombre de la mesa · opcional<input type="text" maxLength={120} placeholder="Nombre de la tienda o de la mesa" value={settings.giftRegistryName} onChange={event => field("giftRegistryName", event.target.value)} /></label>
            <label>Enlace de la mesa · opcional<input type="url" maxLength={1000} placeholder="https://…" value={settings.giftRegistryUrl} onChange={event => field("giftRegistryUrl", event.target.value)} /></label><p className={styles.help}>El enlace debe comenzar con https:// y aparecerá como una opción en la invitación.</p>
            <button type="submit" className={styles.primary} disabled={!!busy}>{busy === "settings" ? <LoaderCircle className={styles.spin} size={16} /> : <Check size={16} />} Guardar detalles</button>
          </div>
        </form>
        <aside className={styles.panel}>
          <div className={styles.settingsTitle}><Music2 size={20} /><div><h2>Su canción</h2><p>Una melodía para acompañar la historia.</p></div></div>
          <div className={styles.formBody}>
            <div className={styles.audioEmpty}><Music2 size={30} strokeWidth={1.1} /><p>La invitación incluye una canción predeterminada. La carga de audio personalizado está desactivada para evitar almacenamiento adicional.</p></div>
            <p className={styles.help}>La canción comienza al pulsar «Abrir invitación»; el navegador puede requerir esa interacción para reproducirla.</p>
          </div>
        </aside>
      </div>}
      <footer className={styles.footer}><span>NARDA & SAÚL</span><p>Para que ustedes solo se ocupen de celebrar.</p><Heart size={13} strokeWidth={1.3} /></footer>
    </div>
    {deleteTarget && <div className={styles.modalBackdrop} onClick={event => { if (event.target === event.currentTarget && !busy) setDeleteTarget(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="delete-heading"><div className={styles.modalIcon}><Trash2 size={23} /></div><h2 id="delete-heading">Eliminar confirmación</h2><p>Se eliminará la respuesta de <strong>{deleteTarget.name}</strong> de su lista. Esta acción no se puede deshacer.</p><div className={styles.actions}><button className={styles.secondary} autoFocus disabled={!!busy} onClick={() => setDeleteTarget(null)}>Conservar</button><button className={styles.danger} disabled={!!busy} onClick={removeGuest}>{busy === "delete" && <LoaderCircle className={styles.spin} size={15} />} Eliminar</button></div></section></div>}
  </main>;
}
