/* ==========================================================================
   Showreel — lazy, network-aware, IntersectionObserver-driven video grid.
   No dependency on the hero's GSAP timeline: this module is self-contained
   and safe to defer-load.
   ========================================================================== */

(function () {
  const section = document.querySelector(".showreel");
  if (!section) return;

  const cards = Array.from(section.querySelectorAll(".showreel__card"));
  const filters = Array.from(section.querySelectorAll(".showreel__filter"));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSaveData = !!(connection && connection.saveData);
  const isSlowNetwork =
    !!(connection && /2g/.test(connection.effectiveType || ""));
  const autoplayAllowed = !prefersReducedMotion && !isSaveData && !isSlowNetwork;

  function hydrateSource(video) {
    if (!video || video.dataset.hydrated) return;
    const src = video.dataset.src;
    if (!src) return;
    video.src = src;
    video.preload = "metadata";
    video.load();
    video.dataset.hydrated = "true";
    video.addEventListener(
      "loadeddata",
      () => video.classList.add("is-ready"),
      { once: true }
    );
  }

  function playCard(card) {
    const video = card.querySelector(".showreel__video");
    if (!video) return;
    hydrateSource(video);
    const attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.then(() => card.classList.add("is-playing")).catch(() => {});
    } else {
      card.classList.add("is-playing");
    }
  }

  function pauseCard(card) {
    const video = card.querySelector(".showreel__video");
    if (!video) return;
    video.pause();
    card.classList.remove("is-playing");
  }

  // Lazy-hydrate the <video> only once its card is near the viewport,
  // and only autoplay it if the network/motion conditions allow it.
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const card = entry.target;
        if (entry.isIntersecting) {
          const video = card.querySelector(".showreel__video");
          hydrateSource(video);
          if (autoplayAllowed && matchMedia("(hover: hover)").matches === false) {
            // Touch devices: autoplay muted clips once visible, like a feed.
            playCard(card);
          }
        } else {
          pauseCard(card);
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0.25 }
  );

  cards.forEach((card) => {
    visibilityObserver.observe(card);

    const playButton = card.querySelector(".showreel__play");
    const video = card.querySelector(".showreel__video");

    // Desktop: play on hover, pause + rewind on leave.
    card.addEventListener("mouseenter", () => {
      if (!autoplayAllowed) return;
      if (matchMedia("(hover: hover)").matches) playCard(card);
    });
    card.addEventListener("mouseleave", () => {
      if (matchMedia("(hover: hover)").matches) pauseCard(card);
    });

    // Explicit control for touch/keyboard/reduced-motion users.
    playButton?.addEventListener("click", () => {
      if (card.classList.contains("is-playing")) {
        pauseCard(card);
      } else {
        playCard(card);
      }
    });

    video?.addEventListener("ended", () => card.classList.remove("is-playing"));
  });

  // Domain filter (Tech / Lifestyle / Fashion / All) — pure DOM toggling,
  // no re-render, no layout thrash beyond the show/hide itself.
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter;

      cards.forEach((card) => {
        const matches = filter === "all" || card.dataset.domain === filter;
        card.classList.toggle("is-hidden", !matches);
        if (!matches) pauseCard(card);
      });
    });
  });
})();
