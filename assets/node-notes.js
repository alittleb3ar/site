/* click-to-open "why this tech" notes for deployment-diagram chips
   (.topo section). Reads a page-defined NODE_NOTES map keyed by chip
   label (trailing version numbers stripped: "PostgreSQL 17" -> "PostgreSQL").
   Pages without a NODE_NOTES map are left untouched. */
(function(){
  var notes = (typeof NODE_NOTES !== 'undefined') && NODE_NOTES;
  if(!notes || !Object.keys(notes).length) return;

  var pop = document.createElement('div');
  pop.className = 'node-note';
  pop.id = 'node-note';
  pop.setAttribute('role','note');
  pop.hidden = true;
  document.body.appendChild(pop);
  var current = null;

  function keyFor(node){
    var s = node.querySelector('span');
    return s ? s.textContent.trim().replace(/\s+\d+$/,'') : '';
  }

  function close(refocus){
    if(!current) return;
    pop.hidden = true;
    current.classList.remove('open');
    current.setAttribute('aria-expanded','false');
    current.removeAttribute('aria-describedby');
    if(refocus) current.focus();
    current = null;
  }

  function open(node, key){
    close();
    pop.innerHTML = '<b></b><p></p>';
    pop.querySelector('b').textContent = key;
    pop.querySelector('p').textContent = notes[key];
    pop.hidden = false;
    var r = node.getBoundingClientRect(), w = pop.offsetWidth;
    var x = Math.max(8 + window.scrollX,
            Math.min(r.left + r.width/2 - w/2 + window.scrollX,
                     window.scrollX + document.documentElement.clientWidth - w - 8));
    var y = r.bottom + window.scrollY + 8;
    if(r.bottom + pop.offsetHeight + 16 > window.innerHeight)  /* flip above if cramped */
      y = r.top + window.scrollY - pop.offsetHeight - 8;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    node.classList.add('open');
    node.setAttribute('aria-expanded','true');
    node.setAttribute('aria-describedby','node-note');
    current = node;
  }

  /* only plain deployment chips — a.node keeps navigating */
  document.querySelectorAll('.topo div.node').forEach(function(node){
    var key = keyFor(node);
    if(!notes[key]) return;
    node.classList.add('has-note');
    node.setAttribute('tabindex','0');
    node.setAttribute('role','button');
    node.setAttribute('aria-expanded','false');
    node.addEventListener('click', function(e){
      e.stopPropagation();
      current === node ? close() : open(node, key);
    });
    node.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); node.click(); }
    });
  });

  document.addEventListener('click', function(e){
    if(current && !pop.contains(e.target)) close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close(true);
  });
  window.addEventListener('resize', function(){ close(); });
})();
