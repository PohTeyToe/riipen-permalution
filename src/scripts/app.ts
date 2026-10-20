// All client behaviour for the page. The page works without it: the first
// project shows, the estimate shows its default, the form posts nowhere.
import { inverse, type Frame } from '../lib/equal-earth';
import { estimate, groupDigits } from '../lib/estimate';
import { INDUSTRIAL, oneDecimal, totes } from '../lib/totes';
import { validate, type Fields } from '../lib/validate';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ---------- Claims view ---------- */
const claimsBtn = $<HTMLButtonElement>('[data-claims-toggle]');
function setClaims(on: boolean) {
  document.documentElement.dataset.claims = on ? 'on' : 'off';
  claimsBtn?.setAttribute('aria-pressed', String(on));
  store.set('claims', on ? 'on' : 'off');
}
claimsBtn?.addEventListener('click', () => setClaims(document.documentElement.dataset.claims !== 'on'));
if (store.get('claims') === 'on') setClaims(true);

function openRegisterForHash() {
  if (/^#claim-\d+$/.test(location.hash)) {
    const reg = $<HTMLDetailsElement>('#claims');
    if (reg) reg.open = true;
    $(location.hash)?.scrollIntoView({ block: 'center' });
  }
}
window.addEventListener('hashchange', openRegisterForHash);
openRegisterForHash();

/* ---------- Small-screen menu: close after a jump ---------- */
const menu = $<HTMLDetailsElement>('[data-menu]');
menu?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) menu.open = false; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.open) { menu.open = false; menu.querySelector('summary')?.focus(); } });

/* ---------- Tabs (projects and journeys) ---------- */
function tabs(list: HTMLElement, onSelect?: (tab: HTMLElement) => void) {
  const all = () => $$<HTMLElement>('[role="tab"]', list);
  const select = (tab: HTMLElement, focus = false) => {
    for (const t of all()) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) panel.hidden = !on;
    }
    if (focus) tab.focus();
    onSelect?.(tab);
  };
  list.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest<HTMLElement>('[role="tab"]');
    if (tab) select(tab);
  });
  list.addEventListener('keydown', (e) => {
    const items = all();
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(items[(next + items.length) % items.length], true);
  });
  return select;
}

for (const list of $$('[data-tabs]')) tabs(list);

/* ---------- Map ---------- */
const mapBlock = $('[data-map]');
if (mapBlock) {
  const frame = JSON.parse(mapBlock.dataset.frame!) as Frame;
  const W = Number(mapBlock.dataset.w), H = Number(mapBlock.dataset.h);
  const dirs = (mapBlock.dataset.dirs ?? 'N,S,E,W').split(',');
  const stage = $('[data-stage]', mapBlock)!;
  const drop = $('[data-drop]', mapBlock)!;
  const pick = $('#site-pick')!;
  const tabList = $('.site-tabs', mapBlock)!;
  const pins = $$<HTMLButtonElement>('.pin', mapBlock);
  let lastSite = 'coatepec';
  let picked: [number, number] | null = null;

  const markPins = (id: string | null) => pins.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.site === id)));
  const selectSite = tabs(tabList, (tab) => {
    lastSite = tab.dataset.site!;
    markPins(lastSite);
    pick.hidden = true;
    drop.hidden = true;
  });

  pins.forEach((p) => p.addEventListener('click', (e) => {
    e.stopPropagation();
    const tab = $<HTMLElement>(`#tab-${p.dataset.site}`)!;
    selectSite(tab);
  }));

  const fmt = (lon: number, lat: number) =>
    `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? dirs[0] : dirs[1]}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? dirs[2] : dirs[3]}`;

  stage.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.pin')) return;
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    const ll = inverse(x, y, frame);
    if (!ll) return;
    picked = ll;
    drop.style.left = `${(x / W) * 100}%`;
    drop.style.top = `${(y / H) * 100}%`;
    drop.hidden = false;
    // restart the drop animation
    drop.style.animation = 'none'; void drop.offsetWidth; drop.style.animation = '';
    for (const t of $$<HTMLElement>('[role="tab"]', tabList)) {
      t.setAttribute('aria-selected', 'false');
      document.getElementById(t.getAttribute('aria-controls')!)!.hidden = true;
    }
    markPins(null);
    $('[data-coords]', pick)!.textContent = fmt(ll[0], ll[1]);
    pick.hidden = false;
  });

  $('[data-pick-clear]', pick)?.addEventListener('click', () => {
    selectSite($<HTMLElement>(`#tab-${lastSite}`)!, true);
  });
  $('[data-pick-cta]', pick)?.addEventListener('click', () => {
    if (picked) setFormLocation(fmt(picked[0], picked[1]));
    setTopic('site');
  });
}

