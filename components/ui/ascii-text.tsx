import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uEnableWaves;

void main() {
  vUv = uv;
  float time = uTime * 5.0;
  float waveFactor = uEnableWaves;
  vec3 transformed = position;

  transformed.x += sin(time + position.y) * 0.32 * waveFactor;
  transformed.y += cos(time + position.z) * 0.1 * waveFactor;
  transformed.z += sin(time + position.x) * 0.55 * waveFactor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
  float time = uTime;
  vec2 pos = vUv;

  float r = texture2D(uTexture, pos + cos(time * 2.0 + pos.x) * 0.008).r;
  float g = texture2D(uTexture, pos + tan(time * 0.5 + pos.x - time) * 0.006).g;
  float b = texture2D(uTexture, pos - cos(time * 2.0 + pos.y) * 0.008).b;
  float a = texture2D(uTexture, pos).a;

  gl_FragColor = vec4(r, g, b, a);
}
`;

const ASCII_MIN_CELL_PX = 4;
const ASCII_ALPHA_CUTOFF = 18;
const ASCII_FONT_FAMILY =
  '"Cascadia Mono", "SFMono-Regular", "JetBrains Mono", Consolas, "Courier New", monospace';

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixChannel(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function neonGradientAt(x: number, y: number, width: number, height: number) {
  const horizontal = width > 0 ? x / width : 0;
  const vertical = height > 0 ? y / height : 0;
  const magentaPulse = Math.max(0, 1 - Math.abs(horizontal - 0.08) / 0.18);
  const cyanPulse = Math.max(0, 1 - Math.abs(horizontal - 0.38) / 0.24);
  const greenPulse = Math.max(0, 1 - Math.abs(horizontal - 0.56) / 0.2);
  const orangePulse = Math.max(0, 1 - Math.abs(horizontal - 0.78) / 0.18);
  const scanPulse = 0.82 + Math.sin(vertical * Math.PI * 7) * 0.18;

  const r = (250 + magentaPulse * 28 + orangePulse * 55 - cyanPulse * 68) * scanPulse;
  const g = (244 + cyanPulse * 42 + greenPulse * 52 + orangePulse * 6) * scanPulse;
  const b = (226 + cyanPulse * 48 + magentaPulse * 34 - orangePulse * 104) * scanPulse;

  return {
    r: clampChannel(r),
    g: clampChannel(g),
    b: clampChannel(b),
  };
}

function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${Math.max(0, Math.min(1, a))})`;
}

function mapRange(n: number, start: number, stop: number, start2: number, stop2: number) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

type AsciiFilterOptions = {
  fontSize?: number;
  fontFamily?: string;
  charset?: string;
  invert?: boolean;
};

class AsciiFilter {
  renderer: THREE.WebGLRenderer;
  domElement: HTMLCanvasElement;
  outputContext: CanvasRenderingContext2D;
  sampleCanvas: HTMLCanvasElement;
  sampleContext: CanvasRenderingContext2D;
  deg = 0;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width = 1;
  height = 1;
  cols = 1;
  rows = 1;
  charWidth = 1;
  cellHeight = 1;
  center = { x: 0, y: 0 };
  mouse = { x: 0, y: 0 };

  constructor(renderer: THREE.WebGLRenderer, options: AsciiFilterOptions = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement("canvas");
    const outputContext = this.domElement.getContext("2d", { alpha: true });
    if (!outputContext) {
      throw new Error("Could not create ASCII output context");
    }
    this.outputContext = outputContext;
    this.sampleCanvas = document.createElement("canvas");
    const sampleContext = this.sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) {
      throw new Error("Could not create ASCII sample context");
    }
    this.sampleContext = sampleContext;
    this.domElement.style.position = "absolute";
    this.domElement.style.inset = "0";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";

