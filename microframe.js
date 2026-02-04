/**
 * Microframe
 * ----------
 * Lightweight modal for displaying a single element (image, video, or generic content)
 * in an overlay. Handles scroll locking, fade-in/out, and basic keyboard interactions.
 */
class Microframe {

  constructor(element) {
    this.targetElement = element; // Element to show in the microframe
  }

  open(){
    // Lock scrolling
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    // Create microframe main container and center panel
    this.microframe = document.createElement("div"); 
    this.microframe.id = "microframe";
    this.panel = Microframe.createPanel(this.targetElement);
    this.panel.classList.add("center");
    this.microframe.appendChild(this.panel);

    // Bind event listeners
    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onClickBound = this.close.bind(this);
    document.addEventListener("keydown", this.onKeyDownBound);
    this.microframe.addEventListener("click", this.onClickBound);

    // Add to DOM and trigger show animation
    document.body.appendChild(this.microframe);
    this.microframe.getBoundingClientRect(); // Force reflow
    this.microframe.classList.add("show");
  }

  close(){
    // Remove listeners
    document.removeEventListener("keydown", this.onKeyDownBound);

    // Fade out and remove from DOM
    this.microframe.classList.remove("show");
    this.microframe.addEventListener("transitionend", () => {this.microframe.remove();}, {once: true});

    // Restore scroll
    document.body.style.height = "";
    document.body.style.overflow = "";
  }

  onKeyDown(e){
    switch (e.key) {
    case "Escape":
      e.preventDefault();
      this.close(); // Close on Escape
      break;
    case "Tab":
      e.preventDefault(); // Prevent focus loss
      break;
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      e.preventDefault(); // Prevent scrolling of main page elements
      break;
    }
  }

  // Creates a panel for a given element or empty panel
  static createPanel(element = null) {
    const panel = document.createElement("div");
    panel.className = "panel";

    if (!element) return panel; // Empty panel

    // Clone the element so original DOM is untouched
    const media = element.cloneNode(true);

    // Handle media-specific attributes
    if (media.tagName === "IMG") {
      media.sizes = "100vw";
      media.decoding = "async";
      media.loading = "eager";
    } else if (media.tagName === "VIDEO") {
      media.controls = true;
      media.pause?.();
    } else {
      panel.appendChild(media); // Non-media content
      return panel;
    }

    panel.appendChild(media);

    // Add legend if alt or title exists
    const legendText = (media.alt || media.title)?.trim();
    if (legendText) {
      const legend = document.createElement("div");
      legend.className = "legend";
      legend.textContent = legendText;
      panel.appendChild(legend);
    }

    return panel;
  }
}


/**
 * MicroframeGallery
 * -----------------
 * Extends Microframe to display a gallery of content elements in an overlay.
 * Maintains a 3-panel sliding window of CSS Classes [staging-left, center, staging-right].
 * Animations are handled by the browser (CSS)
 */
class MicroframeGallery extends Microframe{

  constructor(element){
    super(element);
    // Collect all media elements in the gallery container
    const galleryElement = this.targetElement.closest(".gallery, .media-group");
    this.galleryElements = Array.from(galleryElement.querySelectorAll("img, video, .microframe"));
    this.currentIndex = this.galleryElements.indexOf(this.targetElement);
  }

  open(){
    super.open();

    // Helper: create a panel for a side index or empty panel
    const createSidePanel = (index) => (
      index >= 0 && index < this.galleryElements.length
        ? MicroframeGallery.createPanel(this.galleryElements[index])
        : MicroframeGallery.createPanel()
    );

    // Initialize Array representing the 3-panel sliding window and add them to the DOM
    this.displayPanels = [
        createSidePanel(this.currentIndex - 1),
        this.panel,
        createSidePanel(this.currentIndex + 1)
    ];
    this.applyPanelClasses();
    this.microframe.appendChild(this.displayPanels[2]);
    this.microframe.appendChild(this.displayPanels[0]);

    // Show navigation hint and counter
    this.initNavHint();
    this.initCounter();

    // Bind touch events for swipe navigation
    this.onTouchStartBound = this.onTouchStart.bind(this);
    this.onTouchEndBound = this.onTouchEnd.bind(this);
    this.microframe.addEventListener("touchstart", this.onTouchStartBound);
    this.microframe.addEventListener("touchend", this.onTouchEndBound);
  }

