# Unity UXML / USS / C# Previewer

https://lewi39.github.io/Unity-Uxml-Previewer/ 

A standalone, browser-based Unity UI Toolkit workbench.

## Features

- UXML editor with Unity UI Toolkit element/attribute autocomplete
- USS editor with CSS and Unity USS property autocomplete
- Editable C# controller editor support
- C# controller parsing and UXML `root.Q<T>("name")` mapping
- Mock HUD data and UI updates
- C# → UXML mapping panel
- Built-in console
- Live UXML/USS preview
- Draggable editor/preview splitters
- No backend required
- No external runtime dependencies

## Run locally

Open `index.html` in a browser.

## GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html` and the `assets` folder.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the branch containing `index.html` and the `/ (root)` folder.
6. Open the generated GitHub Pages URL.

## Important

This is a browser preview/simulator, not Unity itself. It does not execute arbitrary Unity C# or Unity runtime APIs. The C# side parses controller code and simulates UI-related behavior that the previewer understands.
