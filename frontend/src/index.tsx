/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import "./index.css";
import App from "./App";
import { ThemeProvider } from "./theme";

const root = document.getElementById("root");

render(
  () => (
    <ThemeProvider>
      <Router>
        <Route path="/" component={App} />
        <Route path="/:id" component={App} />
      </Router>
    </ThemeProvider>
  ),
  root!
);
