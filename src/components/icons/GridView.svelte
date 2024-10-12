<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface $$Props extends SVGAttributes<any> {};
</script>

<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" {...$$restProps}>
  <rect x="6" y="6" width="220" height="220" rx="25" ry="25" />
  <rect x="286" y="6" width="220" height="220" rx="25" ry="25" />
  <rect x="6" y="286" width="220" height="220" rx="25" ry="25" />
  <rect x="286" y="286" width="220" height="220" rx="25" ry="25" />
</svg>