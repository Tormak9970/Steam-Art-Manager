import "../globalStyles.css";
import Main from "./Main.svelte";

const main = new Main({
  target: document.getElementById("entryPoint"),
});

export default main;
