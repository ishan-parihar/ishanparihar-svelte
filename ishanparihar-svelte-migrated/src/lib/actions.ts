export function inView(node: HTMLElement, params = {}) {
  let observer: IntersectionObserver;

  const handleIntersect = (e: IntersectionObserverEntry[]) => {
    if (e[0].isIntersecting) {
      node.dispatchEvent(new CustomEvent('intersect'));
    }
  };

  const setObserver = ({ root, rootMargin, threshold }: IntersectionObserverInit) => {
    const options = { root, rootMargin, threshold };
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(handleIntersect, options);
    observer.observe(node);
  };

  setObserver(params);

  return {
    update(params: IntersectionObserverInit) {
      setObserver(params);
    },
    destroy() {
      if (observer) observer.disconnect();
    },
  };
}
