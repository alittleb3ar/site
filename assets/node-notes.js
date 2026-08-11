/* click-to-open notes for the stack chips on a project page.

   Reads a page-defined NODE_NOTES map keyed by chip label (trailing version
   numbers stripped: "PostgreSQL 17" -> "PostgreSQL"), so one entry annotates
   every chip carrying that name across every diagram on the page.

   Each entry is an object:
     why   what the thing is doing here, and why it and not something else
     href  optional — the project's own homepage
     live  optional — {url, label} for the instance actually running on the
           box. This is the whole reason the chips became buttons: a logo
           linking to dagster.io is a logo; a logo linking to *my* Dagster is
           evidence.

   The popover is inserted next to the chip it belongs to rather than at the
   end of <body>, so Tab reaches its links right after the chip that opened it.
   Pages without a NODE_NOTES map are left untouched. Legacy plain-string
   entries are still honoured as a bare `why`. */
(function () {
  var notes = typeof NODE_NOTES !== 'undefined' && NODE_NOTES;
  if (!notes || !Object.keys(notes).length) return;

  var pop = document.createElement('div');
  pop.className = 'node-note';
  pop.id = 'node-note';
  pop.setAttribute('role', 'note');
  pop.hidden = true;
  var current = null;

  function entryFor(key) {
    var note = notes[key];
    if (!note) return null;
    return typeof note === 'string' ? { why: note } : note;
  }

  function keyFor(node) {
    var label = node.querySelector('span');
    return label ? label.textContent.trim().replace(/\s+\d+$/, '') : '';
  }

  function close(refocus) {
    if (!current) return;
    pop.hidden = true;
    current.classList.remove('open');
    current.setAttribute('aria-expanded', 'false');
    current.removeAttribute('aria-describedby');
    if (refocus) current.focus();
    current = null;
  }

  /* Build the note body. textContent throughout — the copy is hand-authored,
     but it is still data, and a stray "<" in a note should read as a "<". */
  function fill(key, entry) {
    pop.textContent = '';

    var title = document.createElement('b');
    title.textContent = key;
    pop.appendChild(title);

    var why = document.createElement('p');
    why.textContent = entry.why;
    pop.appendChild(why);

    if (!entry.live && !entry.href) return;

    var links = document.createElement('div');
    links.className = 'note-links';
    if (entry.live) {
      var live = document.createElement('a');
      live.className = 'live';
      live.href = entry.live.url;
      live.target = '_blank';
      live.rel = 'noopener';
      live.textContent = entry.live.label;
      links.appendChild(live);
    }
    if (entry.href) {
      var home = document.createElement('a');
      home.href = entry.href;
      home.target = '_blank';
      home.rel = 'noopener';
      home.textContent = entry.href.replace(/^https?:\/\//, '').replace(/\/$/, '');
      links.appendChild(home);
    }
    pop.appendChild(links);
  }

  /* Position against the chip, clamped to the viewport, then translated into
     the coordinates of whatever the popover's offsetParent turned out to be
     (.nodes is position:relative for exactly this). */
  function place(node) {
    var chip = node.getBoundingClientRect();
    var origin = pop.offsetParent
      ? pop.offsetParent.getBoundingClientRect()
      : { left: 0, top: 0 };
    var width = pop.offsetWidth;
    var viewport = document.documentElement.clientWidth;

    var x = Math.max(8, Math.min(chip.left + chip.width / 2 - width / 2, viewport - width - 8));
    var y = chip.bottom + 8;
    if (chip.bottom + pop.offsetHeight + 16 > window.innerHeight) {
      y = chip.top - pop.offsetHeight - 8; /* flip above if cramped */
    }

    pop.style.left = x - origin.left + 'px';
    pop.style.top = y - origin.top + 'px';
  }

  function open(node, key, entry) {
    close();
    node.parentNode.insertBefore(pop, node.nextSibling);
    fill(key, entry);
    pop.hidden = false;
    place(node);
    node.classList.add('open');
    node.setAttribute('aria-expanded', 'true');
    node.setAttribute('aria-describedby', 'node-note');
    current = node;
  }

  /* Diagram chips only. The hero's side doors are the same chip by design,
     but they are plain links — a note would be in the way of the click. */
  document.querySelectorAll('.diagram .node, .topo .node').forEach(function (node) {
    var key = keyFor(node);
    var entry = entryFor(key);
    if (!entry) return;

    node.classList.add('has-note');
    if (entry.live) node.classList.add('has-live');
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-expanded', 'false');

    node.addEventListener('click', function (e) {
      e.stopPropagation();
      current === node ? close() : open(node, key, entry);
    });
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        node.click();
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (current && !pop.contains(e.target)) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close(true);
  });
  window.addEventListener('resize', function () {
    close();
  });
})();
