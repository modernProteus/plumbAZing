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
	"Emergency plumbing",
  ];

  const servicesGrid = document.getElementById("servicesGrid");
  if (servicesGrid) {
	servicesGrid.innerHTML = services
	  .map((service) => `<div class="service-card">✓ ${service}</div>`)
	  .join("");
  }

  // Keep your carousel logic here, but only here.
});