import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mat4, quat, vec2, vec3, vec4 } from "gl-matrix";

import { GlassSurface } from "@/components/ui/glass-surface";
import {
  clampMotionValue,
  dampMotionValue,
  dampMotionVector3,
  dragStretchTarget,
  motionVectorLength3,
  normalizeMotionVector3,
  springMotionValue,
} from "@/components/ui/motion-utils";

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

void main() {
  vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.0);

  vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float radius = length(centerPos.xyz);

  if (gl_VertexID > 0) {
    vec3 rotationAxis = uRotationAxisVelocity.xyz;
    float rotationVelocity = clamp(uRotationAxisVelocity.w, 0.0, 0.16);
    vec3 stretchVector = cross(centerPos, rotationAxis);
    float stretchLength = length(stretchVector);

    if (stretchLength > 0.0001) {
      vec3 stretchDir = stretchVector / stretchLength;
      vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
      float strength = dot(stretchDir, relativeVertexPos);
      float invAbsStrength = min(0.0, abs(strength) - 1.0);
      strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.0);
      worldPosition.xyz += stretchDir * strength;
    }
  }

  worldPosition.xyz = radius * normalize(worldPosition.xyz);

  gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

  vAlpha = smoothstep(0.5, 1.0, normalize(worldPosition.xyz).z) * 0.9 + 0.1;
  vUvs = aModelUvs;
  vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
uniform int uHiddenInstanceId;
uniform float uHiddenInstanceOpacity;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
  int itemIndex = vInstanceId % uItemCount;
  int cellsPerRow = uAtlasSize;
  int cellX = itemIndex % cellsPerRow;
  int cellY = itemIndex / cellsPerRow;
  vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
  vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

  vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
  st = clamp(st, 0.0, 1.0);
  st = st * cellSize + cellOffset;

  outColor = texture(uTex, st);
  outColor.a *= vAlpha;

  if (vInstanceId == uHiddenInstanceId) {
    outColor.a *= uHiddenInstanceOpacity;
  }
}
`;

export type InfiniteMenuItem = {
  image: string;
  link: string;
  title: string;
  description: string;
  aspect?: number;
};

type InfiniteMenuProps = {
  items: InfiniteMenuItem[];
  scale?: number;
  active?: boolean;
};

type ViewerState = {
  item: InfiniteMenuItem;
  originSource: "webgl-active-disc" | "canvas-fallback";
  hiddenInstanceIndex: number | null;
  origin: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  target: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

const imageDecodeCache = new Map<string, Promise<void>>();
const lightboxThumbnailRevealDelayMs = 120;
const lightboxThumbnailRevealMs = 460;
const lightboxUnmountDelayMs = 760;
const infiniteMenuTargetFrameMs = 1000 / 45;
const infiniteMenuMaxPixelRatio = 1.35;

function preloadImage(src: string) {
  if (!imageDecodeCache.has(src)) {
    imageDecodeCache.set(
      src,
      new Promise((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;

        if (image.decode) {
          image.decode().then(resolve).catch(resolve);
        }
      })
    );
  }

  return imageDecodeCache.get(src) as Promise<void>;
}

function getCanvasFallbackOrigin(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const diameter = Math.min(rect.width, rect.height) * 0.54;

  return {
    left: rect.left + rect.width / 2 - diameter / 2,
    top: rect.top + rect.height / 2 - diameter / 2,
    width: diameter,
    height: diameter,
  };
}

function getTargetRect(aspect = 4 / 3) {
  const maxWidth = window.innerWidth * 0.88;
  const maxHeight = window.innerHeight * 0.84;
  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

function getViewerStyle(viewer: ViewerState) {
  return {
    "--origin-left": `${viewer.origin.left}px`,
    "--origin-top": `${viewer.origin.top}px`,
    "--origin-width": `${viewer.origin.width}px`,
    "--origin-height": `${viewer.origin.height}px`,
    "--target-left": `${viewer.target.left}px`,
    "--target-top": `${viewer.target.top}px`,
    "--target-width": `${viewer.target.width}px`,
    "--target-height": `${viewer.target.height}px`,
  } as CSSProperties;
}

function getRandomInitialItemIndex(itemCount: number) {
  if (itemCount <= 1) {
    return 0;
  }

  return Math.min(itemCount - 1, Math.floor(Math.random() * itemCount));
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  const sourceWidth = image.naturalWidth || image.width || size;
  const sourceHeight = image.naturalHeight || image.height || size;
  const sourceSize = Math.min(sourceWidth, sourceHeight);
  const sourceX = (sourceWidth - sourceSize) / 2;
  const sourceY = (sourceHeight - sourceSize) / 2;

  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, x, y, size, size);
}

class Face {
  constructor(
    public a: number,
    public b: number,
    public c: number
  ) {}
}

class Vertex {
  position: vec3;
  normal = vec3.create();
  uv = vec2.create();

  constructor(x: number, y: number, z: number) {
    this.position = vec3.fromValues(x, y, z);
  }
}

class Geometry {
  vertices: Vertex[] = [];
  faces: Face[] = [];

  addVertex(...args: number[]) {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  addFace(...args: number[]) {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  get lastVertex() {
    return this.vertices[this.vertices.length - 1];
  }

  subdivide(divisions = 1) {
    const midPointCache: Record<string, number> = {};
    let faces = this.faces;

    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array<Face>(faces.length * 4);

      faces.forEach((face, index) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache);
        const mBC = this.getMidPoint(face.b, face.c, midPointCache);
        const mCA = this.getMidPoint(face.c, face.a, midPointCache);
        const i = index * 4;

        newFaces[i] = new Face(face.a, mAB, mCA);
        newFaces[i + 1] = new Face(face.b, mBC, mAB);
        newFaces[i + 2] = new Face(face.c, mCA, mBC);
        newFaces[i + 3] = new Face(mAB, mBC, mCA);
      });

      faces = newFaces;
    }

    this.faces = faces;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach((vertex) => {
      vec3.normalize(vertex.normal, vertex.position);
      vec3.scale(vertex.position, vertex.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: this.vertexData,
      indices: this.indexData,
      uvs: this.uvData,
    };
  }

  get vertexData() {
    return new Float32Array(this.vertices.flatMap((vertex) => Array.from(vertex.position)));
  }

  get uvData() {
    return new Float32Array(this.vertices.flatMap((vertex) => Array.from(vertex.uv)));
  }

  get indexData() {
    return new Uint16Array(this.faces.flatMap((face) => [face.a, face.b, face.c]));
  }

  getMidPoint(indexA: number, indexB: number, cache: Record<string, number>) {
    const cacheKey = indexA < indexB ? `k_${indexB}_${indexA}` : `k_${indexA}_${indexB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
      return cache[cacheKey];
    }

    const a = this.vertices[indexA].position;
    const b = this.vertices[indexB].position;
    const index = this.vertices.length;
    cache[cacheKey] = index;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return index;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    this.addVertex(
      -1,
      t,
      0,
      1,
      t,
      0,
      -1,
      -t,
      0,
      1,
      -t,
      0,
      0,
      -1,
      t,
      0,
      1,
      t,
      0,
      -1,
      -t,
      0,
      1,
      -t,
      t,
      0,
      -1,
      t,
      0,
      1,
      -t,
      0,
      -1,
      -t,
      0,
      1
    ).addFace(
      0,
      11,
      5,
      0,
      5,
      1,
      0,
      1,
      7,
      0,
      7,
      10,
      0,
      10,
      11,
      1,
      5,
      9,
      5,
      11,
      4,
      11,
      10,
      2,
      10,
      7,
      6,
      7,
      1,
      8,
      3,
      9,
      4,
      3,
      4,
      2,
      3,
      2,
      6,
      3,
      6,
      8,
      3,
      8,
      9,
      4,
      9,
      5,
      2,
      4,
      11,
      6,
      2,
      10,
      8,
      6,
      7,
      9,
      8,
      1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    const safeSteps = Math.max(4, steps);
    const alpha = (2 * Math.PI) / safeSteps;

    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = 0.5;
    this.lastVertex.uv[1] = 0.5;

    for (let i = 0; i < safeSteps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * 0.5 + 0.5;
      this.lastVertex.uv[1] = y * 0.5 + 0.5;

      if (i > 0) {
        this.addFace(0, i, i + 1);
      }
    }

    this.addFace(0, safeSteps, 1);
  }
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(
  gl: WebGL2RenderingContext,
  shaderSources: [string, string],
  attribLocations: Record<string, number>
) {
  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, index) => {
    const shader = createShader(gl, type, shaderSources[index]);
    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  for (const attrib in attribLocations) {
    gl.bindAttribLocation(program, attribLocations[attrib], attrib);
  }

  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeBuffer(gl: WebGL2RenderingContext, sizeOrData: Float32Array | number, usage: number) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  if (typeof sizeOrData === "number") {
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  } else {
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData as unknown as BufferSource, usage);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}

