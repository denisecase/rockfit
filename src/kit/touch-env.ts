// src/kit/touch-env.ts
export function applyTouchClass() {
  const hasTouch = navigator.maxTouchPoints > 0;
  const mq = window.matchMedia("(hover: none), (any-pointer: coarse)").matches;
  const narrow = window.innerWidth <= 600;
  document.body.classList.toggle("touch", hasTouch || mq || narrow);
}

export function bindTouchClassListeners() {
  const fn = () => applyTouchClass();
  window.addEventListener("resize", fn);
  window.addEventListener("orientationchange", fn);
  window.addEventListener("pageshow", fn);
  applyTouchClass(); // run once
  return () => {
    window.removeEventListener("resize", fn);
    window.removeEventListener("orientationchange", fn);
    window.removeEventListener("pageshow", fn);
  };
}
