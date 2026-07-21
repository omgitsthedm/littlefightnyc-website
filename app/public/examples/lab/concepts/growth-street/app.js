const stage = document.getElementById("streetStage");
const serviceLayer = document.getElementById("serviceLayer");
const replayBtn = document.getElementById("replayBtn");
const buildingNodes = Array.from(document.querySelectorAll(".building"));

const growthPlan = [
  {
    slug: "perry",
    services: ["Website", "SEO", "WiFi Fix", "Branding"]
  },
  {
    slug: "bleecker",
    services: ["Website", "SEO", "WiFi Fix", "Branding", "Reviews"]
  },
  {
    slug: "village",
    services: ["Website", "SEO", "WiFi Fix", "Branding", "CRM", "Analytics"]
  },
  {
    slug: "orchard",
    services: ["Website", "SEO", "WiFi Fix", "Branding"]
  },
  {
    slug: "vestry",
    services: ["Website", "SEO", "WiFi Fix", "Branding", "Reservations"]
  }
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let timers = [];
let hasPlayedOnView = false;

function queueTimer(callback, delay) {
  const timerId = window.setTimeout(callback, delay);
  timers.push(timerId);
}

function clearTimers() {
  timers.forEach((timerId) => window.clearTimeout(timerId));
  timers = [];
}

function floorBottom(level, storefrontHeight, floorHeight, floorGap) {
  return storefrontHeight + (level * (floorHeight + floorGap));
}

function buildFloors() {
  growthPlan.forEach((plan) => {
    const building = buildingNodes.find((node) => node.dataset.slug === plan.slug);
    if (!building) return;

    const holder = building.querySelector(".floors");
    if (!holder) return;

    holder.textContent = "";

    const style = getComputedStyle(building);
    const storefrontHeight = parseFloat(style.getPropertyValue("--storefront-h")) || 160;
    const floorHeight = parseFloat(style.getPropertyValue("--floor-h")) || 44;
    const floorGap = parseFloat(style.getPropertyValue("--floor-gap")) || 6;

    plan.services.forEach((service, index) => {
      const floor = document.createElement("div");
      floor.className = "service-floor";
      floor.style.bottom = `${floorBottom(index, storefrontHeight, floorHeight, floorGap)}px`;

      const label = document.createElement("span");
      label.className = "floor-label";
      label.textContent = service;

      floor.appendChild(label);
      holder.appendChild(floor);
    });
  });
}

function getBuildingFloors(building) {
  return Array.from(building.querySelectorAll(".service-floor"));
}

function spawnMoneySplash(building, level) {
  if (prefersReducedMotion) return;

  const stageRect = stage.getBoundingClientRect();
  const buildingRect = building.getBoundingClientRect();
  const style = getComputedStyle(building);
  const storefrontHeight = parseFloat(style.getPropertyValue("--storefront-h")) || 160;
  const floorHeight = parseFloat(style.getPropertyValue("--floor-h")) || 44;
  const floorGap = parseFloat(style.getPropertyValue("--floor-gap")) || 6;

  const x = buildingRect.left - stageRect.left + buildingRect.width * 0.5;
  const y = buildingRect.bottom - stageRect.top - floorBottom(level, storefrontHeight, floorHeight, floorGap) - floorHeight * 0.6;

  for (let i = 0; i < 4; i += 1) {
    const money = document.createElement("span");
    money.className = "money-splash";
    money.textContent = "$";

    const dx = (Math.random() * 52) - 26;
    const dy = -1 * (42 + Math.random() * 62);
    const jitterX = (Math.random() * 22) - 11;

    money.style.setProperty("--x", `${x + jitterX}px`);
    money.style.setProperty("--y", `${y}px`);
    money.style.setProperty("--dx", `${dx}px`);
    money.style.setProperty("--dy", `${dy}px`);

    serviceLayer.appendChild(money);

    requestAnimationFrame(() => money.classList.add("burst"));
    queueTimer(() => money.classList.add("fade"), 420);
    queueTimer(() => money.remove(), 760);
  }
}

function setFinalState() {
  buildingNodes.forEach((building) => {
    getBuildingFloors(building).forEach((floor) => floor.classList.add("is-visible"));
  });
}

function resetState() {
  clearTimers();
  serviceLayer.textContent = "";

  buildingNodes.forEach((building) => {
    getBuildingFloors(building).forEach((floor) => floor.classList.remove("is-visible"));
  });
}

function runSequence() {
  if (prefersReducedMotion) {
    setFinalState();
    return;
  }

  let cursor = 260;

  growthPlan.forEach((plan) => {
    const building = buildingNodes.find((node) => node.dataset.slug === plan.slug);
    if (!building) return;

    const floors = getBuildingFloors(building);

    floors.forEach((floor, floorIndex) => {
      queueTimer(() => {
        floor.classList.add("is-visible");
        spawnMoneySplash(building, floorIndex);
      }, cursor + floorIndex * 420);
    });

    cursor += floors.length * 420 + 300;
  });
}

function play() {
  resetState();
  runSequence();
}

buildFloors();
if (prefersReducedMotion) {
  setFinalState();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasPlayedOnView) {
        hasPlayedOnView = true;
        play();
      }
    });
  },
  { threshold: 0.45 }
);

observer.observe(stage);

replayBtn.addEventListener("click", () => {
  play();
});
