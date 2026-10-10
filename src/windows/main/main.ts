import "../globalStyles.css";
import Main from "./Main.svelte";

import { mount } from "svelte";

const app = mount(Main, { target: document.getElementById("entryPoint")! });

export default app;