function makeVertexArray(
  gl: WebGL2RenderingContext,
  bufLocNumElmPairs: [WebGLBuffer | null, number, number][],
  indices: Uint16Array
) {
  const vertexArray = gl.createVertexArray();
  gl.bindVertexArray(vertexArray);

  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1 || !buffer) {
      continue;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return vertexArray;
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = Math.min(infiniteMenuMaxPixelRatio, window.devicePixelRatio || 1);
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);
  const needsResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needsResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needsResize;
}

function createAndSetupTexture(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

class ArcballControl {
  isPointerDown = false;
  orientation = quat.create();
  pointerRotation = quat.create();
  rotationVelocity = 0;
  rotationAxis = vec3.fromValues(1, 0, 0);
  snapDirection = vec3.fromValues(0, 0, -1);
  snapTargetDirection: vec3 | null = null;

  private readonly epsilon = 0.1;
  private readonly identityQuat = quat.create();
  private pointerPos = vec2.create();
  private previousPointerPos = vec2.create();
  private internalRotationVelocity = 0;
  private combinedQuat = quat.create();
  private abortController = new AbortController();
  private activePointerId: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly updateCallback: (deltaTime: number) => void = () => undefined
  ) {
    const signal = this.abortController.signal;

    canvas.addEventListener(
      "pointerdown",
      (event) => {
        if (this.activePointerId !== null && this.activePointerId !== event.pointerId) {
          this.endPointerDrag();
        }
        vec2.set(this.pointerPos, event.clientX, event.clientY);
        vec2.copy(this.previousPointerPos, this.pointerPos);
        this.activePointerId = event.pointerId;
        this.isPointerDown = true;
        try {
          canvas.setPointerCapture?.(event.pointerId);
        } catch {
          // Some embedded browsers can reject capture during rapid pointer transitions.
        }
      },
      { signal }
    );
    canvas.addEventListener("pointerup", (event) => this.endPointerDrag(event.pointerId), { signal });
    canvas.addEventListener("pointercancel", (event) => this.endPointerDrag(event.pointerId), { signal });
    canvas.addEventListener(
      "pointermove",
      (event) => {
        if (this.activePointerId !== null && event.pointerId !== this.activePointerId) {
          return;
        }
        if (this.isPointerDown) {
          vec2.set(this.pointerPos, event.clientX, event.clientY);
        }
      },
      { signal }
    );
    window.addEventListener("blur", () => this.endPointerDrag(), { signal });

    canvas.style.touchAction = "none";
  }

  dispose() {
    this.abortController.abort();
    this.endPointerDrag();
  }

  private endPointerDrag(pointerId?: number) {
    if (pointerId !== undefined && this.activePointerId !== null && pointerId !== this.activePointerId) {
      return;
    }

    if (this.activePointerId !== null) {
      try {
        if (this.canvas.hasPointerCapture?.(this.activePointerId)) {
          this.canvas.releasePointerCapture?.(this.activePointerId);
        }
      } catch {
        // Capture may already be gone after pointer cancel, blur, or component unmount.
      }
    }

    this.activePointerId = null;
    this.isPointerDown = false;
  }

  update(deltaTime: number, targetFrameDuration = 16) {
    const timeScale = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = timeScale;
    const snapRotation = quat.create();

    if (this.isPointerDown) {
      const intensity = 0.3 * timeScale;
      const angleAmplification = 5 / timeScale;
      const midPointerPos = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos);
      vec2.scale(midPointerPos, midPointerPos, intensity);

      if (vec2.sqrLen(midPointerPos) > this.epsilon) {
        vec2.add(midPointerPos, this.previousPointerPos, midPointerPos);

        const p = this.project(midPointerPos);
        const q = this.project(this.previousPointerPos);
        const a = vec3.normalize(vec3.create(), p);
        const b = vec3.normalize(vec3.create(), q);

        vec2.copy(this.previousPointerPos, midPointerPos);
        angleFactor *= angleAmplification;
        this.quatFromVectors(a, b, this.pointerRotation, angleFactor);
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, this.identityQuat, intensity);
      }
    } else {
      const intensity = 0.1 * timeScale;
      quat.slerp(this.pointerRotation, this.pointerRotation, this.identityQuat, intensity);

      if (this.snapTargetDirection) {
        const snappingIntensity = 0.2;
        const a = this.snapTargetDirection;
        const b = this.snapDirection;
        const sqrDist = vec3.squaredDistance(a, b);
        const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
        angleFactor *= snappingIntensity * distanceFactor;
        this.quatFromVectors(a, b, snapRotation, angleFactor);
      }
    }

    const combinedQuat = quat.multiply(quat.create(), snapRotation, this.pointerRotation);
    this.orientation = quat.multiply(quat.create(), combinedQuat, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    const rotationAxisIntensity = 0.8 * timeScale;
    quat.slerp(this.combinedQuat, this.combinedQuat, combinedQuat, rotationAxisIntensity);
    quat.normalize(this.combinedQuat, this.combinedQuat);

    const rad = Math.acos(this.combinedQuat[3]) * 2.0;
    const s = Math.sin(rad / 2.0);
    let rotationVelocity = 0;

    if (s > 0.000001) {
      rotationVelocity = rad / (2 * Math.PI);
      this.rotationAxis[0] = this.combinedQuat[0] / s;
      this.rotationAxis[1] = this.combinedQuat[1] / s;
      this.rotationAxis[2] = this.combinedQuat[2] / s;
    }

    const rotationVelocityIntensity = 0.5 * timeScale;
    this.internalRotationVelocity += (rotationVelocity - this.internalRotationVelocity) * rotationVelocityIntensity;
    this.rotationVelocity = this.internalRotationVelocity / timeScale;
    this.updateCallback(deltaTime);
  }

  quatFromVectors(a: vec3, b: vec3, out: quat, angleFactor = 1) {
    const axis = vec3.cross(vec3.create(), a, b);
    vec3.normalize(axis, axis);
    const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
    const angle = Math.acos(d) * angleFactor;
    quat.setAxisAngle(out, axis, angle);
  }

  private project(pos: vec2) {
    const r = 2;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const size = Math.max(width, height) - 1;
    const x = (2 * pos[0] - width - 1) / size;
    const y = (2 * pos[1] - height - 1) / size;
    const xySq = x * x + y * y;
    const rSq = r * r;
    const z = xySq <= rSq / 2 ? Math.sqrt(rSq - xySq) : rSq / Math.sqrt(xySq);

    return vec3.fromValues(-x, y, z);
  }
}

