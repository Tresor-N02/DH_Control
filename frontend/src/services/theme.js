const KEY = "dh_mil_theme";
const EVENT = "dh-mil-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");
function savedTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
}
function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
apply(savedTheme() || (media.matches ? "dark" : "light"));
export function getTheme() {
  return document.documentElement.dataset.theme;
}
export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* Theme still works without storage. */
  }
  apply(next);
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeTheme(listener) {
  const sync = () => {
    apply(savedTheme() || (media.matches ? "dark" : "light"));
    listener();
  };
  const storage = (event) => {
    if (event.key === KEY || event.key === null) sync();
  };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", storage);
  media.addEventListener("change", sync);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", storage);
    media.removeEventListener("change", sync);
  };
}
