// Motion layer: smooth scroll, scroll-driven reveals, intro, parallax, spotlight.
// Degrades to the plain site if GSAP/Lenis didn't load or the visitor prefers reduced motion.
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = window.gsap && window.ScrollTrigger;

  // cursor spotlight on cards (pure CSS vars, no library needed)
  document.querySelectorAll('.hl-card, .feat-card, .callout-card, .quicklink, .hero-substat, .award').forEach(function(el){
    el.classList.add('spot');
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // terminal-style decode on mono labels when they scroll into view
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_-';
  function scramble(el){
    if(el.dataset.scrambled) return;
    el.dataset.scrambled = '1';
    var final = el.textContent, frame = 0, total = 22;
    (function tick(){
      var locked = Math.floor(final.length * frame / total);
      var out = '';
      for(var i = 0; i < final.length; i++){
        var c = final[i];
        out += (i < locked || c === ' ' || c === '—' || c === '·') ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if(frame++ < total) requestAnimationFrame(tick); else el.textContent = final;
    })();
  }
  var scrambleEls = Array.prototype.filter.call(
    document.querySelectorAll('.eyebrow, .callout-label, .hero-number-label, .hl-lbl, .t-label'),
    function(el){ return el.childNodes.length === 1 && el.firstChild.nodeType === 3; }
  );


  // ---------- page curtain: drop it before leaving for another page ----------
  if(!reduce){
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a');
      if(!a || e.defaultPrevented) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
      if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var url = new URL(a.href, location.href);
      if(url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if(url.pathname === location.pathname) return;
      var c = document.querySelector('.curtain');
      if(!c) return;
      e.preventDefault();
      c.classList.add('leaving');
      setTimeout(function(){ location.href = a.href; }, 470);
    });
    window.addEventListener('pageshow', function(e){
      var c = document.querySelector('.curtain');
      if(e.persisted && c){ c.classList.remove('leaving'); c.style.animation = 'none'; c.style.transform = 'translateY(-100%)'; }
    });
  }

  // measure the nav so sticky offsets and triggers always match its real height
  var navBar = document.querySelector('.nav');
  function setNavH(){ if(navBar) document.documentElement.style.setProperty('--nav-h', navBar.offsetHeight + 'px'); }
  setNavH();
  window.addEventListener('resize', setNavH);

  if(reduce || !hasGsap){ return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  gsap.config({ nullTargetWarn: false });

  // GSAP takes over these from the CSS fade-in so the two never fight
  document.querySelectorAll('.hl-card, .feat-card, .quicklink, .home-section-head, .page-band .page-header').forEach(function(el){
    el.classList.remove('reveal');
    el.classList.add('in');
  });

  // smooth scroll
  var lenis = null;
  if(window.Lenis){
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    // in-page anchors go through Lenis so they glide instead of jump
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var target = document.querySelector(a.getAttribute('href'));
        if(!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -((navBar ? navBar.offsetHeight : 60) + (document.querySelector('.jump-nav') ? 64 : 16)) });
        history.replaceState(null, '', a.getAttribute('href'));
      });
    });
    // arriving from another page with a #hash
    if(location.hash && document.querySelector(location.hash)){
      window.addEventListener('load', function(){
        lenis.scrollTo(location.hash, { offset: -((navBar ? navBar.offsetHeight : 60) + (document.querySelector('.jump-nav') ? 64 : 16)), immediate: true });
      });
    }
    // back-to-top button: swap its native handler for a Lenis one
    var oldBtn = document.querySelector('.to-top');
    if(oldBtn){
      var btn = oldBtn.cloneNode(true);
      oldBtn.parentNode.replaceChild(btn, oldBtn);
      btn.addEventListener('click', function(){ lenis.scrollTo(0); });
      lenis.on('scroll', function(e){ btn.classList.toggle('show', e.scroll > 600); });
    }
  }

  // scroll progress bar
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

  // headline intro: split into words/chars and rise them in
  function splitHeadline(h){
    var words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach(function(w, wi){
      var ws = document.createElement('span');
      ws.className = 'split-word';
      w.split('').forEach(function(ch){
        var cs = document.createElement('span');
        cs.className = 'split-char';
        cs.textContent = ch;
        ws.appendChild(cs);
      });
      h.appendChild(ws);
      if(wi < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    return h.querySelectorAll('.split-char');
  }
  var headline = document.querySelector('.hero-text h1, .page-band .page-header h1');
  if(headline){
    var chars = splitHeadline(headline);
    var intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: document.querySelector('.curtain') ? 0.55 : 0 });
    intro.from(chars, { yPercent: 115, duration: 1.0, stagger: 0.035 })
         .from('.hero-text .eyebrow, .page-band .eyebrow', { y: 14, opacity: 0, duration: 0.7 }, 0.1)
         .from('.hero-sub, .page-band .page-header p', { y: 18, opacity: 0, duration: 0.8 }, 0.35)
         .from('.hero-tags .tag', { y: 14, opacity: 0, duration: 0.6, stagger: 0.07 }, 0.5)
         .from('.dark-hero .hero-photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'power3.inOut' }, 0.15)
         .from('.rec-chip', { opacity: 0, x: 20, duration: 0.6 }, 0.9)
         .from('.jump-nav a', { y: 10, opacity: 0, duration: 0.5, stagger: 0.04 }, 0.5);
  }

  // hero parallax
  if(document.querySelector('.dark-hero')){
    gsap.to('.dark-hero-video', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.dark-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.dark-hero .hero-photo', { y: -50, ease: 'none', scrollTrigger: { trigger: '.dark-hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  document.querySelectorAll('.bp-grid').forEach(function(g){
    gsap.to(g, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: g.parentNode, start: 'top top', end: 'bottom top', scrub: true } });
  });

  // images wipe up into view
  gsap.utils.toArray('.hero-media-frame, .bento-cell, .fea-tile, .feat-img').forEach(function(el){
    if(el.closest('.dark-hero')) return;
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true }
    });
  });

  // big numbers punch in; section rules draw across
  gsap.utils.toArray('.hero-number-val, .hl-val').forEach(function(el){
    gsap.from(el, { scale: 0.86, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', transformOrigin: 'left bottom',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
  });
  gsap.utils.toArray('.category-header .rule').forEach(function(el){
    gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
  });

  // cards in a group stagger in
  ['.highlights', '.callout-grid', '.hero-substats', '.chip-row', '.quicklinks'].forEach(function(sel){
    gsap.utils.toArray(sel).forEach(function(group){
      gsap.from(group.children, { y: 26, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity',
        scrollTrigger: { trigger: group, start: 'top 95%', once: true } });
    });
  });

  // mono labels decode as they arrive
  scrambleEls.forEach(function(el){
    ST.create({ trigger: el, start: 'top 95%', once: true, onEnter: function(){ scramble(el); } });
  });

  // case-study timeline: line draws across, steps land one by one
  var mm = gsap.matchMedia();
  gsap.utils.toArray('.timeline').forEach(function(tl){
    var line = tl.querySelector('.timeline-line');
    mm.add('(min-width: 861px)', function(){
      gsap.from(line, { scaleX: 0, duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: tl, start: 'top 95%', once: true } });
    });
    mm.add('(max-width: 860px)', function(){
      gsap.from(line, { scaleY: 0, transformOrigin: 'center top', duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: tl, start: 'top 95%', once: true } });
    });
    gsap.from(tl.querySelectorAll('.t-step'), { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.18, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: tl, start: 'top 95%', once: true } });
  });

  // comparison rows slide in
  gsap.utils.toArray('.compare').forEach(function(c){
    gsap.from(c.querySelectorAll('.compare-row'), { x: -18, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.07, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: c, start: 'top 95%', once: true } });
  });


  // nav turns dark while it's over a dark band
  var navEl = document.querySelector('.nav');
  var darkTop = document.querySelector('.dark-hero, .page-band');
  if(navEl && darkTop){
    ST.create({ trigger: darkTop, start: function(){ return 'top top+=' + (navEl.offsetHeight + 2); }, end: function(){ return 'bottom top+=' + navEl.offsetHeight; },
      onToggle: function(self){ navEl.classList.toggle('on-dark', self.isActive); } });
  }

  // sticky project nav highlights the section you're reading
  var spyNav = document.querySelector('.jump-nav');
  if(spyNav){
    var spyLinks = spyNav.querySelectorAll('a');
    spyLinks.forEach(function(a){
      var target = document.querySelector(a.getAttribute('href'));
      if(!target) return;
      ST.create({ trigger: target, start: 'top 45%', end: 'bottom 45%',
        onToggle: function(self){
          if(!self.isActive) return;
          spyLinks.forEach(function(l){ l.classList.remove('active'); });
          a.classList.add('active');
          spyNav.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
        } });
    });
  }

  window.addEventListener('load', function(){ ST.refresh(); });
})();