/* ---------- Estimate ---------- */
const est = $('[data-estimate]');
if (est) {
  const sep = est.dataset.sep ?? ',', mark = est.dataset.mark ?? '.', to = est.dataset.to ?? 'to';
  const input = $<HTMLInputElement>('[data-units]', est)!;
  const out = $('[data-units-out]', est)!;
  const litres = $('[data-litres]', est)!;
  const nets = $$('[data-collectors] .net', est);
  const toteBox = $('[data-totes]', est)!;
  const toteText = $('[data-totes-text]', est)!;
  const render = () => {
    const n = Number(input.value);
    const e = estimate(n, INDUSTRIAL);
    out.textContent = String(n);
    litres.textContent = `${groupDigits(e.litresMin, sep)} ${to} ${groupDigits(e.litresMax, sep)}`;
    nets.forEach((el, i) => el.classList.toggle('on', i < n));
    toteText.textContent = `${oneDecimal(e.litresMin / 1000, mark)} ${to} ${oneDecimal(e.litresMax / 1000, mark)}`;
    const cells = totes(n);
    const have = toteBox.children.length;
    for (let i = have; i < cells.length; i++) {
      const s = document.createElement('span');
      s.className = 'tote';
      s.append(document.createElement('i'), document.createElement('b'));
      // Astro scopes styles with a data attribute; copy it from a sibling.
      const proto = toteBox.firstElementChild;
      if (proto) for (const a of proto.getAttributeNames()) if (a.startsWith('data-astro-cid')) { s.setAttribute(a, ''); s.firstElementChild!.setAttribute(a, ''); s.lastElementChild!.setAttribute(a, ''); }
      toteBox.append(s);
    }
    while (toteBox.children.length > cells.length) toteBox.lastElementChild!.remove();
    cells.forEach((c, i) => {
      const el = toteBox.children[i] as HTMLElement;
      el.style.setProperty('--lo', String(c.low));
      el.style.setProperty('--hi', String(c.high));
    });
  };
  input.addEventListener('input', render);
  render();
}

/* ---------- Form ---------- */
const form = $<HTMLFormElement>('[data-form]');
function setTopic(topic: string) {
  const r = form?.querySelector<HTMLInputElement>(`input[name="topic"][value="${topic}"]`);
  if (r) r.checked = true;
}
function setFormLocation(v: string) {
  const el = form?.querySelector<HTMLInputElement>('#f-location');
  if (el) el.value = v;
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLElement>('[data-topic]');
  if (a?.dataset.topic) setTopic(a.dataset.topic);
});

if (form) {
  const messages = JSON.parse(form.dataset.errors!) as Record<string, string>;
  const summary = $('[data-error-summary]')!;
  const done = $('[data-done]')!;
  const fieldIds: Record<string, string> = { location: 'f-location', sector: 'f-sector', need: 'f-need', name: 'f-name', email: 'f-email', message: 'f-message', consent: 'f-consent' };

  const read = (): Fields => {
    const fd = new FormData(form);
    return {
      topic: String(fd.get('topic') ?? ''),
      location: String(fd.get('location') ?? ''),
      sector: String(fd.get('sector') ?? ''),
      need: String(fd.get('need') ?? ''),
      name: String(fd.get('name') ?? ''),
      org: String(fd.get('org') ?? ''),
      email: String(fd.get('email') ?? ''),
      message: String(fd.get('message') ?? ''),
      consent: fd.get('consent') === 'on',
    };
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = read();
    const errs = validate(f);
    for (const [field, id] of Object.entries(fieldIds)) {
      const err = errs.find((x) => x.field === field);
      const input = document.getElementById(id)!;
      const msg = document.getElementById(`e-${field}`);
      input.setAttribute('aria-invalid', String(!!err));
      if (msg) { msg.hidden = !err; msg.textContent = err ? messages[err.code] : ''; }
    }
    const ul = $('ul', summary)!;
    ul.replaceChildren(...errs.map((x) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${fieldIds[x.field]}`;
      a.textContent = messages[x.code];
      a.addEventListener('click', (ev) => { ev.preventDefault(); document.getElementById(fieldIds[x.field])!.focus(); });
      li.append(a);
      return li;
    }));
    if (errs.length) {
      summary.hidden = false;
      summary.focus();
      return;
    }
    summary.hidden = true;
    const dl = $('[data-done-list]', done)!;
    const label = (id: string) => (form.querySelector(`label[for="${id}"]`)?.firstChild?.textContent ?? id).trim();
    const topicLabel = form.querySelector<HTMLInputElement>('input[name="topic"]:checked')?.nextElementSibling?.textContent ?? f.topic;
    const sectorLabel = form.querySelector<HTMLSelectElement>('#f-sector')!.selectedOptions[0]?.textContent ?? f.sector;
    const rows: [string, string][] = [
      [form.querySelector('legend')!.textContent!, topicLabel],
      [label('f-location'), f.location],
      [label('f-sector'), sectorLabel],
      [label('f-need'), f.need],
      [label('f-name'), f.name],
      [label('f-org'), f.org],
      [label('f-email'), f.email],
      [label('f-message'), f.message],
    ];
    dl.replaceChildren(...rows.filter(([, v]) => v.trim()).flatMap(([k, v]) => {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      for (const a of dl.getAttributeNames()) if (a.startsWith('data-astro-cid')) { dt.setAttribute(a, ''); dd.setAttribute(a, ''); }
      return [dt, dd];
    }));
    form.hidden = true;
    done.hidden = false;
    done.focus();
  });

  $('[data-edit]', done)?.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLElement>('input, select, textarea')?.focus();
  });
}
