import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test } from "vitest";
import App from "./App.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const roots = [];

afterEach(() => {
  while (roots.length > 0) {
    const { root, container } = roots.pop();
    act(() => root.unmount());
    container.remove();
  }
});

describe("App", () => {
  test("renders an Optix-branded header without phase or feature-status copy", () => {
    const { container } = renderApp();

    const logo = container.querySelector(
      'img[alt="Optix Solutions Limited logo"]'
    );

    expect(logo).not.toBeNull();
    expect(container.querySelector("h1")?.textContent).toBe(
      "Shift Roster Builder"
    );
    expect(container.textContent).not.toContain(
      "Employee management, weekly shift assignment, drag-and-drop reassignment, availability preferences, conflict checks, hour summaries, and CSV export are active."
    );
    expect(container.textContent).not.toContain("Phase 10 in progress");
  });
});

function renderApp() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(<App />);
  });

  roots.push({ root, container });
  return { container };
}
