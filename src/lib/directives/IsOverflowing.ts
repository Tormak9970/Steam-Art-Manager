import type { Action } from "svelte/action";
import { writable } from "svelte/store";

type IsOverflowingParams = {
  callback: (isOverflowing: boolean) => void;
}

/**
 * A Svelte directive for detecting when an element is overflowing..
 */
export const isOverflowing: Action<HTMLElement, IsOverflowingParams | undefined> = (node: HTMLElement, props = { callback: (isOverflowing: boolean) => {} }) => {
  let callback = props.callback;

  const isOverflowing = writable(false);
  const isOverflowingUnsub = isOverflowing.subscribe((isOverflowing: boolean) => {
    callback(isOverflowing);
  });

  const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    const element = entries[0].target;
    
    const overflowingTop = element.scrollTop !== 0;
    const overflowingBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) > 0;
    isOverflowing.set(overflowingTop || overflowingBottom);
  });
  
  node.addEventListener("scroll", scrollHandler);
  observer.observe(node);


  function scrollHandler(e: Event) {
    const element = e.currentTarget as HTMLDivElement;

    const overflowingTop = element.scrollTop !== 0;
    const overflowingBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) > 0;
    isOverflowing.set(overflowingTop || overflowingBottom);
  }

  return {
    update(props = { callback: (isOverflowing: boolean) => {} }) {
      callback = props.callback;
    },
    destroy() {
      node.removeEventListener("scroll", scrollHandler);
      observer.disconnect();

      isOverflowingUnsub();
    }
  }
}