/* ============================================
   HK POS eSignature - i18n (locale JSON + key-based)
   - Load locale by lang, t(key), applyPage (data-i18n + topbar re-render)
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  var DEMO = window.HKPOS.DEMO || { lang: 'hkpos.demo.lang' };
  var langKey = DEMO.lang || 'hkpos.demo.lang';
  var messages = {};
  var currentLang = 'ko';
  var readyPromise = null;

  function getLang() {
    try {
      return localStorage.getItem(langKey) || document.documentElement.lang || 'ko';
    } catch (e) {
      return 'ko';
    }
  }

  function loadLocale(lang) {
    var pathname = (window.location.pathname || '').replace(/\\/g, '/');
    var inApp = pathname.indexOf('/app/') !== -1;
    var path = (inApp ? '../assets/locales/' : 'assets/locales/') + (lang || 'ko') + '.json';
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error('Locale not found: ' + lang);
      return res.json();
    });
  }

  function t(key, params) {
    if (!key) return '';
    var str = messages[key];
    if (str == null) return key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  function setLang(lang) {
    currentLang = lang || getLang();
    try {
      localStorage.setItem(langKey, currentLang);
    } catch (e) {}
    document.documentElement.lang = currentLang;
    return loadLocale(currentLang).then(function (data) {
      messages = data;
      return data;
    });
  }

  function applyToDocument(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (key) {
        var text = t(key);
        if (el.getAttribute('data-i18n-placeholder') === 'true') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    }
    var placeholders = root.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholders.length; j++) {
      var p = placeholders[j];
      var pk = p.getAttribute('data-i18n-placeholder');
      if (pk && pk !== 'true') {
        p.placeholder = t(pk);
      }
    }
    var ariaNodes = root.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < ariaNodes.length; k++) {
      var a = ariaNodes[k];
      var ak = a.getAttribute('data-i18n-aria');
      if (ak) {
        a.setAttribute('aria-label', t(ak));
      }
    }
    var htmlNodes = root.querySelectorAll('[data-i18n-html]');
    for (var h = 0; h < htmlNodes.length; h++) {
      var elH = htmlNodes[h];
      var keyH = elH.getAttribute('data-i18n-html');
      if (keyH) {
        var html = t(keyH);
        if (html !== keyH) elH.innerHTML = html;
      }
    }
  }

  function applyMermaid(root) {
    root = root || document;
    var el = root.querySelector('[data-i18n-mermaid="steps"]');
    if (!el || typeof window.mermaid === 'undefined') return;
    var esc = function (s) {
      return String(s || '').replace(/\n/g, '<br/>').replace(/"/g, '&quot;');
    };
    var s0 = esc(t('screen.list.step0'));
    var s1 = esc(t('screen.list.step1'));
    var s2 = esc(t('screen.list.step2'));
    var s3 = esc(t('screen.list.step3'));
    var s4 = esc(t('screen.list.step4'));
    var s5 = esc(t('screen.list.step5'));
    var code = 'flowchart LR\n    Step0["' + s0 + '"] --> Step1["' + s1 + '"]\n    Step1["' + s1 + '"] --> Step2["' + s2 + '"]\n    Step2["' + s2 + '"] --> Step3["' + s3 + '"]\n    Step3["' + s3 + '"] --> Step4["' + s4 + '"]\n    Step4["' + s4 + '"] --> Step5["' + s5 + '"]';
    var id = 'index-mermaid-' + Date.now();
    window.mermaid.render(id, code).then(function (result) {
      el.innerHTML = result.svg;
      if (result.bindFunctions && typeof result.bindFunctions === 'function') {
        result.bindFunctions(el);
      }
    }).catch(function (err) {
      console.warn('[i18n] Mermaid render failed', err);
      el.textContent = code;
    });
  }

  function reloadDeviceFrameIframes() {
    var iframes = document.querySelectorAll('iframe.device-frame__iframe[data-src]');
    var stamp = String(Date.now());
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      var dataSrc = iframe.getAttribute('data-src');
      if (!dataSrc) continue;
      var sep = dataSrc.indexOf('?') >= 0 ? '&' : '?';
      iframe.src = dataSrc + sep + 'v=' + stamp;
    }
  }

  /** 언어 변경 시 디바이스 프레임 iframe에 postMessage로 전달해, iframe 내부 언어가 즉시 전환되도록 함 (data-src 유무와 관계없이 모든 device-frame iframe 대상) */
  function notifyDeviceFrameIframes(lang) {
    var iframes = document.querySelectorAll('iframe.device-frame__iframe');
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'hkpos.setLang', lang: lang }, '*');
        }
      } catch (e) {}
    }
  }

  function applyPage(root) {
    root = root || document;
    applyToDocument(root);
    applyMermaid(root);
    var header = root.querySelector('header[data-layout="topbar"]');
    if (header && typeof window.HKPOS.renderTopbar === 'function') {
      window.HKPOS.renderTopbar(header);
      if (window.HKPOS.Pages && typeof window.HKPOS.Pages.initTopbar === 'function') {
        window.HKPOS.Pages.initTopbar();
      }
    } else {
      var sel = (root || document).querySelector('#app-language');
      if (sel) sel.value = currentLang;
      var helpBtn = (root || document).querySelector('#toggle-help');
      if (helpBtn && window.HKPOS.Utils && typeof window.HKPOS.Utils.applyHelpCollapsedState === 'function') {
        window.HKPOS.Utils.applyHelpCollapsedState();
      }
    }
    // 로그인 페이지 테스트 데이터 버튼: 언어 변경 시 다시 렌더해 번역 문구 적용
    var demoStaffHost = (root || document).querySelector('#demo-staff-accounts');
    if (demoStaffHost && window.HKPOS.Utils && typeof window.HKPOS.Utils.renderLoginTestAccounts === 'function') {
      window.HKPOS.Utils.renderLoginTestAccounts();
    }
    // 고객 검색 페이지 테스트 데이터: 언어 변경 시 다시 렌더해 번역 문구 적용
    var demoSearchHost = (root || document).querySelector('#demo-customer-search-cases');
    if (demoSearchHost && window.HKPOS.Utils && typeof window.HKPOS.Utils.renderCustomerSearchTestCases === 'function') {
      window.HKPOS.Utils.renderCustomerSearchTestCases();
    }
    // 래퍼 페이지 테스트 데이터(선택 양식 목록): 언어 변경 시 다시 렌더해 번역 문구 적용
    if (root === document && document.body.getAttribute('data-app-page') === 'wrapper' && window.HKPOS.Pages && typeof window.HKPOS.Pages.initWrapperPage === 'function') {
      window.HKPOS.Pages.initWrapperPage();
    }
  }

  currentLang = getLang();
  document.documentElement.lang = currentLang;
  readyPromise = loadLocale(currentLang)
    .then(function (data) {
      messages = data;
      if (typeof window.HKPOS.i18nReady === 'function') {
        window.HKPOS.i18nReady();
      }
      applyPage();
      return data;
    })
    .catch(function (err) {
      messages = {};
      console.warn('[i18n] Locale load failed. Use a local server (e.g. python -m http.server) and open index.html via http://.', err);
      applyPage();
      return {};
    });

  window.HKPOS.i18n = {
    t: t,
    getLang: function () {
      return currentLang;
    },
    setLang: function (lang) {
      return setLang(lang).then(function () {
        applyPage();
        notifyDeviceFrameIframes(currentLang);
      }).catch(function () {
        applyPage();
        notifyDeviceFrameIframes(currentLang);
      });
    },
    loadLocale: loadLocale,
    applyToDocument: applyToDocument,
    applyPage: applyPage,
    ready: function () {
      return readyPromise;
    },
  };
})();
