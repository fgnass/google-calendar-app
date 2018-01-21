/**
 * Monkey-patch the Notification constructor to remove the icon.
 * Without this patch the Calendar icon would be shown twice (as app icon and
 * as contentIcon) which looks pretty weird.
 */
function patch(win) {
  var _N = win.Notification;
  var N = (win.Notification = function(title, opts) {
    console.log(title, opts);
    opts.icon = null;
    return new _N(title, opts);
  });
  N.prototype = _N.prototype;
  N.permission = _N.permission;
  N.requestPermission = _N.requestPermission;
}

// Monkey-patch the main window as well as all iframes
patch(window);
Array.prototype.slice
  .call(document.querySelectorAll('iframe'))
  .forEach(function(f) {
    if (~f.src.indexOf(window.location.origin)) patch(f.contentWindow);
  });
