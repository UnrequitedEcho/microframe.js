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

Link <code>microframe.min.js<code> and <microframe.min.css> in your html or template. You can download the [latest release](https://github.com/UnrequitedEcho/microframe.js/releases) and host the files yourself or use a jsdelivr's CDN.

```html
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/UnrequitedEcho/microframe.js/dist/microframe.min.css">
</head>

<body>
  <script type="module">
    import { initMicroframe } from 'https://cdn.jsdelivr.net/gh/UnrequitedEcho/microframe.js/dist/microframe.min.js';
    initMicroframe(); // Initialize microframe.js with default options
  </script>
<body>
```

## Configuration

`initMicroframe()` accepts an optional configuration object. All options are optional. The defaults shown below will be used if omitted.

```javascript
initMicroframe({
  // Which elements can open Microframe when clicked
  selector: "img, video, .microframe",

  // Elements with this class will be ignored
  ignoreClass: "no-microframe",

  // Parent containers that should be treated as galleries
  gallerySelector: ".gallery, .media-group",

  // Show navigation hint on open
  showNavHint: true,

  // Show the current index (e.g. 3 / 12)
  showCounter: true,

  // Control when legends (alt / title text) are shown:
  // "all"   -> images and videos
  // "image" -> images only
  // "video" -> videos only
  // "none"  -> never show legends
  showLegend: "all"
});
```

In addition, you can customize microframe.js’ appearance and behavior by overriding the default `microframe.css`, either by editing it directly if you host it yourself, or by including your own CSS after the default file.

```html
<head>
  <!-- microframe CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/UnrequitedEcho/microframe.js/dist/microframe.min.css">
  <!-- Your overrides -->
  <link rel="stylesheet" href="microframe-overrides.css">
</head>
```

Below is an example `microframe-overrides.css` showing some of the most useful settings.

```CSS
/* General Customization */
#microframe {
  /* Modal */
  --anim-duration: 0.3s;                /* Fade duration for opening / closing */
  --media-size: 90;                     /* Max media size (in vw / vh) */
  background: rgba(0, 0, 0, 0.85        /* Modal background, semi-transparent by default */

  /* Gallery UI */
  --slide-duration: 0.3s;               /* Duration of slide + fade between panels */

  /* Side panel transforms
   These define the resting position of the hidden previous / next panels */
  --panel-offset-x: 50vw;               /* Horizontal offset (0 = centered) */
  --panel-offset-y: 0%;                 /* Vertical offset (0 = centered) */
  --panel-scale: 0.8;                   /* Scale factor (1 = no scaling) */
  --panel-rot: 0deg;                    /* 2D rotation (0deg = none) */
  --panel-tilt: 0deg;                   /* 3D tilt angle (coverflow-style effect) */
  perspective: 2000px;                  /* Change this for more/less perspective effect when using --panel-tilt*/
}

/* Caption Customization */
#microframe .panel .legend {
  font-family: inherit;                 /* Caption font */
  color: white;                         /* Caption color */
  text-align: center;                   
  margin-top: 10px;                     /* Space between the media and the caption */
  text-shadow: 0 0 5px rgba(0,0,0,1);
}

/* Custom element behavior */
#microframe .my-element{                /* Replace .my-element with your own class */
  width: 100%                           /* 100% = grow to max, auto = shrink to min, or set fixed size like 200px */
  height: 100%                          /* Same for height */
}
```