class InfiniteGridMenu {
  private readonly targetFrameDuration = infiniteMenuTargetFrameMs;
  private readonly sphereRadius = 2;
  private time = 0;
  private frames = 0;
  private animationFrame = 0;
  private lastDrawTime = 0;
  private isRunning = false;
  private nearestVertexIndex = 0;
  private hiddenInstanceIndex: number | null = null;
  private hiddenInstanceOpacity = 1;
  private hiddenInstanceFade: {
    from: number;
    to: number;
    startedAt: number;
    duration: number;
  } | null = null;
  private smoothRotationVelocity = 0;
  private smoothRotationAxis = vec3.fromValues(1, 0, 0);
  private smoothRotationVector = vec3.create();
  private stretchAmount = 0;
  private stretchVelocity = 0;
  private movementActive = false;
  private gl: WebGL2RenderingContext;
  private discProgram: WebGLProgram;
  private discLocations: Record<string, WebGLUniformLocation | number | null>;
  private discBuffers: { vertices: Float32Array; indices: Uint16Array; uvs: Float32Array };
  private discVAO: WebGLVertexArrayObject | null;
  private instancePositions: vec3[];
  private discInstances: {
    matricesArray: Float32Array;
    matrices: Float32Array[];
    buffer: WebGLBuffer | null;
  };
  private worldMatrix = mat4.create();
  private texture: WebGLTexture | null;
  private atlasSize = 1;
  private control: ArcballControl;
  private viewportSize = vec2.create();
  private readonly camera = {
    matrix: mat4.create(),
    near: 0.1,
    far: 40,
    fov: Math.PI / 4,
    aspect: 1,
    position: vec3.fromValues(0, 0, 3),
    up: vec3.fromValues(0, 1, 0),
    matrices: {
      view: mat4.create(),
      projection: mat4.create(),
      inversProjection: mat4.create(),
    },
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly items: InfiniteMenuItem[],
    private readonly onActiveItemChange: (index: number) => void,
    private readonly onMovementChange: (isMoving: boolean) => void,
    private readonly scaleFactor = 1.0,
    private readonly initialItemIndex = 0,
    private readonly autoStart = true
  ) {
    this.camera.position[2] = 3 * scaleFactor;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) {
      throw new Error("No WebGL 2 context.");
    }
    this.gl = gl;
    this.canvas.dataset.renderTargetFrameMs = this.targetFrameDuration.toFixed(2);
    this.canvas.dataset.renderMaxPixelRatio = infiniteMenuMaxPixelRatio.toFixed(2);

