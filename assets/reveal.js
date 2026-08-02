/* shared scroll-reveal: adds .in to .proj / .entry / .lane / .host / .clock /
   .build-card as they enter view.

   Cards inside a hidden tab panel never intersect, so they are never revealed
   here — the tab controller hands them their .in when it opens the panel. */
(function(){
    function reveal(){
      var els = document.querySelectorAll('.proj, .entry, .lane, .host, .clock, .build-card');
      if(!('IntersectionObserver' in window)){
        els.forEach(function(e){e.classList.add('in');});
        return;
      }
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
        });
      },{threshold:.15});
      els.forEach(function(e,i){ e.style.transitionDelay=(i%6)*0.05+'s'; io.observe(e); });
    }
    if(document.readyState!=='loading') reveal();
    else document.addEventListener('DOMContentLoaded', reveal);
  })();