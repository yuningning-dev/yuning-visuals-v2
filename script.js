document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader');
  const front  = document.querySelector('.mountain-layer--front');
  const art    = document.querySelector('.guohua-raster');
  const veil   = document.querySelector('.raster-veil');

  const clearLoader = () => loader?.remove();

  // Safety net: whatever happens with animation/GSAP below, the loader must
  // never stay on screen forever, and the image/veil are ALREADY visible via
  // plain CSS (see .guohua-raster / .raster-veil in styles.css) — so if
  // anything below fails, the visitor still sees the artwork, just static.
  if (!front || !art || !veil) {
    console.warn('[yuning-visuals] Hero elements missing, skipping animation.');
    clearLoader();
    return;
  }

  art.addEventListener('error', () => {
    console.error('[yuning-visuals] guohua-raster image failed to load:', art.currentSrc || art.src);
  });

  // Small decorative ink-splash particles, added once, purely cosmetic.
  const splash = document.createElement('div');
  splash.className = 'ink-splash';
  [
    ['4%', '12%', '13px', '44px', '-28deg', '.55'],
    ['17%', '5%', '8px', '32px', '24deg', '.42'],
    ['29%', '19%', '20px', '9px', '-45deg', '.5'],
    ['47%', '7%', '11px', '38px', '58deg', '.6'],
    ['64%', '16%', '15px', '9px', '-25deg', '.45'],
    ['81%', '4%', '10px', '35px', '38deg', '.52'],
    ['94%', '24%', '16px', '8px', '-52deg', '.42'],
  ].forEach(([x, y, w, h, r, o]) => {
    const i = document.createElement('i');
    i.style.cssText = `--x:${x};--y:${y};--w:${w};--h:${h};--r:${r};--o:${o}`;
    splash.appendChild(i);
  });
  front.appendChild(splash);

  // Everything past this point is a PROGRESSIVE ENHANCEMENT: the scroll-driven
  // reveal (image sliding up from behind, title fading, etc). If GSAP or
  // ScrollTrigger didn't load (CDN blocked, offline, ad-blocker...), we just
  // bail out cleanly and leave the static CSS layout in place — the image
  // stays visible, it just doesn't animate.
  const startAnimation = () => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(loader, { opacity: 0, duration: .7, delay: .3, onComplete: clearLoader });

    // Only NOW do we hide the art off-screen, right before animating it back in.
    gsap.set([art, veil], { yPercent: 60 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.25 }
    });
    tl.from('.hero__sun', { scale: .55, opacity: 0, duration: 1.1, ease: 'power2.out' })
      .from('.hero__content .eyebrow, .hero__title span, .hero__subtitle, .hero__cta',
        { y: 45, opacity: 0, stagger: .1, duration: 1, ease: 'power4.out' }, '-.15')
      .to('.hero__title', { scale: .97, duration: 1.4, ease: 'none' }, '>.2')
      // The landscape rises and the whole title block sinks/fades away together,
      // starting almost at the same time, so the title visibly sinks under it.
      .to([art, veil], { yPercent: 0, duration: 3.4, ease: 'power2.out' }, '<')
      .to('.hero__content', { yPercent: 160, duration: 4.2, ease: 'power1.inOut' }, '<+=0.9')
      .to('.hero__content', { opacity: 0, duration: 1, ease: 'power2.in' }, '>-.6')
      .to(splash, { opacity: 1, scale: 1, duration: .35, ease: 'back.out(1.4)' }, '-=.6');

    gsap.utils.toArray(
      '.section-label, .intro h2, .intro__grid>div, .work__heading, .project-card, .process__list>div, .contact__inner>*'
    ).forEach(el => gsap.from(el, {
      y: 60, opacity: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
    }));
  };

  try {
    if (window.gsap && window.ScrollTrigger) {
      startAnimation();
    } else {
      console.warn('[yuning-visuals] GSAP/ScrollTrigger not available — showing static hero.');
      clearLoader();
    }
  } catch (err) {
    // Whatever goes wrong in the animation, never let it leave the art hidden
    // or the loader stuck on screen.
    console.error('[yuning-visuals] Animation failed, falling back to static hero:', err);
    gsap?.set?.([art, veil], { yPercent: 0, clearProps: 'transform' });
    clearLoader();
  }
});
