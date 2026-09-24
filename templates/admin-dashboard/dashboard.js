/**
 * admin-dashboard interactivity
 * - profile dropdown
 * - mobile sidebar + swipe
 * - revenue chart range tabs → --st-pN (st-core@v2)
 */

// Profile dropdown
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
if (profileBtn && profileDropdown) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => profileDropdown.classList.remove('open'));
}

// Mobile sidebar
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function openSidebar() {
  sidebar?.classList.add('open');
  sidebarBackdrop?.classList.add('open');
}
function closeSidebar() {
  sidebar?.classList.remove('open');
  sidebarBackdrop?.classList.remove('open');
}

menuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarBackdrop?.addEventListener('click', closeSidebar);

window.addEventListener('resize', () => {
  if (window.innerWidth > 1100) closeSidebar();
});

// Swipe-to-close / edge open
(function enableSwipe() {
  if (!sidebar) return;
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  sidebar.addEventListener('touchstart', (e) => {
    if (!sidebar.classList.contains('open')) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    dragging = true;
    sidebar.style.transition = 'none';
  }, { passive: true });

  sidebar.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    const delta = Math.min(0, currentX - startX);
    sidebar.style.transform = `translateX(${delta}px)`;
  }, { passive: true });

  sidebar.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    sidebar.style.transition = '';
    sidebar.style.transform = '';
    if (currentX - startX < -60) closeSidebar();
  });

  let edgeStartX = 0;
  let edgeDragging = false;
  document.addEventListener('touchstart', (e) => {
    if (sidebar.classList.contains('open') || window.innerWidth > 1100) return;
    const x = e.touches[0].clientX;
    if (x <= 24) {
      edgeStartX = x;
      edgeDragging = true;
    }
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!edgeDragging) return;
    if (e.touches[0].clientX - edgeStartX > 40) {
      openSidebar();
      edgeDragging = false;
    }
  }, { passive: true });
  document.addEventListener('touchend', () => { edgeDragging = false; });
})();

// Chart datasets → CSS variables for st-core
const datasets = {
  '7d':  { values: [42, 58, 65, 60, 78, 70, 92], labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  '30d': { values: [35, 48, 55, 62, 58, 70, 75, 68, 80, 85], labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10'] },
  '90d': { values: [30, 40, 45, 50, 55, 60, 58, 65, 70, 75, 80, 85], labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] }
};

function updateChart(range) {
  const data = datasets[range];
  if (!data) return;
  const style = data.values
    .map((v, i) => `--st-p${i + 1}: ${100 - v}%;`)
    .join(' ');
  const chart = document.getElementById('revenueChart');
  if (chart) chart.style.cssText = style;
  const xLabels = document.getElementById('xLabels');
  if (xLabels) {
    xLabels.innerHTML = data.labels.map((l) => `<span>${l}</span>`).join('');
  }
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    updateChart(tab.dataset.range);
  });
});

updateChart('7d');
