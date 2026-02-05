# microframe.js

microframe.js is a **small**, **lightweight** and **dependency-free** lightbox and full-screen gallery effect for images, videos, and custom HTML content, written in **vanilla JavaScript**. It weighs in at around 2.5kB when gzipped (js + CSS), and the script itself is a single, self-contained file of roughly 300 lines of clean, object-oriented code, released under the MIT License.

It has been tested across several desktop and mobile browsers, but it is not yet battle-tested and intentionally avoids the heavy defensive programming that would make it bullet-proof. In exchange, it is significantly easier to read and extend. Compared to [GLightbox](https://biati-digital.github.io/glightbox/) or [Lightbox2](https://lokeshdhakar.com/projects/lightbox2/), microframe.js aims for a middle ground between the customizability and the completeness of features of the former and the ease of use of the latter.

Check out the [demo website](https://unrequitedecho.github.io/microframe.js/) to learn more!

## Features

- Lightweight and dependency-free
- Works with images, videos, gifs, custom html elements (but not iframes)
- Responsive
- Keyboard (desktop) / Swipe (mobile) navigation
- Captions
- Easily customizable animations via CSS
- Smooth GPU-accelerated CSS animations

## Installation

Grab the [latest release](https://github.com/UnrequitedEcho/microframe.js/releases), copy the files in your project, then in your html/template:

```html
<head>
  <link rel="stylesheet" href="./path/to/microframe.min.css">
</head>

<body>
  <script type="module">
    import { initMicroframe } from './path/to/microframe.min.js';
    initMicroframe(); // Initialize Microframe with default options
  </script>
<body>
```