  // Show temporary navigation hint for keyboard or touch
  initNavHint(){
    this.hint = document.createElement("div");
    this.hint.className = "nav-hint";

    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const hintText = isTouch ? "Swipe left/right to navigate" : "Use ← / → to navigate";
    this.hint.textContent = hintText;
    this.microframe.appendChild(this.hint);

    requestAnimationFrame(() => this.hint.classList.add("show"));
    setTimeout(() => this.hint.classList.remove("show"), 5000);
  }

  // Display counter showing current item / total
  initCounter(){
    this.counter = document.createElement("div");
    this.counter.className = "counter";
    this.counter.textContent = `${this.currentIndex + 1}/${this.galleryElements.length}`
    this.microframe.appendChild(this.counter);

    requestAnimationFrame(() => this.counter.classList.add("show"));
  }

  // Handle gallery-specific keydown events (extends base Microframe keys handling)
  onKeyDown(e){
    super.onKeyDown(e);
    if (e.key === "ArrowRight") this.shiftGallery(1);
    if (e.key === "ArrowLeft") this.shiftGallery(-1);
  }

  // Record initial touch position for swipe
  onTouchStart(e){
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
  }

  // Detect swipe direction and trigger gallery shift
  onTouchEnd(e){
    const t = e.changedTouches[0];
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) {this.shiftGallery(1)} else {this.shiftGallery(-1)}
    }
  }

  // Apply CSS classes to panels for sliding layout (trigger animation)
  applyPanelClasses(){
    const classes = ['staging-left', 'center', 'staging-right'];
    this.displayPanels.forEach((panel, i) => {
      if (!panel) return;
      panel.classList.remove('staging-left', 'center', 'staging-right');
      panel.classList.add(classes[i]);
    });
  }

  // Shift sliding window left or right when navigating
  shiftGallery(delta){
    const nextIndex = this.currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= this.galleryElements.length) return;
    this.currentIndex = nextIndex;

    // Pause if center panel is or has video
    this.displayPanels[1].querySelectorAll("video").forEach(video => {
      video.pause();
    })

    // Append panels to the DOM in a hidden state, before they are assigned
    // their style with applyPanelClasses
    const appendPanel = (panel) => {
      panel.style.opacity = "0";
      this.microframe.appendChild(panel);
      panel.style.opacity = "";
    };

    if (delta === 1) {
      // Move left -> shift window right
      this.displayPanels.shift()?.remove();
      this.displayPanels.push(
        this.galleryElements[this.currentIndex + 1]
          ? MicroframeGallery.createPanel(this.galleryElements[this.currentIndex + 1])
          : MicroframeGallery.createPanel()
        );
      appendPanel(this.displayPanels[2]);
    } else {
      // Move right -> shift window left
      this.displayPanels.pop()?.remove();
      this.displayPanels.unshift(
        this.galleryElements[this.currentIndex - 1]
          ? MicroframeGallery.createPanel(this.galleryElements[this.currentIndex - 1])
          : MicroframeGallery.createPanel()
        );
      appendPanel(this.displayPanels[0]);
    }

    this.applyPanelClasses();

    // Hide nav hint if still shown and update counter
    if (this.hint) this.hint.classList.remove("show");
    this.counter.textContent = `${this.currentIndex + 1}/${this.galleryElements.length}`;
  }
}

export function initMicroframe() {
  document.addEventListener("click", function (e) { // User clicks
    if (document.getElementById("microframe")) return; // Microframe is already open: exit
    const target = e.target.closest("img, video, .microframe"); 
    if (target && !target.classList.contains("no-microframe")){ // Click target is microframe-able
      e.preventDefault();
      let mf;
      mf = target.closest(".gallery, .media-group") // Click target is in a gallery
        ? new MicroframeGallery(target)
        : new Microframe(target);
      mf.open();
    }
  });
}