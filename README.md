# Unity UXML / USS / C# Previewer

A standalone, browser-based Unity UI Toolkit workbench.

## About

This project was built to provide a lightweight workspace during downtime in restricted environments (such as school networks with restricted traffic and blocked software downloads). It runs completely locally in the browser with zero external network requests or dependencies.

* **Development Note:** This applications initial prototype was **100% AI-generated** using ChatGPT (OpenAI), prompted and assembled to solve a specific workflow constraint on restricted hardware. I might later update this depending on my personal needs.

## Features

- C# controller parsing and UXML `root.Q<T>("name")` mapping
- Mock HUD data and UI updates
- C# → UXML mapping panel
- Built-in console
- Live UXML/USS preview
- Draggable editor/preview splitters
- No backend required
- No external runtime dependencies

## Important

This is a browser preview/simulator, not Unity itself. It does not execute arbitrary Unity C# or Unity runtime APIs. The C# side parses controller code and simulates UI-related behavior that the previewer understands.

##  Roadmap & Ideas

Potential features for future updates:
- [ ] **UXML Editor with Unity UI Toolkit Autocompletion:** UXML editor with Unity UI Toolkit element/attribute autocomplete
- [ ] **USS, CSS  & Unity USS property autocompletion :** USS editor with CSS and Unity USS property autocomplete
- [ ] **C# Coding support:**Editable C# controller editor support for UXML Attribute linking controller
- [ ] **GitHub Sync (Fetch & Commit):** Import UXML/USS files directly from a GitHub repo and commit changes back using the GitHub REST API.
- [ ] **File Export / Import:** Quick drag-and-drop file loading and `.zip` export for UXML/USS pairs.

---

##  Project History

* **v1.0.0 (August 2026):** Initial release — 100% AI-generated standalone UXML/USS/C# previewer prototype.
