document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  function bindRequestServiceButtons() {
	document.querySelectorAll("[data-request-service]").forEach((button) => {
	  button.addEventListener("click", () => {
		window.HCPWidget?.openModal?.();
	  });
	});
  }

  if (menuToggle && mobileMenu) {
	menuToggle.addEventListener("click", () => {
	  const isOpen = mobileMenu.classList.toggle("open");
	  menuToggle.setAttribute("aria-expanded", String(isOpen));
	});

	mobileMenu.querySelectorAll("a, button").forEach((link) => {
	  link.addEventListener("click", () => {
		mobileMenu.classList.remove("open");
		menuToggle.setAttribute("aria-expanded", "false");
	  });
	});
  }

  const serviceCards = document.querySelectorAll("[data-card]");
  const mobileMq = window.matchMedia("(max-width: 1199px)");

  serviceCards.forEach((card) => {
	card.addEventListener("click", (event) => {
	  if (!mobileMq.matches) return;
	  if (event.target.closest("a, button")) return;

	  const isFlipped = card.classList.contains("is-flipped");

	  serviceCards.forEach((other) => {
		other.classList.remove("is-flipped");
	  });

	  if (!isFlipped) {
		card.classList.add("is-flipped");
	  }
	});
  });

  const profileCards = document.querySelectorAll("[data-profile-card]");

  profileCards.forEach((card) => {
	card.addEventListener("click", (event) => {
	  if (!mobileMq.matches) return;
	  if (event.target.closest("a, button")) return;

	  const isFlipped = card.classList.contains("is-flipped");

	  profileCards.forEach((other) => {
		other.classList.remove("is-flipped");
	  });

	  if (!isFlipped) {
		card.classList.add("is-flipped");
	  }
	});
  });

  document.querySelectorAll(".faq-question").forEach((button) => {
	button.addEventListener("click", () => {
	  const item = button.closest(".faq-item");

	  if (item) {
		item.classList.toggle("open");
	  }
	});
  });

  const heroCarousel = document.getElementById("heroCarousel");
  const heroSlides = heroCarousel
	? Array.from(heroCarousel.querySelectorAll("[data-hero-slide]"))
	: [];
  const heroDots = heroCarousel
	? Array.from(heroCarousel.querySelectorAll("[data-hero-dot]"))
	: [];
  const heroPrev = heroCarousel
	? heroCarousel.querySelector("[data-hero-prev]")
	: null;
  const heroNext = heroCarousel
	? heroCarousel.querySelector("[data-hero-next]")
	: null;

  let heroIndex = 0;
  let heroInterval = null;

  function renderHeroSlide(index) {
	heroSlides.forEach((slide, i) => {
	  slide.classList.toggle("active", i === index);
	});

	heroDots.forEach((dot, i) => {
	  dot.classList.toggle("active", i === index);
	});

	heroIndex = index;
  }

  function nextHeroSlide() {
	if (!heroSlides.length) return;
	renderHeroSlide((heroIndex + 1) % heroSlides.length);
  }

  function prevHeroSlide() {
	if (!heroSlides.length) return;
	renderHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length);
  }

  function startHeroCarousel() {
	if (!heroSlides.length) return;

	stopHeroCarousel();
	heroInterval = window.setInterval(nextHeroSlide, 5500);
  }

  function stopHeroCarousel() {
	if (heroInterval) {
	  window.clearInterval(heroInterval);
	  heroInterval = null;
	}
  }

  if (heroCarousel && heroSlides.length) {
	heroDots.forEach((dot, i) => {
	  dot.addEventListener("click", () => {
		renderHeroSlide(i);
		startHeroCarousel();
	  });
	});

	heroPrev?.addEventListener("click", () => {
	  prevHeroSlide();
	  startHeroCarousel();
	});

	heroNext?.addEventListener("click", () => {
	  nextHeroSlide();
	  startHeroCarousel();
	});

	heroCarousel.addEventListener("mouseenter", stopHeroCarousel);
	heroCarousel.addEventListener("mouseleave", startHeroCarousel);

	renderHeroSlide(0);
	startHeroCarousel();
  }

  bindRequestServiceButtons();

  const heroBrandLockup = document.getElementById("heroBrandLockup");
  const siteHeader = document.querySelector(".site-header");

  function updateHeroBrandState() {
	if (!heroBrandLockup || !siteHeader) return;

	const heroRect = heroBrandLockup.getBoundingClientRect();
	const headerRect = siteHeader.getBoundingClientRect();

	const passed = heroRect.bottom <= headerRect.bottom + 16;
	document.body.classList.toggle("hero-brand-passed", passed);
  }

  window.addEventListener("scroll", updateHeroBrandState, { passive: true });
  window.addEventListener("resize", updateHeroBrandState);

  updateHeroBrandState();
});