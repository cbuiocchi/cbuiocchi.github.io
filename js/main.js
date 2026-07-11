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

  function isMobile() {
    return window.innerWidth <= 760;
  }

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
  // the real src on close and restore it on the next open/re-open.
  function restoreIframe(win) {
    var iframe = win.querySelector('iframe');
    if (iframe && iframe.dataset.src && iframe.src !== iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
    }
  }

  function unloadIframe(win) {
    var iframe = win.querySelector('iframe');
    if (iframe) {
      if (!iframe.dataset.src) iframe.dataset.src = iframe.src;
      iframe.src = 'about:blank';
    }
  }

  function openWindow(id) {
    var win = getWindow(id);
    if (!win) return;

    if (!win.classList.contains('open')) {
      win.classList.add('open');
      win.classList.remove('minimized');

      if (!isMobile() && !win.style.left && !win.style.top) {
        var step = cascadeOffset % CASCADE_MAX;
        win.style.left = (60 + step * CASCADE_STEP) + 'px';
        win.style.top = (40 + step * CASCADE_STEP) + 'px';
        win.style.width = '620px';
        win.style.height = '480px';
        cascadeOffset++;
      }

      addTaskbarItem(id);
    } else if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
    }

    restoreIframe(win);
    focusWindow(id);
    closeStartMenu();
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
      win.style.height = (desktop.clientHeight - 66) + 'px';
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
  function makeDraggable(win) {
    var titleBar = win.querySelector('.title-bar');
    var dragging = false;
    var startX, startY, origLeft, origTop;

    titleBar.addEventListener('mousedown', function (e) {
      if (e.target.closest('.title-bar-controls')) return;
      if (isMobile()) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = win.offsetLeft;
      origTop = win.offsetTop;
      focusWindow(win.id);
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newLeft = Math.max(0, origLeft + dx);
      var newTop = Math.max(0, origTop + dy);
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', function () {
      dragging = false;
    });
  }

  // ---- wire up all windows ----
  document.querySelectorAll('.xp-window').forEach(function (win) {
    makeDraggable(win);

    win.addEventListener('mousedown', function () {
      focusWindow(win.id);
    });

    win.querySelector('[data-action="close"]').addEventListener('click', function () {
      closeWindow(win.id);
    });
    win.querySelector('[data-action="minimize"]').addEventListener('click', function () {
      minimizeWindow(win.id);
    });
    win.querySelector('[data-action="maximize"]').addEventListener('click', function () {
      toggleMaximize(win.id);
    });
  });

  // ---- icons + start menu open windows ----
  document.querySelectorAll('[data-window]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openWindow(trigger.dataset.window);
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

  // ---- boot screen ----
  var boot = document.getElementById('boot-screen');
  function dismissBoot() {
    boot.classList.add('hidden');
    setTimeout(function () { boot.style.display = 'none'; }, 650);
  }
  boot.addEventListener('click', dismissBoot);
  setTimeout(dismissBoot, 2600);
})();