    const program = createProgram(gl, [discVertShaderSource, discFragShaderSource], {
      aModelPosition: 0,
      aModelUvs: 2,
      aInstanceMatrix: 3,
    });
    if (!program) {
      throw new Error("Could not create InfiniteMenu shader program.");
    }
    this.discProgram = program;

    this.discLocations = {
      aModelPosition: gl.getAttribLocation(program, "aModelPosition"),
      aModelUvs: gl.getAttribLocation(program, "aModelUvs"),
      aInstanceMatrix: gl.getAttribLocation(program, "aInstanceMatrix"),
      uWorldMatrix: gl.getUniformLocation(program, "uWorldMatrix"),
      uViewMatrix: gl.getUniformLocation(program, "uViewMatrix"),
      uProjectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
      uCameraPosition: gl.getUniformLocation(program, "uCameraPosition"),
      uRotationAxisVelocity: gl.getUniformLocation(program, "uRotationAxisVelocity"),
      uTex: gl.getUniformLocation(program, "uTex"),
      uFrames: gl.getUniformLocation(program, "uFrames"),
      uItemCount: gl.getUniformLocation(program, "uItemCount"),
      uAtlasSize: gl.getUniformLocation(program, "uAtlasSize"),
      uHiddenInstanceId: gl.getUniformLocation(program, "uHiddenInstanceId"),
      uHiddenInstanceOpacity: gl.getUniformLocation(program, "uHiddenInstanceOpacity"),
    };

