class Microframe {

  constructor(element) {
    this.targetElement = element;
  }

  open(){
    // Scroll Lock
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    this.microframe = document.createElement("div"); 
    this.microframe.id = "microframe";
    this.panel = Microframe.createPanel(this.targetElement);
    this.panel.classList.add("center");
    this.microframe.appendChild(this.panel);

    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onClickBound = this.close.bind(this);
    document.addEventListener("keydown", this.onKeyDownBound);
    this.microframe.addEventListener("click", this.onClickBound);

    document.body.appendChild(this.microframe);
    this.microframe.getBoundingClientRect();
    this.microframe.classList.add("show");
  }

  close(){
    // Remove event listeners
    document.removeEventListener("keydown", this.onKeyDownBound);

    // fade out microframe then remove it from DOM
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
      this.close();
      break;
    case "Tab":
      e.preventDefault();
      break;
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      e.preventDefault();
      break;
    }
  }

  static createPanel(element = null) {
    const panel = document.createElement("div");
    panel.className = "panel";

    if (!element) return panel; // Empty panel

    // Clone the element so we don't move it from the DOM
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
      // Non-media content: just clone and append
      panel.appendChild(media);
      return panel;
    }

    // Append the media
    panel.appendChild(media);

    // Create a legend if alt or title exists
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

class MicroframeGallery extends Microframe{

  constructor(element){
    super(element);
    const galleryElement = this.targetElement.closest(".gallery, .media-group");
    this.galleryElements = Array.from(galleryElement.querySelectorAll("img, video, .microframe"));
    this.currentIndex = this.galleryElements.indexOf(this.targetElement);
  }

  open(){
    super.open();

    const createSidePanel = (index) => (
      index >= 0 && index < this.galleryElements.length
        ? MicroframeGallery.createPanel(this.galleryElements[index])
        : MicroframeGallery.createPanel()
    );
    this.displayPanels = [
        createSidePanel(this.currentIndex - 1),
        this.panel,
        createSidePanel(this.currentIndex + 1)
    ];
    this.applyPanelClasses();
    this.microframe.appendChild(this.displayPanels[2]);
    this.microframe.insertBefore(this.displayPanels[0], this.displayPanels[1]);

    this.initNavHint();
    this.initCounter();

    this.onKeyTouchStartBound = this.onTouchStart.bind(this);
    this.onKeyTouchEndBound = this.onTouchEnd.bind(this);
    this.microframe.addEventListener("touchstart", this.onTouchStartBound);
    this.microframe.addEventListener("touchend", this.onTouchEndBound);
  }

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

  initCounter(){
    this.counter = document.createElement("div");
    this.counter.className = "counter";
    this.counter.textContent = `${this.currentIndex + 1}/${this.galleryElements.length}`
    this.microframe.appendChild(this.counter);

    requestAnimationFrame(() => this.counter.classList.add("show"));
  }

  onKeyDown(e){
    super.onKeyDown(e);
    if (e.key === "ArrowRight") this.shiftGallery(1);
    if (e.key === "ArrowLeft") this.shiftGallery(-1);
  }

  onTouchStart(e){
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
  }

  onTouchEnd(e){
    const t = e.changedTouches[0];
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) {this.shiftGallery(1)} else {this.shiftGallery(-1)}
    }
  }

  applyPanelClasses(){
    const classes = ['staging-left', 'center', 'staging-right'];

    this.displayPanels.forEach((panel, i) => {
      if (!panel) return;
      panel.className = 'panel';
      panel.classList.add(classes[i]);
    });
  }

  shiftGallery(delta){
    const nextIndex = this.currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= this.galleryElements.length) return;
    this.currentIndex = nextIndex;

    if (delta === 1) {
      // moving left -> shift window right
      this.displayPanels.shift()?.remove();
      this.displayPanels.push(
        this.galleryElements[this.currentIndex + 1]
          ? MicroframeGallery.createPanel(this.galleryElements[this.currentIndex + 1])
          : MicroframeGallery.createPanel()
        );
      this.microframe.appendChild(this.displayPanels[2]);
    } else {
      // moving right -> shift window left
      this.displayPanels.pop()?.remove();
      this.displayPanels.unshift(
        this.galleryElements[this.currentIndex - 1]
          ? MicroframeGallery.createPanel(this.galleryElements[this.currentIndex - 1])
          : MicroframeGallery.createPanel()
        );
      this.microframe.insertBefore(this.displayPanels[0], this.displayPanels[1]);
    }

    this.applyPanelClasses();

    // Hide nav hint if still shown and update counter
    if (this.hint) this.hint.classList.remove("show");
    this.counter.textContent = `${this.currentIndex + 1}/${this.galleryElements.length}`;
  }
}

export function initMicroframe() {
  document.addEventListener("click", function (e) {
    if (document.getElementById("microframe")) return;
    const target = e.target.closest("img, video, .microframe");
    if (target && !target.classList.contains("no-microframe")){
      e.preventDefault();
      let mf;

      mf = target.closest(".gallery, .media-group")
        ? new MicroframeGallery(target)
        : new Microframe(target);

      mf.open();

    }
  });
}