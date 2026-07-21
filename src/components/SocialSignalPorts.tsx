import { memo, useMemo, useState, type CSSProperties } from "react";

export type SignalPort = {
  index: string;
  label: string;
  href: string;
  handle: string;
  description: string;
  endpoint: string;
  action: string;
  tone: string;
};

export type SocialSignalPortsProps = {
  id?: string;
  title?: string;
  tagline?: string;
  body?: string;
  ports?: SignalPort[];
};

export const defaultSignalPorts: SignalPort[] = [
  {
    index: "01",
    label: "GitHub",
    href: "https://github.com/Ha22yX",
    handle: "@Ha22yX",
    description: "Code archive",
    endpoint: "git://github.com/Ha22yX",
    action: "OPEN",
    tone: "#8ef6ff",
  },
  {
    index: "02",
    label: "WeChat",
    href: "weixin://contacts/profile/imxzy945",
    handle: "imxzy945",
    description: "Private signal",
    endpoint: "weixin://contacts/profile/imxzy945",
    action: "OPEN",
    tone: "#f3eee6",
  },
  {
    index: "03",
    label: "Instagram",
    href: "https://www.instagram.com/ha22yx/",
    handle: "@ha22yx",
    description: "Field images",
    endpoint: "ig://profile/ha22yx",
    action: "OPEN",
    tone: "#e2b85b",
  },
  {
    index: "04",
    label: "Email",
    href: "mailto:ha22y.xing@gmail.com",
    handle: "ha22y.xing@gmail.com",
    description: "Direct channel",
    endpoint: "mailto://ha22y.xing@gmail.com",
    action: "SEND",
    tone: "#ff7a1a",
  },
];

const driveContacts = Array.from({ length: 18 }, (_, index) => index);
const pcbTraces = Array.from({ length: 18 }, (_, index) => index);
const pcbVias = Array.from({ length: 12 }, (_, index) => index);

