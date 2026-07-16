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
  var revealEls = document.querySelectorAll('.entry, .quicklink, .category-header, .page-header, .spec-strip');
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

  // lightbox
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt=""><div class="lightbox-caption"></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lightbox-caption');
  document.querySelectorAll('.img-slot img').forEach(function(img){
    img.addEventListener('click', function(){
      lbImg.src = img.src;
      var cap = img.closest('.img-wrap');
      lbCap.textContent = cap && cap.querySelector('.img-caption') ? cap.querySelector('.img-caption').textContent : '';
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