    this.invert = options.invert ?? true;
    this.fontSize = options.fontSize ?? 9;
    this.fontFamily = options.fontFamily ?? ASCII_FONT_FAMILY;
    this.charset =
      options.charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener("mousemove", this.onMouseMove);
  }

  setSize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height);
    this.domElement.width = this.width;
    this.domElement.height = this.height;
    this.reset();
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.cellHeight = Math.max(ASCII_MIN_CELL_PX, this.fontSize);
    this.outputContext.font = `800 ${this.cellHeight}px ${this.fontFamily}`;
    this.outputContext.textBaseline = "top";
    this.outputContext.textAlign = "left";
    this.charWidth = Math.max(1, this.outputContext.measureText("A").width);
    this.cols = Math.max(1, Math.floor(this.width / this.charWidth));
    this.rows = Math.max(1, Math.floor(this.height / this.cellHeight));
    this.sampleCanvas.width = this.cols;
    this.sampleCanvas.height = this.rows;
    this.sampleContext.imageSmoothingEnabled = false;
    this.outputContext.imageSmoothingEnabled = false;
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);
    this.sampleContext.clearRect(0, 0, this.cols, this.rows);
    this.sampleContext.drawImage(this.renderer.domElement, 0, 0, this.cols, this.rows);
    this.asciify();
  }

  asciify() {
    const imageData = this.sampleContext.getImageData(0, 0, this.cols, this.rows).data;
    this.outputContext.clearRect(0, 0, this.width, this.height);
    this.outputContext.font = `800 ${this.cellHeight}px ${this.fontFamily}`;
    this.outputContext.textBaseline = "top";

    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        const index = (x + y * this.cols) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const a = imageData[index + 3];

        if (a < ASCII_ALPHA_CUTOFF) {
          continue;
        }

        const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        const mix = this.invert ? gray : 1 - gray;
        const charIndex = Math.max(0, Math.min(this.charset.length - 1, Math.floor(mix * (this.charset.length - 1))));
        const drawX = x * this.charWidth;
        const drawY = y * this.cellHeight;
        const alpha = Math.min(1, Math.max(0.5, (a / 255) * 1.18));
        const neon = neonGradientAt(drawX, drawY, this.width, this.height);
        const sourceLift = Math.max(r, g, b) / 255;
        const channelAlpha = alpha * (0.55 + sourceLift * 0.28);
        this.outputContext.fillStyle = rgba(40, 248, 255, channelAlpha * 0.72);
        this.outputContext.fillText(this.charset[charIndex], drawX - 1.35, drawY);
        this.outputContext.fillStyle = rgba(255, 36, 210, channelAlpha * 0.56);
        this.outputContext.fillText(this.charset[charIndex], drawX + 1.25, drawY + 0.35);
        this.outputContext.fillStyle = rgba(255, 226, 54, channelAlpha * 0.48);
        this.outputContext.fillText(this.charset[charIndex], drawX + 0.25, drawY - 0.45);
        const outR = mixChannel(neon.r, 235, 0.28);
        const outG = mixChannel(neon.g, 250, 0.24);
        const outB = mixChannel(neon.b, 238, 0.22);
        this.outputContext.fillStyle = rgba(outR, outG, outB, alpha * 0.76);
        this.outputContext.fillText(this.charset[charIndex], drawX, drawY);
      }
    }
  }

  onMouseMove(e: MouseEvent) {
    this.mouse = { x: e.clientX, y: e.clientY };
  }

  dispose() {
    document.removeEventListener("mousemove", this.onMouseMove);
  }
}

class CanvasText {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  text: string;
  layoutText: string;
  anchorText: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  lineHeight: number;
  font: string;
  alignMode: "center" | "anchored" | "layout";
  lineXPositions: number[] = [];
  private dirty = true;

