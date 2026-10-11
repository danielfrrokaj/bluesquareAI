/*! Blue Square Analytics tracker — no cookies, no storage.
 * <script defer src="https://ANALYTICS_HOST/t.js" data-site="SITE_ID"></script>
 * Records page views, visible seconds on each page and clicks on links/buttons.
 * Add data-track="Name" to any element to give its clicks a custom label.
 */
(function () {
  var script = document.currentScript;
  if (!script || navigator.webdriver) return;
  var site = script.getAttribute("data-site");
  if (!site) return;
  var endpoint = (script.getAttribute("data-api") || new URL(script.src).origin) + "/api/collect";

  function send(data, beacon) {
    data.s = site;
    var body = JSON.stringify(data);
    // text/plain keeps this a "simple" cross-origin request (no CORS preflight).
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }));
    } else {
      fetch(endpoint, { method: "POST", body: body, keepalive: true, headers: { "Content-Type": "text/plain" } })["catch"](function () {});
    }
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ---- Page views and visible time ----
  var view = null; // { id, path, ms, since }

  function visibleMs() {
    return view.ms + (view.since ? Date.now() - view.since : 0);
  }

  function flush() {
    if (!view) return;
    var sec = Math.round(visibleMs() / 1000);
    if (sec > 0) send({ t: "dur", id: view.id, sec: sec }, true);
  }

  function start(first) {
    var ref = "";
    if (first && document.referrer) {
      try {
        var r = new URL(document.referrer);
        if (r.host !== location.host) ref = r.host;
      } catch (e) {}
    }
    view = { id: uid(), path: location.pathname, ms: 0, since: document.visibilityState === "visible" ? Date.now() : 0 };
    send({ t: "pv", id: view.id, p: view.path, r: ref, w: screen.width });
  }

  function onRouteChange() {
    if (view && location.pathname === view.path) return;
    flush();
    start(false);
  }

  document.addEventListener("visibilitychange", function () {
    if (!view) return;
    if (document.visibilityState === "hidden") {
      if (view.since) view.ms += Date.now() - view.since;
      view.since = 0;
      flush(); // the server keeps the highest value, so repeated flushes are safe
    } else {
      view.since = Date.now();
    }
  });
  window.addEventListener("pagehide", flush);

  // Single-page apps (Next.js, React Router…) change pages with the History API.
  ["pushState", "replaceState"].forEach(function (name) {
    var original = history[name];
    history[name] = function () {
      var result = original.apply(this, arguments);
      setTimeout(onRouteChange, 0);
      return result;
    };
  });
  window.addEventListener("popstate", function () {
    setTimeout(onRouteChange, 0);
  });

  // ---- Clicks ----
  document.addEventListener(
    "click",
    function (e) {
      var el = e.target && e.target.closest && e.target.closest("[data-track], a, button");
      if (!el) return;
      var label = el.getAttribute("data-track") || el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "";
      label = label.replace(/\s+/g, " ").trim().slice(0, 100);
      var href = el.tagName === "A" ? el.getAttribute("href") : null;
      send({ t: "click", p: location.pathname, l: label, h: href ? href.slice(0, 300) : null }, true);
    },
    true
  );

  start(true);
})();
