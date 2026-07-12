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

const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio : 1;

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
  domElement: HTMLDivElement;
  pre: HTMLPreElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  deg = 0;
  invert: boolean;
  fontSize: number;
  fontFamily: string;
  charset: string;
  width = 1;
  height = 1;
  cols = 1;
  rows = 1;
  center = { x: 0, y: 0 };
  mouse = { x: 0, y: 0 };

  constructor(renderer: THREE.WebGLRenderer, options: AsciiFilterOptions = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement("div");
    this.domElement.style.position = "absolute";
    this.domElement.style.inset = "0";
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";

    this.pre = document.createElement("pre");
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Could not create ASCII canvas context");
    }
    this.context = context;
    this.domElement.appendChild(this.canvas);

    this.invert = options.invert ?? true;
    this.fontSize = options.fontSize ?? 9;
    this.fontFamily = options.fontFamily ?? "'IBM Plex Mono', 'Courier New', monospace";
    this.charset =
      options.charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    this.context.imageSmoothingEnabled = false;
    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener("mousemove", this.onMouseMove);
  }

  setSize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height);
    this.reset();
    this.center = { x: this.width / 2, y: this.height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = Math.max(1, this.context.measureText("A").width);
    this.cols = Math.max(1, Math.floor(this.width / charWidth));
    this.rows = Math.max(1, Math.floor(this.height / this.fontSize));

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = "0";
    this.pre.style.padding = "0";
    this.pre.style.lineHeight = "1em";
    this.pre.style.position = "absolute";
    this.pre.style.left = "0";
    this.pre.style.top = "0";
    this.pre.style.zIndex = "9";
    this.pre.style.backgroundAttachment = "fixed";
    this.pre.style.mixBlendMode = "screen";
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }

    this.asciify(this.context, w, h);
    this.hue();
  }

  onMouseMove(e: MouseEvent) {
    this.mouse = { x: e.clientX * pixelRatio, y: e.clientY * pixelRatio };
  }

  hue() {
    const deg = (Math.atan2(this.mouse.y - this.center.y, this.mouse.x - this.center.x) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imgData = ctx.getImageData(0, 0, w, h).data;
    let str = "";

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = x * 4 + y * 4 * w;
        const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

        if (a === 0) {
          str += " ";
          continue;
        }

        const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
        let idx = Math.floor((1 - gray) * (this.charset.length - 1));
        if (this.invert) {
          idx = this.charset.length - idx - 1;
        }
        str += this.charset[idx];
      }
      str += "\n";
    }

    this.pre.textContent = str;
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

  constructor(
    text: string,
    {
      layoutText,
      anchorText = layoutText,
      fontSize = 160,
      fontFamily = "'IBM Plex Mono', 'Courier New', monospace",
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
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    this.context.textBaseline = "top";

    const lines = this.text.split("\n");
    const anchorLines = this.anchorText.split("\n");
    lines.forEach((line, index) => {
      const drawLine = this.alignMode === "layout" ? line : line.trim();
      const referenceLine =
        this.alignMode === "center" ? drawLine : anchorLines[index] ?? drawLine;
      const referenceWidth = this.context.measureText(referenceLine || " ").width;
      const targetX = Math.max(18, (this.canvas.width - referenceWidth) / 2);
      const currentX = this.lineXPositions[index] ?? targetX;
      const nextX = currentX + (targetX - currentX) * 0.18;
      const x = Math.abs(nextX - targetX) < 0.12 ? targetX : nextX;
      this.lineXPositions[index] = x;
      this.context.fillText(drawLine, x, 12 + index * this.lineHeight);
    });
  }

  setText(text: string) {
    this.text = text;
  }

  setAnchorText(anchorText: string) {
    this.anchorText = anchorText;
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
    if ("fonts" in document) {
      try {
        await document.fonts.ready;
      } catch {
        // Continue with fallback fonts.
      }
    }

    this.setMesh();
    this.setRenderer();
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
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      fontSize: this.options.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
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

  load(active = true) {
    if (!active) {
      this.render();
      return;
    }

    this.resume();
  }

  resume() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const animateFrame = () => {
      if (!this.isRunning) {
        return;
      }

      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
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

  render() {
    if (!this.mesh || !this.material || !this.filter) {
      return;
    }

    const time = Date.now() * 0.001;
    this.textCanvas.render();
    this.texture.needsUpdate = true;
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
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const asciiRef = useRef<CanvasAscii | null>(null);
  const latestText = useRef(text);
  const latestAnchorText = useRef(anchorText);
  const resizeTimeout = useRef<number | null>(null);

  useEffect(() => {
    latestText.current = text;
    asciiRef.current?.setText(text);
  }, [text]);

  useEffect(() => {
    latestAnchorText.current = anchorText;
    asciiRef.current?.setAnchorText(anchorText);
  }, [anchorText]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    const container = containerRef.current;

    const setup = async () => {
      const { width, height } = container.getBoundingClientRect();
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

      asciiRef.current = instance;
      instance.load(active);

      if (resizeMode !== "initial") {
        resizeObserver = new ResizeObserver((entries) => {
          if (!entries[0] || !asciiRef.current) {
            return;
          }
          const { width: w, height: h } = entries[0].contentRect;
          if (w > 0 && h > 0) {
            const applySize = () => {
              asciiRef.current?.setSize(w, h);
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
  ]);

  useEffect(() => {
    if (active) {
      asciiRef.current?.resume();
    } else {
      asciiRef.current?.pause();
    }
  }, [active]);

  return (
    <div
      className="ascii-text-container"
      data-align-mode={alignMode}
      data-ascii-canvas
      data-ascii-font-size={asciiFontSize}
      data-anchor-text={anchorText}
      data-render-active={active ? "true" : "false"}
      data-resize-mode={resizeMode}
      ref={containerRef}
    />
  );
}
