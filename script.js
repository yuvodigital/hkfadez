const menuButton = document.querySelector('.menu');
const nav = document.querySelector('#nav');
const siteHeader = document.querySelector('.site-header');

const updateHeaderOnScroll = () => {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 16);
};

updateHeaderOnScroll();
window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
  menuButton.textContent = open ? '×' : '☰';
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Öppna meny');
    menuButton.textContent = '☰';
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
const heroVideo = document.querySelector('.phone-video');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroVideoVisible = true;

if (heroVideo) {
  const syncHeroVideo = () => {
    if (motionPreference.matches || !heroVideoVisible) {
      heroVideo.pause();
    } else {
      heroVideo.play().catch(() => {});
    }
  };

  if ('IntersectionObserver' in window) {
    const heroVideoObserver = new IntersectionObserver((entries) => {
      heroVideoVisible = entries.some((entry) => entry.isIntersecting);
      syncHeroVideo();
    }, { threshold: 0.25 });
    heroVideoObserver.observe(heroVideo);
  } else {
    syncHeroVideo();
  }

  motionPreference.addEventListener('change', syncHeroVideo);
}

const reviewTrack = document.querySelector('.customer-reviews');
if (reviewTrack) {
  [...reviewTrack.children].forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    reviewTrack.append(clone);
  });
  reviewTrack.classList.add('is-looping');
}

const hero = document.querySelector('.hero');
const heroCopy = document.querySelector('.hero-copy');
const heroSlides = [...document.querySelectorAll('.hero-slide')];
const heroDots = [...document.querySelectorAll('.hero-dot')];
if (hero && heroCopy && heroSlides.length && heroDots.length) {
  const slides = [
    {
      eyebrow: 'Barberare · Landskrona',
      title: 'Fades med<br><em>precision.</em>',
      paragraphs: [
        'Rena övergångar, skarpa linjer och en finish som håller. Vi formar varje klippning efter din stil.',
        'Från första passet till sista detaljen får du ett personligt bemötande och tid för hantverket.'
      ],
      specialties: ['Fade', 'Skägg', 'Line up']
    },
    {
      eyebrow: 'Noggrant hantverk',
      title: 'Skarpa linjer.<br><em>Ren finish.</em>',
      paragraphs: [
        'Varje detalj räknas. Vi formar din fade med precision och ser till att helheten känns genomtänkt.',
        'En välgjord klippning ska kännas lika bra när du går härifrån som när du sätter dig i stolen.'
      ],
      specialties: ['Precision', 'Detaljer', 'Finish']
    },
    {
      eyebrow: 'Din stund · Landskrona',
      title: 'Din nästa look.<br><em>Ditt val.</em>',
      paragraphs: [
        'Vill du fräscha upp din vanliga stil eller testa något nytt? Vi börjar med att lyssna på vad du vill ha.',
        'Välj en tjänst och boka en tid som passar dig. Vi tar hand om resten och ser fram emot ditt besök.'
      ],
      specialties: ['Fade', 'Skägg', 'Line up']
    }
  ];
  let activeSlide = 0;
  let timer;
  const eyebrow = heroCopy.querySelector('.eyebrow');
  const title = heroCopy.querySelector('h1');
  const paragraphs = heroCopy.querySelectorAll('.hero-text');
  const specialtyItems = heroCopy.querySelectorAll('.hero-specialties span');

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    const content = slides[activeSlide];
    heroSlides.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === activeSlide));
    heroDots.forEach((dot, dotIndex) => {
      const selected = dotIndex === activeSlide;
      dot.classList.toggle('is-active', selected);
      if (selected) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    eyebrow.textContent = content.eyebrow;
    title.innerHTML = content.title;
    paragraphs.forEach((paragraph, paragraphIndex) => paragraph.textContent = content.paragraphs[paragraphIndex]);
    specialtyItems.forEach((item, itemIndex) => item.textContent = content.specialties[itemIndex]);
    heroCopy.classList.remove('is-changing');
    void heroCopy.offsetWidth;
    heroCopy.classList.add('is-changing');
  };

  const stopTimer = () => window.clearInterval(timer);
  const startTimer = () => {
    stopTimer();
    if (!motionPreference.matches && !document.hidden) timer = window.setInterval(() => showSlide(activeSlide + 1), 6500);
  };

  document.querySelectorAll('[data-hero-step]').forEach((button) => button.addEventListener('click', () => {
    showSlide(activeSlide + Number(button.dataset.heroStep));
    startTimer();
  }));
  heroDots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index);
    startTimer();
  }));
  hero.addEventListener('mouseenter', stopTimer);
  hero.addEventListener('mouseleave', startTimer);
  hero.addEventListener('focusin', stopTimer);
  hero.addEventListener('focusout', (event) => {
    if (!hero.contains(event.relatedTarget)) startTimer();
  });
  document.addEventListener('visibilitychange', startTimer);
  motionPreference.addEventListener('change', startTimer);
  startTimer();
}