    const discGeometry = new DiscGeometry(56, 1);
    this.discBuffers = discGeometry.data;
    this.discVAO = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW), this.discLocations.aModelPosition as number, 3],
        [makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW), this.discLocations.aModelUvs as number, 2],
      ],
      this.discBuffers.indices
    );

    const icoGeometry = new IcosahedronGeometry();
    icoGeometry.subdivide(1).spherize(this.sphereRadius);
    this.instancePositions = icoGeometry.vertices.map((vertex) => vertex.position);
    this.discInstances = this.initDiscInstances(this.instancePositions.length);
    this.texture = createAndSetupTexture(gl);
    this.initTexture();
    this.control = new ArcballControl(this.canvas, (deltaTime) => this.onControlUpdate(deltaTime));
    this.setInitialActiveItem(initialItemIndex);

    this.updateCameraMatrix();
    this.updateProjectionMatrix();
    this.resize();
    this.render();
    if (autoStart) {
      this.resume();
    }
  }

  dispose() {
    this.pause();
    this.control.dispose();
    this.setHiddenInstanceIndex(null);
  }

  pause() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    this.onMovementChange(false);
  }

  resume() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.time = performance.now();
    this.lastDrawTime = 0;
    this.animationFrame = requestAnimationFrame(this.run);
  }

  setHiddenInstanceIndex(index: number | null, opacity = 0) {
    this.hiddenInstanceIndex = index;
    this.hiddenInstanceOpacity = index === null ? 1 : opacity;
    this.hiddenInstanceFade = null;

    if (index === null) {
      delete this.canvas.dataset.hiddenInstanceIndex;
    } else {
      this.canvas.dataset.hiddenInstanceIndex = String(index);
    }
  }

  fadeHiddenInstanceTo(opacity: number, duration = lightboxThumbnailRevealMs) {
    if (this.hiddenInstanceIndex === null) {
      return;
    }

    this.hiddenInstanceFade = {
      from: this.hiddenInstanceOpacity,
      to: Math.max(0, Math.min(1, opacity)),
      startedAt: performance.now(),
      duration: Math.max(1, duration),
    };
  }

  getActiveDiscSnapshot() {
    const rect = this.getActiveDiscRect();
    return rect ? { ...rect, instanceIndex: this.nearestVertexIndex } : null;
  }

  private getActiveDiscRect() {
    const matrix = this.discInstances.matrices[this.nearestVertexIndex];
    const canvasRect = this.canvas.getBoundingClientRect();

    if (!matrix || canvasRect.width <= 0 || canvasRect.height <= 0) {
      return null;
    }

    const center = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(center, center, matrix);
    vec4.transformMat4(center, center, this.worldMatrix);
    const radius = Math.hypot(center[0], center[1], center[2]);

    if (!Number.isFinite(radius) || radius <= 0) {
      return null;
    }

    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const vertices = this.discBuffers.vertices;

    for (let index = 0; index < vertices.length; index += 3) {
      const worldPosition = vec4.fromValues(vertices[index], vertices[index + 1], vertices[index + 2], 1);
      vec4.transformMat4(worldPosition, worldPosition, matrix);
      vec4.transformMat4(worldPosition, worldPosition, this.worldMatrix);

      const normalized = vec3.fromValues(worldPosition[0], worldPosition[1], worldPosition[2]);
      vec3.normalize(normalized, normalized);
      vec3.scale(normalized, normalized, radius);

      const projected = vec4.fromValues(normalized[0], normalized[1], normalized[2], 1);
      vec4.transformMat4(projected, projected, this.camera.matrices.view);
      vec4.transformMat4(projected, projected, this.camera.matrices.projection);

      if (!Number.isFinite(projected[3]) || Math.abs(projected[3]) < 0.0001) {
        continue;
      }

      const ndcX = projected[0] / projected[3];
      const ndcY = projected[1] / projected[3];
      const screenX = canvasRect.left + (ndcX * 0.5 + 0.5) * canvasRect.width;
      const screenY = canvasRect.top + (1 - (ndcY * 0.5 + 0.5)) * canvasRect.height;

      minX = Math.min(minX, screenX);
      maxX = Math.max(maxX, screenX);
      minY = Math.min(minY, screenY);
      maxY = Math.max(maxY, screenY);
    }

    if (![minX, maxX, minY, maxY].every(Number.isFinite)) {
      return null;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width, height);

    if (size <= 0) {
      return null;
    }

    return {
      left: minX + width / 2 - size / 2,
      top: minY + height / 2 - size / 2,
      width: size,
      height: size,
    };
  }

  private setInitialActiveItem(itemIndex: number) {
    const itemCount = Math.max(1, this.items.length);
    const safeItemIndex = Math.max(0, Math.min(itemCount - 1, itemIndex));
    const instanceIndex = Math.min(this.instancePositions.length - 1, safeItemIndex);
    const localDirection = vec3.normalize(vec3.create(), this.instancePositions[instanceIndex]);

    this.nearestVertexIndex = instanceIndex;
    quat.rotationTo(this.control.orientation, localDirection, this.control.snapDirection);
    quat.normalize(this.control.orientation, this.control.orientation);
    this.control.snapTargetDirection = vec3.normalize(vec3.create(), this.getVertexWorldPosition(instanceIndex));
    this.onActiveItemChange(safeItemIndex);
  }

  resize() {
    this.viewportSize = vec2.set(this.viewportSize, this.canvas.clientWidth, this.canvas.clientHeight);
    if (resizeCanvasToDisplaySize(this.canvas)) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }
    this.updateProjectionMatrix();
  }

  private run = (time = 0) => {
    if (!this.isRunning) {
      return;
    }

    if (this.lastDrawTime > 0 && time - this.lastDrawTime < this.targetFrameDuration) {
      this.animationFrame = requestAnimationFrame(this.run);
      return;
    }

    const deltaTime = Math.min(32, time - this.time);
    this.time = time;
    this.lastDrawTime = time;
    this.frames += deltaTime / this.targetFrameDuration;
    this.animate(deltaTime);
    this.render();
    this.animationFrame = requestAnimationFrame(this.run);
  };

  private initTexture() {
    const gl = this.gl;
    const itemCount = Math.max(1, this.items.length);
    const atlasSize = Math.ceil(Math.sqrt(itemCount));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const cellSize = 512;

    if (!context || !this.texture) {
      return;
    }

    this.atlasSize = atlasSize;
    canvas.width = atlasSize * cellSize;
    canvas.height = atlasSize * cellSize;

    Promise.all(
      this.items.map(
        (item) =>
          new Promise<HTMLImageElement>((resolve) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = () => resolve(image);
            image.src = item.link || item.image;
          })
      )
    ).then((images) => {
      images.forEach((image, index) => {
        const x = (index % atlasSize) * cellSize;
        const y = Math.floor(index / atlasSize) * cellSize;
        drawImageCover(context, image, x, y, cellSize);
      });

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  private initDiscInstances(count: number) {
    const gl = this.gl;
    const discInstances = {
      matricesArray: new Float32Array(count * 16),
      matrices: [] as Float32Array[],
      buffer: gl.createBuffer(),
    };

    for (let i = 0; i < count; ++i) {
      const instanceMatrixArray = new Float32Array(discInstances.matricesArray.buffer, i * 16 * 4, 16);
      instanceMatrixArray.set(mat4.create());
      discInstances.matrices.push(instanceMatrixArray);
    }

    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);

    const mat4AttribSlotCount = 4;
    const bytesPerMatrix = 16 * 4;
    const matrixLocation = this.discLocations.aInstanceMatrix as number;

    for (let i = 0; i < mat4AttribSlotCount; ++i) {
      const loc = matrixLocation + i;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, i * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
    return discInstances;
  }

  private animate(deltaTime: number) {
    const gl = this.gl;
    this.control.update(deltaTime, this.targetFrameDuration);

    const positions = this.instancePositions.map((position) =>
      vec3.transformQuat(vec3.create(), position, this.control.orientation)
    );
    const scale = 0.25;
    const scaleIntensity = 0.6;

    positions.forEach((position, index) => {
      const s = (Math.abs(position[2]) / this.sphereRadius) * scaleIntensity + (1 - scaleIntensity);
      const finalScale = s * scale;
      const matrix = mat4.create();

      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), position)));
      mat4.multiply(matrix, matrix, mat4.targetTo(mat4.create(), [0, 0, 0], position, [0, 1, 0]));
      mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]));
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [0, 0, -this.sphereRadius]));
      mat4.copy(this.discInstances.matrices[index], matrix);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  private render() {
    const gl = this.gl;
    this.updateHiddenInstanceFade();
    gl.useProgram(this.discProgram);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix as WebGLUniformLocation, false, this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix as WebGLUniformLocation, false, this.camera.matrices.view);
    gl.uniformMatrix4fv(
      this.discLocations.uProjectionMatrix as WebGLUniformLocation,
      false,
      this.camera.matrices.projection
    );
    gl.uniform3f(
      this.discLocations.uCameraPosition as WebGLUniformLocation,
      this.camera.position[0],
      this.camera.position[1],
      this.camera.position[2]
    );
    gl.uniform4f(
      this.discLocations.uRotationAxisVelocity as WebGLUniformLocation,
      this.smoothRotationAxis[0],
      this.smoothRotationAxis[1],
      this.smoothRotationAxis[2],
      this.stretchAmount
    );
    gl.uniform1i(this.discLocations.uItemCount as WebGLUniformLocation, this.items.length);
    gl.uniform1i(this.discLocations.uAtlasSize as WebGLUniformLocation, this.atlasSize);
    gl.uniform1i(this.discLocations.uHiddenInstanceId as WebGLUniformLocation, this.hiddenInstanceIndex ?? -1);
    gl.uniform1f(this.discLocations.uHiddenInstanceOpacity as WebGLUniformLocation, this.hiddenInstanceOpacity);
    gl.uniform1f(this.discLocations.uFrames as WebGLUniformLocation, this.frames);
    gl.uniform1i(this.discLocations.uTex as WebGLUniformLocation, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, this.discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, this.instancePositions.length);
  }

  private updateHiddenInstanceFade() {
    if (!this.hiddenInstanceFade) {
      return;
    }

    const progress = Math.min(1, (performance.now() - this.hiddenInstanceFade.startedAt) / this.hiddenInstanceFade.duration);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    this.hiddenInstanceOpacity =
      this.hiddenInstanceFade.from + (this.hiddenInstanceFade.to - this.hiddenInstanceFade.from) * easedProgress;

    if (progress >= 1) {
      this.hiddenInstanceOpacity = this.hiddenInstanceFade.to;
      this.hiddenInstanceFade = null;
    }
  }

  private updateCameraMatrix() {
    mat4.targetTo(this.camera.matrix, this.camera.position, [0, 0, 0], this.camera.up);
    mat4.invert(this.camera.matrices.view, this.camera.matrix);
  }

  private updateProjectionMatrix() {
    const gl = this.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    const height = this.sphereRadius * 0.35;
    const distance = this.camera.position[2];
    this.camera.fov =
      this.camera.aspect > 1
        ? 2 * Math.atan(height / distance)
        : 2 * Math.atan(height / this.camera.aspect / distance);
    mat4.perspective(
      this.camera.matrices.projection,
      this.camera.fov,
      this.camera.aspect,
      this.camera.near,
      this.camera.far
    );
    mat4.invert(this.camera.matrices.inversProjection, this.camera.matrices.projection);
  }

  private onControlUpdate(deltaTime: number) {
    const timeScale = deltaTime / this.targetFrameDuration + 0.0001;
    const velocityLimit = this.control.isPointerDown ? 0.2 : 0.14;
    const velocityTarget = clampMotionValue(this.control.rotationVelocity, velocityLimit);
    const targetRotationVector: [number, number, number] = [
      this.control.rotationAxis[0] * velocityTarget,
      this.control.rotationAxis[1] * velocityTarget,
      this.control.rotationAxis[2] * velocityTarget,
    ];
    const dampedRotationVector = dampMotionVector3(
      [this.smoothRotationVector[0], this.smoothRotationVector[1], this.smoothRotationVector[2]],
      targetRotationVector,
      this.control.isPointerDown ? 0.18 : 0.1,
      deltaTime,
      this.targetFrameDuration
    );

    vec3.set(
      this.smoothRotationVector,
      dampedRotationVector[0],
      dampedRotationVector[1],
      dampedRotationVector[2]
    );

    this.smoothRotationVelocity = dampMotionValue(
      this.smoothRotationVelocity,
      motionVectorLength3(dampedRotationVector),
      this.control.isPointerDown ? 0.16 : 0.1,
      deltaTime,
      this.targetFrameDuration
    );

    const normalizedAxis = normalizeMotionVector3(dampedRotationVector, [
      this.smoothRotationAxis[0],
      this.smoothRotationAxis[1],
      this.smoothRotationAxis[2],
    ]);
    vec3.set(this.smoothRotationAxis, normalizedAxis[0], normalizedAxis[1], normalizedAxis[2]);

    const stretchTarget = this.control.isPointerDown ? dragStretchTarget(velocityTarget, velocityLimit, 0.16) : 0;
    const stretchSpring = springMotionValue(this.stretchAmount, this.stretchVelocity, stretchTarget, {
      stiffness: this.control.isPointerDown ? 230 : 100,
      damping: this.control.isPointerDown ? 28 : 14,
      deltaTime,
    });
    this.stretchAmount = Math.max(0, Math.min(0.16, stretchSpring.value));
    this.stretchVelocity = stretchSpring.value <= 0 && stretchTarget === 0 ? 0 : stretchSpring.velocity;

    if (
      !this.control.isPointerDown &&
      stretchTarget === 0 &&
      this.stretchAmount < 0.0008 &&
      Math.abs(this.stretchVelocity) < 0.0008
    ) {
      this.stretchAmount = 0;
      this.stretchVelocity = 0;
    }

    let damping = 5 / timeScale;
    let cameraTargetZ = 3 * this.scaleFactor;
    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.006;

    if (isMoving !== this.movementActive) {
      this.movementActive = isMoving;
      this.onMovementChange(isMoving);
    }

    if (!this.control.isPointerDown) {
      const nearestVertexIndex = this.findNearestVertexIndex();
      const itemIndex = nearestVertexIndex % Math.max(1, this.items.length);
      this.nearestVertexIndex = nearestVertexIndex;
      this.onActiveItemChange(itemIndex);
      this.control.snapTargetDirection = vec3.normalize(vec3.create(), this.getVertexWorldPosition(nearestVertexIndex));
    } else {
      cameraTargetZ += this.smoothRotationVelocity * 42 + 2.05;
      damping = 10 / timeScale;
    }

    this.camera.position[2] += (cameraTargetZ - this.camera.position[2]) / damping;
    this.updateCameraMatrix();
  }

  private findNearestVertexIndex() {
    const snapDirection = this.control.snapDirection;
    const inverseOrientation = quat.conjugate(quat.create(), this.control.orientation);
    const transformedDirection = vec3.transformQuat(vec3.create(), snapDirection, inverseOrientation);
    let maxDistance = -1;
    let nearestVertexIndex = this.nearestVertexIndex;

    for (let i = 0; i < this.instancePositions.length; ++i) {
      const distance = vec3.dot(transformedDirection, this.instancePositions[i]);
      if (distance > maxDistance) {
        maxDistance = distance;
        nearestVertexIndex = i;
      }
    }

    return nearestVertexIndex;
  }

  private getVertexWorldPosition(index: number) {
    return vec3.transformQuat(vec3.create(), this.instancePositions[index], this.control.orientation);
  }
}

