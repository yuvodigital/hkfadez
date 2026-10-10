(() => {
  const STORAGE_KEY = 'hkfadez-cookie-consent-v1';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const readChoice = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || Date.now() - stored.updatedAt > MAX_AGE) return null;
      return { necessary: true, analytics: !!stored.analytics, marketing: !!stored.marketing };
    } catch {
      return null;
    }
  };

  const saveChoice = (choice) => {
    const saved = { necessary: true, analytics: !!choice.analytics, marketing: !!choice.marketing, updatedAt: Date.now() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* The controls still work for this visit. */ }
    window.dispatchEvent(new CustomEvent('hkfadez:consentchange', { detail: saved }));
    activateConsentedResources(saved);
    return saved;
  };

  const activateConsentedResources = (choice) => {
    document.querySelectorAll('[data-consent-src][data-consent-category]').forEach((resource) => {
      const category = resource.dataset.consentCategory;
      if (!choice[category]) return;

      if (resource.tagName === 'IFRAME' && !resource.hasAttribute('src')) {
        resource.src = resource.dataset.consentSrc;
        resource.dataset.consentLoaded = 'true';
      } else if (resource.tagName === 'SCRIPT' && resource.dataset.consentLoaded !== 'true') {
        const script = document.createElement('script');
        script.src = resource.dataset.consentSrc;
        script.async = true;
        resource.dataset.consentLoaded = 'true';
        document.head.append(script);
      }
    });
  };

  const mount = () => {
    const markup = `
      <aside class="cookie-banner" data-cookie-banner aria-labelledby="cookie-banner-title" hidden>
        <div class="cookie-banner-copy"><p class="eyebrow">Dina val</p><h2 id="cookie-banner-title">Kakor och integritet</h2><p>Vi använder inga statistik- eller marknadsföringskakor just nu. Välj om sådana valfria funktioner får användas om de införs.</p><a href="cookies.html">Läs om kakor</a></div>
        <div class="cookie-banner-actions"><button type="button" class="cookie-button cookie-button-muted" data-cookie-reject>Avvisa valfria</button><button type="button" class="cookie-button cookie-button-outline" data-cookie-customize>Anpassa</button><button type="button" class="cookie-button cookie-button-primary" data-cookie-accept>Acceptera alla</button></div>
      </aside>
      <dialog class="cookie-dialog" data-cookie-dialog aria-labelledby="cookie-dialog-title">
        <form method="dialog" class="cookie-dialog-inner">
          <button class="cookie-close" type="submit" value="close" aria-label="Stäng inställningar">×</button>
          <p class="eyebrow">Samtycke</p><h2 id="cookie-dialog-title">Cookieinställningar</h2>
          <p class="cookie-dialog-intro">Ditt val sparas i den här webbläsaren i upp till 180 dagar. Nödvändig lagring är alltid på. Valfria kategorier aktiverar inget på webbplatsen i nuläget.</p>
          <label class="cookie-choice"><span><strong>Nödvändiga</strong><small>Behövs för att spara och komma ihåg dina val.</small></span><input type="checkbox" checked disabled aria-label="Nödvändiga, alltid aktiva"></label>
          <label class="cookie-choice"><span><strong>Statistik</strong><small>Hjälper till att förstå hur webbplatsen används.</small></span><input type="checkbox" data-cookie-analytics></label>
          <label class="cookie-choice"><span><strong>Marknadsföring</strong><small>Används för marknadsföring och annonsmätning.</small></span><input type="checkbox" data-cookie-marketing></label>
          <div class="cookie-dialog-actions"><button type="button" class="cookie-button cookie-button-muted" data-cookie-reject>Avvisa valfria</button><button type="button" class="cookie-button cookie-button-primary" data-cookie-save>Spara val</button></div>
        </form>
      </dialog>`;
    document.body.insertAdjacentHTML('beforeend', markup);
    const banner = document.querySelector('[data-cookie-banner]');
    const dialog = document.querySelector('[data-cookie-dialog]');
    const analytics = dialog.querySelector('[data-cookie-analytics]');
    const marketing = dialog.querySelector('[data-cookie-marketing]');

    const openSettings = () => {
      const current = readChoice();
      analytics.checked = !!current?.analytics;
      marketing.checked = !!current?.marketing;
      if (!dialog.open) dialog.showModal();
    };
    const closeBanner = () => { banner.hidden = true; };
    const reject = () => { saveChoice({ analytics: false, marketing: false }); closeBanner(); dialog.close(); };
    const accept = () => { saveChoice({ analytics: true, marketing: true }); closeBanner(); dialog.close(); };
    const save = () => { saveChoice({ analytics: analytics.checked, marketing: marketing.checked }); closeBanner(); dialog.close(); };

    document.querySelectorAll('[data-cookie-settings]').forEach((button) => button.addEventListener('click', openSettings));
    document.querySelectorAll('[data-cookie-reject]').forEach((button) => button.addEventListener('click', reject));
    document.querySelectorAll('[data-cookie-accept]').forEach((button) => button.addEventListener('click', accept));
    document.querySelectorAll('[data-cookie-customize]').forEach((button) => button.addEventListener('click', openSettings));
    document.querySelectorAll('[data-cookie-save]').forEach((button) => button.addEventListener('click', save));

    const current = readChoice();
    if (current) {
      closeBanner();
      activateConsentedResources(current);
    } else {
      banner.hidden = false;
    }

    window.HKFadezConsent = Object.freeze({
      get: readChoice,
      allows: (category) => !!readChoice()?.[category]
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
