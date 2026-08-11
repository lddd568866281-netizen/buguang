const colors = [
  { name: '白色', value: '#FFFFFF' }, { name: '暖白色', value: '#FFF4E5' },
  { name: '黄色', value: '#FFD66B' }, { name: '蓝色', value: '#DCEBFF' },
  { name: '粉色', value: '#FFD6E7' }, { name: '红色', value: '#FF6B6B' },
  { name: '绿色', value: '#8DDB9C' }, { name: '紫色', value: '#CDB4FF' }
];

const presets = [
  { name: '冷白光', value: '#FFFFFF' }, { name: '暖白光', value: '#FFF4E5' },
  { name: '暖黄光', value: '#FFD66B' }, { name: '粉色', value: '#FFD6E7' },
  { name: '蓝色', value: '#DCEBFF' }
];

const app = document.querySelector('#light-app');
const controls = document.querySelector('#controls');
const showControls = document.querySelector('#show-controls');
const colorGrid = document.querySelector('#color-grid');
const presetList = document.querySelector('#preset-list');
const colorValue = document.querySelector('#color-value');
const customColor = document.querySelector('#custom-color');
const brightness = document.querySelector('#brightness');
const brightnessValue = document.querySelector('#brightness-value');
const fullscreenButton = document.querySelector('#fullscreen-button');

function makeButton(item, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.style.setProperty('--swatch', item.value);
  button.dataset.color = item.value;
  button.setAttribute('aria-label', `选择${item.name} ${item.value}`);
  button.innerHTML = className === 'color-button' ? `<span>${item.name}</span>` : item.name;
  button.addEventListener('click', () => setColor(item.value));
  return button;
}

colors.forEach((color) => colorGrid.appendChild(makeButton(color, 'color-button')));
presets.forEach((preset) => presetList.appendChild(makeButton(preset, 'preset-button')));

function setColor(color) {
  const normalized = color.toUpperCase();
  app.style.setProperty('--light-color', normalized);
  colorValue.value = normalized;
  customColor.value = normalized;
  document.querySelectorAll('[data-color]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.color === normalized);
  });
}

function setBrightness() {
  const value = Number(brightness.value);
  brightnessValue.value = `${value}%`;
  // 保留至少 25% 的亮度，便于在暗处操作控制面板。
  app.style.setProperty('--dim-level', ((100 - value) / 100 * 0.75).toFixed(3));
}

customColor.addEventListener('input', (event) => setColor(event.target.value));
brightness.addEventListener('input', setBrightness);

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await app.requestFullscreen();
  } catch (error) {
    console.warn('无法进入全屏模式：', error);
  }
}

function updateFullscreenUI() {
  const isFullscreen = document.fullscreenElement === app;
  fullscreenButton.querySelector('span:last-child').textContent = isFullscreen ? '退出全屏' : '全屏';
  fullscreenButton.setAttribute('aria-label', isFullscreen ? '退出全屏' : '进入全屏');
  if (!isFullscreen) {
    controls.classList.remove('is-hidden');
    showControls.classList.remove('is-visible');
  }
}

fullscreenButton.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenUI);

app.addEventListener('click', (event) => {
  if (document.fullscreenElement !== app || event.target.closest('button, input, label')) return;
  const hidden = controls.classList.toggle('is-hidden');
  showControls.classList.toggle('is-visible', hidden);
});

showControls.addEventListener('click', () => {
  controls.classList.remove('is-hidden');
  showControls.classList.remove('is-visible');
});

setColor('#FFFFFF');
setBrightness();
