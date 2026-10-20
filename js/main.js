/* =========================================================
   Волейбол для начинающих — базовые скрипты
   ========================================================= */

(function () {
  "use strict";

  var doc = document;

  /* ---------- Текущий год в подвале ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Мобильное меню ---------- */
  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Открыть меню");
      }
    });
  }

  /* ---------- Подсветка активного раздела ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));
  var sections = navLinks
    .map(function (link) {
      return doc.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var linkBySection = new Map();
    navLinks.forEach(function (link) {
      var section = doc.querySelector(link.getAttribute("href"));
      if (section) {
        linkBySection.set(section, link);
      }
    });

    var setActive = function (section) {
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", linkBySection.get(section) === link);
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------- Кнопка «наверх» ---------- */
  var toTop = doc.querySelector(".to-top");

  if (toTop) {
    var updateToTop = function () {
      var visible = window.scrollY > 600;
      toTop.hidden = !visible;
    };

    window.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();

    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });
    });
  }

  /* ---------- Эффект взрыва и слизи для ссылок в шапке ---------- */
  (function () {
    var links = Array.prototype.slice.call(doc.querySelectorAll('.site-nav a[href^="#"]'));

    if (!links.length) {
      return;
    }

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var palette = ["#a9e35f", "#c8f279", "#74d24f", "#ddf79a", "#4fbe63"];

    var canvas = null;
    var ctx = null;
    var viewW = 0;
    var viewH = 0;
    var dpr = 1;
    var blobs = [];
    var drips = [];
    var puddles = [];
    var waves = [];
    var raf = null;
    var prev = 0;

    function floor() {
      return viewH - 6;
    }

    function resize() {
      if (!canvas) {
        return;
      }

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      canvas.style.width = viewW + "px";
      canvas.style.height = viewH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function ensureCanvas() {
      if (canvas) {
        return;
      }

      canvas = doc.createElement("canvas");
      canvas.className = "fx-layer";
      canvas.setAttribute("aria-hidden", "true");
      doc.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize, { passive: true });
    }

    function addPuddle(x, y, r, color) {
      puddles.push({
        x: x,
        y: y,
        r: r,
        max: r * (1.6 + Math.random() * 0.8),
        color: color,
        life: 0,
        dur: 3200,
        seed: Math.random() * 6.28
      });

      if (puddles.length > 40) {
        puddles.shift();
      }
    }

    function blast(x, y, rect) {
      var count = reduced ? 8 : 26;

      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.55;
        var speed = 240 + Math.random() * 520;

        blobs.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 180,
          r: 4 + Math.random() * 12,
          color: palette[(Math.random() * palette.length) | 0],
          life: 0,
          max: 800 + Math.random() * 900,
          seed: Math.random() * 6.28
        });
      }

      waves.push({ x: x, y: y, life: 0, dur: 520, max: 320 });

      var dripCount = reduced ? 0 : 4 + ((Math.random() * 4) | 0);

      for (var j = 0; j < dripCount; j++) {
        drips.push({
          x: rect.left + rect.width * (0.15 + Math.random() * 0.7),
          y: rect.bottom - 4,
          vx: (Math.random() - 0.5) * 80,
          vy: 30 + Math.random() * 140,
          r: 3 + Math.random() * 5,
          color: palette[(Math.random() * palette.length) | 0],
          life: 0,
          trail: []
        });
      }
    }

    function drawBlob(blob, stretch) {
      var wobble = 1 + Math.sin(blob.seed + blob.life / 90) * 0.14;

      ctx.fillStyle = blob.color;
      ctx.beginPath();
      ctx.ellipse(blob.x, blob.y, blob.r * wobble, (blob.r * stretch) / wobble, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#f2ffd0";
      ctx.beginPath();
      ctx.ellipse(blob.x - blob.r * 0.3, blob.y - blob.r * 0.38, blob.r * 0.3, blob.r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawPuddle(p) {
      var grow = Math.min(1, p.life / 220);
      var fade = p.life > p.dur - 700 ? Math.max(0, (p.dur - p.life) / 700) : 1;
      var r = p.r + (p.max - p.r) * grow;

      ctx.globalAlpha = 0.9 * fade;
      ctx.fillStyle = p.color;
      ctx.beginPath();

      for (var a = 0; a <= 6.3; a += 0.35) {
        var wob = 1 + Math.sin(a * 3 + p.seed) * 0.13;
        var px = p.x + Math.cos(a) * r * wob;
        var py = p.y + Math.sin(a) * r * 0.34 * wob;

        if (a === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function update(dt) {
      var i;

      for (i = blobs.length - 1; i >= 0; i--) {
        var b = blobs[i];
        b.life += dt;
        b.vy += 1500 * dt;
        b.vx *= 0.985;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.y > floor()) {
          b.y = floor();
          b.vy *= -0.28;
          b.vx *= 0.55;
          addPuddle(b.x, floor(), b.r * 1.3, b.color);
        }

        if (b.life > b.max) {
          blobs.splice(i, 1);
        }
      }

      for (i = drips.length - 1; i >= 0; i--) {
        var d = drips[i];
        d.life += dt;
        d.vy += 1400 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.trail.push({ x: d.x, y: d.y });

        if (d.trail.length > 12) {
          d.trail.shift();
        }

        if (d.y > floor()) {
          addPuddle(d.x, floor(), d.r * 2.4, d.color);
          drips.splice(i, 1);
        }
      }

      for (i = puddles.length - 1; i >= 0; i--) {
        puddles[i].life += dt;

        if (puddles[i].life > puddles[i].dur) {
          puddles.splice(i, 1);
        }
      }

      for (i = waves.length - 1; i >= 0; i--) {
        waves[i].life += dt;

        if (waves[i].life > waves[i].dur) {
          waves.splice(i, 1);
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, viewW, viewH);

      var i;

      for (i = 0; i < puddles.length; i++) {
        drawPuddle(puddles[i]);
      }

      for (i = 0; i < drips.length; i++) {
        var d = drips[i];

        for (var t = 0; t < d.trail.length; t++) {
          var point = d.trail[t];
          ctx.globalAlpha = (t / d.trail.length) * 0.5;
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, d.r * (t / d.trail.length) * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        drawBlob(d, 1 + Math.min(3, d.vy / 320));
      }

      for (i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        drawBlob(b, b.y >= floor() ? 0.5 : 1);
      }

      for (i = 0; i < waves.length; i++) {
        var w = waves[i];
        var progress = w.life / w.dur;

        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.strokeStyle = "#d9f79a";
        ctx.lineWidth = 5 * (1 - progress) + 1;
        ctx.beginPath();
        ctx.arc(w.x, w.y, 8 + (w.max - 8) * progress, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function loop(now) {
      var dt = Math.min(0.05, (now - prev) / 1000 || 0.016);
      prev = now;
      update(dt);
      render();

      if (blobs.length || drips.length || puddles.length || waves.length) {
        raf = window.requestAnimationFrame(loop);
      } else {
        raf = null;
        ctx.clearRect(0, 0, viewW, viewH);
      }
    }

    function start() {
      if (raf === null) {
        prev = window.performance ? window.performance.now() : Date.now();
        raf = window.requestAnimationFrame(loop);
      }
    }

    function shake() {
      doc.body.classList.remove("fx-shake");
      void doc.body.offsetWidth;
      doc.body.classList.add("fx-shake");

      window.setTimeout(function () {
        doc.body.classList.remove("fx-shake");
      }, 520);
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var rect = link.getBoundingClientRect();
        var x = rect.left + rect.width / 2;
        var y = rect.top + rect.height / 2;

        ensureCanvas();
        blast(x, y, rect);
        start();

        link.classList.remove("fx-hit", "fx-slimy");
        void link.offsetWidth;
        link.classList.add("fx-hit", "fx-slimy");

        window.setTimeout(function () {
          link.classList.remove("fx-hit", "fx-slimy");
        }, 950);

        if (!reduced) {
          shake();
        }
      });
    });
  })();

  /* ---------- Одновременно открыта одна карточка ---------- */
  var details = Array.prototype.slice.call(doc.querySelectorAll(".card-details"));

  details.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) {
        return;
      }

      details.forEach(function (other) {
        if (other !== item && other.open) {
          other.open = false;
        }
      });
    });
  });
})();
