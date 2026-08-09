(() => {
  'use strict';

  const root = document.getElementById('app');
  if (!root) return;

  const TAU = Math.PI * 2;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => Array.from(root.querySelectorAll(selector));

  const sceneMeta = [
    {
      short: '正弦波',
      eyebrow: '01 · 认识一个波',
      title: '一个波由什么决定？',
      summary: '从振幅、波长和相位开始，让公式变成可操纵的对象。',
      conceptTitle: '振幅、波数与相位',
      conceptBody: '传播波不是一条静止曲线。它的形状由 A、k、φ 决定，时间项 −ωt 让相位持续前进。',
      insight: 'k 越大，空间振荡越密。',
      facts: ['k 是角波数，单位为 rad / 长度。', '波长与波数满足 λ = 2π / |k|。', '3D 螺旋表示复数值随 x 的变化，不是电子轨迹。'],
      whyPrompt: '深入理解 k 为什么自然出现',
      why: {
        intuition: '沿 x 前进一步，复相位就转过一点。k 越大，同样距离内转过的圈数越多，所以投影出来的波峰也越密。',
        math: '相位差满足 Δθ = kΔx；波形重复一次需要 Δθ = 2π，因此 λ = 2π / |k|。',
        formula: 'e<sup>i(kx−ωt)</sup> = cos(kx−ωt) + i sin(kx−ωt)',
        mistake: 'e^{ikx} 本身只描述空间相位。要表达传播，还需要时间项以及明确的色散关系 ω(k)。'
      }
    },
    {
      short: '傅里叶叠加',
      eyebrow: '02 · 把波放在一起',
      title: '复杂形状，是简单波的合成',
      summary: '逐个开关三个分量，观察相长、抵消与总波形之间的关系。',
      conceptTitle: '从分量到整体',
      conceptBody: '每个分量都有自己的振幅、波数和相位。它们在每个位置逐项相加，形成更复杂的空间图像。',
      insight: '尖锐细节需要更高的 k。',
      facts: ['细线是各个分量，粗线是它们的总和。', '右侧双边谱保留 +k 与 −k。', '3D 中的纵深只表示“视觉分层”，不是物理空间。'],
      whyPrompt: '几个平滑波为何能组成尖峰',
      why: {
        intuition: '不同波在大多数位置彼此抵消，只在特定位置同相叠加。加入更高 k 后，局部变化可以变得更快、更尖。',
        math: '一个周期函数可以写成 f(x)=ΣAₙcos(kₙx+φₙ)。每项都是一根基波坐标轴。',
        formula: 'f(x) = ∑<sub>n</sub> A<sub>n</sub> cos(k<sub>n</sub>x + φ<sub>n</sub>)',
        mistake: '三个分量只能形成近似。要逼近真正的方波，需要更多奇次谐波，并会在跳变附近出现 Gibbs 振铃。'
      }
    },
    {
      short: '傅里叶变换',
      eyebrow: '03 · 从形状看成分',
      title: '同一个对象，两种语言',
      summary: '左边问“每个位置是什么值”，右边问“每种 k 含有多少”。',
      conceptTitle: '实空间与 k 空间',
      conceptBody: '傅里叶变换没有创造新对象。它只是把同一份信息从位置坐标，翻译成波数成分。',
      insight: '实空间越窄，k 空间越宽。',
      facts: ['默认采用完整双边谱。', '|F(k)| 是振幅；重建还需要相位。', '余弦的理想频谱在 ±k₀ 有一对等高峰。'],
      whyPrompt: '理解傅里叶为什么是“翻译”',
      why: {
        intuition: '左图像一段声音的波形，右图像配方表：列出里面用了哪些振荡尺度、各用了多少。',
        math: '我们固定约定 F(k)=∫f(x)e^{-ikx}dx，逆变换前带 1/(2π)。',
        formula: 'F(k)=∫ f(x)e<sup>−ikx</sup>dx　·　f(x)=1/(2π)∫F(k)e<sup>ikx</sup>dk',
        mistake: '只看 |F(k)| 会丢失相位。两个振幅谱相同的函数，空间位置与形状细节仍可能不同。'
      }
    },
    {
      short: '波包',
      eyebrow: '04 · 制造局域性',
      title: '波函数不是一条水波',
      summary: '把高斯包络与复相位拆开，区分 Reψ、Imψ 与 |ψ|²。',
      conceptTitle: '相位在旋转，概率是包络',
      conceptBody: '波函数是复值的。3D 螺旋展示其相位；真正与位置概率有关的是 |ψ|²，而不是实部的上下振动。',
      insight: '单一平面波不局域；一段 k 才能形成波包。',
      facts: ['Reψ 与 Imψ 是复波函数的两个分量。', '|ψ|² 是归一化概率密度。', '改变 k₀ 只改变内部振荡，不改变包络宽度。'],
      whyPrompt: '为什么平面波不能表示局域粒子',
      why: {
        intuition: '单一波数铺满整个空间。只有许多相近的 k 在中心相长、远处相消，能量才会集中成一个包。',
        math: '对高斯最小波包，位置标准差 σₓ 与波数标准差 σₖ 互为倒数：σₖ=1/(2σₓ)。',
        formula: 'ψ(x,t)=C exp[−(x−x₀)²/(4σₓ²)]e<sup>i(k₀x−ωt)</sup>',
        mistake: '3D 螺旋是复数轨迹，不是电子沿螺旋线路飞行；概率密度也不会像实部那样正负振荡。'
      }
    },
    {
      short: 'x / k 空间',
      eyebrow: '05 · 测量两种宽度',
      title: '局域性有一个傅里叶代价',
      summary: '拖窄位置分布，同时看见 k 分布扩张，并测量两者标准差。',
      conceptTitle: '不确定关系的傅里叶根源',
      conceptBody: '要在空间中定位得更精细，就必须调用跨度更大的 k 成分。这不是测量仪器的缺陷，而是波的结构。',
      insight: '高斯最小波包满足 Δx·Δk = 1/2。',
      facts: ['此页绘制的是 |ψ(x)|² 与 |φ(k)|²。', '改变 x₀ 不改变 k 空间概率谱。', '若 p=ℏk，则 Δx·Δp = ℏ/2。'],
      whyPrompt: '为什么窄波包必然有宽频谱',
      why: {
        intuition: '要让中心以外迅速抵消，需要更多不同快慢的振荡共同参与；只用相近的 k，图像只能缓慢变化。',
        math: '高斯函数的傅里叶变换仍是高斯，且 σₖ=1/(2σₓ)，所以乘积固定为 1/2。',
        formula: 'Δx·Δk ≥ 1/2　→　Δx·Δp ≥ ℏ/2',
        mistake: '等号只对最小不确定度高斯态成立。一般波包只能保证乘积不小于 1/2。'
      }
    }
  ];

  const defaults = {
    scene: 0,
    view: '3d',
    playing: false,
    time: 0,
    A: 1,
    lambda: Math.PI,
    phase: 0,
    omega: 1,
    components: [
      { enabled: true, a: 1, k: 1, phi: 0 },
      { enabled: true, a: 0.55, k: 3, phi: 0 },
      { enabled: true, a: 0.32, k: 5, phi: 0 }
    ],
    preset: 'gaussian',
    spectrumMode: 'magnitude',
    sigmaX: 1.2,
    k0: 3.5,
    x0: 0,
    packetDisplay: 'all',
    hoverComponent: -1
  };

  const state = structuredClone(defaults);
  state.k = TAU / state.lambda;

  const dom = {
    topNav: $('#top-scene-nav'),
    sideNav: $('#side-scene-nav'),
    eyebrow: $('#scene-eyebrow'),
    title: $('#scene-title'),
    summary: $('#scene-summary'),
    conceptIndex: $('#concept-index'),
    conceptTitle: $('#concept-title'),
    conceptBody: $('#concept-body'),
    keyInsight: $('#key-insight'),
    mobileInsight: $('#mobile-insight'),
    facts: $('#concept-facts'),
    whyPrompt: $('#why-prompt'),
    leftSpace: $('#left-space'),
    leftSubtitle: $('#left-subtitle'),
    leftStatus: $('#left-status'),
    rightSpace: $('#right-space'),
    rightSubtitle: $('#right-subtitle'),
    rightStatus: $('#right-status'),
    transformMark: $('#transform-mark'),
    plotGrid: $('#plot-grid'),
    threeStage: $('#three-stage'),
    controls: $('#controls-grid'),
    presets: $('#preset-group'),
    formula: $('#formula'),
    readout: $('#live-readout'),
    play: $('#play-button'),
    reset: $('#reset-button'),
    prev: $('#prev-button'),
    next: $('#next-button'),
    why: $('#why-button'),
    mobileConcept: $('#mobile-concept-button'),
    dialog: $('#why-dialog'),
    dialogClose: $('#dialog-close'),
    dialogNext: $('#dialog-next'),
    whyTitle: $('#why-title'),
    whyIntuition: $('#why-intuition'),
    whyMath: $('#why-math'),
    whyFormula: $('#why-formula'),
    whyMistake: $('#why-mistake'),
    leftCanvas: $('#left-canvas'),
    rightCanvas: $('#right-canvas'),
    leftTooltip: $('#left-tooltip'),
    rightTooltip: $('#right-tooltip'),
    threeCanvas: $('#three-canvas'),
    cameraReset: $('#camera-reset'),
    viewHint: $('#view-hint')
  };

  const canvasState = new WeakMap();
  let raf = 0;
  let lastFrame = 0;
  let threeRenderer = null;

  function format(value, digits = 2) {
    const n = Math.abs(value) < 1e-8 ? 0 : value;
    return Number(n).toFixed(digits);
  }

  function sceneAllowsMotion() {
    return state.scene === 0 || state.scene === 3;
  }

  function snapshot3D() {
    return {
      scene: state.scene,
      time: state.time,
      playing: state.playing,
      A: state.A,
      k: state.k,
      phase: state.phase,
      omega: state.omega,
      components: state.components.map((c) => ({ ...c })),
      preset: state.preset,
      spectrumMode: state.spectrumMode,
      sigmaX: state.sigmaX,
      k0: state.k0,
      x0: state.x0,
      packetDisplay: state.packetDisplay
    };
  }

  function buildNavigation() {
    dom.topNav.innerHTML = sceneMeta.map((scene, i) => `
      <button class="path-step" type="button" data-scene="${i}" ${i === 0 ? 'aria-current="step"' : ''}>
        <span class="step-number">${String(i + 1).padStart(2, '0')}</span>
        <span class="step-name">${scene.short}</span>
      </button>`).join('');
    dom.sideNav.innerHTML = sceneMeta.map((scene, i) => `
      <button class="rail-step" type="button" data-scene="${i}" ${i === 0 ? 'aria-current="step"' : ''}>
        <span class="rail-step-number">${i + 1}</span>
        <span class="rail-step-copy"><small>STEP ${String(i + 1).padStart(2, '0')}</small><strong>${scene.short}</strong></span>
      </button>`).join('');
    $$('[data-scene]').forEach((button) => button.addEventListener('click', () => setScene(Number(button.dataset.scene))));
  }

  function setScene(index) {
    if (!Number.isInteger(index) || index < 0 || index >= sceneMeta.length) return;
    state.scene = index;
    state.time = 0;
    state.hoverComponent = -1;
    if (!sceneAllowsMotion()) state.playing = false;
    updatePlayButton();
    $$('[data-scene]').forEach((button) => {
      if (Number(button.dataset.scene) === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const topActive = dom.topNav.querySelector(`[data-scene="${index}"]`);
    topActive?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    renderScene();
  }

  function renderScene() {
    const meta = sceneMeta[state.scene];
    dom.eyebrow.textContent = meta.eyebrow;
    dom.title.textContent = meta.title;
    dom.summary.textContent = meta.summary;
    dom.conceptIndex.textContent = String(state.scene + 1).padStart(2, '0');
    dom.conceptTitle.textContent = meta.conceptTitle;
    dom.conceptBody.textContent = meta.conceptBody;
    dom.keyInsight.textContent = meta.insight;
    dom.mobileInsight.textContent = meta.insight;
    dom.facts.innerHTML = meta.facts.map((fact) => `<li>${fact}</li>`).join('');
    dom.whyPrompt.textContent = meta.whyPrompt;
    dom.whyTitle.textContent = meta.title;
    dom.whyIntuition.textContent = meta.why.intuition;
    dom.whyMath.textContent = meta.why.math;
    dom.whyFormula.innerHTML = meta.why.formula;
    dom.whyMistake.textContent = meta.why.mistake;
    dom.prev.disabled = state.scene === 0;
    dom.next.disabled = state.scene === sceneMeta.length - 1;
    dom.next.innerHTML = state.scene === sceneMeta.length - 1 ? '第一章完成' : `下一步 <span>→</span>`;
    updatePlotLabels();
    buildPresets();
    buildControls();
    updateFormula();
    updateView();
    drawAll();
  }

  function updatePlotLabels() {
    const labels = [
      ['实空间 x', '传播波 f(x,t)', '复指数', 'Re / Im 相位投影'],
      ['实空间 x', '分量与合成 f(x)', 'k 空间', '双边振幅谱 |F(k)|'],
      ['实空间 x', '函数 f(x)', 'k 空间', state.spectrumMode === 'phase' ? '相位 arg F(k)' : '归一化幅值 |F(k)|'],
      ['实空间 x', state.packetDisplay === 'probability' ? '概率密度 |ψ|²' : '复波函数 ψ(x)', 'k 空间', '概率密度 |φ(k)|²'],
      ['实空间 x', '位置概率密度 |ψ|²', 'k 空间', '波数概率密度 |φ|²']
    ][state.scene];
    [dom.leftSpace.textContent, dom.leftSubtitle.textContent, dom.rightSpace.textContent, dom.rightSubtitle.textContent] = labels;
    dom.transformMark.style.visibility = state.scene === 0 ? 'hidden' : 'visible';
  }

  function buildPresets() {
    let options = [];
    let selected = '';
    if (state.scene === 1) {
      options = [['harmonics', '奇次谐波'], ['soft', '柔和混合'], ['single', '只看基波']];
      selected = 'custom';
    } else if (state.scene === 2) {
      options = [['gaussian', '高斯'], ['cosine', '余弦'], ['mixed', '三波混合']];
      selected = state.preset;
    } else if (state.scene === 3) {
      options = [['all', '复波＋概率'], ['phase', '只看复相位'], ['probability', '只看概率']];
      selected = state.packetDisplay;
    }
    dom.presets.innerHTML = options.map(([value, label]) => `<button type="button" data-preset="${value}" aria-pressed="${value === selected}">${label}</button>`).join('');
    dom.presets.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      const value = button.dataset.preset;
      if (state.scene === 1) applyComponentPreset(value);
      if (state.scene === 2) state.preset = value;
      if (state.scene === 3) state.packetDisplay = value;
      buildPresets();
      buildControls();
      updatePlotLabels();
      updateFormula();
      drawAll();
    }));
  }

  function applyComponentPreset(name) {
    if (name === 'harmonics') {
      state.components = [
        { enabled: true, a: 1, k: 1, phi: 0 },
        { enabled: true, a: 1 / 3, k: 3, phi: 0 },
        { enabled: true, a: 1 / 5, k: 5, phi: 0 }
      ];
    } else if (name === 'soft') {
      state.components = [
        { enabled: true, a: 1, k: 1, phi: 0 },
        { enabled: true, a: 0.6, k: 2.2, phi: 0.7 },
        { enabled: true, a: 0.35, k: 3.8, phi: -0.5 }
      ];
    } else if (name === 'single') {
      state.components = [
        { enabled: true, a: 1, k: 1, phi: 0 },
        { enabled: false, a: 0.55, k: 3, phi: 0 },
        { enabled: false, a: 0.32, k: 5, phi: 0 }
      ];
    }
  }

  function rangeControl({ key, label, symbol, min, max, step, value, unit = '', formatter = (v) => format(v), onInput }) {
    const id = `control-${key}`;
    return `
      <div class="control-field">
        <label class="control-label" for="${id}">
          <span class="control-name">${label}<em>${symbol || ''}</em></span>
          <output class="control-value" id="${id}-value">${formatter(value)}${unit ? ` <small>${unit}</small>` : ''}</output>
        </label>
        <input type="range" id="${id}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${value}">
        <div class="control-note"><span>${formatter(min)}</span><span>${formatter(max)}</span></div>
      </div>`;
  }

  function buildControls() {
    const controls = [];
    if (state.scene === 0) {
      controls.push(
        rangeControl({ key: 'A', label: '振幅', symbol: 'A', min: 0.2, max: 1.8, step: 0.02, value: state.A }),
        rangeControl({ key: 'lambda', label: '波长', symbol: 'λ', min: 1.2, max: 8, step: 0.02, value: state.lambda, unit: '长度' }),
        rangeControl({ key: 'phase', label: '初相位', symbol: 'φ', min: -Math.PI, max: Math.PI, step: 0.02, value: state.phase, unit: 'rad' }),
        rangeControl({ key: 'omega', label: '角频率', symbol: 'ω', min: 0.2, max: 2.5, step: 0.02, value: state.omega, unit: 'rad/s' })
      );
    } else if (state.scene === 1) {
      dom.controls.innerHTML = state.components.map((component, i) => componentControl(component, i)).join('');
      bindComponentControls();
      return;
    } else if (state.scene === 2) {
      if (state.preset === 'gaussian') {
        controls.push(
          rangeControl({ key: 'sigmaX', label: '空间宽度', symbol: 'σₓ', min: 0.4, max: 2.5, step: 0.02, value: state.sigmaX }),
          rangeControl({ key: 'x0', label: '函数中心', symbol: 'x₀', min: -2.5, max: 2.5, step: 0.02, value: state.x0 }),
          spectrumModeControl()
        );
      } else if (state.preset === 'cosine') {
        controls.push(
          rangeControl({ key: 'k0', label: '余弦波数', symbol: 'k₀', min: 0.5, max: 6, step: 0.02, value: state.k0, unit: 'rad/长度' }),
          rangeControl({ key: 'A', label: '振幅', symbol: 'A', min: 0.2, max: 1.6, step: 0.02, value: state.A }),
          rangeControl({ key: 'phase', label: '相位', symbol: 'φ', min: -Math.PI, max: Math.PI, step: 0.02, value: state.phase, unit: 'rad' })
        );
      } else {
        controls.push(
          rangeControl({ key: 'k0', label: '整体频移', symbol: 'Δk', min: -1.2, max: 1.2, step: 0.02, value: Math.max(-1.2, Math.min(1.2, state.k0 - 3.5)) }),
          spectrumModeControl(),
          `<div class="control-field"><div class="mode-control"><span class="control-name">谱峰</span><span class="control-value">±k₁ · ±k₂ · ±k₃</span></div><div class="control-note"><span>完整双边谱</span><span>实函数共轭对称</span></div></div>`
        );
      }
    } else if (state.scene === 3 || state.scene === 4) {
      controls.push(
        rangeControl({ key: 'sigmaX', label: state.scene === 4 ? '位置标准差' : '波包宽度', symbol: state.scene === 4 ? 'Δx' : 'σₓ', min: 0.42, max: 2.5, step: 0.02, value: state.sigmaX }),
        rangeControl({ key: 'k0', label: '中心波数', symbol: 'k₀', min: 0, max: 6, step: 0.02, value: state.k0, unit: 'rad/长度' }),
        rangeControl({ key: 'x0', label: '波包中心', symbol: 'x₀', min: -2.8, max: 2.8, step: 0.02, value: state.x0 })
      );
    }
    dom.controls.innerHTML = controls.join('');
    bindRangeControls();
    const spectrumButtons = dom.controls.querySelectorAll('[data-spectrum-mode]');
    spectrumButtons.forEach((button) => button.addEventListener('click', () => {
      state.spectrumMode = button.dataset.spectrumMode;
      buildControls();
      updatePlotLabels();
      updateFormula();
      drawAll();
    }));
  }

  function spectrumModeControl() {
    return `<div class="control-field">
      <div class="control-label"><span class="control-name">频谱显示</span><span class="control-value">${state.spectrumMode === 'magnitude' ? '|F(k)|' : 'arg F(k)'}</span></div>
      <div class="view-switch" role="group" aria-label="频谱显示方式">
        <button type="button" data-spectrum-mode="magnitude" aria-pressed="${state.spectrumMode === 'magnitude'}">振幅</button>
        <button type="button" data-spectrum-mode="phase" aria-pressed="${state.spectrumMode === 'phase'}">相位</button>
      </div>
      <div class="control-note"><span>完整重建两者都需要</span><span></span></div>
    </div>`;
  }

  function componentControl(component, index) {
    const colors = ['var(--cyan)', 'var(--ivory)', 'var(--coral)'];
    return `<div class="control-field component-control" style="--component-color:${colors[index]}">
      <button class="component-toggle" type="button" data-component-toggle="${index}" aria-pressed="${component.enabled}" aria-label="${component.enabled ? '关闭' : '开启'}分量 ${index + 1}">${index + 1}</button>
      <div class="mini-field">
        <label for="component-a-${index}"><span>A${index + 1}</span><output>${format(component.a)}</output></label>
        <input type="range" id="component-a-${index}" data-component="${index}" data-prop="a" min="0" max="1.25" step="0.01" value="${component.a}">
      </div>
      <div class="mini-field">
        <label for="component-k-${index}"><span>k${index + 1}</span><output>${format(component.k)}</output></label>
        <input type="range" id="component-k-${index}" data-component="${index}" data-prop="k" min="0.5" max="6" step="0.02" value="${component.k}">
      </div>
    </div>`;
  }

  function bindRangeControls() {
    dom.controls.querySelectorAll('input[type="range"][data-key]').forEach((input) => {
      input.addEventListener('input', () => {
        const key = input.dataset.key;
        const raw = Number(input.value);
        if (state.scene === 2 && state.preset === 'mixed' && key === 'k0') state.k0 = 3.5 + raw;
        else state[key] = raw;
        if (key === 'lambda') state.k = TAU / state.lambda;
        const output = dom.controls.querySelector(`#${input.id}-value`);
        if (output) {
          const unit = output.querySelector('small')?.outerHTML || '';
          output.innerHTML = `${format(raw)}${unit ? ` ${unit}` : ''}`;
        }
        updateFormula();
        drawAll();
      });
      input.addEventListener('change', announceCurrentState);
    });
  }

  function bindComponentControls() {
    dom.controls.querySelectorAll('[data-component-toggle]').forEach((button) => button.addEventListener('click', () => {
      const i = Number(button.dataset.componentToggle);
      state.components[i].enabled = !state.components[i].enabled;
      buildControls();
      updateFormula();
      drawAll();
    }));
    dom.controls.querySelectorAll('input[data-component]').forEach((input) => {
      input.addEventListener('input', () => {
        const i = Number(input.dataset.component);
        const prop = input.dataset.prop;
        state.components[i][prop] = Number(input.value);
        input.closest('.mini-field').querySelector('output').textContent = format(input.value);
        updateFormula();
        drawAll();
      });
      input.addEventListener('change', announceCurrentState);
    });
  }

  function updateFormula() {
    const formulas = [
      `<span class="v-cyan">f(x,t)</span> = ${format(state.A)} cos(<span class="v-amber">${format(state.k)}x</span> − ${format(state.omega)}t + ${format(state.phase)})`,
      `<span class="v-cyan">f(x)</span> = ${state.components.filter((c) => c.enabled).map((c) => `${format(c.a)}cos(${format(c.k)}x)`).join(' + ') || '0'}`,
      state.preset === 'gaussian'
        ? `<span class="v-ivory">f(x)</span> = exp[−(x−x₀)²/(2σₓ²)]　⇄　<span class="v-cyan">F(k)</span> ∝ exp(−σₓ²k²/2)`
        : state.preset === 'cosine'
          ? `<span class="v-ivory">cos(k₀x+φ)</span> = ½e<sup>i(k₀x+φ)</sup> + ½e<sup>−i(k₀x+φ)</sup>`
          : `<span class="v-cyan">F(k)</span> = ∫ f(x)e<sup>−ikx</sup> dx`,
      `<span class="v-cyan">ψ(x,t)</span> = C exp[−(x−x₀)²/(4σₓ²)] e<sup>i(k₀x−ωt)</sup>`,
      `<span class="v-amber">Δx</span> · <span class="v-cyan">Δk</span> = ${format(state.sigmaX)} × ${format(1 / (2 * state.sigmaX))} = 0.50`
    ];
    dom.formula.innerHTML = formulas[state.scene];
    dom.formula.setAttribute('aria-label', dom.formula.textContent.replace(/\s+/g, ' ').trim());

    if (state.scene === 0) {
      dom.readout.innerHTML = `<span>波长与波数联动</span><strong>λ = ${format(state.lambda)} · k = ${format(state.k)}</strong>`;
    } else if (state.scene === 1) {
      const count = state.components.filter((c) => c.enabled).length;
      dom.readout.innerHTML = `<span>当前参与叠加</span><strong>${count} 个 k 分量</strong>`;
    } else if (state.scene === 2) {
      dom.readout.innerHTML = state.preset === 'gaussian'
        ? `<span>高斯宽度互为倒数</span><strong>σₓ = ${format(state.sigmaX)} · 谱宽 ∝ ${format(1 / state.sigmaX)}</strong>`
        : state.preset === 'cosine'
          ? `<span>理想无限区间双边谱</span><strong>峰位于 k = ±${format(state.k0)}</strong>`
          : `<span>实函数共轭对称</span><strong>|F(−k)| = |F(k)|</strong>`;
    } else if (state.scene === 3) {
      dom.readout.innerHTML = `<span>概率宽度</span><strong>σₓ = ${format(state.sigmaX)} · σₖ = ${format(1 / (2 * state.sigmaX))}</strong>`;
    } else {
      dom.readout.innerHTML = `<span>最小不确定高斯态</span><strong>ΔxΔk = 0.50</strong>`;
    }
  }

  function announceCurrentState() {
    dom.readout.setAttribute('aria-live', 'polite');
    window.setTimeout(() => dom.readout.setAttribute('aria-live', 'off'), 400);
  }

  function updateView() {
    const is3D = state.view === '3d';
    dom.plotGrid.hidden = is3D;
    dom.threeStage.hidden = !is3D;
    $$('[data-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === state.view)));
    dom.viewHint.textContent = is3D ? '拖动旋转，观察复相位与投影' : '二维图用于精确比较与读数';
    if (is3D && !threeRenderer && window.WaveLab3DRenderer) {
      threeRenderer = new window.WaveLab3DRenderer(dom.threeCanvas, snapshot3D);
    }
    window.requestAnimationFrame(() => drawAll());
  }

  function themeColors() {
    const style = getComputedStyle(document.documentElement);
    const get = (name) => style.getPropertyValue(name).trim();
    return {
      bg: get('--ink'), line: get('--line-strong'), faint: get('--text-faint'), soft: get('--text-soft'), text: get('--text'),
      cyan: get('--cyan'), amber: get('--amber'), ivory: get('--ivory'), coral: get('--coral'), green: get('--green')
    };
  }

  function prepareCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(240, Math.round(rect.width));
    const height = Math.max(180, Math.round(rect.height));
    const pxW = Math.round(width * dpr);
    const pxH = Math.round(height * dpr);
    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const prepared = { canvas, ctx, width, height, colors: themeColors() };
    canvasState.set(canvas, prepared);
    return prepared;
  }

  function makeAxes(prepared, domain, labels, options = {}) {
    const { ctx, width, height, colors } = prepared;
    const margin = { left: 47, right: 18, top: 15, bottom: 31, ...(options.margin || {}) };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const x = (v) => margin.left + (v - domain.xMin) / (domain.xMax - domain.xMin) * innerW;
    const y = (v) => margin.top + (domain.yMax - v) / (domain.yMax - domain.yMin) * innerH;

    ctx.save();
    ctx.strokeStyle = colors.line;
    ctx.fillStyle = colors.faint;
    ctx.lineWidth = 1;
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';

    const xTicks = options.xTicks || 5;
    const yTicks = options.yTicks || 4;
    for (let i = 0; i <= xTicks; i += 1) {
      const value = domain.xMin + (domain.xMax - domain.xMin) * i / xTicks;
      const px = x(value);
      ctx.globalAlpha = i === 0 || i === xTicks ? 0.35 : 0.52;
      ctx.beginPath(); ctx.moveTo(px, margin.top); ctx.lineTo(px, height - margin.bottom); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = i === 0 ? 'left' : i === xTicks ? 'right' : 'center';
      ctx.fillText(formatTick(value), px, height - 13);
    }
    for (let i = 0; i <= yTicks; i += 1) {
      const value = domain.yMin + (domain.yMax - domain.yMin) * i / yTicks;
      const py = y(value);
      ctx.globalAlpha = i === 0 || i === yTicks ? 0.35 : 0.52;
      ctx.beginPath(); ctx.moveTo(margin.left, py); ctx.lineTo(width - margin.right, py); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = 'right';
      ctx.fillText(formatTick(value), margin.left - 8, py);
    }
    if (domain.yMin < 0 && domain.yMax > 0) {
      ctx.globalAlpha = 0.95; ctx.strokeStyle = colors.soft;
      ctx.beginPath(); ctx.moveTo(margin.left, y(0)); ctx.lineTo(width - margin.right, y(0)); ctx.stroke();
    }
    if (domain.xMin < 0 && domain.xMax > 0) {
      ctx.globalAlpha = 0.7; ctx.strokeStyle = colors.line;
      ctx.beginPath(); ctx.moveTo(x(0), margin.top); ctx.lineTo(x(0), height - margin.bottom); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.soft;
    ctx.font = 'italic 13px "Cambria Math", serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(labels.x, width - margin.right, height - 1);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(labels.y, 5, margin.top - 1);
    ctx.restore();
    return { x, y, margin, innerW, innerH, domain };
  }

  function formatTick(value) {
    if (Math.abs(value) < 1e-8) return '0';
    if (Math.abs(value) >= 10) return Math.round(value).toString();
    return Number(value.toFixed(1)).toString();
  }

  function drawLine(ctx, points, color, width = 2, dash = [], alpha = 1) {
    if (!points.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.setLineDash(dash);
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
    ctx.restore();
  }

  function plotFunction(prepared, axes, fn, color, options = {}) {
    const points = [];
    const count = options.samples || Math.max(260, Math.round(axes.innerW * 1.25));
    for (let i = 0; i <= count; i += 1) {
      const value = axes.domain.xMin + (axes.domain.xMax - axes.domain.xMin) * i / count;
      points.push([axes.x(value), axes.y(fn(value))]);
    }
    drawLine(prepared.ctx, points, color, options.width || 2.2, options.dash || [], options.alpha ?? 1);
    return points;
  }

  function fillUnder(prepared, axes, fn, color, alpha = 0.12) {
    const { ctx } = prepared;
    const count = Math.max(220, Math.round(axes.innerW));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(axes.x(axes.domain.xMin), axes.y(Math.max(0, axes.domain.yMin)));
    for (let i = 0; i <= count; i += 1) {
      const value = axes.domain.xMin + (axes.domain.xMax - axes.domain.xMin) * i / count;
      ctx.lineTo(axes.x(value), axes.y(fn(value)));
    }
    ctx.lineTo(axes.x(axes.domain.xMax), axes.y(Math.max(0, axes.domain.yMin)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawAll() {
    if (state.view === '3d') {
      threeRenderer?.draw();
      return;
    }
    const left = prepareCanvas(dom.leftCanvas);
    const right = prepareCanvas(dom.rightCanvas);
    if (state.scene === 0) drawSceneWave(left, right);
    if (state.scene === 1) drawSceneSum(left, right);
    if (state.scene === 2) drawSceneTransform(left, right);
    if (state.scene === 3) drawScenePacket(left, right);
    if (state.scene === 4) drawSceneUncertainty(left, right);
  }

  function drawSceneWave(left, right) {
    const domain = { xMin: -TAU, xMax: TAU, yMin: -1.95, yMax: 1.95 };
    const axes = makeAxes(left, domain, { x: 'x', y: 'f' }, { xTicks: 4 });
    const theta = (x) => state.k * x - state.omega * state.time + state.phase;
    plotFunction(left, axes, (x) => state.A * Math.cos(theta(x)), left.colors.cyan, { width: 2.5 });
    const y0 = axes.y(-1.62);
    const start = Math.max(domain.xMin + 0.3, -state.lambda / 2);
    const end = Math.min(domain.xMax - 0.3, start + state.lambda);
    left.ctx.save();
    left.ctx.strokeStyle = left.colors.amber; left.ctx.fillStyle = left.colors.amber; left.ctx.lineWidth = 1;
    left.ctx.beginPath(); left.ctx.moveTo(axes.x(start), y0); left.ctx.lineTo(axes.x(end), y0); left.ctx.stroke();
    [start, end].forEach((v) => { left.ctx.beginPath(); left.ctx.moveTo(axes.x(v), y0 - 5); left.ctx.lineTo(axes.x(v), y0 + 5); left.ctx.stroke(); });
    left.ctx.font = '11px "Cambria Math", serif'; left.ctx.textAlign = 'center'; left.ctx.fillText(`λ = ${format(state.lambda)}`, (axes.x(start) + axes.x(end)) / 2, y0 - 8);
    left.ctx.restore();

    drawPhasor(right, state.k * 0.8 - state.omega * state.time + state.phase);
    dom.leftStatus.textContent = `t = ${format(state.time)} s`;
    dom.rightStatus.textContent = `θ = ${format(state.k * 0.8 - state.omega * state.time + state.phase)} rad`;
    dom.leftCanvas.setAttribute('aria-label', `传播波形：振幅 ${format(state.A)}，波长 ${format(state.lambda)}，波数 ${format(state.k)}`);
    dom.rightCanvas.setAttribute('aria-label', '复指数相量在复平面旋转，其实部和虚部是两个投影。');
  }

  function drawPhasor(prepared, angle) {
    const { ctx, width, height, colors } = prepared;
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * 0.29;
    ctx.save();
    ctx.strokeStyle = colors.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - radius - 22, cy); ctx.lineTo(cx + radius + 22, cy); ctx.moveTo(cx, cy - radius - 20); ctx.lineTo(cx, cy + radius + 20); ctx.stroke();
    const px = cx + radius * Math.cos(angle);
    const py = cy - radius * Math.sin(angle);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = colors.ivory; ctx.globalAlpha = 0.75;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.cyan; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.fillStyle = colors.cyan; ctx.beginPath(); ctx.arc(px, py, 4.5, 0, TAU); ctx.fill();
    ctx.fillStyle = colors.soft; ctx.font = 'italic 13px "Cambria Math", serif';
    ctx.textAlign = 'right'; ctx.fillText('Re', width - 8, cy - 8);
    ctx.textAlign = 'left'; ctx.fillText('Im', cx + 9, 14);
    ctx.fillStyle = colors.ivory; ctx.font = '11px "Segoe UI", sans-serif'; ctx.textAlign = 'left'; ctx.fillText('eⁱᶿ', px + 8, py - 8);
    ctx.restore();
  }

  function activeComponents() {
    return state.components.map((component, index) => ({ ...component, index })).filter((component) => component.enabled);
  }

  function drawSceneSum(left, right) {
    const components = activeComponents();
    const maxAmp = Math.max(1.25, components.reduce((sum, c) => sum + c.a, 0) * 1.08);
    const axes = makeAxes(left, { xMin: -Math.PI, xMax: Math.PI, yMin: -maxAmp, yMax: maxAmp }, { x: 'x', y: 'f' }, { xTicks: 4 });
    const colors = [left.colors.cyan, left.colors.ivory, left.colors.coral];
    components.forEach((component) => plotFunction(left, axes, (x) => component.a * Math.cos(component.k * x + component.phi), colors[component.index], {
      width: state.hoverComponent === component.index ? 2.5 : 1.25,
      dash: component.index === 1 ? [7, 5] : component.index === 2 ? [2, 5] : [],
      alpha: state.hoverComponent < 0 || state.hoverComponent === component.index ? 0.7 : 0.18
    }));
    plotFunction(left, axes, (x) => components.reduce((sum, c) => sum + c.a * Math.cos(c.k * x + c.phi), 0), left.colors.text, { width: 2.7 });
    drawSpectrumStems(right, components, { maxK: 6.5, maxA: 1.35, phase: false });
    dom.leftStatus.textContent = `Σ ${components.length} 个分量`;
    dom.rightStatus.textContent = '完整双边谱';
    dom.leftCanvas.setAttribute('aria-label', `三个波的叠加图，当前开启 ${components.length} 个分量。粗白线为总和。`);
    dom.rightCanvas.setAttribute('aria-label', `双边振幅谱，显示 ${components.length} 对正负 k 峰。`);
  }

  function drawSpectrumStems(prepared, components, options) {
    const phaseMode = Boolean(options.phase);
    const domain = { xMin: -options.maxK, xMax: options.maxK, yMin: phaseMode ? -Math.PI : 0, yMax: phaseMode ? Math.PI : options.maxA };
    const axes = makeAxes(prepared, domain, { x: 'k', y: phaseMode ? 'arg F' : '|F|' }, { xTicks: 6, yTicks: phaseMode ? 4 : 3 });
    const colors = [prepared.colors.cyan, prepared.colors.ivory, prepared.colors.coral];
    prepared.ctx.save();
    components.forEach((component) => {
      const values = [-component.k, component.k];
      values.forEach((kValue, side) => {
        const value = phaseMode ? (side === 0 ? -component.phi : component.phi) : component.a;
        const y0 = axes.y(phaseMode ? 0 : 0);
        const y1 = axes.y(value);
        prepared.ctx.globalAlpha = state.hoverComponent < 0 || state.hoverComponent === component.index ? 1 : 0.18;
        prepared.ctx.strokeStyle = colors[component.index];
        prepared.ctx.lineWidth = state.hoverComponent === component.index ? 5 : 3;
        prepared.ctx.beginPath(); prepared.ctx.moveTo(axes.x(kValue), y0); prepared.ctx.lineTo(axes.x(kValue), y1); prepared.ctx.stroke();
        prepared.ctx.fillStyle = colors[component.index]; prepared.ctx.beginPath(); prepared.ctx.arc(axes.x(kValue), y1, state.hoverComponent === component.index ? 4.5 : 3.2, 0, TAU); prepared.ctx.fill();
      });
    });
    prepared.ctx.restore();
    canvasState.set(prepared.canvas, { ...prepared, axes, spectrum: components });
  }

  function drawSceneTransform(left, right) {
    if (state.preset === 'gaussian') {
      const leftAxes = makeAxes(left, { xMin: -6, xMax: 6, yMin: -0.08, yMax: 1.18 }, { x: 'x', y: 'f' }, { yTicks: 3 });
      const f = (x) => Math.exp(-((x - state.x0) ** 2) / (2 * state.sigmaX ** 2));
      fillUnder(left, leftAxes, f, left.colors.ivory, 0.08);
      plotFunction(left, leftAxes, f, left.colors.ivory, { width: 2.5 });
      drawWidthMarker(left, leftAxes, state.x0, state.sigmaX, 0.58, 'σₓ', left.colors.ivory);
      if (state.spectrumMode === 'magnitude') {
        const rightAxes = makeAxes(right, { xMin: -7, xMax: 7, yMin: -0.08, yMax: 1.18 }, { x: 'k', y: '|F|' }, { xTicks: 6, yTicks: 3 });
        const g = (k) => Math.exp(-0.5 * state.sigmaX ** 2 * k ** 2);
        fillUnder(right, rightAxes, g, right.colors.cyan, 0.11);
        plotFunction(right, rightAxes, g, right.colors.cyan, { width: 2.5 });
        drawWidthMarker(right, rightAxes, 0, 1 / state.sigmaX, 0.58, '∝ 1/σₓ', right.colors.cyan);
      } else {
        const rightAxes = makeAxes(right, { xMin: -7, xMax: 7, yMin: -Math.PI, yMax: Math.PI }, { x: 'k', y: 'arg F' }, { xTicks: 6, yTicks: 4 });
        plotFunction(right, rightAxes, (k) => -k * state.x0, right.colors.cyan, { width: 2.2 });
      }
      dom.leftStatus.textContent = `σₓ = ${format(state.sigmaX)}`;
      dom.rightStatus.textContent = state.spectrumMode === 'magnitude' ? '幅值已归一' : '平移只改变相位';
    } else if (state.preset === 'cosine') {
      const leftAxes = makeAxes(left, { xMin: -TAU, xMax: TAU, yMin: -1.75, yMax: 1.75 }, { x: 'x', y: 'f' }, { xTicks: 4 });
      plotFunction(left, leftAxes, (x) => state.A * Math.cos(state.k0 * x + state.phase), left.colors.ivory, { width: 2.4 });
      const components = [{ enabled: true, a: state.A / 2, k: state.k0, phi: state.phase, index: 0 }];
      drawSpectrumStems(right, components, { maxK: 7, maxA: 1.05, phase: state.spectrumMode === 'phase' });
      dom.leftStatus.textContent = `k₀ = ${format(state.k0)}`;
      dom.rightStatus.textContent = state.spectrumMode === 'phase' ? '双边相位' : '理想无限区间';
    } else {
      const components = activeComponents().map((c) => ({ ...c, k: c.k + (state.k0 - 3.5) }));
      const leftAxes = makeAxes(left, { xMin: -Math.PI, xMax: Math.PI, yMin: -2.2, yMax: 2.2 }, { x: 'x', y: 'f' }, { xTicks: 4 });
      plotFunction(left, leftAxes, (x) => components.reduce((sum, c) => sum + c.a * Math.cos(c.k * x + c.phi), 0), left.colors.ivory, { width: 2.5 });
      drawSpectrumStems(right, components, { maxK: 7, maxA: 1.25, phase: state.spectrumMode === 'phase' });
      dom.leftStatus.textContent = '三波混合';
      dom.rightStatus.textContent = state.spectrumMode === 'phase' ? '相位谱' : '六个对称峰';
    }
    dom.leftCanvas.setAttribute('aria-label', '傅里叶变换左图：实空间函数。');
    dom.rightCanvas.setAttribute('aria-label', `傅里叶变换右图：${state.spectrumMode === 'phase' ? '相位谱' : '双边振幅谱'}。`);
  }

  function drawWidthMarker(prepared, axes, center, width, level, label, color) {
    const { ctx } = prepared;
    const y = axes.y(level);
    const left = axes.x(center - width);
    const right = axes.x(center + width);
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.moveTo(left, y - 5); ctx.lineTo(left, y + 5); ctx.moveTo(right, y - 5); ctx.lineTo(right, y + 5); ctx.stroke();
    ctx.font = 'italic 11px "Cambria Math", serif'; ctx.textAlign = 'center'; ctx.fillText(label, (left + right) / 2, y - 7); ctx.restore();
  }

  function wavePacketValues(x) {
    const C = Math.pow(2 * Math.PI * state.sigmaX ** 2, -0.25);
    const envelope = C * Math.exp(-((x - state.x0) ** 2) / (4 * state.sigmaX ** 2));
    const theta = state.k0 * x - state.omega * state.time;
    return { re: envelope * Math.cos(theta), im: envelope * Math.sin(theta), prob: envelope ** 2, envelope };
  }

  function kProbability(k) {
    const sigmaK = 1 / (2 * state.sigmaX);
    return Math.exp(-((k - state.k0) ** 2) / (2 * sigmaK ** 2)) / (Math.sqrt(2 * Math.PI) * sigmaK);
  }

  function drawScenePacket(left, right) {
    const ampMax = Math.pow(2 * Math.PI * 0.42 ** 2, -0.25) * 1.12;
    const probabilityOnly = state.packetDisplay === 'probability';
    const leftAxes = makeAxes(left, { xMin: -6, xMax: 6, yMin: probabilityOnly ? -0.05 : -ampMax, yMax: probabilityOnly ? 1 : ampMax }, { x: 'x', y: probabilityOnly ? '|ψ|²' : 'ψ' }, { xTicks: 6, yTicks: 4 });
    if (state.packetDisplay !== 'probability') {
      plotFunction(left, leftAxes, (x) => wavePacketValues(x).re, left.colors.cyan, { width: 2.2 });
      plotFunction(left, leftAxes, (x) => wavePacketValues(x).im, left.colors.ivory, { width: 1.45, dash: [6, 4], alpha: 0.72 });
      plotFunction(left, leftAxes, (x) => wavePacketValues(x).envelope, left.colors.soft, { width: 1, dash: [3, 5], alpha: 0.65 });
      plotFunction(left, leftAxes, (x) => -wavePacketValues(x).envelope, left.colors.soft, { width: 1, dash: [3, 5], alpha: 0.65 });
    }
    if (state.packetDisplay !== 'phase') {
      const probability = (x) => wavePacketValues(x).prob;
      fillUnder(left, leftAxes, probability, left.colors.amber, probabilityOnly ? 0.22 : 0.07);
      plotFunction(left, leftAxes, probability, left.colors.amber, { width: probabilityOnly ? 2.5 : 1.4, alpha: probabilityOnly ? 1 : 0.7 });
    }

    const sigmaK = 1 / (2 * state.sigmaX);
    const maxProb = 1 / (Math.sqrt(2 * Math.PI) * sigmaK);
    const rightAxes = makeAxes(right, { xMin: -1, xMax: 8, yMin: -0.05, yMax: maxProb * 1.16 }, { x: 'k', y: '|φ|²' }, { xTicks: 6, yTicks: 3 });
    fillUnder(right, rightAxes, kProbability, right.colors.cyan, 0.13);
    plotFunction(right, rightAxes, kProbability, right.colors.cyan, { width: 2.4 });
    drawWidthMarker(right, rightAxes, state.k0, sigmaK, maxProb * 0.56, 'σₖ', right.colors.cyan);
    dom.leftStatus.textContent = `Re 实线 · Im 虚线 · t = ${format(state.time)}`;
    dom.rightStatus.textContent = `概率密度 · 自动纵轴`;
    dom.leftCanvas.setAttribute('aria-label', `复高斯波包，中心 ${format(state.x0)}，位置标准差 ${format(state.sigmaX)}，中心波数 ${format(state.k0)}。`);
    dom.rightCanvas.setAttribute('aria-label', `k 空间概率密度，标准差 ${format(sigmaK)}，中心波数 ${format(state.k0)}。`);
  }

  function drawSceneUncertainty(left, right) {
    const posProb = (x) => Math.exp(-((x - state.x0) ** 2) / (2 * state.sigmaX ** 2)) / (Math.sqrt(2 * Math.PI) * state.sigmaX);
    const posMax = 1 / (Math.sqrt(2 * Math.PI) * state.sigmaX);
    const leftAxes = makeAxes(left, { xMin: -6, xMax: 6, yMin: -0.04, yMax: posMax * 1.2 }, { x: 'x', y: '|ψ|²' }, { xTicks: 6, yTicks: 3 });
    drawStdBand(left, leftAxes, state.x0, state.sigmaX, left.colors.amber);
    fillUnder(left, leftAxes, posProb, left.colors.amber, 0.16);
    plotFunction(left, leftAxes, posProb, left.colors.amber, { width: 2.5 });
    drawWidthMarker(left, leftAxes, state.x0, state.sigmaX, posMax * 0.52, 'Δx', left.colors.amber);

    const sigmaK = 1 / (2 * state.sigmaX);
    const kMax = 1 / (Math.sqrt(2 * Math.PI) * sigmaK);
    const rightAxes = makeAxes(right, { xMin: -1, xMax: 8, yMin: -0.04, yMax: kMax * 1.2 }, { x: 'k', y: '|φ|²' }, { xTicks: 6, yTicks: 3 });
    drawStdBand(right, rightAxes, state.k0, sigmaK, right.colors.cyan);
    fillUnder(right, rightAxes, kProbability, right.colors.cyan, 0.16);
    plotFunction(right, rightAxes, kProbability, right.colors.cyan, { width: 2.5 });
    drawWidthMarker(right, rightAxes, state.k0, sigmaK, kMax * 0.52, 'Δk', right.colors.cyan);
    dom.leftStatus.textContent = `Δx = ${format(state.sigmaX)} · 归一化`;
    dom.rightStatus.textContent = `Δk = ${format(sigmaK)} · 自动纵轴`;
    dom.leftCanvas.setAttribute('aria-label', `位置概率密度，标准差 Δx 等于 ${format(state.sigmaX)}。`);
    dom.rightCanvas.setAttribute('aria-label', `波数概率密度，标准差 Δk 等于 ${format(sigmaK)}，乘积等于 0.5。`);
  }

  function drawStdBand(prepared, axes, center, sigma, color) {
    const { ctx } = prepared;
    const left = axes.x(Math.max(axes.domain.xMin, center - sigma));
    const right = axes.x(Math.min(axes.domain.xMax, center + sigma));
    ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = color;
    ctx.fillRect(left, axes.margin.top, right - left, axes.innerH);
    ctx.restore();
  }

  function updatePlayButton() {
    const allowed = sceneAllowsMotion();
    dom.play.disabled = !allowed;
    dom.play.setAttribute('aria-pressed', String(state.playing));
    dom.play.querySelector('span').textContent = state.playing ? '暂停' : '播放';
    dom.play.querySelector('svg').innerHTML = state.playing
      ? '<path d="M7 5h4v14H7zM14 5h4v14h-4z"/>'
      : '<path d="m8 5 11 7-11 7V5Z"/>';
  }

  function animationFrame(now) {
    if (!state.playing) { raf = 0; return; }
    const delta = Math.min(0.05, (now - lastFrame) / 1000 || 0);
    lastFrame = now;
    state.time += delta;
    if (state.scene === 3 && state.time > 12) {
      state.time = 12;
      state.playing = false;
      updatePlayButton();
    }
    updateFormula();
    drawAll();
    if (state.playing) raf = requestAnimationFrame(animationFrame);
  }

  function togglePlay() {
    if (!sceneAllowsMotion()) return;
    state.playing = !state.playing;
    updatePlayButton();
    if (state.playing && !raf) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(animationFrame);
    } else if (!state.playing && raf) {
      cancelAnimationFrame(raf); raf = 0;
    }
    drawAll();
  }

  function resetScene() {
    const scene = state.scene;
    const view = state.view;
    const clean = structuredClone(defaults);
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, clean, { scene, view, k: TAU / clean.lambda });
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    updatePlayButton();
    renderScene();
    threeRenderer?.resetCamera();
  }

  function openWhy() {
    if (typeof dom.dialog.showModal === 'function') dom.dialog.showModal();
    else dom.dialog.setAttribute('open', '');
    dom.dialogClose.focus();
  }

  function closeWhy() {
    if (typeof dom.dialog.close === 'function') dom.dialog.close();
    else dom.dialog.removeAttribute('open');
    dom.why.focus();
  }

  function bindUI() {
    $$('[data-view]').forEach((button) => button.addEventListener('click', () => {
      state.view = button.dataset.view;
      updateView();
    }));
    dom.play.addEventListener('click', togglePlay);
    dom.reset.addEventListener('click', resetScene);
    dom.prev.addEventListener('click', () => setScene(state.scene - 1));
    dom.next.addEventListener('click', () => setScene(state.scene + 1));
    dom.why.addEventListener('click', openWhy);
    dom.mobileConcept.addEventListener('click', openWhy);
    dom.dialogClose.addEventListener('click', closeWhy);
    dom.dialogNext.addEventListener('click', closeWhy);
    dom.dialog.addEventListener('click', (event) => {
      const box = dom.dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeWhy();
    });
    dom.cameraReset.addEventListener('click', () => threeRenderer?.resetCamera());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.playing) togglePlay();
    });
    window.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'r' && !dom.dialog.open && document.activeElement?.tagName !== 'INPUT') resetScene();
    });
    const resizeObserver = new ResizeObserver(() => drawAll());
    resizeObserver.observe(dom.leftCanvas);
    resizeObserver.observe(dom.rightCanvas);
    bindSpectrumHover();
  }

  function bindSpectrumHover() {
    dom.rightCanvas.addEventListener('pointermove', (event) => {
      if (state.scene !== 1 || state.view !== '2d') return;
      const prepared = canvasState.get(dom.rightCanvas);
      if (!prepared?.axes || !prepared.spectrum) return;
      const rect = dom.rightCanvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const kValue = prepared.axes.domain.xMin + (px - prepared.axes.margin.left) / prepared.axes.innerW * (prepared.axes.domain.xMax - prepared.axes.domain.xMin);
      const nearest = prepared.spectrum.reduce((best, component) => {
        const distance = Math.min(Math.abs(kValue - component.k), Math.abs(kValue + component.k));
        return !best || distance < best.distance ? { component, distance } : best;
      }, null);
      if (nearest && nearest.distance < 0.45) {
        state.hoverComponent = nearest.component.index;
        dom.rightTooltip.hidden = false;
        dom.rightTooltip.style.left = `${event.clientX - rect.left}px`;
        dom.rightTooltip.style.top = `${event.clientY - rect.top}px`;
        dom.rightTooltip.textContent = `分量 ${nearest.component.index + 1} · k = ±${format(nearest.component.k)} · A = ${format(nearest.component.a)}`;
      } else {
        state.hoverComponent = -1;
        dom.rightTooltip.hidden = true;
      }
      drawAll();
    });
    dom.rightCanvas.addEventListener('pointerleave', () => {
      if (state.hoverComponent !== -1) { state.hoverComponent = -1; dom.rightTooltip.hidden = true; drawAll(); }
    });
  }

  buildNavigation();
  bindUI();
  updatePlayButton();
  renderScene();
})();
