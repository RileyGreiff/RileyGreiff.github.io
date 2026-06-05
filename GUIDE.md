# Portfolio Website — Quick Reference Guide

## File Structure

```
Portfolio website/
├── index.html          ← All page content lives here
├── css/style.css       ← All styling (colors, layout, animations, responsive)
├── js/main.js          ← Dark mode toggle, scroll animations, mobile nav
└── assets/images/
    └── projects/       ← Drop project screenshots here
```

## How to Preview

Open a terminal in this folder and run:
```
python -m http.server 8080
```
Then visit **http://localhost:8080** in your browser.

---

## Adding Content

All content is in `index.html`. Each repeatable item has comment markers you can search for.

### Add a New Project

Search for `PROJECT CARD` in `index.html` and copy-paste this block inside the `<div class="projects-grid">`:

```html
<!-- === PROJECT CARD (copy this block to add a new project) === -->
<article class="card" data-animate>
  <div class="card__image">
    <img src="assets/images/projects/your-image.png"
         alt="Screenshot of Your Project" loading="lazy">
  </div>
  <div class="card__body">
    <h3 class="card__title">Project Name</h3>
    <p class="card__desc">
      One or two sentences about what it does and why it matters.
    </p>
    <div class="card__tags">
      <span class="tag">Python</span>
      <span class="tag">React</span>
    </div>
    <div class="card__links">
      <a href="https://github.com/you/repo" class="card__link">GitHub</a>
      <a href="https://your-demo.com" class="card__link">Live Demo</a>
    </div>
  </div>
</article>
<!-- === END PROJECT CARD === -->
```

- Replace the `src` with your screenshot path (put images in `assets/images/projects/`)
- Change the title, description, tags, and links
- The grid auto-adjusts — no CSS changes needed

### Add a New Publication

Search for `PUBLICATION ENTRY` and copy-paste this inside `<ul class="publications-list">`:

```html
<!-- === PUBLICATION ENTRY (copy this block to add a new publication) === -->
<li class="pub" data-animate>
  <div class="pub__info">
    <h3 class="pub__title">
      <a href="https://link-to-paper.com">Paper Title</a>
    </h3>
    <p class="pub__venue">Conference or Journal Name, 2025</p>
  </div>
  <time class="pub__date" datetime="2025-06">Jun 2025</time>
</li>
<!-- === END PUBLICATION ENTRY === -->
```

### Add a New Job/Experience

Search for `TIMELINE ENTRY` and copy-paste this inside `<div class="timeline">`:

```html
<!-- === TIMELINE ENTRY (copy this block to add a new position) === -->
<div class="timeline__item" data-animate>
  <div class="timeline__marker"></div>
  <div class="timeline__content">
    <h3 class="timeline__role">Your Role</h3>
    <p class="timeline__company">Company Name</p>
    <p class="timeline__period">Start — End</p>
    <p class="timeline__desc">
      What you did and the impact you made.
    </p>
  </div>
</div>
<!-- === END TIMELINE ENTRY === -->
```

### Add a New Skill Badge

Find the `<div class="skills">` section and add:

```html
<span class="skill-badge">New Skill</span>
```

---

## Customization

### Colors

All colors are CSS custom properties in `css/style.css` at the top under `:root`. Change them there and they update everywhere.

| Variable              | What it controls              |
|-----------------------|-------------------------------|
| `--color-bg`          | Page background               |
| `--color-text`        | Main text color               |
| `--color-text-muted`  | Secondary/lighter text        |
| `--color-accent`      | Links, buttons, highlights    |
| `--color-border`      | Card borders, dividers        |
| `--color-tag-bg`      | Tag/badge background          |
| `--color-surface`     | Card background               |

Dark mode colors are under `[data-theme="dark"]` — same variables, different values.

### Fonts

The site uses **Inter** from Google Fonts. To change it, update the `<link>` tag in `index.html` and the `--font-sans` variable in `css/style.css`.

### Spacing

| Variable            | Default | Controls                  |
|---------------------|---------|---------------------------|
| `--space-section`   | 6rem    | Vertical padding between sections |
| `--container-max`   | 1080px  | Max content width         |
| `--container-pad`   | 1.5rem  | Horizontal page padding   |

---

## How Things Work

### Dark Mode
- `js/main.js` checks `localStorage` for a saved theme, then falls back to system preference (`prefers-color-scheme`)
- Clicking the sun/moon button toggles `data-theme` on `<html>` between `"light"` and `"dark"`
- All colors swap automatically because every color in CSS references a custom property

### Scroll Animations
- Any element with `data-animate` starts invisible (opacity 0, shifted down 20px)
- When it scrolls into view, `js/main.js` adds the class `is-visible` which fades it in
- Each element only animates once

### Mobile Navigation
- Below 640px, the nav links collapse behind a hamburger button
- `js/main.js` toggles the `is-open` class on `.nav__links`
- Clicking any nav link auto-closes the menu

### Responsive Breakpoints
| Width     | Layout                          |
|-----------|---------------------------------|
| < 640px   | 1-column projects, hamburger nav |
| 640px+    | 2-column project grid           |
| 1024px+   | 3-column project grid           |

---

## Tips

- **Images**: Use 16:9 aspect ratio screenshots for best results (e.g., 1200x675px). The CSS enforces `aspect-ratio: 16/9` so any size works, but 16:9 avoids cropping.
- **Performance**: Images use `loading="lazy"` so they only load when scrolled into view.
- **SEO**: Update the `<title>` and `<meta name="description">` in the `<head>` of `index.html`.
- **Favicon**: Drop a `favicon.ico` or `favicon.svg` into the root folder and add `<link rel="icon" href="favicon.svg">` to the `<head>`.
