document.addEventListener("DOMContentLoaded", () => {
  const yearNode = document.getElementById("y");
  if (yearNode) {
	yearNode.textContent = new Date().getFullYear();
  }

  document.querySelectorAll("[data-request-service]").forEach((button) => {
	button.addEventListener("click", () => {
	  window.HCPWidget?.openModal?.();
	});
  });

  const services = [
	"Leak repair",
	"Clogged drains",
	"Toilets & faucets",
	"Water heaters",
	"Garbage disposals",
	"Shower & tub valves",
	"Gas line work (where applicable)",
	"Sewer line diagnostics",
	"Fixture installs",
	"Emergency plumbing"
  ];

  const servicesGrid = document.getElementById("servicesGrid");
  if (servicesGrid) {
	servicesGrid.innerHTML = services
	  .map((service) => `<div class="service-card">✓ ${service}</div>`)
	  .join("");
  }

const slides = [
	{
	  badge: "Water Heater Special",
	  title: "Need a new water heater?",
	  copy: "Ask about current install specials and replacement options for your home.",
	  fine: "Call or request service to check current availability.",
	  ctaText: "Ask about specials",
	  ctaHref: "tel:+15128884406",
	  image: "img/ad-water-heater.jpg"
	},
	{
	  badge: "Fast Help",
	  title: "Leaks, clogs, and plumbing problems that can’t wait",
	  copy: "Tell us what’s happening and how urgent it is. We’ll help you figure out the next step.",
	  fine: "Call, text, or request service online.",
	  ctaText: "Request service",
	  ctaType: "request",
	  image: "img/ad-service-call.jpg"
	},
	{
	  badge: "Local Service",
	  title: "Straightforward plumbing help for Austin-area homeowners",
	  copy: "Clean work, clear communication, and practical solutions without the big-company runaround.",
	  fine: "Free estimates for most jobs.",
	  ctaText: "Call now",
	  ctaHref: "tel:+15128884406",
	  image: "img/ad-team.png"
	}
  ];

  const track = document.getElementById("adTrack");
  const dotsWrap = document.getElementById("adDots");
  const prevBtn = document.getElementById("adPrev");
  const nextBtn = document.getElementById("adNext");
  const waterHeaterBadge = document.getElementById("waterHeaterBadge");

  if (track && dotsWrap && prevBtn && nextBtn && slides.length) {
	let currentIndex = 0;
	let autoRotate;

	track.innerHTML = slides
	  .map((slide) => {
		const actionMarkup = slide.ctaType === "request"
		  ? `<button class="ad-link" type="button" data-request-service>${slide.ctaText}</button>`
		  : `<a class="ad-link" href="${slide.ctaHref}">${slide.ctaText}</a>`;
	
		const imageMarkup = slide.image
		  ? `<div class="ad-media"><img src="${slide.image}" alt="${slide.title}"></div>`
		  : "";
	
		return `
		  <article class="ad-slide">
			${imageMarkup}
			<div class="ad-content">
			  <span class="ad-badge">${slide.badge}</span>
			  <h3 class="ad-title">${slide.title}</h3>
			  <p class="ad-copy">${slide.copy}</p>
			  <div class="ad-actions">
				${actionMarkup}
			  </div>
			  <p class="ad-fine">${slide.fine}</p>
			</div>
		  </article>
		`;
	  })
	  .join("");

	dotsWrap.innerHTML = slides
	  .map(
		(_, index) =>
		  `<button class="dot${index === 0 ? " active" : ""}" type="button" aria-label="Go to slide ${index + 1}" data-index="${index}"></button>`
	  )
	  .join("");

	function bindRequestButtons() {
	  document.querySelectorAll(".ad-link[data-request-service]").forEach((button) => {
		button.addEventListener("click", () => {
		  window.HCPWidget?.openModal?.();
		});
	  });
	}

	function updateCarousel(index) {
	  currentIndex = (index + slides.length) % slides.length;
	  track.style.transform = `translateX(-${currentIndex * 100}%)`;

	  dotsWrap.querySelectorAll(".dot").forEach((dot, dotIndex) => {
		dot.classList.toggle("active", dotIndex === currentIndex);
	  });
	}

	function startAutoRotate() {
	  stopAutoRotate();
	  autoRotate = window.setInterval(() => {
		updateCarousel(currentIndex + 1);
	  }, 5000);
	}

	function stopAutoRotate() {
	  if (autoRotate) {
		window.clearInterval(autoRotate);
	  }
	}

	prevBtn.addEventListener("click", () => {
	  updateCarousel(currentIndex - 1);
	  startAutoRotate();
	});

	nextBtn.addEventListener("click", () => {
	  updateCarousel(currentIndex + 1);
	  startAutoRotate();
	});

	dotsWrap.addEventListener("click", (event) => {
	  const target = event.target;
	  if (!(target instanceof HTMLElement)) return;

	  const index = Number(target.dataset.index);
	  if (Number.isNaN(index)) return;

	  updateCarousel(index);
	  startAutoRotate();
	});

	track.addEventListener("mouseenter", stopAutoRotate);
	track.addEventListener("mouseleave", startAutoRotate);
	bindRequestButtons();
	updateCarousel(0);
	startAutoRotate();

	if (waterHeaterBadge) {
	  waterHeaterBadge.addEventListener("click", () => {
		updateCarousel(0);
		document.getElementById("heroCarousel")?.scrollIntoView({
		  behavior: "smooth",
		  block: "nearest"
		});
	  });
	}
  } else if (waterHeaterBadge) {
	waterHeaterBadge.addEventListener("click", () => {
	  window.location.href = "tel:+15128884406";
	});
  }
});