const defaultItems: InfiniteMenuItem[] = [
  {
    image: "/assets/photography/signal-plain-thumb.jpg",
    link: "/assets/photography/signal-plain-large.jpg",
    title: "",
    description: "",
  },
];

export function InfiniteMenu({ items = [], scale = 1.0, active = true }: InfiniteMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sketchRef = useRef<InfiniteGridMenu | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const closingOriginFrameRef = useRef<number | null>(null);
  const closingOriginDetachRef = useRef<(() => void) | null>(null);
  const [activeItem, setActiveItem] = useState<InfiniteMenuItem | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [viewerExpanded, setViewerExpanded] = useState(false);
  const [viewerClosing, setViewerClosing] = useState(false);
  const [actionButtonState, setActionButtonState] = useState<"idle" | "hover" | "press">("idle");
  const actionButtonScaleFrameRef = useRef<number | null>(null);
  const actionButtonScaleValueRef = useRef(-300);
  const [actionButtonDistortionScale, setActionButtonDistortionScale] = useState(-300);
  const sourceItems = items.length ? items : defaultItems;
  const initialItemIndexRef = useRef<number | null>(null);
  if (initialItemIndexRef.current === null || initialItemIndexRef.current >= sourceItems.length) {
    initialItemIndexRef.current = getRandomInitialItemIndex(sourceItems.length);
  }
  const initialItemIndex = initialItemIndexRef.current;
  const actionButtonTargetDistortionScale = actionButtonState === "idle" ? -300 : 300;

  const getCurrentViewerOrigin = useCallback(() => {
    const canvas = canvasRef.current;
    const sketch = sketchRef.current;

    if (!canvas || !sketch) {
      return null;
    }

    const activeSnapshot = sketch.getActiveDiscSnapshot();

    if (activeSnapshot) {
      return {
        originSource: "webgl-active-disc" as const,
        hiddenInstanceIndex: activeSnapshot.instanceIndex,
        origin: {
          left: activeSnapshot.left,
          top: activeSnapshot.top,
          width: activeSnapshot.width,
          height: activeSnapshot.height,
        },
      };
    }

    return {
      originSource: "canvas-fallback" as const,
      hiddenInstanceIndex: null,
      origin: getCanvasFallbackOrigin(canvas),
    };
  }, []);

  const refreshClosingViewerOrigin = useCallback(() => {
    const latestOrigin = getCurrentViewerOrigin();

    if (!latestOrigin) {
      return;
    }

    setViewer((currentViewer) =>
      currentViewer
        ? {
            ...currentViewer,
            originSource: latestOrigin.originSource,
            hiddenInstanceIndex: latestOrigin.hiddenInstanceIndex,
            origin: latestOrigin.origin,
          }
        : currentViewer
    );
  }, [getCurrentViewerOrigin]);

  const scheduleClosingViewerOriginRefresh = useCallback(() => {
    if (closingOriginFrameRef.current !== null) {
      return;
    }

    closingOriginFrameRef.current = window.requestAnimationFrame(() => {
      closingOriginFrameRef.current = null;
      refreshClosingViewerOrigin();
    });
  }, [refreshClosingViewerOrigin]);

  const detachClosingOriginListeners = useCallback(() => {
    if (closingOriginDetachRef.current) {
      closingOriginDetachRef.current();
      closingOriginDetachRef.current = null;
    }

    if (closingOriginFrameRef.current !== null) {
      window.cancelAnimationFrame(closingOriginFrameRef.current);
      closingOriginFrameRef.current = null;
    }
  }, []);

  const attachClosingOriginListeners = useCallback(() => {
    if (closingOriginDetachRef.current) {
      scheduleClosingViewerOriginRefresh();
      return;
    }

    const refreshOnViewportChange = () => scheduleClosingViewerOriginRefresh();

    window.addEventListener("scroll", refreshOnViewportChange, { passive: true });
    window.addEventListener("resize", refreshOnViewportChange);
    closingOriginDetachRef.current = () => {
      window.removeEventListener("scroll", refreshOnViewportChange);
      window.removeEventListener("resize", refreshOnViewportChange);
    };

    scheduleClosingViewerOriginRefresh();
  }, [scheduleClosingViewerOriginRefresh]);

  useEffect(() => {
    if (actionButtonScaleFrameRef.current) {
      window.cancelAnimationFrame(actionButtonScaleFrameRef.current);
      actionButtonScaleFrameRef.current = null;
    }

    const from = actionButtonScaleValueRef.current;
    const to = actionButtonTargetDistortionScale;

    if (from === to) {
      setActionButtonDistortionScale(to);
      return undefined;
    }

    const duration = 420;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = progress === 1 ? to : Math.round((from + (to - from) * eased) * 100) / 100;

      actionButtonScaleValueRef.current = next;
      setActionButtonDistortionScale(next);

      if (progress < 1) {
        actionButtonScaleFrameRef.current = window.requestAnimationFrame(tick);
      } else {
        actionButtonScaleFrameRef.current = null;
      }
    };

    actionButtonScaleFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (actionButtonScaleFrameRef.current) {
        window.cancelAnimationFrame(actionButtonScaleFrameRef.current);
        actionButtonScaleFrameRef.current = null;
      }
    };
  }, [actionButtonTargetDistortionScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const sketch = new InfiniteGridMenu(
      canvas,
      sourceItems,
      (index) => setActiveItem(sourceItems[index % sourceItems.length]),
      setIsMoving,
      scale,
      initialItemIndex,
      active
    );
    sketchRef.current = sketch;

    const handleResize = () => sketch.resize();
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      sketch.dispose();
      sketchRef.current = null;
    };
  }, [sourceItems, scale, initialItemIndex]);

  useEffect(() => {
    const syncActivity = () => {
      if (active && document.visibilityState !== "hidden") {
        sketchRef.current?.resume();
      } else {
        sketchRef.current?.pause();
      }
    };

    syncActivity();
    document.addEventListener("visibilitychange", syncActivity);
    return () => document.removeEventListener("visibilitychange", syncActivity);
  }, [active]);

  useEffect(() => {
    sourceItems.forEach((item) => {
      if (item.link) {
        void preloadImage(item.link);
      }
    });
  }, [sourceItems]);

  const openViewer = async () => {
    const canvas = canvasRef.current;
    const item = activeItem;
    const sketch = sketchRef.current;

    if (!canvas || !item?.link || !sketch) {
      return;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    detachClosingOriginListeners();
    setViewerClosing(false);

    await preloadImage(item.link);

    const originSnapshot = getCurrentViewerOrigin();

    if (!originSnapshot) {
      return;
    }

    const { origin, originSource, hiddenInstanceIndex } = originSnapshot;
    const target = getTargetRect(item.aspect);

    sketch.setHiddenInstanceIndex(hiddenInstanceIndex, 0);

    setViewerExpanded(false);
    setViewer({
      item,
      originSource,
      hiddenInstanceIndex,
      origin,
      target,
    });
    window.requestAnimationFrame(() => setViewerExpanded(true));
  };

  const closeViewer = useCallback(() => {
    if (viewerClosing) {
      return;
    }

    const latestOrigin = getCurrentViewerOrigin();
    if (latestOrigin) {
      setViewer((currentViewer) =>
        currentViewer
          ? {
              ...currentViewer,
              originSource: latestOrigin.originSource,
              hiddenInstanceIndex: latestOrigin.hiddenInstanceIndex,
              origin: latestOrigin.origin,
            }
          : currentViewer
      );
    }

    setViewerClosing(true);
    setViewerExpanded(false);
    attachClosingOriginListeners();

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = window.setTimeout(() => {
      sketchRef.current?.fadeHiddenInstanceTo(1, lightboxThumbnailRevealMs);
      revealTimerRef.current = null;
    }, lightboxThumbnailRevealDelayMs);

    closeTimerRef.current = window.setTimeout(() => {
      sketchRef.current?.setHiddenInstanceIndex(null);
      detachClosingOriginListeners();
      setViewer(null);
      setViewerClosing(false);
      closeTimerRef.current = null;
    }, lightboxUnmountDelayMs);
  }, [attachClosingOriginListeners, detachClosingOriginListeners, getCurrentViewerOrigin, viewerClosing]);

  useEffect(() => {
    if (!viewerClosing) {
      detachClosingOriginListeners();
      return undefined;
    }

    attachClosingOriginListeners();
    return () => detachClosingOriginListeners();
  }, [attachClosingOriginListeners, detachClosingOriginListeners, viewerClosing]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && viewer) {
        closeViewer();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeViewer, viewer]);

  useEffect(() => {
    if (!viewer || !viewerExpanded) {
      return undefined;
    }

    const onResize = () => {
      setViewer((currentViewer) =>
        currentViewer
          ? (() => {
              const target = getTargetRect(currentViewer.item.aspect);
              return {
                ...currentViewer,
                target,
              };
            })()
          : currentViewer
      );
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [viewer, viewerExpanded]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }
      sketchRef.current?.setHiddenInstanceIndex(null);
    };
  }, []);

  const isViewerHoldingMenu = Boolean(viewer && !viewerClosing);
  const isViewerLockingCanvas = Boolean(viewer);
  const lightboxClassName = [
    "photo-lightbox",
    viewerExpanded && !viewerClosing ? "is-expanded" : "",
    viewerClosing ? "is-closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="infinite-menu"
      data-infinite-menu
      data-initial-index={initialItemIndex}
      data-moving={isMoving ? "true" : "false"}
      data-viewer-lock={isViewerLockingCanvas ? "true" : "false"}
    >
      <canvas
        id="infinite-grid-menu-canvas"
        ref={canvasRef}
        aria-label="Photography menu"
        data-render-active={active ? "true" : "false"}
      />

      {activeItem && (
        <>
          <h2 className={`face-title ${isMoving || isViewerHoldingMenu ? "inactive" : "active"}`}>{activeItem.title}</h2>
          <p className={`face-description ${isMoving || isViewerHoldingMenu ? "inactive" : "active"}`}>
            {activeItem.description}
          </p>
          <button
            type="button"
            onClick={openViewer}
            onPointerEnter={() => setActionButtonState("hover")}
            onPointerLeave={() => setActionButtonState("idle")}
            onPointerDown={() => setActionButtonState("press")}
            onPointerUp={() => setActionButtonState("hover")}
            onPointerCancel={() => setActionButtonState("idle")}
            onBlur={() => setActionButtonState("idle")}
            className={`action-button ${isMoving || isViewerHoldingMenu ? "inactive" : "active"}`}
            aria-label={`Open ${activeItem.title}`}
            data-glass-surface="true"
          >
            <GlassSurface
              width="100%"
              height="100%"
              borderRadius={999}
              borderWidth={0.11}
              brightness={50}
              opacity={0.93}
              blur={11}
              displace={1.1}
              backgroundOpacity={0.08}
              saturation={1}
              distortionScale={actionButtonDistortionScale}
              redOffset={20}
              greenOffset={21}
              blueOffset={20}
              mixBlendMode="screen"
              className="action-button-glass"
            >
              <span className="action-button-icon" aria-hidden="true">
                {"\u2197"}
              </span>
            </GlassSurface>
          </button>
        </>
      )}

      {viewer &&
        createPortal(
          <div
            className={lightboxClassName}
            data-photo-lightbox
            onPointerDown={closeViewer}
            onWheel={(event) => {
              if (!viewerClosing) {
                event.preventDefault();
              }
            }}
          >
            <figure
              className="photo-lightbox-visual"
              data-origin-source={viewer.originSource}
              style={getViewerStyle(viewer)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img
                className="photo-lightbox-media"
                data-photo-lightbox-media
                src={viewer.item.link}
                alt={viewer.item.title}
              />
              <figcaption>
                <strong>{viewer.item.title}</strong>
                <span>{viewer.item.description}</span>
              </figcaption>
            </figure>
          </div>,
          document.body
        )}
    </div>
  );
}
