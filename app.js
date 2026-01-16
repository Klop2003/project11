/* ===========================
   ДЕМО-ДАННЫЕ (каталог компонентов)
   =========================== */

const CATALOG = {
  cpu: [
    { id: "cpu_13400f", name: "Intel Core i5-13400F", socket: "LGA1700", tdp: 65, price: 899 },
    { id: "cpu_14600k",  name: "Intel Core i5-14600K",  socket: "LGA1700", tdp: 125, price: 1499 },
    { id: "cpu_7600",    name: "AMD Ryzen 5 7600",      socket: "AM5",     tdp: 65, price: 999 },
    { id: "cpu_7800x3d", name: "AMD Ryzen 7 7800X3D",   socket: "AM5",     tdp: 120, price: 1799 },
  ],

  motherboard: [
    { id: "mb_b760", name: "MSI B760 (mATX, DDR5)", socket: "LGA1700", ramType: "DDR5", formFactor: "mATX", price: 699 },
    { id: "mb_z790", name: "ASUS Z790 (ATX, DDR5)", socket: "LGA1700", ramType: "DDR5", formFactor: "ATX",  price: 1399 },
    { id: "mb_b650", name: "Gigabyte B650 (ATX, DDR5)", socket: "AM5",  ramType: "DDR5", formFactor: "ATX",  price: 899 },
    { id: "mb_a620", name: "ASRock A620 (mATX, DDR5)",  socket: "AM5",  ramType: "DDR5", formFactor: "mATX", price: 549 },
  ],

  ram: [
    { id: "ram_ddr5_32", name: "DDR5 32GB (2x16) 6000MHz", type: "DDR5", watts: 8,  price: 499 },
    { id: "ram_ddr5_16", name: "DDR5 16GB (2x8) 5600MHz",  type: "DDR5", watts: 6,  price: 299 },
    { id: "ram_ddr4_32", name: "DDR4 32GB (2x16) 3600MHz", type: "DDR4", watts: 8,  price: 359 },
  ],

  gpu: [
    { id: "gpu_rtx4060", name: "NVIDIA GeForce RTX 4060", watts: 115, price: 1399 },
    { id: "gpu_rtx4070", name: "NVIDIA GeForce RTX 4070", watts: 200, price: 2699 },
    { id: "gpu_rx7800",  name: "AMD Radeon RX 7800 XT",   watts: 263, price: 2499 },
  ],

  storage: [
    { id: "ssd_1tb", name: "NVMe SSD 1TB", watts: 5, price: 259 },
    { id: "ssd_2tb", name: "NVMe SSD 2TB", watts: 6, price: 449 },
  ],

  psu: [
    { id: "psu_550", name: "PSU 550W 80+ Bronze", watts: 550, price: 229 },
    { id: "psu_650", name: "PSU 650W 80+ Gold",   watts: 650, price: 329 },
    { id: "psu_750", name: "PSU 750W 80+ Gold",   watts: 750, price: 399 },
    { id: "psu_850", name: "PSU 850W 80+ Gold",   watts: 850, price: 499 },
  ],

  case: [
    { id: "case_matx", name: "Корпус mATX (компакт)", supports: ["mATX"], price: 199 },
    { id: "case_atx",  name: "Корпус ATX (mid-tower)", supports: ["mATX","ATX"], price: 259 },
  ],
};

/* ===========================
   УТИЛИТЫ
   =========================== */

const PLN = (n) => `${Math.round(n)} PLN`;

function byId(id){
  return document.getElementById(id);
}

function findItem(group, id){
  return CATALOG[group].find(x => x.id === id) || null;
}

function fillSelect(selectEl, items, placeholder){
  selectEl.innerHTML = "";

  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = placeholder;
  ph.disabled = true;
  ph.selected = true;
  selectEl.appendChild(ph);

  for (const it of items){
    const opt = document.createElement("option");
    opt.value = it.id;
    opt.textContent = `${it.name} — ${PLN(it.price)}`;
    selectEl.appendChild(opt);
  }
}

