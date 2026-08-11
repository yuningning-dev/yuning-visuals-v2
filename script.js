document.addEventListener("DOMContentLoaded", () => {
  const loader = document.querySelector(".loader");
  const front = document.querySelector(".mountain-layer--front");
  const legacyBack = document.querySelector(".mountain-layer--back");

  const style = document.createElement("style");

  style.textContent = `
    .mountain-layer--back {
      display: none !important;
    }

    .mountain-layer--front {
      z-index: 8 !important;
      height: 100% !important;
      display: block !important;
      overflow: visible !important;
    }

    .hero__title {
      position: relative;
      z-index: 4;
      left: clamp(-2.8rem, -2vw, -0.8rem);
    }

    .guohua-raster {
      position: absolute;
      inset: 0;
      z-index: 9;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center bottom;
      opacity: 0.98;
      visibility: visible;
      transform: translateY(0) scale(1.04);
      filter: grayscale(1) contrast(1.15) brightness(0.58);
      mix-blend-mode: multiply;
      pointer-events: none;
    }

    .raster-veil {
      position: absolute;
      inset: 0;
      z-index: 8;
      pointer-events: none;
      opacity: 0.72;
      background:
        linear-gradient(
          180deg,
          transparent 32%,
          rgba(8, 10, 12, 0.1) 54%,
          rgba(3, 4, 5, 0.72) 100%
        );
    }

    .ink-splash {
      position: absolute;
      inset: 8% 0 auto;
      z-index: 10;
      height: 38%;
      opacity: 0.35;
      pointer-events: none;
    }

    .ink-splash i {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: var(--w);
      height: var(--h);
      border-radius: 65% 25% 60% 35%;
      background: #090d11;
      opacity: var(--o);
      transform: rotate(var(--r));
    }

    .ink-splash i:nth-child(odd) {
      border-radius: 25% 70% 30% 60%;
    }

    @media (max-width: 700px) {
      .hero__title {
        left: -0.35rem;
      }

      .guohua-raster {
        object-position: center bottom;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ink-splash {
        display: none;
      }

      .guohua-raster {
        opacity: 1;
        transform: none;
      }

      .raster-veil {
        opacity: 0.72;
      }
    }
  `;

  document.head.appendChild(style);

  // Supprime définitivement l'ancien calque de montagnes.
  if (legacyBack) {
    legacyBack.remove();
  }

  let artwork = null;

  if (front) {
    // Supprime les anciens SVG et anciens éléments.
    front.replaceChildren();
    front.classList.add("guohua-only");

    front.innerHTML = `
      <img
        class="guohua-raster"
        src="./assets/yuning-guohua-shadow.png?v=3"
        alt="Paysage chinois monochrome avec montagnes, pins, temple et brume"
      />

      <div
        class="raster-veil"
        aria-hidden="true"
      ></div>
    `;

    artwork = front.querySelector(".guohua-raster");

    const splash = document.createElement("div");
    splash.className = "ink-splash";

    const drops = [
      ["4%", "12%", "13px", "44px", "-28deg", "0.55"],
      ["17%", "5%", "8px", "32px", "24deg", "0.42"],
      ["29%", "19%", "20px", "9px", "-45deg", "0.5"],
      ["47%", "7%", "11px", "38px", "58deg", "0.6"],
      ["64%", "16%", "15px", "9px", "-25deg", "0.45"],
      ["81%", "4%", "10px", "35px", "38deg", "0.52"],
      ["94%", "24%", "16px", "8px", "-52deg", "0.42"]
    ];

    drops.forEach(([x, y, width, height, rotation, opacity]) => {
      const drop = document.createElement("i");

      drop.style.cssText = `
        --x: ${x};
        --y: ${y};
        --w: ${width};
        --h: ${height};
        --r: ${rotation};
        --o: ${opacity};
      `;

      splash.appendChild(drop);
    });

    front.appendChild(splash);
  }

  const startAnimation = () => {
    if (!window.gsap) {
      if (loader) loader.remove();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.to(loader, {
      opacity: 0,
      duration: 0.7,
      delay: 0.3,
      onComplete: () => loader?.remove()
    });

    // État initial de l'animation.
    gsap.set(".guohua-raster, .raster-veil", {
      yPercent: 105,
      opacity: 0
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.25
      }
    });

    timeline
      .from(".hero__sun", {
        scale: 0.55,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out"
      })

      .from(
        ".hero__content .eyebrow, .hero__title span, .hero__subtitle, .hero__cta",
        {
          y: 45,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power4.out"
        },
        "-=0.15"
      )

      // Le titre reste visible pendant cette phase.
      .to(
        ".hero__title",
        {
          yPercent: -2,
          scale: 0.98,
          duration: 2.35,
          ease: "none"
        },
        ">"
      )

      .to(
        ".hero__subtitle, .hero__cta",
        {
          opacity: 0.72,
          y: -8,
          duration: 0.72,
          ease: "none"
        },
        "<"
      )

      // Le nouveau paysage PNG monte devant le titre.
      .to(
        ".guohua-raster, .raster-veil",
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.85,
          ease: "power2.out"
        },
        ">0.2"
      )

      .to(
        ".ink-splash",
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.4)"
        },
        ">-0.28"
      )

      .to(
        ".hero__subtitle, .hero__cta",
        {
          opacity: 0,
          y: -25,
          duration: 0.3,
          ease: "power2.in"
        },
        ">0.02"
      )

      // Le titre devient discret seulement après l'arrivée du paysage.
      .to(
        ".hero__title",
        {
          opacity: 0.18,
          duration: 0.42,
          ease: "power2.in"
        },
        ">0.5"
      )

      .to(
        ".hero__stamp, .hero__footer",
        {
          opacity: 0,
          duration: 0.3
        },
        ">-0.1"
      );

    gsap.utils
      .toArray(
        ".section-label, .intro h2, .intro__grid > div, .work__heading, .project-card, .process__list > div, .contact__inner > *"
      )
      .forEach((element) => {
        gsap.from(element, {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none reverse"
          }
        });
      });
  };

  // On attend que le PNG soit chargé avant de lancer GSAP.
  if (artwork) {
    if (artwork.complete) {
      startAnimation();
    } else {
      artwork.addEventListener("load", startAnimation, { once: true });
      artwork.addEventListener("error", () => {
        console.error(
          "Impossible de charger ./assets/yuning-guohua-shadow.png"
        );

        if (loader) loader.remove();
      });
    }
  } else {
    startAnimation();
  }
});
