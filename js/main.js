// Window manager: open/close/minimize/drag/focus for the XP-style desktop,
// plus the boot screen, start menu, taskbar, and clock.

(function () {
  var zCounter = 10;
  var openWindows = []; // ordered list of window ids currently open

  var desktop = document.getElementById('desktop');
  var taskbarWindows = document.getElementById('taskbar-windows');
  var startMenu = document.getElementById('start-menu');
  var startButton = document.getElementById('start-button');

  var cascadeOffset = 0;
  var CASCADE_STEP = 28;
  var CASCADE_MAX = 6;

  // Must match the RESPONSIVE / MOBILE media query in css/style.css. Short
  // landscape phones are wider than 760px but have no room for floating
  // windows, so they get the stacked layout too.
  var mobileQuery = window.matchMedia('(max-width: 760px), (max-height: 500px)');
  function isMobile() {
    return mobileQuery.matches;
  }

  var TASKBAR_H = 40;

  // ---- boot screen ----
  // Wired up FIRST, on purpose. The boot screen covers the whole page, so if
  // anything below this throws before the dismissal is registered, the visitor
  // is stuck staring at it with no way into the site. Registering it up front
  // means only the boot code itself can strand anyone. (css/style.css also
  // auto-hides it on a pure-CSS timer, for the case where this file fails to
  // load or parse at all.)
  var boot = document.getElementById('boot-screen');
  function dismissBoot() {
    // dismissBoot fires from either the click handler or the timeout below,
    // so bail if we've already run to avoid re-opening the welcome window.
    if (boot.classList.contains('hidden')) return;
    boot.classList.add('hidden');
    setTimeout(function () { boot.style.display = 'none'; }, 650);
    openWindow('win-welcome');
    // Let the desktop settle for a beat before the ad barges in.
    setTimeout(openAd, 1200);
  }
  boot.addEventListener('click', dismissBoot);
  setTimeout(dismissBoot, 2600);

  function getWindow(id) {
    return document.getElementById(id);
  }

  function focusWindow(id) {
    document.querySelectorAll('.xp-window').forEach(function (w) {
      w.classList.toggle('focused', w.id === id);
    });
    var win = getWindow(id);
    if (win) win.style.zIndex = ++zCounter;
    updateTaskbarActive(id);
  }

  // Closing a window only hides it in CSS — the iframe underneath (and any
  // audio it's playing) keeps running unless we actually unload it. We stash
  // the real src on close and restore it on the next open/re-open. A project
  // site holds more than one (trailer + GDD), so handle every iframe in it.
  function restoreIframe(win) {
    win.querySelectorAll('iframe').forEach(function (iframe) {
      // On mobile the PDF embeds sit in desktop-only wrappers, so don't
      // spend bandwidth loading something nobody can see.
      if (isMobile() && iframe.closest('.desktop-only')) return;
      // Compare the raw attribute: iframe.src resolves to an absolute URL,
      // so a relative data-src (the GDD PDFs) would never match and the PDF
      // would reload, losing its scroll position, on every refocus.
      if (iframe.dataset.src && iframe.getAttribute('src') !== iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
      }
    });
  }

  function unloadIframe(win) {
    win.querySelectorAll('iframe').forEach(function (iframe) {
      if (!iframe.dataset.src) iframe.dataset.src = iframe.src;
      iframe.src = 'about:blank';
    });
  }

  function openWindow(id) {
    var win = getWindow(id);
    if (!win) return;

    if (!win.classList.contains('open')) {
      win.classList.add('open');
      win.classList.remove('minimized');

      if (!isMobile() && !win.style.left && !win.style.top) placeWindow(win);

      addTaskbarItem(id);
    } else if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
    }

    restoreIframe(win);
    focusWindow(id);
    closeStartMenu();

    if (isMobile()) {
      setTimeout(function () {
        win.scrollIntoView({ block: 'start' });
      }, 100);
    }
  }

  // Give a window its desktop size and position. Called on first open, and
  // again if a window opened in the stacked mobile layout ends up on the
  // desktop layout (rotating a tablet, widening the browser).
  function placeWindow(win) {
    if (win.id === 'win-deckborn-ad') { placeAd(win); return; }
    // Per-window size can be preset via data-width/data-height;
    // otherwise fall back to the 620x480 default.
    var w = parseInt(win.dataset.width, 10) || 620;
    var h = parseInt(win.dataset.height, 10) || 480;
    // The project sites ask for a big window; don't let one spill past
    // the screen edge or under the taskbar on smaller displays.
    w = Math.max(320, Math.min(w, desktop.clientWidth - 80));
    h = Math.max(200, Math.min(h, desktop.clientHeight - TASKBAR_H - 60));
    win.style.width = w + 'px';
    win.style.height = h + 'px';
    if (win.id === 'win-welcome') {
      // The welcome window greets visitors, so sit it dead-center of the
      // desktop rather than in the cascade stack.
      win.style.left = Math.max(0, (desktop.clientWidth - w) / 2) + 'px';
      win.style.top = Math.max(0, (desktop.clientHeight - TASKBAR_H - h) / 2) + 'px';
    } else {
      // Position can also be preset via data-left/data-top; else cascade.
      var step = cascadeOffset % CASCADE_MAX;
      var left = parseInt(win.dataset.left, 10) || (60 + step * CASCADE_STEP);
      var top = parseInt(win.dataset.top, 10) || (40 + step * CASCADE_STEP);
      // On a smaller screen the cascade would push a big window off the
      // right edge or under the taskbar, so pull it back into view.
      win.style.left = Math.max(0, Math.min(left, desktop.clientWidth - w)) + 'px';
      win.style.top = Math.max(0, Math.min(top, desktop.clientHeight - TASKBAR_H - h)) + 'px';
      cascadeOffset++;
    }
  }

  // Keep at least a grabbable strip of the title bar on screen, so a window
  // can never be dragged (or left by a browser resize) where it can't be
  // dragged back from.
  function clampPosition(win, left, top) {
    var keep = 80;
    var maxLeft = desktop.clientWidth - keep;
    var maxTop = desktop.clientHeight - TASKBAR_H - 30;
    win.style.left = Math.max(keep - win.offsetWidth, Math.min(left, maxLeft)) + 'px';
    win.style.top = Math.max(0, Math.min(top, maxTop)) + 'px';
  }

  function closeWindow(id) {
    var win = getWindow(id);
    if (!win) return;
    win.classList.remove('open', 'minimized');
    win.style.left = '';
    win.style.top = '';
    unloadIframe(win);
    removeTaskbarItem(id);
  }

  function minimizeWindow(id) {
    var win = getWindow(id);
    if (!win) return;
    win.classList.add('minimized');
    updateTaskbarActive(null);
  }

  function toggleMaximize(id) {
    var win = getWindow(id);
    if (!win) return;
    if (win.dataset.maximized === 'true') {
      win.style.left = win.dataset.prevLeft;
      win.style.top = win.dataset.prevTop;
      win.style.width = win.dataset.prevWidth;
      win.style.height = win.dataset.prevHeight;
      win.dataset.maximized = 'false';
    } else {
      win.dataset.prevLeft = win.style.left;
      win.dataset.prevTop = win.style.top;
      win.dataset.prevWidth = win.style.width;
      win.dataset.prevHeight = win.style.height;
      win.style.left = '10px';
      win.style.top = '10px';
      win.style.width = (desktop.clientWidth - 20) + 'px';
      win.style.height = (desktop.clientHeight - TASKBAR_H - 26) + 'px';
      win.dataset.maximized = 'true';
    }
    focusWindow(id);
  }

  // ---- taskbar ----
  function addTaskbarItem(id) {
    if (document.querySelector('.taskbar-item[data-id="' + id + '"]')) return;
    var win = getWindow(id);
    var icon = win.querySelector('.title-bar-icon');
    var item = document.createElement('button');
    item.className = 'taskbar-item';
    item.dataset.id = id;
    item.innerHTML = '<img src="' + (icon ? icon.src : '') + '" alt="">' +
      '<span>' + (win.dataset.title || id) + '</span>';
    item.addEventListener('click', function () {
      if (win.classList.contains('minimized') || !win.classList.contains('focused')) {
        openWindow(id);
      } else {
        minimizeWindow(id);
        updateTaskbarActive(null);
      }
    });
    taskbarWindows.appendChild(item);
  }

  function removeTaskbarItem(id) {
    var item = document.querySelector('.taskbar-item[data-id="' + id + '"]');
    if (item) item.remove();
  }

  function updateTaskbarActive(activeId) {
    document.querySelectorAll('.taskbar-item').forEach(function (item) {
      item.classList.toggle('active', item.dataset.id === activeId);
    });
  }

  // ---- dragging ----
  // Pointer events, so it works with a mouse, a pen, or a finger on a
  // tablet. While dragging, iframes (trailers, PDFs) stop taking pointer
  // events (.dragging in style.css); otherwise crossing one mid-drag would
  // swallow the moves and the release, leaving the window stuck to the cursor.
  function makeDraggable(win) {
    var titleBar = win.querySelector('.title-bar');
    var dragging = false;
    var startX, startY, origLeft, origTop;

    titleBar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.title-bar-controls')) return;
      if (isMobile() || e.button !== 0) return;
      if (win.dataset.maximized === 'true') return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = win.offsetLeft;
      origTop = win.offsetTop;
      focusWindow(win.id);
      document.body.classList.add('dragging');
      if (titleBar.setPointerCapture) titleBar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    titleBar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      clampPosition(win, origLeft + e.clientX - startX, origTop + e.clientY - startY);
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('dragging');
    }
    titleBar.addEventListener('pointerup', endDrag);
    titleBar.addEventListener('pointercancel', endDrag);
    titleBar.addEventListener('lostpointercapture', endDrag);
  }

  // ---- wire up all windows ----
  document.querySelectorAll('.xp-window').forEach(function (win) {
    // Windows are hand-written HTML, so one with a typo or a missing piece
    // shouldn't cost every other window its wiring. Contain the damage.
    try {
      makeDraggable(win);

      win.addEventListener('mousedown', function () {
        focusWindow(win.id);
      });

      // Not every window carries all three controls — the pop-up ad only has
      // a close button — so wire whichever ones are actually there.
      bindControl(win, 'close', closeWindow);
      bindControl(win, 'minimize', minimizeWindow);
      bindControl(win, 'maximize', toggleMaximize);
    } catch (err) {
      if (window.console) console.error('Could not wire up window', win.id, err);
    }
  });

  function bindControl(win, action, fn) {
    var btn = win.querySelector('[data-action="' + action + '"]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      fn(win.id);
    });
  }

  // ---- icons + start menu open windows ----
  document.querySelectorAll('[data-window]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      // Some triggers are <a href="#"> (inline tour links); don't let them
      // jump to the top of the page.
      e.preventDefault();
      openWindow(trigger.dataset.window);
    });
  });

  // ---- project-site jump links ----
  // The nav in a project site scrolls the page *inside* its window. A plain
  // #anchor jump would also try to scroll the (overflow:hidden) desktop and
  // knock the whole layout out of place, so do the scroll by hand. On mobile
  // the window isn't its own scroller, so fall back to scrolling the page.
  document.querySelectorAll('[data-scroll-to]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById(link.dataset.scrollTo);
      var page = link.closest('.site-page');
      if (!target || !page) return;
      var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (page.scrollHeight > page.clientHeight) {
        var nav = page.querySelector('.site-nav');
        var top = target.getBoundingClientRect().top - page.getBoundingClientRect().top +
          page.scrollTop - (nav ? nav.offsetHeight : 0) - 8;
        page.scrollTo({ top: top, behavior: behavior });
      } else {
        target.scrollIntoView({ behavior: behavior, block: 'start' });
      }
    });
  });

  // ---- start menu toggle ----
  startButton.addEventListener('click', function (e) {
    startMenu.classList.toggle('open');
    e.stopPropagation();
  });
  document.addEventListener('click', function (e) {
    if (!startMenu.contains(e.target) && e.target !== startButton) {
      closeStartMenu();
    }
  });
  function closeStartMenu() {
    startMenu.classList.remove('open');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeStartMenu();
  });

  // ---- clock ----
  function tickClock() {
    var el = document.getElementById('taskbar-clock');
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    el.textContent = h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }
  tickClock();
  setInterval(tickClock, 15000);

  // ---- Deckborn pop-up ad ----
  // Deliberately not routed through openWindow(): the ad skips the cascade
  // and stays out of the taskbar, so closing it is final (an ad you can
  // restore from the taskbar rather defeats the bit). On desktop it parks
  // itself against the right edge, clear of the centered welcome window; on
  // mobile the responsive rules drop it into the page flow, so leave the
  // geometry alone there.
  function openAd() {
    var adId = 'win-deckborn-ad';
    var ad = getWindow(adId);
    if (!ad || ad.classList.contains('open')) return;

    if (!isMobile()) placeAd(ad);

    ad.classList.add('open');
    focusWindow(adId);
  }

  function placeAd(ad) {
    var w = parseInt(ad.dataset.width, 10) || 400;
    var h = parseInt(ad.dataset.height, 10) || 450;
    h = Math.max(200, Math.min(h, desktop.clientHeight - TASKBAR_H - 24));
    ad.style.width = w + 'px';
    ad.style.height = h + 'px';
    ad.style.left = Math.max(12, desktop.clientWidth - w - 40) + 'px';
    ad.style.top = Math.max(12, (desktop.clientHeight - TASKBAR_H - h) / 2) + 'px';
  }

  // ---- viewport changes ----
  // Rotating a tablet or resizing the browser can strand windows off screen,
  // or flip between the stacked (mobile) and floating (desktop) layouts.
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (isMobile()) return;
      document.querySelectorAll('.xp-window.open').forEach(function (win) {
        if (!win.style.left && !win.style.top) {
          placeWindow(win);
        } else if (win.dataset.maximized === 'true') {
          win.style.width = (desktop.clientWidth - 20) + 'px';
          win.style.height = (desktop.clientHeight - TASKBAR_H - 26) + 'px';
        } else {
          clampPosition(win, win.offsetLeft, win.offsetTop);
        }
        restoreIframe(win);
      });
    }, 150);
  });
})();
