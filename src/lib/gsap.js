import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function killScrollTriggers() {
  try {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  } catch {
    /* noop */
  }
}
