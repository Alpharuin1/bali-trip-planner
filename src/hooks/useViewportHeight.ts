import { useEffect } from "react";

/** Keeps --app-height / --app-offset-top in sync with the visible viewport (mobile browser chrome). */
export function useViewportHeight(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.removeProperty("--app-height");
      document.documentElement.style.removeProperty("--app-offset-top");
      return;
    }

    const sync = () => {
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
      document.documentElement.style.setProperty("--app-offset-top", `${offsetTop}px`);
    };

    sync();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      document.documentElement.style.removeProperty("--app-height");
      document.documentElement.style.removeProperty("--app-offset-top");
    };
  }, [enabled]);
}