  constructor(
    text: string,
    {
      layoutText,
      anchorText = layoutText,
      fontSize = 160,
      fontFamily = ASCII_FONT_FAMILY,
      color = "#fdf9f3",
      alignMode = "center",
    }: {
      layoutText: string;
      anchorText?: string;
      fontSize?: number;
      fontFamily?: string;
      color?: string;
      alignMode?: "center" | "anchored" | "layout";
    }
  ) {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create text canvas context");
    }
    this.context = context;
    this.text = text;
    this.layoutText = layoutText;
    this.anchorText = anchorText;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.alignMode = alignMode;
    this.lineHeight = this.fontSize * 1.02;
    this.font = `800 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.context.font = this.font;
    const lines = this.layoutText.split("\n");
    const textWidth = Math.ceil(Math.max(...lines.map((line) => this.context.measureText(line).width), 1)) + 40;
    const textHeight = Math.ceil(lines.length * this.lineHeight) + 30;

    this.canvas.width = textWidth;
    this.canvas.height = textHeight;
    this.lineXPositions = [];
    this.dirty = true;
  }

  render() {
    const lines = this.text.split("\n");
    const anchorLines = this.anchorText.split("\n");
    const nextLineXPositions: number[] = [];
    let changed = this.dirty || this.lineXPositions.length !== lines.length;

    this.context.font = this.font;
    lines.forEach((line, index) => {
      const drawLine = this.alignMode === "layout" ? line : line.trim();
      const referenceLine = this.alignMode === "center" ? drawLine : anchorLines[index] ?? drawLine;
      const referenceWidth = this.context.measureText(referenceLine || " ").width;
      const targetX = Math.max(18, (this.canvas.width - referenceWidth) / 2);
      const currentX = this.lineXPositions[index] ?? targetX;
      const nextX = currentX + (targetX - currentX) * 0.18;
      const x = Math.abs(nextX - targetX) < 0.12 ? targetX : nextX;
      nextLineXPositions[index] = x;

      if (Math.abs((this.lineXPositions[index] ?? Number.NaN) - x) > 0.01) {
        changed = true;
      }
    });

    if (!changed) {
      return false;
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    this.context.textBaseline = "top";

    lines.forEach((line, index) => {
      const drawLine = this.alignMode === "layout" ? line : line.trim();
      this.context.fillText(drawLine, nextLineXPositions[index], 12 + index * this.lineHeight);
    });
    this.lineXPositions = nextLineXPositions;
    this.dirty = false;
    return true;
  }

  setText(text: string) {
    if (this.text === text) {
      return;
    }

    this.text = text;
    this.dirty = true;
  }

  setAnchorText(anchorText: string) {
    if (this.anchorText === anchorText) {
      return;
    }

    this.anchorText = anchorText;
    this.dirty = true;
  }

  get texture() {
    return this.canvas;
  }
}

class CanvasAscii {
  textCanvas: CanvasText;
  texture: THREE.CanvasTexture;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer?: THREE.WebGLRenderer;
  filter?: AsciiFilter;
  geometry?: THREE.PlaneGeometry;
  material?: THREE.ShaderMaterial;
  mesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  animationFrameId = 0;
  isRunning = false;
  isDisposed = false;
  lastRenderNow = 0;
  mouse = { x: 0, y: 0 };
  center = { x: 0, y: 0 };

  constructor(
    private options: {
      text: string;
      layoutText: string;
      anchorText: string;
      asciiFontSize: number;
      textFontSize: number;
      textColor: string;
      planeBaseHeight: number;
      enableWaves: boolean;
      alignMode: "center" | "anchored" | "layout";
      targetFrameMs: number;
    },
    private container: HTMLElement,
    private width: number,
    private height: number
  ) {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: this.width / 2, y: this.height / 2 };
    this.textCanvas = new CanvasText(options.text, {
      layoutText: options.layoutText,
      anchorText: options.anchorText,
      fontSize: options.textFontSize,
      color: options.textColor,
      alignMode: options.alignMode,
    });
    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  async init() {
    this.setMesh();
    this.setRenderer();

    if ("fonts" in document) {
      void document.fonts.ready
        .then(() => {
          if (!this.isDisposed) {
            this.refreshTextGeometry();
            this.render(performance.now());
          }
        })
        .catch(() => {
          // Continue with fallback fonts.
        });
    }
  }

  setMesh() {
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.texture.width / this.textCanvas.texture.height;
    const planeH = this.options.planeBaseHeight;
    const planeW = planeH * textAspect;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.options.enableWaves ? 1.0 : 0.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: ASCII_FONT_FAMILY,
      fontSize: this.options.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.container.dataset.renderTargetFrameMs = this.options.targetFrameMs.toFixed(2);
    this.setSize(this.width, this.height);
    this.container.addEventListener("mousemove", this.onMouseMove);
    this.container.addEventListener("touchmove", this.onMouseMove, { passive: true });
  }

  setText(text: string) {
    this.textCanvas.setText(text);
  }

  setAnchorText(anchorText: string) {
    this.textCanvas.setAnchorText(anchorText);
  }

  setSize(w: number, h: number) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.filter?.setSize(this.width, this.height);
    this.center = { x: this.width / 2, y: this.height / 2 };
  }

  refreshTextGeometry() {
    if (!this.mesh || !this.material) {
      return;
    }

    this.textCanvas.resize();
    this.textCanvas.render();
    this.texture.needsUpdate = true;

    const textAspect = this.textCanvas.texture.width / this.textCanvas.texture.height;
    const planeH = this.options.planeBaseHeight;
    const planeW = planeH * textAspect;
    const nextGeometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.mesh.geometry.dispose();
    this.mesh.geometry = nextGeometry;
    this.geometry = nextGeometry;
  }

  load(active = true) {
    if (!active) {
      this.render(performance.now());
      return;
    }

    this.render(performance.now());
    this.resume();
  }

  resume() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastRenderNow = 0;
    const animateFrame = (now: number) => {
      if (!this.isRunning) {
        return;
      }

      if (this.lastRenderNow > 0 && now - this.lastRenderNow < this.options.targetFrameMs) {
        this.animationFrameId = requestAnimationFrame(animateFrame);
        return;
      }

      this.lastRenderNow = now;
      this.render(now);
      this.animationFrameId = requestAnimationFrame(animateFrame);
    };
    this.animationFrameId = requestAnimationFrame(animateFrame);
  }

  pause() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
  }

  onMouseMove(evt: MouseEvent | TouchEvent) {
    const event = "touches" in evt ? evt.touches[0] : evt;
    if (!event) {
      return;
    }

    const bounds = this.container.getBoundingClientRect();
    this.mouse = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  render(now = performance.now()) {
    if (!this.mesh || !this.material || !this.filter) {
      return;
    }

    const time = now * 0.001;
    if (this.textCanvas.render()) {
      this.texture.needsUpdate = true;
    }
    this.material.uniforms.uTime.value = Math.sin(time);
    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    if (!this.mesh) {
      return;
    }

    const x = mapRange(this.mouse.y, 0, this.height, 0.38, -0.38);
    const y = mapRange(this.mouse.x, 0, this.width, -0.38, 0.38);
    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
  }

  dispose() {
    this.isDisposed = true;
    this.pause();
    this.container.removeEventListener("mousemove", this.onMouseMove);
    this.container.removeEventListener("touchmove", this.onMouseMove);
    this.filter?.dispose();
    if (this.filter?.domElement.parentNode) {
      this.container.removeChild(this.filter.domElement);
    }
    this.geometry?.dispose();
    this.material?.dispose();
    this.texture?.dispose();
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
  }
}

export type ASCIITextProps = {
  text?: string;
  layoutText?: string;
  anchorText?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
  alignMode?: "center" | "anchored" | "layout";
  resizeMode?: "responsive" | "debounced" | "initial";
  active?: boolean;
  animated?: boolean;
  maxFps?: number;
};

export function ASCIIText({
  text = "Rosebeg",
  layoutText = text,
  anchorText = layoutText,
  asciiFontSize = 7,
  textFontSize = 170,
  textColor = "#fdf9f3",
  planeBaseHeight = 10,
  enableWaves = true,
  alignMode = "center",
  resizeMode = "responsive",
  active = true,
  animated = true,
  maxFps = 20,
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const asciiRef = useRef<CanvasAscii | null>(null);
  const latestText = useRef(text);
  const latestAnchorText = useRef(anchorText);
  const resizeTimeout = useRef<number | null>(null);

  useEffect(() => {
    latestText.current = text;
    asciiRef.current?.setText(text);
    if (!animated || !active) {
      asciiRef.current?.render(performance.now());
    }
  }, [active, animated, text]);

  useEffect(() => {
    latestAnchorText.current = anchorText;
    asciiRef.current?.setAnchorText(anchorText);
    if (!animated || !active) {
      asciiRef.current?.render(performance.now());
    }
  }, [active, animated, anchorText]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    const container = containerRef.current;

    const setup = async () => {
      const { width, height } = container.getBoundingClientRect();
      const targetFrameMs = Math.max(1000 / 60, 1000 / Math.max(1, maxFps));
      const instance = new CanvasAscii(
        {
          text: latestText.current,
          layoutText,
          anchorText: latestAnchorText.current,
          asciiFontSize,
          textFontSize,
          textColor,
          planeBaseHeight,
          enableWaves,
          alignMode,
          targetFrameMs,
        },
        container,
        width || 1,
        height || 1
      );

      await instance.init();
      if (cancelled) {
        instance.dispose();
        return;
      }

      instance.setText(latestText.current);
      instance.setAnchorText(latestAnchorText.current);
      asciiRef.current = instance;
      instance.load(animated && active && document.visibilityState !== "hidden");
      if (!animated || !active) {
        instance.render(performance.now());
      }

      if (resizeMode !== "initial") {
        resizeObserver = new ResizeObserver((entries) => {
          if (!entries[0] || !asciiRef.current) {
            return;
          }
          const { width: w, height: h } = entries[0].contentRect;
          if (w > 0 && h > 0) {
            const applySize = () => {
              asciiRef.current?.setSize(w, h);
              if (!animated || !active) {
                asciiRef.current?.render(performance.now());
              }
              resizeTimeout.current = null;
            };

            if (resizeMode === "debounced") {
              if (resizeTimeout.current !== null) {
                window.clearTimeout(resizeTimeout.current);
              }
              resizeTimeout.current = window.setTimeout(applySize, 180);
              return;
            }

            applySize();
          }
        });
        resizeObserver.observe(container);
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (resizeTimeout.current !== null) {
        window.clearTimeout(resizeTimeout.current);
        resizeTimeout.current = null;
      }
      resizeObserver?.disconnect();
      asciiRef.current?.dispose();
      asciiRef.current = null;
    };
  }, [
    alignMode,
    asciiFontSize,
    enableWaves,
    layoutText,
    planeBaseHeight,
    resizeMode,
    textColor,
    textFontSize,
    animated,
    maxFps,
  ]);

  useEffect(() => {
    const syncActivity = () => {
      if (animated && active && document.visibilityState !== "hidden") {
        asciiRef.current?.resume();
      } else {
        asciiRef.current?.pause();
        asciiRef.current?.render(performance.now());
      }
    };

    syncActivity();
    document.addEventListener("visibilitychange", syncActivity);

    return () => document.removeEventListener("visibilitychange", syncActivity);
  }, [active, animated]);

  return (
    <div
      className="ascii-text-container"
      data-align-mode={alignMode}
      data-ascii-canvas
      data-ascii-font-size={asciiFontSize}
      data-anchor-text={anchorText}
      data-render-active={active ? "true" : "false"}
      data-render-animated={animated ? "true" : "false"}
      data-render-max-fps={maxFps}
      data-resize-mode={resizeMode}
      ref={containerRef}
    />
  );
}
