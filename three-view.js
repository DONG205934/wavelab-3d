(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const EPSILON = 1e-6;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const sample = (count, factory) => {
    const points = [];
    for (let index = 0; index < count; index += 1) {
      points.push(factory(index / Math.max(1, count - 1), index));
    }
    return points;
  };

  class WaveLab3DRenderer {
    constructor(canvas, getSnapshot) {
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError("WaveLab3DRenderer 需要一个 canvas 元素。");
      }
      if (typeof getSnapshot !== "function") {
        throw new TypeError("WaveLab3DRenderer 需要 getSnapshot 回调。");
      }

      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      this.getSnapshot = getSnapshot;
      this.width = 1;
      this.height = 1;
      this.dpr = 1;
      this.destroyed = false;
      this.camera = { yaw: -0.47, pitch: 0.34, distance: 14.8 };
      this.drag = { active: false, pointerId: null, x: 0, y: 0 };
      this._previousTouchAction = canvas.style.touchAction;
      this.canvas.style.touchAction = "none";

      this._onPointerDown = this._onPointerDown.bind(this);
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerUp = this._onPointerUp.bind(this);
      this._onWheel = this._onWheel.bind(this);
      this._onDoubleClick = this._onDoubleClick.bind(this);
      this._onWindowResize = this.resize.bind(this);

      canvas.addEventListener("pointerdown", this._onPointerDown);
      canvas.addEventListener("pointermove", this._onPointerMove);
      canvas.addEventListener("pointerup", this._onPointerUp);
      canvas.addEventListener("pointercancel", this._onPointerUp);
      canvas.addEventListener("lostpointercapture", this._onPointerUp);
      canvas.addEventListener("wheel", this._onWheel, { passive: false });
      canvas.addEventListener("dblclick", this._onDoubleClick);

      if (typeof ResizeObserver === "function") {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas);
      } else {
        window.addEventListener("resize", this._onWindowResize);
      }

      this._readColors();
      this.resize();
      this.draw();
    }

    _readColors() {
      const styles = getComputedStyle(document.documentElement);
      const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
      this.colors = {
        cyan: read("--cyan", "#25d6ee"),
        amber: read("--amber", "#f2b84b"),
        ivory: read("--ivory", "#f2d79a"),
        coral: read("--coral", "#ee806b"),
        green: read("--green", "#61d39b"),
        line: read("--line", "rgba(179, 204, 224, 0.17)"),
        text: read("--text", "#f3efe5"),
        soft: read("--text-soft", "#abb9c5"),
        faint: read("--text-faint", "#718394")
      };
    }

    resize() {
      if (this.destroyed) return;
      const rectangle = this.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rectangle.width || this.canvas.clientWidth || 640));
      const height = Math.max(1, Math.round(rectangle.height || this.canvas.clientHeight || 420));
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;
      }
      this.width = width;
      this.height = height;
      this.dpr = dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }

    resetCamera() {
      this.camera.yaw = -0.47;
      this.camera.pitch = 0.34;
      this.camera.distance = 14.8;
      this.draw();
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.canvas.removeEventListener("pointerdown", this._onPointerDown);
      this.canvas.removeEventListener("pointermove", this._onPointerMove);
      this.canvas.removeEventListener("pointerup", this._onPointerUp);
      this.canvas.removeEventListener("pointercancel", this._onPointerUp);
      this.canvas.removeEventListener("lostpointercapture", this._onPointerUp);
      this.canvas.removeEventListener("wheel", this._onWheel);
      this.canvas.removeEventListener("dblclick", this._onDoubleClick);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      else window.removeEventListener("resize", this._onWindowResize);
      this.canvas.style.touchAction = this._previousTouchAction;
    }

    _onPointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      this.drag.active = true;
      this.drag.pointerId = event.pointerId;
      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
      if (this.canvas.setPointerCapture) this.canvas.setPointerCapture(event.pointerId);
    }

    _onPointerMove(event) {
      if (!this.drag.active || event.pointerId !== this.drag.pointerId) return;
      event.preventDefault();
      const dx = event.clientX - this.drag.x;
      const dy = event.clientY - this.drag.y;
      this.drag.x = event.clientX;
      this.drag.y = event.clientY;
      this.camera.yaw += dx * 0.008;
      this.camera.pitch = clamp(this.camera.pitch + dy * 0.007, -1.12, 1.12);
      this.draw();
    }

    _onPointerUp(event) {
      if (event.pointerId !== undefined && event.pointerId !== this.drag.pointerId) return;
      this.drag.active = false;
      this.drag.pointerId = null;
    }

    _onWheel(event) {
      event.preventDefault();
      this.camera.distance = clamp(this.camera.distance * Math.exp(event.deltaY * 0.0011), 8.5, 28);
      this.draw();
    }

    _onDoubleClick(event) {
      event.preventDefault();
      this.resetCamera();
    }

    _snapshot() {
      let raw = {};
      try {
        raw = this.getSnapshot() || {};
      } catch (_error) {
        raw = {};
      }
      return {
        scene: raw.scene,
        sceneBase: raw.sceneBase,
        time: finite(raw.time, 0),
        playing: Boolean(raw.playing),
        A: clamp(Math.abs(finite(raw.A, 1)), 0.05, 3),
        k: finite(raw.k, 1.6),
        phase: finite(raw.phase, 0),
        omega: finite(raw.omega, 1),
        components: Array.isArray(raw.components) ? raw.components : [],
        preset: raw.preset || "gaussian",
        sigmaX: clamp(Math.abs(finite(raw.sigmaX, 1)), 0.16, 4),
        k0: finite(raw.k0, finite(raw.k, 1.6)),
        x0: finite(raw.x0, 0)
      };
    }

    _sceneNumber(snapshot) {
      const value = snapshot.scene;
      if (typeof value === "string") {
        const key = value.toLowerCase().replace(/[\s_]+/g, "-");
        if (/^(0|01|wave|complex|phasor|plane-wave|scene-?0|scene-?1)$/.test(key)) return 1;
        if (/^(02|components?|synthesis|superposition|scene-?2)$/.test(key)) return 2;
        if (/^(03|fourier|transform|spectrum|scene-?3)$/.test(key)) return 3;
        if (/^(04|packet|wave-packet|wavefunction|scene-?4)$/.test(key)) return 4;
        if (/^(05|uncertainty|dual-space|scene-?5)$/.test(key)) return 5;
        const parsed = Number(key);
        if (Number.isFinite(parsed)) return clamp(Math.round(parsed), 1, 5);
      }
      const numeric = Math.round(finite(value, 0));
      if (snapshot.sceneBase === 1) return clamp(numeric, 1, 5);
      if (numeric >= 0 && numeric <= 4) return numeric + 1;
      return clamp(numeric, 1, 5);
    }

    draw() {
      if (this.destroyed || !this.ctx) return;
      const rectangle = this.canvas.getBoundingClientRect();
      if (Math.abs(rectangle.width - this.width) > 1 || Math.abs(rectangle.height - this.height) > 1) {
        this.resize();
        return;
      }

      const snapshot = this._snapshot();
      const scene = this._sceneNumber(snapshot);
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);
      this._drawBackdrop(scene);

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (scene === 1) this._drawComplexWave(snapshot);
      else if (scene === 2) this._drawSynthesis(snapshot);
      else if (scene === 3) this._drawFourierFrames(snapshot);
      else if (scene === 4) this._drawWavePacket(snapshot);
      else this._drawDualGaussian(snapshot);
      ctx.restore();

      this._drawHud(scene, snapshot);
    }

    _drawBackdrop(scene) {
      const ctx = this.ctx;
      const gradient = ctx.createRadialGradient(
        this.width * 0.53,
        this.height * 0.42,
        10,
        this.width * 0.53,
        this.height * 0.42,
        Math.max(this.width, this.height) * 0.78
      );
      gradient.addColorStop(0, scene === 5 ? "#0b2030" : "#0a1b2a");
      gradient.addColorStop(0.58, "#071522");
      gradient.addColorStop(1, "#030a12");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = this.colors.cyan;
      for (let index = 0; index < 24; index += 1) {
        const x = (index * 97 + scene * 43) % Math.max(1, this.width);
        const y = (index * index * 17 + scene * 29) % Math.max(1, this.height);
        const radius = index % 5 === 0 ? 1.1 : 0.55;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      const vignette = ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        Math.min(this.width, this.height) * 0.28,
        this.width / 2,
        this.height / 2,
        Math.max(this.width, this.height) * 0.72
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.36)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    _project(point) {
      const yawCos = Math.cos(this.camera.yaw);
      const yawSin = Math.sin(this.camera.yaw);
      const pitchCos = Math.cos(this.camera.pitch);
      const pitchSin = Math.sin(this.camera.pitch);
      const x1 = yawCos * point.x + yawSin * point.z;
      const z1 = -yawSin * point.x + yawCos * point.z;
      const y2 = pitchCos * point.y - pitchSin * z1;
      const z2 = pitchSin * point.y + pitchCos * z1;
      const depth = Math.max(0.45, this.camera.distance - z2);
      const focal = Math.min(this.width, this.height) * 1.12;
      const scale = focal / depth;
      return {
        x: this.width * 0.5 + x1 * scale,
        y: this.height * 0.52 - y2 * scale,
        depth,
        scale
      };
    }

    _line(from, to, color, width = 1, alpha = 1, dash = []) {
      const a = this._project(from);
      const b = this._project(to);
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    _polyline(points, color, width = 1.4, alpha = 1, glow = 0, dash = []) {
      if (!points || points.length < 2) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      if (glow > 0) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
      }
      ctx.beginPath();
      const first = this._project(points[0]);
      ctx.moveTo(first.x, first.y);
      for (let index = 1; index < points.length; index += 1) {
        const point = this._project(points[index]);
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      ctx.restore();
    }

    _polygon(points, fill, alpha = 0.1, stroke = null, strokeAlpha = 0.35) {
      if (!points || points.length < 3) return;
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      points.forEach((point, index) => {
        const projected = this._project(point);
        if (index === 0) ctx.moveTo(projected.x, projected.y);
        else ctx.lineTo(projected.x, projected.y);
      });
      ctx.closePath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.globalAlpha = strokeAlpha;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    _dot(point, radius, color, alpha = 1, glow = 0) {
      const projected = this._project(point);
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
      }
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, radius, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    _worldLabel(text, point, color = this.colors.soft, options = {}) {
      const projected = this._project(point);
      this._label(text, projected.x + (options.dx || 0), projected.y + (options.dy || 0), color, options);
    }

    _label(text, x, y, color, options = {}) {
      const ctx = this.ctx;
      const fontSize = options.size || 11;
      const fontFamily = options.math ? '"Cambria Math", "Times New Roman", serif' : '"Segoe UI", "Microsoft YaHei UI", sans-serif';
      ctx.save();
      ctx.font = `${options.weight || 500} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = options.align || "left";
      ctx.textBaseline = options.baseline || "middle";
      ctx.globalAlpha = options.alpha === undefined ? 1 : options.alpha;
      if (options.pill) {
        const metrics = ctx.measureText(text);
        const paddingX = options.paddingX || 8;
        const height = fontSize + 10;
        let left = x - paddingX;
        if (ctx.textAlign === "center") left = x - metrics.width / 2 - paddingX;
        if (ctx.textAlign === "right") left = x - metrics.width - paddingX;
        this._roundedRect(left, y - height / 2, metrics.width + paddingX * 2, height, 5);
        ctx.fillStyle = options.background || "rgba(4, 13, 22, 0.82)";
        ctx.fill();
        ctx.globalAlpha *= 0.45;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.75;
        ctx.stroke();
        ctx.globalAlpha = options.alpha === undefined ? 1 : options.alpha;
      }
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    _roundedRect(x, y, width, height, radius) {
      const ctx = this.ctx;
      const r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }

    _gridXY(x0, x1, y0, y1, z, divisionsX = 10, divisionsY = 4, color = this.colors.line) {
      this._polygon([
        { x: x0, y: y0, z }, { x: x1, y: y0, z },
        { x: x1, y: y1, z }, { x: x0, y: y1, z }
      ], color, 0.025, color, 0.28);
      for (let index = 1; index < divisionsX; index += 1) {
        const x = x0 + (x1 - x0) * index / divisionsX;
        this._line({ x, y: y0, z }, { x, y: y1, z }, color, 0.7, 0.24);
      }
      for (let index = 1; index < divisionsY; index += 1) {
        const y = y0 + (y1 - y0) * index / divisionsY;
        this._line({ x: x0, y, z }, { x: x1, y, z }, color, 0.7, 0.24);
      }
    }

    _gridXZ(x0, x1, z0, z1, y, divisionsX = 10, divisionsZ = 4, color = this.colors.line) {
      this._polygon([
        { x: x0, y, z: z0 }, { x: x1, y, z: z0 },
        { x: x1, y, z: z1 }, { x: x0, y, z: z1 }
      ], color, 0.02, color, 0.22);
      for (let index = 1; index < divisionsX; index += 1) {
        const x = x0 + (x1 - x0) * index / divisionsX;
        this._line({ x, y, z: z0 }, { x, y, z: z1 }, color, 0.7, 0.2);
      }
      for (let index = 1; index < divisionsZ; index += 1) {
        const z = z0 + (z1 - z0) * index / divisionsZ;
        this._line({ x: x0, y, z }, { x: x1, y, z }, color, 0.7, 0.2);
      }
    }

    _axes(origin, xLength, yLength, zLength) {
      this._line(origin, { x: origin.x + xLength, y: origin.y, z: origin.z }, this.colors.coral, 1.15, 0.82);
      this._line(origin, { x: origin.x, y: origin.y + yLength, z: origin.z }, this.colors.green, 1.15, 0.82);
      this._line(origin, { x: origin.x, y: origin.y, z: origin.z + zLength }, this.colors.cyan, 1.15, 0.82);
      this._worldLabel("x", { x: origin.x + xLength, y: origin.y, z: origin.z }, this.colors.coral, { dx: 8, math: true, size: 12 });
      this._worldLabel("Re", { x: origin.x, y: origin.y + yLength, z: origin.z }, this.colors.green, { dy: -8, align: "center", math: true, size: 11 });
      this._worldLabel("Im", { x: origin.x, y: origin.y, z: origin.z + zLength }, this.colors.cyan, { dx: -5, dy: 10, align: "center", math: true, size: 11 });
    }

    _drawComplexWave(snapshot) {
      const amplitude = clamp(snapshot.A, 0.15, 1.65) * 1.05;
      const phaseOffset = snapshot.phase - snapshot.omega * snapshot.time;
      const x0 = -5.4;
      const x1 = 5.4;
      this._gridXY(x0, x1, -1.75, 1.75, 0, 12, 4);
      this._gridXZ(x0, x1, -1.75, 1.75, 0, 12, 4);
      this._axes({ x: x0, y: 0, z: 0 }, x1 - x0 + 0.35, 2.05, 2.05);

      const helix = sample(240, (t) => {
        const x = x0 + (x1 - x0) * t;
        const theta = snapshot.k * x + phaseOffset;
        return { x, y: amplitude * Math.cos(theta), z: amplitude * Math.sin(theta) };
      });
      const realProjection = helix.map((point) => ({ x: point.x, y: point.y, z: 0 }));
      const imaginaryProjection = helix.map((point) => ({ x: point.x, y: 0, z: point.z }));

      this._polyline(realProjection, this.colors.green, 1.25, 0.68);
      this._polyline(imaginaryProjection, this.colors.cyan, 1.25, 0.68);
      this._polyline(helix, this.colors.ivory, 2.15, 0.98, 10);

      const markerT = ((snapshot.time * 0.085) % 1 + 1) % 1;
      const markerIndex = Math.min(helix.length - 1, Math.floor(markerT * helix.length));
      const marker = helix[markerIndex];
      this._line(marker, { x: marker.x, y: marker.y, z: 0 }, this.colors.green, 0.9, 0.45, [3, 4]);
      this._line(marker, { x: marker.x, y: 0, z: marker.z }, this.colors.cyan, 0.9, 0.45, [3, 4]);
      this._dot(marker, 3.6, this.colors.ivory, 1, 12);

      this._worldLabel("Re ψ(x)", { x: x1 - 0.45, y: realProjection[realProjection.length - 1].y, z: 0 }, this.colors.green, { dx: 8, pill: true, math: true });
      this._worldLabel("Im ψ(x)", { x: x1 - 0.45, y: 0, z: imaginaryProjection[imaginaryProjection.length - 1].z }, this.colors.cyan, { dx: 8, pill: true, math: true });
      this._worldLabel("复指数螺旋  ψ = A eⁱᶠ", { x: -0.1, y: amplitude + 0.42, z: 0.2 }, this.colors.ivory, { align: "center", pill: true, math: true, size: 12 });
    }

    _normalizedComponents(snapshot) {
      const fallbacks = [
        { enabled: true, a: 1, k: 1, phi: 0 },
        { enabled: true, a: 0.7, k: 2, phi: 0.45 },
        { enabled: true, a: 0.45, k: 3.3, phi: -0.25 }
      ];
      return fallbacks.map((fallback, index) => {
        const source = snapshot.components[index] || fallback;
        return {
          enabled: source.enabled === undefined ? fallback.enabled : Boolean(source.enabled),
          a: clamp(Math.abs(finite(source.a, fallback.a)), 0, 2.5),
          k: finite(source.k, fallback.k),
          phi: finite(source.phi, fallback.phi)
        };
      });
    }

    _drawSynthesis(snapshot) {
      const components = this._normalizedComponents(snapshot);
      const componentColors = [this.colors.cyan, this.colors.amber, this.colors.coral];
      const layers = [-2.35, -0.72, 0.91];
      const x0 = -5.25;
      const x1 = 5.25;
      const phaseTime = snapshot.omega * snapshot.time;

      layers.forEach((z, componentIndex) => {
        const component = components[componentIndex];
        this._gridXY(x0, x1, -1.05, 1.05, z, 10, 2);
        const curve = sample(180, (t) => {
          const x = x0 + (x1 - x0) * t;
          const y = component.enabled ? 0.72 * component.a * Math.sin(component.k * x + component.phi - phaseTime) : 0;
          return { x, y, z };
        });
        this._polyline(
          curve,
          componentColors[componentIndex],
          component.enabled ? 1.75 : 1,
          component.enabled ? 0.9 : 0.22,
          component.enabled ? 5 : 0,
          component.enabled ? [] : [4, 5]
        );
        const status = component.enabled ? `a${componentIndex + 1} = ${component.a.toFixed(2)}  ·  k${componentIndex + 1} = ${component.k.toFixed(2)}` : `分量 ${componentIndex + 1} 已关闭`;
        this._worldLabel(status, { x: x0, y: 1.31, z }, component.enabled ? componentColors[componentIndex] : this.colors.faint, { pill: true, math: true, size: 10 });
      });

      const resultZ = 2.55;
      const totalAmplitude = components.reduce((sum, component) => sum + (component.enabled ? component.a : 0), 0);
      const visualScale = 1.02 / Math.max(1, totalAmplitude * 0.7);
      this._gridXY(x0, x1, -1.3, 1.3, resultZ, 10, 2, this.colors.ivory);
      const result = sample(220, (t) => {
        const x = x0 + (x1 - x0) * t;
        const y = components.reduce((sum, component) => {
          if (!component.enabled) return sum;
          return sum + component.a * Math.sin(component.k * x + component.phi - phaseTime);
        }, 0) * visualScale;
        return { x, y, z: resultZ };
      });
      this._polyline(result, this.colors.ivory, 2.35, 1, 11);
      this._worldLabel("合成波  Σ aⱼ sin(kⱼx + φⱼ)", { x: x0, y: 1.55, z: resultZ }, this.colors.ivory, { pill: true, math: true, size: 11 });
      this._line({ x: x0 - 0.26, y: -1.05, z: layers[0] }, { x: x0 - 0.26, y: -1.05, z: resultZ }, this.colors.line, 1, 0.48);
      this._worldLabel("逐层相加", { x: x0 - 0.26, y: -1.05, z: 0.15 }, this.colors.green, { dx: -8, align: "right", pill: true, size: 10 });
    }

    _presetType(value) {
      const preset = String(value || "").toLowerCase();
      if (/cos|sine|sinus|余弦|正弦|single/.test(preset)) return "cosine";
      if (/three|triple|mix|sum|三|叠加|复合/.test(preset)) return "three";
      return "gaussian";
    }

    _drawPanelFrame(frame, color) {
      const { x0, x1, y0, y1, z } = frame;
      this._polygon([
        { x: x0, y: y0, z }, { x: x1, y: y0, z },
        { x: x1, y: y1, z }, { x: x0, y: y1, z }
      ], color, 0.025, color, 0.44);
      for (let index = 1; index < 6; index += 1) {
        const x = x0 + (x1 - x0) * index / 6;
        this._line({ x, y: y0, z }, { x, y: y1, z }, color, 0.6, 0.17);
      }
      for (let index = 1; index < 4; index += 1) {
        const y = y0 + (y1 - y0) * index / 4;
        this._line({ x: x0, y, z }, { x: x1, y, z }, color, 0.6, 0.17);
      }
    }

    _mapPanelPoint(frame, t, value, minimum = -1, maximum = 1) {
      const normalized = (value - minimum) / Math.max(EPSILON, maximum - minimum);
      return {
        x: frame.x0 + (frame.x1 - frame.x0) * t,
        y: frame.y0 + (frame.y1 - frame.y0) * normalized,
        z: frame.z
      };
    }

    _drawFourierFrames(snapshot) {
      const left = { x0: -5.75, x1: -0.55, y0: -1.72, y1: 1.72, z: -1.05 };
      const right = { x0: 0.55, x1: 5.75, y0: -1.72, y1: 1.72, z: 1.05 };
      const type = this._presetType(snapshot.preset);
      const components = this._normalizedComponents(snapshot).filter((component) => component.enabled);
      const phaseTime = snapshot.omega * snapshot.time;
      this._drawPanelFrame(left, this.colors.cyan);
      this._drawPanelFrame(right, this.colors.amber);

      let leftCurve;
      let rightCurve;
      let leftCaption = "f(x)";
      let rightCaption = "|F(k)|";
      let domainRight = [-6, 6];
      let subtitle = "高斯的宽度互为倒数";

      if (type === "cosine") {
        const k0 = Math.max(0.35, Math.abs(snapshot.k0));
        leftCurve = sample(220, (t) => {
          const x = -5 + 10 * t;
          return this._mapPanelPoint(left, t, Math.cos(k0 * x + snapshot.phase - phaseTime));
        });
        const peakWidth = 0.16;
        rightCurve = sample(240, (t) => {
          const k = domainRight[0] + (domainRight[1] - domainRight[0]) * t;
          const value = Math.exp(-Math.pow((k - k0) / peakWidth, 2)) + Math.exp(-Math.pow((k + k0) / peakWidth, 2));
          return this._mapPanelPoint(right, t, value, 0, 1.08);
        });
        subtitle = "cos(k₀x) 在 ±k₀ 各有一个分量";
      } else if (type === "three") {
        const active = components.length ? components : this._normalizedComponents(snapshot);
        const sumA = Math.max(1, active.reduce((sum, component) => sum + component.a, 0));
        leftCurve = sample(240, (t) => {
          const x = -5 + 10 * t;
          const value = active.reduce((sum, component) => sum + component.a * Math.sin(component.k * x + component.phi - phaseTime), 0) / sumA;
          return this._mapPanelPoint(left, t, value);
        });
        domainRight = [0, Math.max(6, ...active.map((component) => Math.abs(component.k) + 1))];
        rightCurve = sample(260, (t) => {
          const k = domainRight[0] + (domainRight[1] - domainRight[0]) * t;
          const value = active.reduce((sum, component) => {
            const width = 0.12 + Math.abs(component.k) * 0.014;
            return sum + (component.a / sumA) * Math.exp(-Math.pow((k - Math.abs(component.k)) / width, 2));
          }, 0);
          return this._mapPanelPoint(right, t, value, 0, 1.02);
        });
        rightCaption = "|F(k)|  ·  k ≥ 0 单边谱";
        subtitle = "三个波数 → 三个谱峰";
      } else {
        const sigma = snapshot.sigmaX;
        const center = clamp(snapshot.x0, -2.5, 2.5);
        leftCurve = sample(220, (t) => {
          const x = -5 + 10 * t;
          const value = Math.exp(-Math.pow(x - center, 2) / (4 * sigma * sigma));
          return this._mapPanelPoint(left, t, value, 0, 1.04);
        });
        rightCurve = sample(240, (t) => {
          const k = -6 + 12 * t;
          const value = Math.exp(-sigma * sigma * k * k);
          return this._mapPanelPoint(right, t, value, 0, 1.04);
        });
      }

      this._polyline(leftCurve, this.colors.cyan, 2.15, 0.98, 8);
      this._polyline(rightCurve, this.colors.amber, 2.15, 0.98, 8);
      this._worldLabel(`实空间 x  ·  ${leftCaption}`, { x: left.x0, y: left.y1 + 0.38, z: left.z }, this.colors.cyan, { pill: true, math: true, size: 11 });
      this._worldLabel(`k 空间  ·  ${rightCaption}`, { x: right.x0, y: right.y1 + 0.38, z: right.z }, this.colors.amber, { pill: true, math: true, size: 11 });

      const arrowFrom = { x: -0.28, y: 0, z: -0.25 };
      const arrowTo = { x: 0.28, y: 0, z: 0.25 };
      this._line(arrowFrom, arrowTo, this.colors.ivory, 1.4, 0.72);
      this._worldLabel("ℱ", { x: 0, y: 0.42, z: 0 }, this.colors.ivory, { align: "center", pill: true, math: true, size: 17 });
      this._worldLabel(subtitle, { x: 0, y: -2.25, z: 0 }, this.colors.soft, { align: "center", pill: true, size: 10 });
    }

    _drawWavePacket(snapshot) {
      const sigma = snapshot.sigmaX;
      const center = clamp(snapshot.x0, -3.4, 3.4);
      const k0 = snapshot.k0;
      const phaseOffset = snapshot.phase - snapshot.omega * snapshot.time;
      const xMin = -5.6;
      const xMax = 5.6;
      this._gridXY(xMin, xMax, -1.85, 1.85, 0, 12, 4);
      this._axes({ x: xMin, y: 0, z: 0 }, xMax - xMin + 0.3, 2.08, 2.08);

      const packet = sample(300, (t) => {
        const x = xMin + (xMax - xMin) * t;
        const envelope = Math.exp(-Math.pow(x - center, 2) / (4 * sigma * sigma));
        const theta = k0 * x + phaseOffset;
        return { x, y: 1.48 * envelope * Math.cos(theta), z: 1.48 * envelope * Math.sin(theta) };
      });
      const envelopeTop = sample(180, (t) => {
        const x = xMin + (xMax - xMin) * t;
        return { x, y: 1.48 * Math.exp(-Math.pow(x - center, 2) / (4 * sigma * sigma)), z: 0 };
      });
      const envelopeBottom = envelopeTop.map((point) => ({ x: point.x, y: -point.y, z: 0 }));
      this._polyline(envelopeTop, this.colors.amber, 1.05, 0.62, 3, [5, 5]);
      this._polyline(envelopeBottom, this.colors.amber, 1.05, 0.62, 3, [5, 5]);
      this._polyline(packet, this.colors.ivory, 2.25, 1, 11);

      const densityZ = -2.42;
      const densityBase = -1.62;
      const densityCurve = sample(220, (t) => {
        const x = xMin + (xMax - xMin) * t;
        const probability = Math.exp(-Math.pow(x - center, 2) / (2 * sigma * sigma));
        return { x, y: densityBase + 1.05 * probability, z: densityZ };
      });
      const densityFill = [
        { x: xMin, y: densityBase, z: densityZ },
        ...densityCurve,
        { x: xMax, y: densityBase, z: densityZ }
      ];
      this._polygon(densityFill, this.colors.green, 0.12, this.colors.green, 0.22);
      this._polyline(densityCurve, this.colors.green, 1.85, 0.92, 7);
      this._line({ x: xMin, y: densityBase, z: densityZ }, { x: xMax, y: densityBase, z: densityZ }, this.colors.line, 0.9, 0.62);
      this._worldLabel("概率密度  |ψ(x)|²", { x: xMin + 0.15, y: densityBase + 1.28, z: densityZ }, this.colors.green, { pill: true, math: true, size: 11 });
      this._worldLabel("复波函数 ψ(x)", { x: center, y: 1.88, z: 0 }, this.colors.ivory, { align: "center", pill: true, math: true, size: 11 });

      const leftSigma = center - sigma;
      const rightSigma = center + sigma;
      if (leftSigma > xMin && rightSigma < xMax) {
        this._line({ x: leftSigma, y: densityBase, z: densityZ }, { x: leftSigma, y: densityBase + 0.66, z: densityZ }, this.colors.green, 0.8, 0.36, [3, 4]);
        this._line({ x: rightSigma, y: densityBase, z: densityZ }, { x: rightSigma, y: densityBase + 0.66, z: densityZ }, this.colors.green, 0.8, 0.36, [3, 4]);
      }
    }

    _domainToFrame(frame, value, domainMin, domainMax) {
      return frame.x0 + (frame.x1 - frame.x0) * (value - domainMin) / Math.max(EPSILON, domainMax - domainMin);
    }

    _drawSigmaBand(frame, center, sigma, domainMin, domainMax, color, label) {
      const left = clamp(this._domainToFrame(frame, center - sigma, domainMin, domainMax), frame.x0, frame.x1);
      const right = clamp(this._domainToFrame(frame, center + sigma, domainMin, domainMax), frame.x0, frame.x1);
      this._polygon([
        { x: left, y: frame.y0, z: frame.z }, { x: right, y: frame.y0, z: frame.z },
        { x: right, y: frame.y1, z: frame.z }, { x: left, y: frame.y1, z: frame.z }
      ], color, 0.085, color, 0.28);
      const bracketY = frame.y0 + 0.18;
      this._line({ x: left, y: bracketY, z: frame.z }, { x: right, y: bracketY, z: frame.z }, color, 1.1, 0.82);
      this._line({ x: left, y: bracketY - 0.09, z: frame.z }, { x: left, y: bracketY + 0.09, z: frame.z }, color, 1.1, 0.82);
      this._line({ x: right, y: bracketY - 0.09, z: frame.z }, { x: right, y: bracketY + 0.09, z: frame.z }, color, 1.1, 0.82);
      this._worldLabel(label, { x: (left + right) / 2, y: bracketY - 0.24, z: frame.z }, color, { align: "center", pill: true, math: true, size: 10 });
    }

    _drawDualGaussian(snapshot) {
      const sigmaX = snapshot.sigmaX;
      const sigmaK = 1 / (2 * sigmaX);
      const xCenter = snapshot.x0;
      const kCenter = snapshot.k0;
      const xHalfSpan = Math.max(3.4 * sigmaX, 4.2);
      const kHalfSpan = Math.max(3.4 * sigmaK, 2.5);
      const xDomain = [xCenter - xHalfSpan, xCenter + xHalfSpan];
      const kDomain = [kCenter - kHalfSpan, kCenter + kHalfSpan];
      const left = { x0: -5.8, x1: -0.45, y0: -1.7, y1: 1.7, z: -0.95 };
      const right = { x0: 0.45, x1: 5.8, y0: -1.7, y1: 1.7, z: 0.95 };
      this._drawPanelFrame(left, this.colors.cyan);
      this._drawPanelFrame(right, this.colors.amber);
      this._drawSigmaBand(left, xCenter, sigmaX, xDomain[0], xDomain[1], this.colors.cyan, `2σₓ = ${(2 * sigmaX).toFixed(2)}`);
      this._drawSigmaBand(right, kCenter, sigmaK, kDomain[0], kDomain[1], this.colors.amber, `2σₖ = ${(2 * sigmaK).toFixed(2)}`);

      const phaseTime = snapshot.phase - snapshot.omega * snapshot.time;
      const leftComplex = sample(280, (t) => {
        const x = xDomain[0] + (xDomain[1] - xDomain[0]) * t;
        const envelope = Math.exp(-Math.pow(x - xCenter, 2) / (4 * sigmaX * sigmaX));
        const theta = snapshot.k0 * x + phaseTime;
        return {
          x: left.x0 + (left.x1 - left.x0) * t,
          y: 1.2 * envelope * Math.cos(theta),
          z: left.z + 1.2 * envelope * Math.sin(theta)
        };
      });
      const rightComplex = sample(280, (t) => {
        const k = kDomain[0] + (kDomain[1] - kDomain[0]) * t;
        const envelope = Math.exp(-sigmaX * sigmaX * Math.pow(k - kCenter, 2));
        const theta = -snapshot.x0 * (k - kCenter);
        return {
          x: right.x0 + (right.x1 - right.x0) * t,
          y: 1.2 * envelope * Math.cos(theta),
          z: right.z + 1.2 * envelope * Math.sin(theta)
        };
      });
      this._polyline(leftComplex, this.colors.cyan, 2.15, 0.98, 9);
      this._polyline(rightComplex, this.colors.amber, 2.15, 0.98, 9);

      const leftProbability = sample(210, (t) => {
        const x = xDomain[0] + (xDomain[1] - xDomain[0]) * t;
        const probability = Math.exp(-Math.pow(x - xCenter, 2) / (2 * sigmaX * sigmaX));
        return { x: left.x0 + (left.x1 - left.x0) * t, y: left.y0 + 0.34 + probability * 0.66, z: left.z };
      });
      const rightProbability = sample(210, (t) => {
        const k = kDomain[0] + (kDomain[1] - kDomain[0]) * t;
        const probability = Math.exp(-Math.pow(k - kCenter, 2) / (2 * sigmaK * sigmaK));
        return { x: right.x0 + (right.x1 - right.x0) * t, y: right.y0 + 0.34 + probability * 0.66, z: right.z };
      });
      this._polyline(leftProbability, this.colors.green, 1.25, 0.74);
      this._polyline(rightProbability, this.colors.green, 1.25, 0.74);

      this._worldLabel("x 空间  ·  ψ(x)", { x: left.x0, y: left.y1 + 0.38, z: left.z }, this.colors.cyan, { pill: true, math: true, size: 11 });
      this._worldLabel("k 空间  ·  φ(k)", { x: right.x0, y: right.y1 + 0.38, z: right.z }, this.colors.amber, { pill: true, math: true, size: 11 });
      this._worldLabel("绿线为概率密度", { x: 0, y: -2.12, z: 0 }, this.colors.green, { align: "center", pill: true, size: 10 });
      this._worldLabel(`σₓσₖ = ${sigmaX.toFixed(2)} × ${sigmaK.toFixed(2)} = 1/2`, { x: 0, y: 2.2, z: 0 }, this.colors.ivory, { align: "center", pill: true, math: true, size: 12 });
    }

    _drawHud(scene, snapshot) {
      const titles = [
        "01  复指数与相位螺旋",
        "02  分量分层与傅里叶合成",
        "03  实空间 ↔ k 空间",
        "04  复波包与概率密度",
        "05  双空间与不确定宽度"
      ];
      const ctx = this.ctx;
      ctx.save();
      const titleX = this.width < 590 ? this.width * 0.5 : 118;
      this._label(titles[scene - 1], titleX, 22, this.colors.ivory, {
        align: this.width < 590 ? "center" : "left",
        size: this.width < 430 ? 10 : 11,
        weight: 650,
        alpha: 0.9
      });

      const notice = "透视仅用于建立直觉  ·  Re / Im 为复振幅数学轴";
      if (this.width >= 620) {
        this._label(notice, this.width - 18, 21, this.colors.faint, { align: "right", size: 10 });
        this._label("它们不是额外的物理空间方向", this.width - 18, 37, this.colors.faint, { align: "right", size: 9, alpha: 0.82 });
      } else {
        this._label("Re / Im 是数学轴、不是物理空间方向", this.width * 0.5, this.height - 40, this.colors.faint, { align: "center", size: 9, pill: true, alpha: 0.9 });
      }

      if (snapshot.playing) {
        ctx.fillStyle = this.colors.green;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(this.width - 18, this.height - 18, 2.6, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  window.WaveLab3DRenderer = WaveLab3DRenderer;
})();
