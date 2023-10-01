import type { Action } from "svelte/action"

type ScrollShadowParams = {
  target: HTMLElement,
  container?: HTMLElement,
  heightBump: number
}

/**
 * A Svelte directive for applying scroll shadow to elements.
 */
export const scrollShadow: Action<HTMLElement, ScrollShadowParams> = (node: HTMLElement, { target, container, heightBump }) => {
  let hasObserved = false;

  let scrollTarget = target;
  let scrollContainer = container ?? node;

  const options = {
    root: node,
    threshold: 1
  };
  
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio !== 1) {
      scrollContainer.classList
        .add("is-overflowing", "is-scrolled-top");
    } else {
      scrollContainer.classList
        .remove("is-overflowing");
    }
  }, options);

  if (!hasObserved && scrollTarget) {
    observer.observe(scrollTarget);
    hasObserved = true;
  }
  
  const scrollListener = (e: UIEvent) => {
    const eventTarget = e.currentTarget as HTMLElement;
    if (eventTarget.scrollTop === 0) {
      scrollContainer.classList.add("is-scrolled-top");
    } else {
      scrollContainer.classList.remove("is-scrolled-top");
    }
  
    if (eventTarget.scrollTop + eventTarget.offsetHeight === scrollTarget?.offsetHeight + heightBump) {
      scrollContainer.classList.add("is-scrolled-bottom");
    } else {
      scrollContainer.classList.remove("is-scrolled-bottom");
    }
  }

  node.addEventListener("scroll", scrollListener);

  return {
    update({ target, container }: ScrollShadowParams) {
      scrollTarget = target;
      scrollContainer = container ?? node;
      if (!hasObserved && target) {
        observer.observe(target);
        hasObserved = true;
      }
    },
    destroy() {
      node.removeEventListener("scroll", scrollListener);
      observer.disconnect();
    }
  }
}