const signalPortsStyles = `
.signal-ports-panel {
  display: grid;
  grid-template-columns: minmax(270px, 0.74fr) minmax(440px, 1fr);
  gap: clamp(36px, 7vw, 96px);
  align-items: center;
  padding-inline: clamp(8px, 1vw, 16px);
}

.signal-ports-copy {
  position: relative;
  display: grid;
  max-width: 620px;
  gap: 18px;
}

.signal-ports-kicker {
  color: rgb(142 246 255 / 0.9);
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.signal-ports-copy h2 {
  margin: 0;
  color: var(--bone, #f3eee6);
  font-family: var(--font-display);
  font-size: clamp(3.25rem, 7.4vw, 7.2rem);
  font-weight: 400;
  line-height: 0.84;
  letter-spacing: 0;
  text-shadow:
    0 0 1px rgb(243 238 230 / 0.72),
    0 0 32px rgb(142 246 255 / 0.16);
}

.signal-ports-copy p {
  max-width: 34ch;
  margin: 0;
  color: rgb(243 238 230 / 0.72);
  font-size: clamp(1rem, 1.7vw, 1.16rem);
  line-height: 1.48;
}

.signal-ports-readout {
  display: grid;
  width: min(100%, 390px);
  gap: 7px;
  border-left: 1px solid rgb(142 246 255 / 0.34);
  padding: 3px 0 3px 15px;
  color: rgb(243 238 230 / 0.56);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.signal-ports-readout strong {
  color: var(--active-port-tone, #8ef6ff);
  font-size: 0.92rem;
  font-weight: 850;
}

.signal-drive-shell {
  position: relative;
  min-width: 0;
  perspective: 1200px;
}

.signal-drive-shell::before {
  content: "";
  position: absolute;
  inset: 16% 4% 8% 7%;
  z-index: 0;
  border-radius: var(--archive-radius-panel, 14px);
  background:
    radial-gradient(ellipse 62% 58% at 52% 44%, rgb(147 243 255 / 0.08), transparent 64%),
    radial-gradient(ellipse 80% 70% at 50% 58%, rgb(24 17 68 / 0.42), rgb(2 3 18 / 0.54) 72%, transparent);
  filter: blur(34px);
  transform: rotate(-2.5deg) translate3d(0, 28px, -20px);
  pointer-events: none;
}

.signal-drive {
  position: relative;
  z-index: 1;
  min-height: clamp(360px, 31vw, 430px);
  overflow: hidden;
  border: 1px solid rgb(147 243 255 / 0.22);
  border-radius: var(--archive-radius-panel, 14px);
  color: var(--bone, #f3eee6);
  background:
    radial-gradient(circle at 18% 0%, rgb(147 243 255 / 0.12), transparent 23%),
    radial-gradient(circle at 50% 46%, rgb(218 203 225 / 0.055), transparent 42%),
    radial-gradient(circle at 72% 64%, rgb(142 246 255 / 0.07), transparent 18%),
    radial-gradient(circle at 44% 130%, rgb(2 3 18 / 0.78), transparent 42%),
    repeating-linear-gradient(0deg, rgb(255 255 255 / 0.026) 0 1px, transparent 1px 9px),
    linear-gradient(110deg, #0a211d 0%, #112e2b 48%, #071417 100%);
  box-shadow:
    inset 0 0 0 1px rgb(218 203 225 / 0.08),
    inset 0 16px 38px rgb(255 255 255 / 0.025),
    inset 0 -28px 60px rgb(2 3 18 / 0.46),
    0 30px 92px var(--archive-shadow-deep, rgb(2 3 18 / 0.72)),
    0 0 62px rgb(147 243 255 / 0.08);
  transform: rotateX(4deg) rotateY(-7deg) rotateZ(-1.7deg);
  transform-style: preserve-3d;
}

.signal-drive::before,
.signal-drive::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.signal-drive::before {
  background:
    linear-gradient(90deg, transparent 0 64px, rgb(196 151 48 / 0.16) 64px 66px, transparent 66px),
    repeating-linear-gradient(90deg, transparent 0 34px, rgb(220 172 62 / 0.08) 34px 35px, transparent 35px 68px),
    repeating-linear-gradient(0deg, transparent 0 31px, rgb(80 171 139 / 0.13) 31px 32px, transparent 32px 64px);
  mix-blend-mode: screen;
  opacity: 0.55;
}

.signal-drive::after {
  background:
    radial-gradient(circle at 12% 74%, rgb(246 213 137 / 0.13) 0 1px, transparent 2px),
    radial-gradient(circle at 88% 26%, rgb(246 213 137 / 0.16) 0 1px, transparent 2px),
    linear-gradient(135deg, rgb(255 255 255 / 0.09), transparent 30%, rgb(0 0 0 / 0.18) 72%, transparent);
  background-size: auto, auto, 100% 100%;
  opacity: 0.7;
}

.drive-contact-bank {
  position: absolute;
  top: 74px;
  bottom: 58px;
  left: 0;
  z-index: 3;
  display: grid;
  width: 76px;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(18, 1fr);
  gap: 2px;
  padding: 10px 9px 10px 0;
  background:
    linear-gradient(90deg, #16100a, #241807 46%, #0a1511 100%);
  box-shadow:
    inset -2px 0 0 rgb(255 222 119 / 0.24),
    inset -8px 0 14px rgb(0 0 0 / 0.24),
    9px 0 18px rgb(0 0 0 / 0.18);
}

.drive-contact-bank span {
  display: block;
  width: 100%;
  border-radius: 1px 3px 3px 1px;
  background-color: #d8a535;
  background-image:
    linear-gradient(90deg, #6d430b 0%, #d8a535 26%, #ffdf80 52%, #b77918 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.42),
    inset 0 -1px 0 rgb(0 0 0 / 0.34),
    -1px 0 0 rgb(0 0 0 / 0.55);
}

.drive-contact-bank span:nth-child(3n) {
  width: 84%;
}

.drive-contact-bank span:nth-child(4n) {
  width: 92%;
}

.drive-contact-bank span:nth-child(7),
.drive-contact-bank span:nth-child(8) {
  width: 58%;
}

.drive-screw-hole {
  position: absolute;
  right: 30px;
  top: 50%;
  z-index: 4;
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgb(238 196 106 / 0.42);
  background:
    radial-gradient(circle, rgb(8 10 12 / 0.95) 0 31%, transparent 32%),
    radial-gradient(circle, rgb(230 191 97 / 0.38), rgb(67 46 16 / 0.3) 64%, transparent 66%);
  box-shadow:
    inset 0 0 18px rgb(0 0 0 / 0.38),
    0 0 20px rgb(0 0 0 / 0.24);
  transform: translateY(-50%);
}

.drive-screw-hole::after {
  content: "";
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.86);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.1);
}

.drive-silkscreen {
  position: absolute;
  top: 24px;
  left: 92px;
  right: 100px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: rgb(228 236 215 / 0.72);
  font-family: var(--font-mono);
  font-size: clamp(0.62rem, 0.8vw, 0.75rem);
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.drive-silkscreen span:first-child {
  color: rgb(142 246 255 / 0.78);
}

.drive-led {
  position: absolute;
  left: 92px;
  bottom: 28px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgb(243 238 230 / 0.48);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.drive-led::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--active-port-tone, #8ef6ff);
  box-shadow:
    0 0 10px color-mix(in srgb, var(--active-port-tone, #8ef6ff) 74%, transparent),
    0 0 24px color-mix(in srgb, var(--active-port-tone, #8ef6ff) 44%, transparent);
}

.drive-copper-field {
  position: absolute;
  inset: 58px 82px 58px 86px;
  z-index: 2;
  overflow: hidden;
  opacity: 0.95;
  pointer-events: none;
}

.drive-copper-field [data-pcb-trace] {
  position: absolute;
  height: 1px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, transparent, rgb(210 158 53 / 0.62), rgb(255 212 112 / 0.5), transparent);
  box-shadow: 0 0 8px rgb(224 170 61 / 0.14);
}

.drive-copper-field [data-pcb-trace]::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 1px;
  height: var(--trace-drop, 30px);
  background: linear-gradient(180deg, rgb(210 158 53 / 0.48), transparent);
}

.drive-copper-field [data-pcb-trace]:nth-child(1) {
  left: 2%;
  top: 11%;
  width: 66%;
  --trace-drop: 24px;
}

.drive-copper-field [data-pcb-trace]:nth-child(2) {
  left: 8%;
  top: 18%;
  width: 38%;
  --trace-drop: 42px;
}

.drive-copper-field [data-pcb-trace]:nth-child(3) {
  left: 42%;
  top: 23%;
  width: 42%;
  --trace-drop: 18px;
}

.drive-copper-field [data-pcb-trace]:nth-child(4) {
  left: 15%;
  top: 30%;
  width: 72%;
  --trace-drop: 34px;
}

.drive-copper-field [data-pcb-trace]:nth-child(5) {
  left: 4%;
  top: 39%;
  width: 48%;
  --trace-drop: 52px;
}

.drive-copper-field [data-pcb-trace]:nth-child(6) {
  left: 51%;
  top: 42%;
  width: 34%;
  --trace-drop: 28px;
}

.drive-copper-field [data-pcb-trace]:nth-child(7) {
  left: 10%;
  top: 50%;
  width: 78%;
  --trace-drop: 30px;
}

.drive-copper-field [data-pcb-trace]:nth-child(8) {
  left: 25%;
  top: 57%;
  width: 35%;
  --trace-drop: 46px;
}

.drive-copper-field [data-pcb-trace]:nth-child(9) {
  left: 62%;
  top: 61%;
  width: 24%;
  --trace-drop: 22px;
}

.drive-copper-field [data-pcb-trace]:nth-child(10) {
  left: 3%;
  top: 68%;
  width: 71%;
  --trace-drop: 38px;
}

.drive-copper-field [data-pcb-trace]:nth-child(11) {
  left: 12%;
  top: 75%;
  width: 45%;
  --trace-drop: 18px;
}

.drive-copper-field [data-pcb-trace]:nth-child(12) {
  left: 48%;
  top: 79%;
  width: 36%;
  --trace-drop: 34px;
}

.drive-copper-field [data-pcb-trace]:nth-child(13) {
  left: 6%;
  top: 86%;
  width: 64%;
  --trace-drop: 20px;
}

.drive-copper-field [data-pcb-trace]:nth-child(14) {
  left: 38%;
  top: 8%;
  width: 28%;
  --trace-drop: 60px;
}

.drive-copper-field [data-pcb-trace]:nth-child(15) {
  left: 71%;
  top: 34%;
  width: 18%;
  --trace-drop: 80px;
}

.drive-copper-field [data-pcb-trace]:nth-child(16) {
  left: 20%;
  top: 92%;
  width: 56%;
  --trace-drop: 16px;
}

.drive-copper-field [data-pcb-trace]:nth-child(17) {
  left: 57%;
  top: 14%;
  width: 30%;
  --trace-drop: 92px;
}

.drive-copper-field [data-pcb-trace]:nth-child(18) {
  left: 1%;
  top: 4%;
  width: 25%;
  --trace-drop: 120px;
}

.drive-copper-field [data-pcb-via] {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid rgb(224 177 77 / 0.58);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgb(10 27 20 / 0.9) 0 38%, rgb(222 169 58 / 0.36) 40% 63%, transparent 64%);
  box-shadow: 0 0 9px rgb(224 170 61 / 0.18);
}

.drive-copper-field [data-pcb-via]:nth-of-type(19) {
  left: 11%;
  top: 17%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(20) {
  left: 46%;
  top: 16%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(21) {
  left: 81%;
  top: 25%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(22) {
  left: 30%;
  top: 35%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(23) {
  left: 68%;
  top: 44%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(24) {
  left: 16%;
  top: 54%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(25) {
  left: 51%;
  top: 57%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(26) {
  left: 86%;
  top: 63%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(27) {
  left: 24%;
  top: 77%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(28) {
  left: 60%;
  top: 84%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(29) {
  left: 76%;
  top: 9%;
}

.drive-copper-field [data-pcb-via]:nth-of-type(30) {
  left: 5%;
  top: 88%;
}

.drive-trace-layer {
  position: absolute;
  inset: 70px 96px 72px 82px;
  z-index: 3;
  pointer-events: none;
}

.drive-trace-layer span {
  --trace-top: 20%;
  position: absolute;
  left: 0;
  top: var(--trace-top);
  width: var(--trace-width, 54%);
  height: 2px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgb(188 141 45 / 0.72), rgb(239 202 97 / 0.32), transparent);
  box-shadow: 0 0 10px rgb(215 161 57 / 0.2);
}

.drive-trace-layer span::after {
  content: "";
  position: absolute;
  right: -26px;
  top: 0;
  width: 28px;
  height: 42px;
  border-top: 2px solid rgb(188 141 45 / 0.42);
  border-right: 2px solid rgb(188 141 45 / 0.28);
  border-radius: 0 10px 0 0;
}

.drive-trace-layer span.is-active {
  background:
    linear-gradient(90deg, rgb(255 217 113 / 0.98), var(--active-port-tone, #8ef6ff), transparent);
  box-shadow:
    0 0 10px color-mix(in srgb, var(--active-port-tone, #8ef6ff) 54%, transparent),
    0 0 26px color-mix(in srgb, var(--active-port-tone, #8ef6ff) 34%, transparent);
}

.drive-trace-layer span:nth-child(1) {
  --trace-top: 15%;
  --trace-width: 44%;
}

.drive-trace-layer span:nth-child(2) {
  --trace-top: 37%;
  --trace-width: 58%;
}

.drive-trace-layer span:nth-child(3) {
  --trace-top: 63%;
  --trace-width: 48%;
}

.drive-trace-layer span:nth-child(4) {
  --trace-top: 84%;
  --trace-width: 62%;
}

.drive-chip-grid {
  position: absolute;
  top: 74px;
  right: 96px;
  bottom: 66px;
  left: 136px;
  z-index: 6;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px 20px;
}

.signal-port {
  --port-tone: #8ef6ff;
  position: relative;
  display: grid;
  min-width: 0;
  grid-template-rows: auto auto minmax(0, 1fr);
  align-content: stretch;
  gap: 5px;
  border: 1px solid rgb(147 243 255 / 0.16);
  border-radius: var(--archive-radius-inner, 8px);
  padding: 14px 15px;
  overflow: hidden;
  color: rgb(238 239 225 / 0.88);
  background:
    radial-gradient(circle at 20% 0%, rgb(147 243 255 / 0.12), transparent 30%),
    linear-gradient(140deg, #20282c, #0d1218 62%, #040509);
  box-shadow:
    inset 0 1px 0 rgb(218 203 225 / 0.14),
    inset 0 -1px 0 rgb(2 3 18 / 0.68),
    0 10px 20px rgb(2 3 18 / 0.42);
  transition:
    border-color var(--archive-hover-duration, 260ms) var(--archive-motion-ease, cubic-bezier(0.16, 1, 0.3, 1)),
    box-shadow var(--archive-hover-duration, 260ms) var(--archive-motion-ease, cubic-bezier(0.16, 1, 0.3, 1)),
    transform var(--archive-hover-duration, 260ms) var(--archive-motion-ease, cubic-bezier(0.16, 1, 0.3, 1)),
    background var(--archive-hover-duration, 260ms) var(--archive-motion-ease, cubic-bezier(0.16, 1, 0.3, 1));
}

.signal-port::before,
.signal-port::after {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 5px;
  opacity: 0.74;
  background:
    repeating-linear-gradient(0deg, transparent 0 5px, rgb(196 151 48 / 0.72) 5px 8px, transparent 8px 13px);
  pointer-events: none;
}

.signal-port::before {
  left: -2px;
}

.signal-port::after {
  right: -2px;
}

.signal-port:hover,
.signal-port:focus-visible,
.signal-port.is-active {
  border-color: color-mix(in srgb, var(--port-tone) 58%, #101314);
  background:
    radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--port-tone) 20%, transparent), transparent 30%),
    linear-gradient(140deg, #253139, #0f151d 62%, #040509);
  box-shadow:
    inset 0 1px 0 rgb(218 203 225 / 0.18),
    inset 0 -1px 0 rgb(2 3 18 / 0.68),
    0 0 0 1px color-mix(in srgb, var(--port-tone) 24%, transparent),
    0 0 24px color-mix(in srgb, var(--port-tone) 24%, transparent),
    0 14px 28px rgb(2 3 18 / 0.58);
}

.signal-port:hover,
.signal-port:focus-visible {
  transform: translateY(-3px);
}

.signal-port-index {
  color: var(--port-tone);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  padding-right: 58px;
}

.signal-port-main,
.signal-port-meta {
  position: relative;
  z-index: 1;
  display: grid;
  min-width: 0;
  align-content: end;
  gap: 3px;
}

.signal-port-label {
  overflow: hidden;
  color: rgb(250 246 234 / 0.94);
  font-size: clamp(1rem, 1.45vw, 1.28rem);
  font-weight: 900;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signal-port-handle,
.signal-port-endpoint {
  overflow: hidden;
  color: rgb(238 239 225 / 0.5);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signal-port-endpoint {
  display: block;
  overflow: visible;
  max-width: 100%;
  color: rgb(238 239 225 / 0.56);
  font-size: 0.56rem;
  line-height: 1.18;
  overflow-wrap: anywhere;
  text-overflow: clip;
  white-space: normal;
}

.signal-port-description {
  overflow: hidden;
  color: rgb(238 239 225 / 0.74);
  font-size: 0.72rem;
  font-weight: 850;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signal-port-action {
  position: absolute;
  top: 12px;
  right: 13px;
  z-index: 2;
  border: 1px solid color-mix(in srgb, var(--port-tone) 36%, transparent);
  padding: 5px 7px;
  color: var(--port-tone);
  background: rgb(0 0 0 / 0.22);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.drive-footer-code {
  position: absolute;
  right: 96px;
  bottom: 28px;
  z-index: 5;
  display: flex;
  gap: 18px;
  color: rgb(228 236 215 / 0.52);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .signal-ports-panel {
    grid-template-columns: 1fr;
  }

  .signal-drive {
    transform: none;
  }
}

@media (max-width: 640px) {
  .signal-ports-panel {
    gap: 32px;
  }

  .signal-drive {
    min-height: 760px;
  }

  .drive-contact-bank {
    top: 18px;
    right: 22px;
    bottom: auto;
    left: 22px;
    width: auto;
    height: 38px;
    grid-template-columns: repeat(18, 1fr);
    grid-template-rows: 1fr;
    gap: 3px;
    padding: 0;
  }

  .drive-contact-bank span {
    width: 100%;
  }

  .drive-silkscreen {
    top: 82px;
    right: 22px;
    left: 22px;
    flex-wrap: wrap;
  }

  .drive-chip-grid {
    top: 134px;
    right: 18px;
    bottom: 88px;
    left: 18px;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .drive-copper-field {
    inset: 126px 26px 86px 26px;
  }

  .drive-trace-layer {
    inset: 126px 34px 86px 34px;
  }

  .drive-trace-layer span {
    width: 88%;
  }

  .drive-screw-hole {
    top: auto;
    right: 20px;
    bottom: 20px;
    width: 44px;
    height: 44px;
    transform: none;
  }

  .drive-led {
    left: 20px;
    bottom: 32px;
  }

  .drive-footer-code {
    display: none;
  }
}
`;

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export const SocialSignalPorts = memo(function SocialSignalPorts({
  id = "social",
  title = "Signal Ports",
  tagline = "GitHub for code, Instagram for field images, WeChat for quick messages, and email for conversations that need care.",
  body = "Open a channel for collaboration, admissions conversations, portfolio questions, or project inquiries.",
  ports = defaultSignalPorts,
}: SocialSignalPortsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePort = activeIndex === null ? null : ports[activeIndex] ?? null;

  const panelStyle = useMemo(
    () =>
      ({
        "--active-port-tone": activePort?.tone ?? "#496265",
      }) as CSSProperties,
    [activePort?.tone]
  );

  return (
    <>
      <style>{signalPortsStyles}</style>
      <section
        id={id}
        className="section-panel signal-ports-panel"
        aria-labelledby={`${id}-title`}
        data-archive-section="social"
        data-signal-ports-sample
        style={panelStyle}
      >
        <div className="signal-ports-copy">
          <span className="signal-ports-kicker">04 · Public channels</span>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{tagline}</p>
          <div className="signal-ports-readout" aria-live="polite">
            <span>{body}</span>
            <strong>{activePort ? `${activePort.index} ${activePort.label} active` : "No port selected"}</strong>
          </div>
        </div>

        <div className="signal-drive-shell" onMouseLeave={() => setActiveIndex(null)}>
          <div className="signal-drive" data-hardware-drive aria-label="Retro M.2 identity drive">
            <div className="drive-contact-bank" aria-hidden="true">
              {driveContacts.map((contact) => (
                <span data-drive-contact key={contact} />
              ))}
            </div>
            <div className="drive-screw-hole" aria-hidden="true" />
            <div className="drive-silkscreen" aria-hidden="true">
              <span>ROSEBEG-ID</span>
              <span>M.2 2280</span>
              <span>REV.02</span>
            </div>
            <div className="drive-led" aria-hidden="true">
              Identity bus active
            </div>
            <div className="drive-copper-field" aria-hidden="true">
              {pcbTraces.map((trace) => (
                <span data-pcb-trace key={`pcb-trace-${trace}`} />
              ))}
              {pcbVias.map((via) => (
                <span data-pcb-via key={`pcb-via-${via}`} />
              ))}
            </div>
            <div className="drive-trace-layer" aria-hidden="true">
              {ports.map((port, index) => (
                <span
                  className={activeIndex !== null && index === activeIndex ? "is-active" : undefined}
                  key={`trace-${port.label}`}
                />
              ))}
            </div>

            <div className="drive-chip-grid" aria-label="Social signal ports">
              {ports.map((port, index) => {
                const portStyle = { "--port-tone": port.tone } as CSSProperties;
                const isActive = activeIndex !== null && index === activeIndex;

                return (
                  <a
                    className={isActive ? "signal-port is-active" : "signal-port"}
                    data-drive-chip
                    data-signal-port
                    href={port.href}
                    key={`${port.index}-${port.label}`}
                    onBlur={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    rel={isExternalHref(port.href) ? "noreferrer" : undefined}
                    style={portStyle}
                    target={isExternalHref(port.href) ? "_blank" : undefined}
                  >
                    <span className="signal-port-index">{port.index}</span>
                    <span className="signal-port-main">
                      <span className="signal-port-label">{port.label}</span>
                      <span className="signal-port-handle">{port.handle}</span>
                    </span>
                    <span className="signal-port-meta">
                      <span className="signal-port-description">{port.description}</span>
                      <span className="signal-port-endpoint" data-drive-endpoint>
                        {port.endpoint}
                      </span>
                    </span>
                    <span className="signal-port-action">{port.action}</span>
                  </a>
                );
              })}
            </div>
            <div className="drive-footer-code" aria-hidden="true">
              <span>NVME identity bus</span>
              <span>{String(ports.length).padStart(2, "0")} chips mounted</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export default SocialSignalPorts;
