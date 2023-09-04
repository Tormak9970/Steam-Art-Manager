import "../globalStyles.css";
import ContextMenu from "./ContextMenu.svelte";

const contextMenu = new ContextMenu({
  target: document.getElementById("entryPoint"),
});

export default contextMenu;
