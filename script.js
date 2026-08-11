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
const fullscreenMessage = document.querySelector('#fullscreen-message');
let messageTimer;
let standalonePresentation = false;

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

function currentFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement;
}

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isFullscreenMode() {
  return currentFullscreenElement() === app || standalonePresentation;
}

function notify(message) {
  fullscreenMessage.textContent = message;
  fullscreenMessage.classList.add('is-visible');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => fullscreenMessage.classList.remove('is-visible'), 4200);
}

async function toggleFullscreen() {
  const request = app.requestFullscreen || app.webkitRequestFullscreen;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;

  try {
    if (currentFullscreenElement()) {
      if (exit) await exit.call(document);
      return;
    }
    // iPhone 主屏幕网页不会开放 Fullscreen API，但本身已没有浏览器地址栏。
    // 在这里切换为纯色展示模式，使“全屏”按钮仍然可用。
    if (isStandaloneApp()) {
      standalonePresentation = !standalonePresentation;
      updateFullscreenUI();
      if (standalonePresentation) notify('已进入沉浸模式，轻触空白处可隐藏或显示控制面板。');
      return;
    }
    if (!request) {
      notify('当前浏览器不支持网页全屏。iPhone 请在 Safari 中“添加到主屏幕”后打开。');
      return;
    }
    await request.call(app);
  } catch (error) {
    console.warn('无法进入全屏模式：', error);
    notify('未能进入全屏。请尝试使用 Chrome、Edge 或系统浏览器打开。');
  }
}

function updateFullscreenUI() {
  const isFullscreen = isFullscreenMode();
  fullscreenButton.querySelector('span:last-child').textContent = isFullscreen ? '退出全屏' : '全屏';
  fullscreenButton.setAttribute('aria-label', isFullscreen ? '退出全屏' : '进入全屏');
  if (!isFullscreen) {
    controls.classList.remove('is-hidden');
    showControls.classList.remove('is-visible');
  }
}

fullscreenButton.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

app.addEventListener('click', (event) => {
  if (!isFullscreenMode() || event.target.closest('button, input, label')) return;
  const hidden = controls.classList.toggle('is-hidden');
  showControls.classList.toggle('is-visible', hidden);
});

showControls.addEventListener('click', () => {
  controls.classList.remove('is-hidden');
  showControls.classList.remove('is-visible');
});

setColor('#FFFFFF');
setBrightness();
