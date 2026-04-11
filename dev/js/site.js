<!-- Google tag (gtag.js) -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=AW-17942862558"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
	dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "AW-17942862558");
</script>

<!-- HouseCallPro Online Booking (load ONCE) -->
<script
  async
  src="https://online-booking.housecallpro.com/script.js?token=56fe9001ad314433a6466f5d7d3131b9&orgName=Plumbazing"
></script>
	<script>
  // Year
  document.getElementById("y").textContent = new Date().getFullYear();

  // Services list (easy to edit)
  const SERVICES = [
	"Leak repair",
	"Clogged drains",
	"Toilets & faucets",
	"Water heaters",
	"Garbage disposals",
	"Shower & tub valves",
	"Gas line work (where applicable)",
	"Sewer line diagnostics",
	"Fixture installs",
	"Emergency plumbing",
  ];

  const grid = document.getElementById("servicesGrid");
  if (grid)
	grid.innerHTML = SERVICES.map(
	  (s) => `<div class="svc"><span>✓</span> ${s}</div>`
	).join("");

  /*
	Per-slide options:
	- layout: "split" (text left + optional right image), or "stack" (optional top image), or "text"
	- actions: choose which buttons show; supports:
	  { type: "request", label: "Request service" } -> opens HCP modal
	  { type: "call", label: "Call/Text" } -> tel link
	  { type: "scroll", label: "About PlumbAZing ↓", target: "#about" } -> smooth scroll
	- replyNote: optional supporting line
	- durationMs: optional per-slide auto-rotate duration override
  */

  const ADS = [
	{
	  id: "request-help",
	  layout: "split",
	  badge: "Fast Response",
	  kicker: "Tell us what’s going on",
	  title: "Request help in under a minute",
	  copy: "Share details + urgency. We’ll reply ASAP with options + a quote.",
	  background:
		"linear-gradient(135deg, rgba(3,105,161,0.85), rgba(2,132,199,0.55))",
	  actions: [
		{ type: "request", label: "Request service" },
		{ type: "call", label: "Call/Text" },
	  ],
	  replyNote: "We’ll reply ASAP with options + a quote.",
	  // rightImage: "/img/ad-request.png"
	},
	{
	  id: "new-here",
	  layout: "split",
	  badge: "First-Time Offer",
	  kicker: "New here?",
	  title: "Get $50 OFF your first service",
	  copy: "First-time customers. Request service or call/text and mention this offer.",
	  background:
		"linear-gradient(135deg, rgba(193,18,31,0.75), rgba(11,61,145,0.55))",
	  actions: [{ type: "request", label: "Request service" }],
	  replyNote: "We’ll reply ASAP with options + a quote.",
	  finePrint:
		"Expires: 12/31/26. Not valid with other offers. Ask for details.",
	  // rightImage: "/img/ad-new-here.png"
	},
	{
	  id: "leak-repair",
	  layout: "split",
	  badge: "Common Fix",
	  kicker: "Stop the drip, save the cabinet",
	  title: "Leak detection + repair",
	  copy: "Clear options, clean work, and straightforward communication.",
	  background:
		"linear-gradient(135deg, rgba(30,41,59,0.75), rgba(14,116,144,0.55))",
	  actions: [
		{ type: "request", label: "Request service" },
		{ type: "call", label: "Call/Text" },
	  ],
	  replyNote: "We’ll reply ASAP with options + a quote.",
	  // rightImage: "/img/ad-leak.png"
	},
	{
	  id: "meet-the-team",
	  layout: "stack",
	  badge: "Meet the Team",
	  kicker: "Local. Experienced. Easy to work with.",
	  title: "Josh + Alan",
	  copy: "We’re the folks who show up, explain the options, and leave your place cleaner than we found it.",
	  background:
		"linear-gradient(135deg, rgba(11,61,145,0.70), rgba(15,23,42,0.75))",
	  actions: [],
	  textLink: { label: "About PlumbAZing ↓", target: "#about" },
	  finePrint:
		"Want the quick version? Call or text and tell us what’s going on.",
	  topImage: "/img/ad-team.png",
	},
	{
	  id: "water-heater-special",
	  layout: "stack",
	  badge: "Water Heater Specials",
	  kicker: "Big water heater specials",
	  title: "Save up to $500 + free estimates",
	  copy: "10% OFF installs: up to $250 OFF tank water heaters and up to $500 OFF tankless. Price match guarantee available.",
	  background:
		"linear-gradient(135deg, rgba(193,18,31,0.75), rgba(11,61,145,0.55))",
	  actions: [{ type: "request", label: "Request service" }],
	  replyNote: "We’ll reply ASAP with options + a quote.",
	  finePrint:
		"Discount cap limited. Not valid with other offers/coupons/discounts. Price match must match equipment, installation, and warranty. Some limitations apply.",
	  durationMs: 8500, // stay longer on this slide
	  // rightImage: "/img/ad-water-heater.png"
	},
  ];

  const DEFAULT_INTERVAL_MS = 6500;

  const track = document.getElementById("adTrack");
  const dotsWrap = document.getElementById("adDots");
  const prevBtn = document.getElementById("adPrev");
  const nextBtn = document.getElementById("adNext");
  const heroCarousel = document.getElementById("heroCarousel");

  let idx = 0;
  let timer = null;
  let pauseUntil = 0;

  function resolveBg(ad) {
	if (ad.imageUrl) {
	  return `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.72)), url('${ad.imageUrl}')`;
	}
	return (
	  ad.background ||
	  "linear-gradient(135deg, rgba(2,132,199,0.75), rgba(15,23,42,0.65))"
	);
  }

  function renderActions(ad, slideIndex) {
	const actions = Array.isArray(ad.actions) ? ad.actions : [];
	if (!actions.length) return "";

	return `
	  <div class="ad-actions">
		${actions
		  .map((a) => {
			const label = a.label || "Request service";
			if (a.type === "request") {
			  return `<a class="ad-link" href="#" data-action="request" data-ad-cta="${slideIndex}">${label}</a>`;
			}
			if (a.type === "call") {
			  return `<a class="ad-link" href="tel:+15128884406" data-action="call">${label}</a>`;
			}
			if (a.type === "scroll" && a.target) {
			  return `<a class="ad-link" href="${a.target}" data-action="scroll" data-target="${a.target}">${label}</a>`;
			}
			if (a.type === "jump" && a.targetId) {
			  return `<a class="ad-link" href="#" data-action="jump" data-target-id="${a.targetId}">${label}</a>`;
			}
			if (a.type === "url" && a.href) {
			  return `<a class="ad-link" href="${a.href}" data-action="url">${label}</a>`;
			}
			return "";
		  })
		  .join("")}
	  </div>
	`;
  }

  function renderSlide(ad, i) {
	const bg = resolveBg(ad);
	const layout = ad.layout || "split";

	const layoutClass =
	  layout === "stack"
		? "layout-stack"
		: layout === "text"
		? "layout-text"
		: "layout-split";

	const hasRightMedia = layout === "split" && !!ad.rightImage;
	const hasTopMedia = layout === "stack" && !!ad.topImage;

	const topMediaHtml = hasTopMedia
	  ? `<div class="ad-media-top" aria-hidden="true"><img src="${ad.topImage}" alt=""></div>`
	  : "";

	const rightMediaHtml = hasRightMedia
	  ? `<div class="ad-media" aria-hidden="true"><img src="${ad.rightImage}" alt=""></div>`
	  : "";

	const textLinkHtml = ad.textLink?.target
	  ? `<a class="ad-textlink" href="${
		  ad.textLink.target
		}" data-action="scroll" data-target="${ad.textLink.target}">${
		  ad.textLink.label || "About ↓"
		}</a>`
	  : "";

	return `
	  <article
		class="ad-slide ${layoutClass} ${i === idx ? "is-active" : ""}"
		role="group"
		aria-roledescription="slide"
		aria-label="${i + 1} of ${ADS.length}"
		data-ad-id="${ad.id || ""}"
		style="background-image:${bg};">

		${topMediaHtml}

		<div class="ad-left">
		  ${ad.badge ? `<span class="ad-badge">${ad.badge}</span>` : ""}
		  ${ad.kicker ? `<div class="ad-kicker">${ad.kicker}</div>` : ""}
		  ${ad.title ? `<h3 class="ad-title">${ad.title}</h3>` : ""}
		  ${ad.copy ? `<p class="ad-copy">${ad.copy}</p>` : ""}

		  ${renderActions(ad, i)}

		  ${
			ad.replyNote
			  ? `<p class="ad-reply-note">${ad.replyNote}</p>`
			  : ""
		  }
		  ${textLinkHtml}
		  ${ad.finePrint ? `<p class="ad-fine">${ad.finePrint}</p>` : ""}
		</div>

		${rightMediaHtml}
	  </article>
	`;
  }

  function renderCarousel() {
	if (!track || !dotsWrap) return;

	track.innerHTML = ADS.map((ad, i) => renderSlide(ad, i)).join("");

	dotsWrap.innerHTML = ADS.map(
	  (_, i) =>
		`<button class="dot ${
		  i === idx ? "active" : ""
		}" aria-label="Go to slide ${i + 1}" data-dot="${i}"></button>`
	).join("");

	updateCarousel();
  }

  function updateCarousel() {
	if (!track || !dotsWrap) return;

	track.style.transform = `translateX(-${idx * 100}%)`;

	[...dotsWrap.children].forEach((d, i) =>
	  d.classList.toggle("active", i === idx)
	);
	[...track.children].forEach((slide, i) =>
	  slide.classList.toggle("is-active", i === idx)
	);
  }

  function getCurrentInterval() {
	const ad = ADS[idx] || {};
	return typeof ad.durationMs === "number"
	  ? ad.durationMs
	  : DEFAULT_INTERVAL_MS;
  }

  function restartAuto() {
	if (timer) clearTimeout(timer);

	const tick = () => {
	  if (Date.now() < pauseUntil) {
		timer = setTimeout(tick, 450);
		return;
	  }
	  next(true);
	};

	timer = setTimeout(tick, getCurrentInterval());
  }

  function go(n, fromAuto = false) {
	idx = (n + ADS.length) % ADS.length;
	updateCarousel();

	// If user is interacting manually, reset cadence so it doesn't auto-swipe instantly.
	restartAuto();
  }

  function next(fromAuto = false) {
	go(idx + 1, fromAuto);
  }
  function prev() {
	go(idx - 1, false);
  }

  // Jump to slide by id
  window.goToAd = function (
	adId,
	opts = { scroll: true, highlight: false, pauseMs: 0 }
  ) {
	const targetIndex = ADS.findIndex((a) => a.id === adId);
	if (targetIndex === -1) return;

	go(targetIndex, false);

	if (opts.pauseMs) pauseUntil = Date.now() + opts.pauseMs;

	if (opts.scroll && heroCarousel?.scrollIntoView) {
	  heroCarousel.scrollIntoView({ behavior: "smooth", block: "center" });
	}

	if (opts.highlight && heroCarousel) {
	  heroCarousel.classList.remove("jump-highlight");
	  void heroCarousel.offsetWidth;
	  heroCarousel.classList.add("jump-highlight");
	  setTimeout(
		() => heroCarousel.classList.remove("jump-highlight"),
		1100
	  );
	}
  };

  // Dots click
  dotsWrap?.addEventListener("click", (e) => {
	const b = e.target.closest("button[data-dot]");
	if (!b) return;
	go(parseInt(b.dataset.dot, 10), false);
  });

  // Slide action clicks
  track?.addEventListener("click", (e) => {
	const el = e.target.closest("[data-action], a[data-ad-cta]");
	if (!el) return;

	const action = el.dataset.action;

	// Request service: open HouseCallPro modal
	if (action === "request" || el.hasAttribute("data-ad-cta")) {
	  e.preventDefault();
	  window.HCPWidget?.openModal?.();
	  return;
	}

	// Scroll actions
	if (action === "scroll") {
	  const target = el.dataset.target || el.getAttribute("href");
	  if (target && target.startsWith("#")) {
		e.preventDefault();
		const node = document.querySelector(target);
		node?.scrollIntoView?.({ behavior: "smooth", block: "start" });
	  }
	  return;
	}

	// Jump to a slide
	if (action === "jump") {
	  e.preventDefault();
	  const targetId = el.dataset.targetId;
	  if (targetId)
		window.goToAd(targetId, {
		  scroll: false,
		  highlight: true,
		  pauseMs: 8000,
		});
	  return;
	}
  });

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", () => next(false));

  // Swipe support
  let startX = 0,
	dx = 0;
  track?.addEventListener(
	"touchstart",
	(e) => {
	  startX = e.touches[0].clientX;
	  dx = 0;
	},
	{ passive: true }
  );
  track?.addEventListener(
	"touchmove",
	(e) => {
	  dx = e.touches[0].clientX - startX;
	},
	{ passive: true }
  );
  track?.addEventListener("touchend", () => {
	if (Math.abs(dx) > 45) dx < 0 ? next(false) : prev();
	dx = 0;
  });

  // Pause auto-rotate on hover (desktop)
  heroCarousel?.addEventListener(
	"mouseenter",
	() => timer && clearTimeout(timer)
  );
  heroCarousel?.addEventListener("mouseleave", restartAuto);

  // Topbar badge -> jump to water heater slide with obvious feedback + pause
  document
	.getElementById("waterHeaterBadge")
	?.addEventListener("click", () => {
	  window.goToAd("water-heater-special", {
		scroll: true,
		highlight: true,
		pauseMs: 12000,
	  });
	});

  // Init
  renderCarousel();
  restartAuto();
</script>
