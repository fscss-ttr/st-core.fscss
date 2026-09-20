
const chartFill = document.querySelector(".chart-fill");
const chartLine = document.querySelector(".chart-line");
const chartDot = document.querySelector('.chart-dot');
const axisY = document.querySelector(".y-axis");

const updateBtn = document.querySelector(".update-btn");

function normalize(n) {
  // Returns the percentage from the top (e.g., 80 becomes 20%)
  return (100 - n) + '%';
}

/* st-core.fscss chart x axis */
const xStops = ['0%', '14%', '28%', '42%', '57%', '71%', '85%', '100%'];

function randomUpdate() {
  // 1. Generate 8 random data points
  const points = Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 10);
  
  // 2. Find the peak
  const highest = Math.max(...points);
  const highestIdx = points.indexOf(highest);
  
  // 3. Build CSS variables (Mapping p1 to index 0, p2 to index 1, etc.)
  // This matches: 0% -> p1, 14% -> p2...
  const newChart = points.map((v, i) =>
    `--st-p${i + 1}: ${normalize(v)};`
  ).join(' ');
  
  chartLine.style.cssText = newChart;
  chartFill.style.cssText = newChart;
  
  // 4. Move the dot
  // We use the same index (highestIdx) for both X and Y
  chartDot.style.top = normalize(highest);
  chartDot.style.left = xStops[highestIdx]; 
  
  // Update tooltip text
  chartDot.querySelector('.tooltip').textContent = `$${(highest * 5.5).toFixed(2)}`;
}

updateBtn.addEventListener("click", randomUpdate);

axisY.addEventListener("click", e=>{
  if(e.target.parentElement.classList.contains("y-axis")){
    const rect = e.currentTarget.getBoundingClientRect();
  
  // 1. Get the horizontal position relative to the div
  const x = e.clientX - rect.left; 
  
  // 2. Calculate the percentage
  const xper = ((x / rect.width) * 100).toFixed(2);

  const yper = +e.target.textContent;
  
  chartDot.style.top = normalize(yper);
chartDot.style.left = `${xper}%`;

  chartDot.querySelector('.tooltip').textContent = `$${(yper * 5.5). toFixed(2)}`;
  
  
  console.log(yper)
    console.log(xper);
  } 
})
