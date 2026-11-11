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
