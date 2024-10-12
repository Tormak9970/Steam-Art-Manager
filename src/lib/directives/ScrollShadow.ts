import type { Action } from "svelte/action";
import { writable } from "svelte/store";

type ScrollShadowParams = {
  /**
   * The CSS variable to use as the scroll shadow's background.
   */
  background: string;
  /**
   * Whether or not to show the shadow.
   */
  enabled?: boolean;
}

/**
 * A Svelte directive for applying scroll shadow to elements.
 */
export const scrollShadow: Action<HTMLElement, ScrollShadowParams> = (node: HTMLElement, props: ScrollShadowParams) => {
  const parent = node.parentElement!;

  const showShadow = writable(props.enabled ?? true);
  const showShadowUnsub = showShadow.subscribe((show: boolean) => {
    if (show) {
      parent.classList.add("scroll-shadow");
    } else {
      parent.classList.remove("scroll-shadow");
    }
  });

  const useBackground = writable(props.background);
  const useBackgroundUnsub = useBackground.subscribe((background: string) => {
    parent.style.setProperty("--scroll-shadow-color", `var(${background})`);
  });
  
  const isOverflowingTop = writable(false);
  const isOverflowingTopUnsub = isOverflowingTop.subscribe((isOverflowing: boolean) => {
    if (isOverflowing) {
      parent.classList.add("overflow-top");
    } else {
      parent.classList.remove("overflow-top");
    }
  });

  const isOverflowingBottom = writable(Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop) > 1);
  const isOverflowingBottomUnsub = isOverflowingBottom.subscribe((isOverflowing: boolean) => {
    if (isOverflowing) {
      parent.classList.add("overflow-bottom");
    } else {
      parent.classList.remove("overflow-bottom");
    }
  });

  const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    const element = entries[0].target;
    
    isOverflowingTop.set(element.scrollTop !== 0);
    isOverflowingBottom.set(Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) > 1);
  });
  
  node.addEventListener("scroll", scrollHandler);
  observer.observe(node);


  function scrollHandler(e: Event) {
    const element = e.currentTarget as HTMLDivElement;

    isOverflowingTop.set(element.scrollTop !== 0);
    isOverflowingBottom.set(Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) > 1);
  }


  return {
    update(props: ScrollShadowParams) {
      showShadow.set(props.enabled ?? true);
      useBackground.set(props.background);
    },
    destroy() {
      node.removeEventListener("scroll", scrollHandler);
      observer.disconnect();

      showShadowUnsub();
      useBackgroundUnsub();
      isOverflowingTopUnsub();
      isOverflowingBottomUnsub();

      parent.classList.remove("scroll-shadow");
      parent.classList.remove("overflow-top");
      parent.classList.remove("overflow-bottom");
    }
  }
}