// Lab Log site interactions
(function(){
  if(window.__labLogInit) return;
  window.__labLogInit = true;
  // mobile nav
  var t = document.getElementById('navToggle');
  if(t) t.addEventListener('click', function(){
    document.getElementById('navLinks').classList.toggle('open');
  });

  // scroll reveal
  var revealEls = document.querySelectorAll('.entry, .quicklink, .category-header, .page-header, .spec-strip, .hl-card, .feat-card, .home-section-head');
  revealEls.forEach(function(el){ el.classList.add('reveal'); });
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold: 0.08});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }
  // fallback so nothing can stay hidden if the observer never fires
  function revealVisible(){
    revealEls.forEach(function(el){
      if(!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('in');
    });
  }
  window.addEventListener('scroll', revealVisible, {passive:true});
  window.addEventListener('load', revealVisible);

  // count-up numbers: animate from 0 to the value once the stat scrolls into view
  var countEls = document.querySelectorAll('[data-countup]');
  if(countEls.length && 'IntersectionObserver' in window){
    // real values live in the HTML; only zero them once the animation can actually run
    countEls.forEach(function(el){
      var dec = (el.getAttribute('data-countup').split('.')[1] || '').length;
      el.textContent = (el.getAttribute('data-prefix') || '') + (0).toFixed(dec) + (el.getAttribute('data-suffix') || '');
    });
    var countIo = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        countIo.unobserve(e.target);
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-countup'));
        var decimals = (el.getAttribute('data-countup').split('.')[1] || '').length;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var start = null;
        var dur = 1100;
        function step(ts){
          if(start === null) start = ts;
          var progress = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var val = target * eased;
          var text = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
          el.textContent = prefix + text + suffix;
          if(progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, {threshold: 0.6});
    countEls.forEach(function(el){ countIo.observe(el); });
  }

  // tilt cards: subtle 3D tilt toward the cursor
  var tiltEls = document.querySelectorAll('.tilt-card');
  if(window.matchMedia && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    tiltEls.forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(600px) rotateX(' + (py * -6) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-2px)';
      });
      el.addEventListener('mouseleave', function(){
        el.style.transform = '';
      });
    });
  }

  // lightbox
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt=""><div class="lightbox-caption"></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lightbox-caption');
  document.querySelectorAll('.img-slot img, .fea-tile img, .bento-cell img').forEach(function(img){
    img.addEventListener('click', function(){
      lbImg.src = img.src;
      var wrap = img.closest('.img-wrap');
      var tile = img.closest('.fea-tile');
      var cell = img.closest('.bento-cell');
      var capEl = wrap ? wrap.querySelector('.img-caption') : (tile ? tile.querySelector('span') : (cell ? cell.querySelector('.bento-cap') : null));
      lbCap.textContent = capEl ? capEl.textContent : '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLb(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLb(); });

  // photo-pending: if a pending image loads successfully, swap placeholder out
  document.querySelectorAll('img[data-pending]').forEach(function(img){
    function ok(){
      var wrap = img.closest('.photo-pending');
      if(wrap){
        wrap.classList.remove('photo-pending');
        wrap.style.cssText = 'border:none;background:none;';
        var lbl = wrap.querySelector('span'); if(lbl) lbl.remove();
        img.style.display = 'block';
      }
    }
    if(img.complete && img.naturalWidth > 0){ ok(); }
    else{
      img.addEventListener('load', ok);
      img.addEventListener('error', function(){ img.remove(); });
    }
  });

  // back to top
  var btn = document.createElement('button');
  btn.className = 'to-top';
  btn.setAttribute('aria-label','Back to top');
  btn.textContent = '↑';
  document.body.appendChild(btn);
  btn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  window.addEventListener('scroll', function(){
    btn.classList.toggle('show', window.scrollY > 600);
  }, {passive:true});
})();
