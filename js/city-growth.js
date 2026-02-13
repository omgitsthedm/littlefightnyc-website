// Little Fight NYC — City Growth Animation
// Floors stack upward above each storefront as services are added

(function () {
  "use strict";

  const stage = document.getElementById("streetStage");
  const replayBtn = document.getElementById("replayBtn");
  if (!stage || !replayBtn) return;

  const buildings = Array.from(document.querySelectorAll(".city-building"));

  const growthPlan = [
    { slug: "bakery", services: ["WiFi Fix", "POS Setup", "Google Maps"] },
    { slug: "cafe", services: ["Website", "Socials"] },
    { slug: "hotel", services: ["Network", "Security", "Backup"] },
    { slug: "realty", services: ["Email", "Cloud"] },
    { slug: "restaurant", services: ["Online Orders", "Printers", "Support"] },
  ];

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];
  var hasPlayed = false;

  function queue(fn, delay) {
    timers.push(setTimeout(fn, delay));
  }

  function clearAll() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function buildFloors() {
    growthPlan.forEach(function (plan) {
      var el = buildings.find(function (b) { return b.dataset.slug === plan.slug; });
      if (!el) return;
      var stack = el.querySelector(".city-floors-stack");
      stack.innerHTML = "";

      plan.services.forEach(function (service) {
        var floor = document.createElement("div");
        floor.className = "city-service-floor";

        var label = document.createElement("span");
        label.className = "city-floor-label";
        label.textContent = service;

        floor.appendChild(label);
        stack.appendChild(floor);
      });
    });
  }

  function getAllFloors(building) {
    return Array.from(building.querySelectorAll(".city-service-floor"));
  }

  function showAll() {
    buildings.forEach(function (b) {
      getAllFloors(b).forEach(function (f) { f.classList.add("is-visible"); });
    });
  }

  function hideAll() {
    buildings.forEach(function (b) {
      getAllFloors(b).forEach(function (f) { f.classList.remove("is-visible"); });
    });
  }

  function runSequence() {
    if (prefersReduced) { showAll(); return; }

    // Much faster base delay
    var delay = 100;

    growthPlan.forEach(function (plan) {
      var el = buildings.find(function (b) { return b.dataset.slug === plan.slug; });
      if (!el) return;
      var floors = getAllFloors(el);

      floors.forEach(function (floor, i) {
        // Tighter stagger for snappier feel
        queue(function () { floor.classList.add("is-visible"); }, delay + i * 150);
      });

      // Shorter wait before next building starts
      delay += floors.length * 150 + 100;
    });
  }

  function play() {
    clearAll();
    hideAll();
    runSequence();
  }

  buildFloors();
  if (prefersReduced) showAll();

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !hasPlayed) {
          hasPlayed = true;
          play();
        }
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(stage);

  replayBtn.addEventListener("click", function () {
    hasPlayed = true;
    play();
  });
})();
