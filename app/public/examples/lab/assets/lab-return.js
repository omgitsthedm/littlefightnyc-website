/* The Lab — shared return chip. Injected into every concept page so nobody
 * gets stranded inside a demo. Self-contained (styles included), dependency-
 * free, keyboard-accessible, safe on light or dark grounds. Also installs the
 * Lab favicon when the mirrored page has none (kills the 404 + brands the tab). */
(function () {
  'use strict';
  function init() {
    // Favicon: only if the page didn't bring its own.
    if (!document.querySelector('link[rel~="icon"]')) {
      var icon = document.createElement('link');
      icon.rel = 'icon';
      icon.href = '/examples/lab/assets/favicon.svg';
      icon.type = 'image/svg+xml';
      document.head.appendChild(icon);
    }

    if (document.querySelector('.lab-return')) return;

    var style = document.createElement('style');
    style.textContent =
      '.lab-return{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147483000;' +
      'display:inline-flex;align-items:center;gap:.5em;padding:.55em 1em .55em .8em;border-radius:999px;' +
      'background:rgba(6,8,15,.88);border:1px solid rgba(240,242,248,.22);color:#f0f2f8;' +
      'font:600 13px/1 "Barlow",system-ui,sans-serif;letter-spacing:.02em;text-decoration:none;' +
      '-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);' +
      'box-shadow:0 4px 18px rgba(0,0,0,.35);transition:border-color .18s ease,transform .18s ease}' +
      '.lab-return:hover{border-color:#f97316;transform:translateY(-1px)}' +
      '.lab-return:focus-visible{outline:2px solid #f97316;outline-offset:3px}' +
      '.lab-return svg{width:1.5em;height:1em;color:#f97316}' +
      '@media (prefers-reduced-motion:reduce){.lab-return{transition:none}.lab-return:hover{transform:none}}' +
      '@media print{.lab-return{display:none}}';
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.className = 'lab-return';
    a.href = '/examples/lab/';
    a.setAttribute('aria-label', 'Back to The Lab — all concepts');
    a.innerHTML =
      '<svg viewBox="0 0 838 562" aria-hidden="true" fill="currentColor"><g transform="translate(-297.16,611.59) scale(0.1,-0.1)" stroke="none">' +
      '<path d="M6050 6114 c-317 -39 -527 -140 -620 -299 -42 -70 -38 -357 6 -506 17 -57 20 -58 111 -24 189 70 312 107 448 136 128 27 475 30 623 5 51 -8 99 -13 107 -9 18 6 20 85 5 195 -5 40 -14 105 -19 145 -30 230 -198 349 -506 358 -66 2 -136 1 -155 -1z"/>' +
      '<path d="M8860 5354 c-152 -16 -582 -54 -908 -79 -326 -25 -534 -168 -639 -439 -32 -82 -44 -234 -41 -541 4 -311 -2 -337 -84 -409 -50 -43 -86 -59 -165 -72 -39 -6 -43 -4 -61 26 -11 17 -22 48 -26 68 -20 126 -56 422 -61 507 -4 55 -13 143 -20 195 -7 52 -16 129 -20 170 -9 103 -32 235 -45 259 -42 80 -614 120 -811 57 -24 -8 -91 -29 -149 -47 -134 -41 -282 -112 -315 -150 -29 -35 -33 -95 -14 -208 5 -35 16 -132 24 -215 17 -180 51 -493 65 -591 16 -115 13 -189 -8 -208 -27 -24 -99 -35 -281 -42 -343 -12 -525 -91 -693 -297 -135 -166 -174 -337 -158 -685 9 -192 11 -198 52 -212 67 -24 1232 -9 1543 19 61 5 184 14 275 20 150 10 459 46 585 69 28 5 79 12 115 16 65 6 161 23 295 52 39 8 90 19 115 24 97 20 147 56 337 243 222 219 296 271 461 331 72 26 224 60 312 69 30 4 87 13 125 21 146 30 243 47 330 61 50 7 144 25 210 39 66 14 149 30 185 36 36 5 117 21 180 36 63 14 150 34 192 43 42 9 84 22 92 30 20 16 21 104 2 260 -8 63 -17 178 -21 255 -3 77 -10 176 -15 220 -5 44 -14 145 -20 225 -16 204 -41 324 -90 422 -97 193 -244 318 -461 394 -73 25 -281 40 -389 28z m420 -582 c59 -26 108 -75 136 -137 26 -58 59 -299 70 -510 10 -189 2 -200 -141 -215 -44 -4 -125 -13 -180 -19 -55 -6 -149 -15 -210 -21 -60 -5 -155 -15 -210 -21 -154 -16 -212 -3 -275 63 -41 45 -59 109 -71 267 -17 213 -9 347 23 396 83 127 183 168 478 195 69 6 152 15 185 20 80 11 140 6 195 -18z"/>' +
      '<path d="M10910 3414 c-30 -7 -118 -25 -195 -39 -77 -14 -174 -32 -215 -40 -173 -34 -250 -48 -340 -60 -52 -8 -149 -25 -215 -40 -66 -14 -149 -30 -185 -36 -36 -5 -94 -16 -130 -24 -177 -40 -249 -55 -290 -60 -25 -3 -74 -12 -110 -20 -116 -25 -223 -46 -310 -60 -47 -7 -107 -18 -135 -24 -105 -22 -213 -42 -300 -56 -219 -34 -315 -90 -490 -286 -107 -119 -155 -162 -249 -223 -74 -49 -231 -113 -316 -131 -206 -42 -369 -72 -450 -80 -30 -3 -100 -12 -155 -20 -153 -22 -452 -53 -625 -65 -85 -6 -202 -15 -259 -20 -506 -45 -1428 -36 -2266 22 -479 33 -451 32 -522 13 -190 -52 -231 -306 -122 -761 16 -66 36 -138 44 -160 9 -21 22 -52 28 -69 53 -134 166 -309 251 -389 158 -147 285 -213 506 -262 122 -27 888 -35 3235 -31 2488 3 2311 -1 2575 61 176 41 267 74 427 155 376 187 669 473 900 876 78 137 179 375 198 465 4 19 22 87 40 150 103 364 149 896 92 1058 -27 76 -65 126 -117 152 -47 24 -210 27 -300 4z m-515 -678 c32 -14 72 -46 107 -85 51 -57 58 -69 69 -132 26 -144 -23 -264 -136 -333 -47 -29 -55 -31 -155 -31 -100 0 -108 2 -155 31 -209 128 -187 444 38 549 71 33 163 34 232 1z"/>' +
      '</g></svg>The Lab';
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
