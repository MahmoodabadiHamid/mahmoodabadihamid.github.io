(function () {
  var storageKey = "preferredLanguage";
  var defaultLanguage = "en";
  var pageTranslations = window.pageTranslations || {};
  var originalTitle = document.title;
  var descriptionMeta = document.querySelector('meta[name="description"]');
  var originalDescription = descriptionMeta ? descriptionMeta.getAttribute("content") : "";
  var textNodes = [];
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      var parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].indexOf(parent.tagName) !== -1) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  while (walker.nextNode()) {
    textNodes.push({
      node: walker.currentNode,
      original: walker.currentNode.nodeValue
    });
  }

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function translateText(value, dictionary) {
    var leading = value.match(/^\s*/)[0];
    var trailing = value.match(/\s*$/)[0];
    var key = normalize(value);
    return Object.prototype.hasOwnProperty.call(dictionary, key)
      ? leading + dictionary[key] + trailing
      : value;
  }

  function applyLanguage(language) {
    var dictionary = pageTranslations[language] || {};
    var title = pageTranslations.titles && pageTranslations.titles[language];
    var description = pageTranslations.descriptions && pageTranslations.descriptions[language];
    var toggle = document.querySelector("[data-language-toggle]");

    textNodes.forEach(function (entry) {
      entry.node.nodeValue = language === defaultLanguage
        ? entry.original
        : translateText(entry.original, dictionary);
    });

    document.documentElement.lang = language === "fa" ? "fa" : "en";
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    document.body.classList.toggle("lang-fa", language === "fa");
    document.title = language === defaultLanguage ? originalTitle : (title || originalTitle);
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", language === defaultLanguage ? originalDescription : (description || originalDescription));
    }
    if (toggle) {
      toggle.textContent = language === "fa" ? "English" : "فارسی";
      toggle.setAttribute("aria-label", language === "fa" ? "Switch language to English" : "تغییر زبان به فارسی");
    }
  }

  window.setSiteLanguage = function (language) {
    var nextLanguage = language === "fa" ? "fa" : defaultLanguage;
    localStorage.setItem(storageKey, nextLanguage);
    applyLanguage(nextLanguage);
  };

  document.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-language-toggle]");
    if (!toggle) {
      return;
    }
    var activeLanguage = localStorage.getItem(storageKey) === "fa" ? "fa" : defaultLanguage;
    window.setSiteLanguage(activeLanguage === "fa" ? defaultLanguage : "fa");
  });

  applyLanguage(localStorage.getItem(storageKey) === "fa" ? "fa" : defaultLanguage);
})();
