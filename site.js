// Glimmy site: draws Glimmy (same proportions as the app's GlimmyView), lets the hero Glimmy look at the pointer and
// blink now and then, cycles its greetings, and reveals sections as they scroll in. Respects Reduce Motion.
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var uid = 0;

  // Body Ø 100 in a 260 × 260 box: the glow reaches 2.6 × the body, like in the app.
  function glimmySVG(opts) {
    var id = "g" + (uid++);
    var wink = opts.wink, sleepy = opts.sleepy;
    function eye(x, closed) {
      if (closed) {
        return '<path class="eye" d="M ' + (x - 7) + ' -5 Q ' + x + ' 1 ' + (x + 7) + ' -5" stroke="#2A2433" stroke-width="3" fill="none" stroke-linecap="round"/>';
      }
      return '<g class="eye"><ellipse cx="' + x + '" cy="-6" rx="6.75" ry="9.7" fill="#2A2433"/>' +
        '<circle cx="' + (x + 2.4) + '" cy="-9.9" r="2.6" fill="#fff"/></g>';
    }
    return '<svg class="glimmy" viewBox="-130 -130 260 260" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<radialGradient id="' + id + 'h"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'b" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".8" stop-color="#FFF6F0"/><stop offset="1" stop-color="#FFE9DE"/></radialGradient>' +
      '</defs>' +
      '<circle class="glow" r="130" fill="url(#' + id + 'h)"/>' +
      '<circle r="50" fill="url(#' + id + 'b)"/>' +
      '<g class="face">' + eye(-13.2, sleepy) + eye(13.2, sleepy || wink) +
      '<path d="M -7.5 20 Q 0 27 7.5 20" stroke="#2A2433" stroke-width="3" fill="none" stroke-linecap="round"/></g>' +
      '</svg>';
  }

  document.querySelectorAll("[data-glimmy]").forEach(function (el) {
    el.innerHTML = glimmySVG({ wink: el.dataset.glimmy === "wink", sleepy: el.dataset.glimmy === "sleepy" });
  });

  // Hero: Glimmy looks toward the pointer (a few pixels, like it does in the app) and blinks every few seconds.
  var hero = document.querySelector(".hero-glimmy .glimmy");
  if (hero && !reduced) {
    var face = hero.querySelector(".face");
    window.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var d = Math.max(1, Math.hypot(dx, dy)), k = Math.min(1, d / 400);
      face.style.transform = "translate(" + (dx / d * 9 * k).toFixed(2) + "px," + (dy / d * 7 * k).toFixed(2) + "px)";
    }, { passive: true });
    (function blinkLoop() {
      setTimeout(function () {
        hero.classList.add("blink");
        setTimeout(function () { hero.classList.remove("blink"); blinkLoop(); }, 200);
      }, 2400 + Math.random() * 2600);
    })();
  }

  // Hero bubble: Glimmy's own greetings, one at a time, popping in like on the Today card.
  var bubble = document.querySelector(".sky-card .bubble");
  if (bubble) {
    var lines = (bubble.dataset.lines || "").split("|").filter(Boolean);
    var i = 0;
    var show = function () { bubble.textContent = lines[i % lines.length]; bubble.classList.add("on"); };
    setTimeout(show, reduced ? 0 : 700);
    if (!reduced && lines.length > 1) {
      setInterval(function () {
        bubble.classList.remove("on");
        setTimeout(function () { i++; show(); }, 450);
      }, 4200);
    }
  }

  // Sections rise in once, as they enter the screen.
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.18 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }
})();
