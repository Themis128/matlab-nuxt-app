const imageList = [
  'images/enhanced-models-comparison.png',
  'images/model-comparison.png',
  'images/performance-dashboard.png',
  'images/enhanced-price-prediction.png'
]
const container = document.getElementById('images')
imageList.forEach((src) => {
  const fig = document.createElement('figure')
  const img = document.createElement('img')
  img.src = src
  img.alt = src
  const cap = document.createElement('figcaption')
  cap.textContent = src.replace('images/', '').replace('.png', '')
  fig.appendChild(img)
  fig.appendChild(cap)
  container.appendChild(fig)
})