function safeNumber(x){
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

/* ===========================
   КОНФИГУРАТОР ПК
   =========================== */

const els = {
  cpu: byId("cpuSelect"),
  mb: byId("mbSelect"),
  ram: byId("ramSelect"),
  gpu: byId("gpuSelect"),
  storage: byId("storageSelect"),
  psu: byId("psuSelect"),
  case: byId("caseSelect"),

  compat: byId("compatBox"),
  priceOut: byId("priceOut"),
  powerOut: byId("powerOut"),

  autoPick: byId("autoPickBtn"),
  reset: byId("resetBtn"),
};

function initBuilder(){
  fillSelect(els.cpu, CATALOG.cpu, "Выберите CPU…");
  fillSelect(els.mb, CATALOG.motherboard, "Выберите материнскую плату…");
  fillSelect(els.ram, CATALOG.ram, "Выберите RAM…");
  fillSelect(els.gpu, CATALOG.gpu, "Выберите GPU…");
  fillSelect(els.storage, CATALOG.storage, "Выберите SSD…");
  fillSelect(els.psu, CATALOG.psu, "Выберите PSU…");
  fillSelect(els.case, CATALOG.case, "Выберите корпус…");

  // дефолтные значения: выберем первые совместимые "в целом"
  els.cpu.value = CATALOG.cpu[0].id;
  els.mb.value = CATALOG.motherboard[0].id;
  els.ram.value = CATALOG.ram[0].id;
  els.gpu.value = CATALOG.gpu[0].id;
  els.storage.value = CATALOG.storage[0].id;
  els.psu.value = CATALOG.psu[1].id;
  els.case.value = CATALOG.case[1].id;

  const onChange = () => recomputeBuild();
  for (const k of ["cpu","mb","ram","gpu","storage","psu","case"]){
    els[k].addEventListener("change", onChange);
  }

  els.autoPick.addEventListener("click", autoPickCompatible);
  els.reset.addEventListener("click", () => {
    initBuilder(); // простая перезагрузка состояния
    recomputeBuild();
  });

  recomputeBuild();
}

function getBuild(){
  return {
    cpu: findItem("cpu", els.cpu.value),
    mb: findItem("motherboard", els.mb.value),
    ram: findItem("ram", els.ram.value),
    gpu: findItem("gpu", els.gpu.value),
    storage: findItem("storage", els.storage.value),
    psu: findItem("psu", els.psu.value),
    case: findItem("case", els.case.value),
  };
}

function estimatePower(build){
  // очень упрощенно: CPU TDP + GPU watts + мелочь (RAM/SSD) + 35W на вентиляторы/плату
  const base = 35;
  return (
    safeNumber(build.cpu?.tdp) +
    safeNumber(build.gpu?.watts) +
    safeNumber(build.ram?.watts) +
    safeNumber(build.storage?.watts) +
    base
  );
}

function computePrice(build){
  return (
    safeNumber(build.cpu?.price) +
    safeNumber(build.mb?.price) +
    safeNumber(build.ram?.price) +
    safeNumber(build.gpu?.price) +
    safeNumber(build.storage?.price) +
    safeNumber(build.psu?.price) +
    safeNumber(build.case?.price)
  );
}

function checkCompatibility(build){
  const issues = [];
  const warnings = [];

  if (!build.cpu || !build.mb || !build.ram || !build.gpu || !build.storage || !build.psu || !build.case){
    issues.push("Выберите все компоненты.");
    return { ok: false, issues, warnings };
  }

  // CPU <-> MB socket
  if (build.cpu.socket !== build.mb.socket){
    issues.push(`Несовместимый сокет: CPU ${build.cpu.socket} ≠ MB ${build.mb.socket}.`);
  }

  // RAM type <-> MB
  if (build.ram.type !== build.mb.ramType){
    issues.push(`Несовместимая память: RAM ${build.ram.type} ≠ MB ${build.mb.ramType}.`);
  }

  // Case <-> MB form factor
  if (!build.case.supports.includes(build.mb.formFactor)){
    issues.push(`Корпус не поддерживает форм-фактор платы: ${build.mb.formFactor}.`);
  }

  // PSU vs estimated power (+ запас)
  const est = estimatePower(build);
  const recommended = Math.round(est * 1.35); // запас 35%
  if (build.psu.watts < recommended){
    issues.push(`Недостаточная мощность PSU: ${build.psu.watts}W < рекомендованных ~${recommended}W.`);
  } else if (build.psu.watts < Math.round(est * 1.2)){
    warnings.push(`Мощность PSU на грани: рекомендован больший запас (оценка ~${est}W).`);
  }

  return { ok: issues.length === 0, issues, warnings, est, recommended };
}

function renderCompat(result){
  const { ok, issues, warnings, est, recommended } = result;

  const titleClass = ok ? "compat__ok" : "compat__bad";
  const title = ok ? "Сборка совместима ✅" : "Есть проблемы совместимости ❌";

  let html = `<div class="compat__title ${titleClass}">${title}</div>`;

  if (!ok){
    html += `<ul>`;
    for (const it of issues) html += `<li class="compat__bad">${escapeHtml(it)}</li>`;
    html += `</ul>`;
  }

  if (warnings && warnings.length){
    html += `<ul>`;
    for (const w of warnings) html += `<li class="compat__warn">${escapeHtml(w)}</li>`;
    html += `</ul>`;
  }

  if (typeof est === "number"){
    html += `<div class="muted" style="margin-top:8px;">
      Оценка потребления: <strong>${Math.round(est)}W</strong>,
      рекомендуемый PSU: <strong>~${recommended}W</strong>
    </div>`;
  }

  els.compat.innerHTML = html;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function recomputeBuild(){
  const build = getBuild();
  const compat = checkCompatibility(build);
  renderCompat(compat);

  const power = estimatePower(build);
  const price = computePrice(build);

  els.powerOut.textContent = power ? `${Math.round(power)} W` : "—";
  els.priceOut.textContent = price ? PLN(price) : "—";
}

/**
 * Автоподбор: пытаемся подогнать несовместимые части,
 * минимально меняя сборку (простая стратегия).
 */
function autoPickCompatible(){
  let build = getBuild();

  // 1) Сокет: подбираем MB под CPU (или CPU под MB)
  if (build.cpu && build.mb && build.cpu.socket !== build.mb.socket){
    const mbCandidate = CATALOG.motherboard.find(mb => mb.socket === build.cpu.socket);
    if (mbCandidate) els.mb.value = mbCandidate.id;
  }

  // 2) RAM: подбираем RAM под MB
  build = getBuild();
  if (build.mb && build.ram && build.mb.ramType !== build.ram.type){
    const ramCandidate = CATALOG.ram.find(r => r.type === build.mb.ramType);
    if (ramCandidate) els.ram.value = ramCandidate.id;
  }

  // 3) Case: подбираем корпус под MB
  build = getBuild();
  if (build.mb && build.case && !build.case.supports.includes(build.mb.formFactor)){
    const caseCandidate = CATALOG.case.find(c => c.supports.includes(build.mb.formFactor));
    if (caseCandidate) els.case.value = caseCandidate.id;
  }

  // 4) PSU: подбираем PSU под потребление
  build = getBuild();
  const est = estimatePower(build);
  const need = Math.round(est * 1.35);
  if (build.psu && build.psu.watts < need){
    const psuCandidate = CATALOG.psu.find(p => p.watts >= need) || CATALOG.psu[CATALOG.psu.length - 1];
    if (psuCandidate) els.psu.value = psuCandidate.id;
  }

  recomputeBuild();
}

/* ===========================
   ИНТЕРАКТИВНАЯ КАРТА + ДОСТАВКА
   =========================== */

// Точки продаж (Варшава и рядом — просто демо)
const SALES_POINTS = [
  { id: "p1", type: "store",  name: "Магазин: Centrum (Warszawa)",  lat: 52.2297, lng: 21.0122 },
  { id: "p2", type: "store",  name: "Магазин: Mokotów (Warszawa)",  lat: 52.1934, lng: 21.0342 },
  { id: "p3", type: "pickup", name: "ПВЗ: Praga-Północ",            lat: 52.2570, lng: 21.0340 },
  { id: "p4", type: "pickup", name: "ПВЗ: Bemowo",                   lat: 52.2526, lng: 20.8972 },
];

const DELIVERY = {
  base: 15,     // PLN
  perKm: 2.0,   // PLN/km
};

let map;
let customerMarker;
let selectedPoint = null;

const mapUI = {
  selectedPoint: byId("selectedPoint"),
  distanceOut: byId("distanceOut"),
  deliveryOut: byId("deliveryOut"),
};

function initMap(){
  const center = [52.2297, 21.0122];

  map = L.map("leafletMap", { scrollWheelZoom: false }).setView(center, 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  // Иконки (простые circleMarker стили)
  const storeStyle = { radius: 8, weight: 2, color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.8 };
  const pickupStyle = { radius: 8, weight: 2, color: "#06b6d4", fillColor: "#06b6d4", fillOpacity: 0.8 };

  for (const p of SALES_POINTS){
    const style = p.type === "store" ? storeStyle : pickupStyle;

    const marker = L.circleMarker([p.lat, p.lng], style).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(p.name)}</strong><br/>Тип: ${p.type === "store" ? "магазин" : "ПВЗ"}<br/><em>Нажмите, чтобы выбрать</em>`);

    marker.on("click", () => {
      selectedPoint = p;
      mapUI.selectedPoint.textContent = p.name;
      recomputeDelivery();
    });
  }

  // Клиентская точка — перетаскиваемый маркер
  customerMarker = L.marker(center, { draggable: true }).addTo(map);
  customerMarker.bindPopup("<strong>Вы</strong><br/>Перетащите маркер, чтобы изменить адрес").openPopup();

  customerMarker.on("dragend", () => {
    recomputeDelivery();
  });

  // Начальный расчет
  selectedPoint = SALES_POINTS[0];
  mapUI.selectedPoint.textContent = selectedPoint.name;
  recomputeDelivery();
}

function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(deg){ return deg * Math.PI / 180; }

function recomputeDelivery(){
  if (!selectedPoint || !customerMarker) return;

  const c = customerMarker.getLatLng();
  const km = haversineKm(c.lat, c.lng, selectedPoint.lat, selectedPoint.lng);

  mapUI.distanceOut.textContent = `${km.toFixed(1)} км`;

  let cost = 0;
  if (selectedPoint.type === "pickup"){
    cost = 0;
  } else {
    cost = DELIVERY.base + km * DELIVERY.perKm;
  }
  mapUI.deliveryOut.textContent = PLN(cost);
}

/* ===========================
   INIT
   =========================== */

document.addEventListener("DOMContentLoaded", () => {
  initBuilder();
  initMap();
});
