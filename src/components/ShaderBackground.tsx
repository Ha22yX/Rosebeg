import { memo, useEffect, useRef } from "react";

type ShaderBackgroundProps = {
  className?: string;
  performanceMode?: "full" | "mobile";
};

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
uniform vec4 u_scene;
uniform vec4 u_shape;
uniform vec4 u_surface;
uniform vec4 u_finish;
uniform vec4 u_transform;
uniform vec4 u_space;
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}

vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}

vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n) {
      col = mixColour(col, u_colors[i + 1], smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
    }
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a);
  float sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec2 q = p * 1.6;
  float amp = 0.25 + u_intensity * 0.85;
  for (float i = 1.0; i < 5.0; i += 1.0) {
    q.x += amp / i * cos(i * 2.4 * q.y + t * 0.8 + u_seed);
    q.y += amp / i * cos(i * 1.7 * q.x + t * 0.6);
  }
  return palette(0.5 + 0.5 * sin(q.x + q.y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec2 cursor = (0.5 * u_mouse * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec2 cursorDelta = p - cursor;
  float cursorDistance = length(cursorDelta);
  vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);
  float cursorMask = u_cursorPresence * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));

  if (u_cursorPresence > 0.001) {
    if (u_cursorEffect < 0.5) {
      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;
    } else if (u_cursorEffect < 1.5) {
      p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;
    } else if (u_cursorEffect > 1.5 && u_cursorEffect < 2.5) {
      float cursorAngle = cursorMask * u_cursorStrength * 2.2;
      float cc = cos(cursorAngle);
      float cs = sin(cursorAngle);
      p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
    } else if (u_cursorEffect > 2.5 && u_cursorEffect < 3.5) {
      float ripple = sin(cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);
      p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;
    }
  }

  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  float cr = cos(u_rotate);
  float sr = sin(u_rotate);
  p = mat2(cr, -sr, sr, cr) * p;
  p += u_offset;
  p += vec2(u_time * 0.055, -u_time * 0.075);
  p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));

  if (u_warp > 0.0) {
    p += u_warp * (vec2(fbm(p * u_detail + u_seed), fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }

  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }

  col = (col - 0.5) * u_contrast + 0.5;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, u_saturation);
  col = hueRotate(col, u_hue);
  col += u_brightness;
  float vd = length(screenUv - 0.5) * 1.41421356;
  col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  if (u_cursorEffect > 3.5) {
    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;
  }
  col += (grainHash(gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const UNIFORMS = {
  colors: [
    [0.00784313725490196, 0.00392156862745098, 0.0392156862745098],
    [0.01568627450980392, 0.0196078431372549, 0.1803921568627451],
    [0.23921568627450981, 0.17254901960784313, 0.5529411764705883],
    [0.5686274509803921, 0.4196078431372549, 0.7490196078431373],
    [0.5686274509803921, 0.4196078431372549, 0.7490196078431373],
    [0.5686274509803921, 0.4196078431372549, 0.7490196078431373],
    [0.5686274509803921, 0.4196078431372549, 0.7490196078431373],
    [0.5686274509803921, 0.4196078431372549, 0.7490196078431373],
  ] as [number, number, number][],
  colorCount: 4,
  scale: 1.26,
  intensity: 0.28,
  paramA: 0.5,
  warp: 0,
  detail: 2.4,
  contrast: 1.113,
  brightness: 0,
  saturation: 1,
  hue: 0,
  vignette: 0,
  blur: 0,
  grain: 0.049,
  seed: 1581,
  rotate: 0,
  offsetX: 0,
  offsetY: 0,
  drift: 0,
  scrollParallax: 0.00035,
  cursorEnabled: false,
  cursorEffect: 2,
  cursorStrength: 0.65,
  cursorRadius: 0.46,
  oklab: 0,
  timeScale: 0.42,
};

const SHADER_IDLE_FRAME_MS = 1000 / 60;
const SHADER_INTERACTION_FRAME_MS = 1000 / 60;
const SHADER_TELEMETRY_INTERVAL_MS = 120;
const SHADER_IDLE_PIXEL_RATIO = 0.9;
const SHADER_INTERACTION_PIXEL_RATIO = 0.55;
const SHADER_DROP_FRAME_MS = 90;
const SHADER_INTERACTION_HOLD_MS = 260;
const SHADER_QUALITY_RECOVERY_MS = 4200;

function getShaderPixelRatio(basePixelRatio: number, isInteracting: boolean, qualityDropUntil: number, now: number) {
  const qualityCap = now < qualityDropUntil ? 0.62 : SHADER_IDLE_PIXEL_RATIO;
  const interactionCap = isInteracting ? SHADER_INTERACTION_PIXEL_RATIO : SHADER_IDLE_PIXEL_RATIO;
  return Math.min(window.devicePixelRatio || 1, basePixelRatio, qualityCap, interactionCap);
}

export const ShaderBackground = memo(function ShaderBackground({ className = "", performanceMode = "full" }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (performanceMode === "mobile") {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Opaque, depth-less drawing buffer: the shader always outputs alpha 1.0,
    // so the compositor can treat this fullscreen layer as opaque.
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERT);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();

    if (!vertexShader || !fragmentShader || !program) {
      canvas.style.display = "none";
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      canvas.style.display = "none";
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uni = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform3fv(uni("u_colors"), UNIFORMS.colors.flat());
    gl.uniform4f(uni("u_shape"), UNIFORMS.scale, UNIFORMS.intensity, UNIFORMS.paramA, UNIFORMS.warp);
    gl.uniform4f(
      uni("u_surface"),
      UNIFORMS.detail,
      UNIFORMS.contrast,
      UNIFORMS.brightness,
      UNIFORMS.saturation
    );
    gl.uniform4f(uni("u_finish"), UNIFORMS.hue, UNIFORMS.vignette, UNIFORMS.blur, UNIFORMS.grain);
    gl.uniform4f(uni("u_transform"), UNIFORMS.seed, UNIFORMS.rotate, UNIFORMS.drift, UNIFORMS.oklab);
    gl.uniform4f(uni("u_cursor"), 0, UNIFORMS.cursorEffect, UNIFORMS.cursorStrength, UNIFORMS.cursorRadius);

    // Cache uniform locations used per frame instead of re-querying every draw.
    const uSceneLocation = uni("u_scene");
    const uSpaceLocation = uni("u_space");
    const uCursorLocation = uni("u_cursor");

    let targetX = 0;
    let targetY = 0;
    let targetPresence = 0;
    let targetScrollOffset = window.scrollY * UNIFORMS.scrollParallax;
    let scrollOffset = targetScrollOffset;
    let mouseX = 0;
    let mouseY = 0;
    let cursorPresence = 0;
    let pointerKnown = false;
    let pointerClientX = 0;
    let pointerClientY = 0;

    const updatePointerTarget = () => {
      if (!pointerKnown) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const inside =
        pointerClientX >= rect.left &&
        pointerClientX <= rect.right &&
        pointerClientY >= rect.top &&
        pointerClientY <= rect.bottom;

      if (!inside) {
        targetPresence = 0;
        return;
      }

      const nextX = ((pointerClientX - rect.left) / rect.width) * 2 - 1;
      const nextY = -(((pointerClientY - rect.top) / rect.height) * 2 - 1);
      if (targetPresence === 0 && cursorPresence < 0.01) {
        mouseX = nextX;
        mouseY = nextY;
      }
      targetX = nextX;
      targetY = nextY;
      targetPresence = 1;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerKnown = true;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      updatePointerTarget();
    };

    const onPointerLeave = () => {
      pointerKnown = false;
      targetPresence = 0;
    };

    let interactionUntil = 0;
    let interactionClearTimer: number | undefined;

    const markInteraction = () => {
      interactionUntil = performance.now() + SHADER_INTERACTION_HOLD_MS;
      document.documentElement.dataset.backgroundInteraction = "true";
      if (interactionClearTimer !== undefined) {
        window.clearTimeout(interactionClearTimer);
      }
      interactionClearTimer = window.setTimeout(() => {
        delete document.documentElement.dataset.backgroundInteraction;
        interactionClearTimer = undefined;
      }, SHADER_INTERACTION_HOLD_MS + 80);
    };

    const onScroll = () => {
      markInteraction();
      targetScrollOffset = window.scrollY * UNIFORMS.scrollParallax;
    };

    const onPointerDown = () => {
      markInteraction();
    };

    const onPointerUp = () => {
      interactionUntil = Math.max(interactionUntil, performance.now() + 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    if (UNIFORMS.cursorEnabled) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointercancel", onPointerLeave);
      window.addEventListener("resize", updatePointerTarget);
      window.addEventListener("scroll", updatePointerTarget, true);
      window.addEventListener("blur", onPointerLeave);
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }

    let raf = 0;
    const start = performance.now();
    let lastNow: number | null = null;
    let isVisible = document.visibilityState !== "hidden";

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const basePixelRatio = reducedMotion || coarsePointer ? SHADER_INTERACTION_PIXEL_RATIO : SHADER_IDLE_PIXEL_RATIO;
    let lastDrawNow = 0;
    let lastTelemetryNow = Number.NEGATIVE_INFINITY;
    let qualityDropUntil = 0;

    const render = (now: number) => {
      raf = 0;
      if (!isVisible) {
        return;
      }

      const isInteracting = now < interactionUntil;
      const targetFrameMs = isInteracting || now < qualityDropUntil ? SHADER_INTERACTION_FRAME_MS : SHADER_IDLE_FRAME_MS;

      if (targetFrameMs > 0 && lastDrawNow > 0 && now - lastDrawNow < targetFrameMs) {
        raf = requestAnimationFrame(render);
        return;
      }
      if (lastDrawNow > 0 && now - lastDrawNow > Math.max(SHADER_DROP_FRAME_MS, targetFrameMs + 46)) {
        qualityDropUntil = now + SHADER_QUALITY_RECOVERY_MS;
      }
      lastDrawNow = now;

      const dt = lastNow === null ? 0 : Math.min((now - lastNow) / 1000, 0.1);
      lastNow = now;
      const follow = 1 - Math.exp(-12 * dt);
      mouseX += (targetX - mouseX) * follow;
      mouseY += (targetY - mouseY) * follow;
      cursorPresence += (targetPresence - cursorPresence) * follow;
      scrollOffset += (targetScrollOffset - scrollOffset) * (1 - Math.exp(-4 * dt));

      const dpr = getShaderPixelRatio(basePixelRatio, isInteracting, qualityDropUntil, now);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      const shaderTime = ((now - start) / 1000) * UNIFORMS.timeScale;
      const flowOffsetY = -shaderTime * 0.075;
      gl.uniform4f(uSceneLocation, w, h, shaderTime, UNIFORMS.colorCount);
      gl.uniform4f(uSpaceLocation, UNIFORMS.offsetX, UNIFORMS.offsetY + scrollOffset, mouseX, mouseY);
      if (UNIFORMS.cursorEnabled) {
        gl.uniform4f(
          uCursorLocation,
          cursorPresence,
          UNIFORMS.cursorEffect,
          UNIFORMS.cursorStrength,
          UNIFORMS.cursorRadius
        );
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Test-visible motion telemetry (asserted by tests/homepage.spec.js).
      if (now - lastTelemetryNow >= SHADER_TELEMETRY_INTERVAL_MS) {
        lastTelemetryNow = now;
        canvas.dataset.parallaxOffset = scrollOffset.toFixed(4);
        canvas.dataset.shaderTime = shaderTime.toFixed(4);
        canvas.dataset.flowOffsetY = flowOffsetY.toFixed(4);
      }
      raf = requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== "hidden";
      if (!isVisible) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastNow = null;
        lastDrawNow = 0;
        return;
      }

      if (raf === 0) {
        raf = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      if (interactionClearTimer !== undefined) {
        window.clearTimeout(interactionClearTimer);
      }
      delete document.documentElement.dataset.backgroundInteraction;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (UNIFORMS.cursorEnabled) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointercancel", onPointerLeave);
        window.removeEventListener("resize", updatePointerTarget);
        window.removeEventListener("scroll", updatePointerTarget, true);
        window.removeEventListener("blur", onPointerLeave);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      }
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [performanceMode]);

  return (
    <div
      className={["shader-background", className].filter(Boolean).join(" ")}
      data-shader-background
      data-shader-mode={performanceMode === "mobile" ? "static" : "webgl"}
      aria-hidden="true"
    >
      {performanceMode === "mobile" ? (
        <div className="shader-static" data-static-shader-background />
      ) : (
        <canvas ref={canvasRef} className="shader-canvas" />
      )}
    </div>
  );
});
