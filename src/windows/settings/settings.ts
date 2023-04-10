import "../globalStyles.css";
import Settings from "./Settings.svelte";

const settings = new Settings({
  target: document.getElementById("entryPoint"),
});

export default settings;
