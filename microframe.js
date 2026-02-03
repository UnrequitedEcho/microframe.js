function createPanel(element) {
    const panel = document.createElement("div");
    panel.className = "panel";

    // Non-media content: just clone and append
    if (element.tagName !== "IMG" && element.tagName !== "VIDEO") {
        panel.append(element.cloneNode(true));
        return panel;
    }

    // Media content (IMG or VIDEO)
    const media = element.cloneNode(true);

    if (media.tagName === "IMG") {
        // Force browser to consider large resolution
        media.sizes = "100vw";
        media.decoding = "async";
        media.loading = "eager";
    }

    if (media.tagName === "VIDEO") {
        media.controls = true;
        media.pause?.();
    }

    panel.append(media);

    // Create legend if alt or title exists and is non-empty
    const altText = media.alt?.trim();
    const titleText = media.title?.trim();
    const legendText = altText || titleText;

    if (legendText) {
        const legend = document.createElement("div");
        legend.className = "legend";
        legend.textContent = legendText;
        panel.append(legend);
    }

    return panel;
}

function createEmptyPanel() {
    const div = document.createElement('div');
    div.className = 'panel empty';
    return div;
}

function applyPanelClasses(panels) {
    const classes = ['staging-left', 'center', 'staging-right'];

    panels.forEach((panel, i) => {
        if (!panel) return;
        panel.className = 'panel';
        panel.classList.add(classes[i]);
    });
}

let handleGalleryKey = () => void 0;

function keyHandler(e){
    switch (e.key) {
        case "Escape":
            e.preventDefault();
            closeMicroframe();
            break;
        case "Tab":
            e.preventDefault();
            break;
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
            e.preventDefault();
            handleGalleryKey(e.key);
            break;
    }
}

// Graceful microframe close function
function closeMicroframe() {
    document.removeEventListener("keydown", keyHandler);
    // fade out microframe then remove it from dom
    microframe.classList.remove("show");
    microframe.addEventListener("transitionend", () => {microframe.remove();}, {once: true});

    // Restore scroll
    document.body.style.height = "";
    document.body.style.overflow = "";
}

function initGalleryMode(microframe, target){
    const galleryElement = target.closest(".gallery, .media-group");
    const galleryElements = Array.from(galleryElement.querySelectorAll("img, video, .microframe")); 
    let currentIndex = galleryElements.indexOf(target);

    // Add right and left panels in staging
    const displayPanels = [null, null, null];
    displayPanels[1] = microframe.querySelector('.panel.center');
    if (currentIndex - 1 >= 0) {
        displayPanels[0] = createPanel(galleryElements[currentIndex - 1]);
    } else {
        displayPanels[0] = createEmptyPanel();
    }
    microframe.append(displayPanels[0]);
    if (currentIndex + 1 < galleryElements.length) {
        displayPanels[2] = createPanel(galleryElements[currentIndex + 1]);
    } else {
        displayPanels[2] = createEmptyPanel();
    }
    microframe.append(displayPanels[2]);

    applyPanelClasses(displayPanels);

    // Navigation hint
    const hint = document.createElement("div");
    hint.className = "nav-hint";

    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const hintText = isTouch ? "Swipe left/right to navigate" : "Use ← / → to navigate";
    hint.textContent = hintText;
    microframe.appendChild(hint);

    // fade in and auto fade out hint after delay
    requestAnimationFrame(() => hint.classList.add("show"));
    setTimeout(() => hint.classList.remove("show"), 5000);

    // Counter (only in galleries)
    const counter = document.createElement("div");
    counter.className = "counter";
    counter.textContent = `${currentIndex + 1}/${galleryElements.length}`
    microframe.appendChild(counter);

    // fade in counter
    requestAnimationFrame(() => counter.classList.add("show"));

    // Helper function to create the next panel and call for 
    // an animation to show it

    function changePanel(delta) {
        const nextIndex = currentIndex + delta;
        if (nextIndex < 0 || nextIndex >= galleryElements.length) return;
        currentIndex = nextIndex;

        if (delta === 1) {
            // moving left -> shift window right
            displayPanels.shift()?.remove();
            displayPanels.push(
            galleryElements[currentIndex + 1]
                ? createPanel(galleryElements[currentIndex + 1])
                : createEmptyPanel()
            );
            microframe.append(displayPanels[2]);
        } else {
            // moving right -> shift window left
            displayPanels.pop()?.remove();
            displayPanels.unshift(
            galleryElements[currentIndex - 1]
                ? createPanel(galleryElements[currentIndex - 1])
                : createEmptyPanel()
            );
            microframe.append(displayPanels[0]);
        }
        
        applyPanelClasses(displayPanels);

        const positions = ['staging-left', 'center', 'staging-right'];
        displayPanels.forEach((panel, i) => {
            panel.className = 'panel';
            panel.classList.add(positions[i]);
        });

        // Hide nav hint if still shown and update counter
        if (hint) {
            requestAnimationFrame(() => hint.classList.remove("show"));
        }
        counter.textContent = `${currentIndex + 1}/${galleryElements.length}`;
    }

    // Event Handling
    // Keyboard events : Esc, Left & Right Arrow
    handleGalleryKey = function(key) {
        if (key === "ArrowRight") changePanel(1);
        if (key === "ArrowLeft") changePanel(-1);
    }

    // Swipe events on mobile
    let startX = 0, startY = 0;

    microframe.addEventListener(
        "touchstart", 
        e => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
        },
    );

    microframe.addEventListener("touchend", e => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) {changePanel(1)} else {changePanel(-1)}
        }
    });

}

function showMicroframe(media){
    // Prevent multiple microframes
    if (document.getElementById("microframe")) return;

    // Scroll lock
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    // Build overlay structure: dom hierarchy is 
    // microframe       - fullscreen overlay
    //   └── panel      - vertical layout container, centered on screen
    //       ├── img    - current image
    //       └── legend - alt text / caption
    const microframe = document.createElement("div"); 
    microframe.id = "microframe";
    const panel = createPanel(media);
    panel.classList.add("center");
    microframe.appendChild(panel);

    // Detect if media is in a group for gallery mode
    const galleryMode = !!media.closest(".gallery, .media-group");
    if (galleryMode){
        initGalleryMode(microframe, media);
    }

    document.addEventListener("keydown", keyHandler);
    // Click event: close microframe on click
    microframe.addEventListener("click", closeMicroframe);

    // Finally show microframe
    document.body.appendChild(microframe);
    microframe.getBoundingClientRect();
    microframe.classList.add("show");
}

export function initMicroframe() {
    document.addEventListener("click", function (e) {
        const target = e.target.closest("img, video, .microframe");
        if (target && !target.classList.contains("no-microframe")){
            e.preventDefault();
            showMicroframe(target);
        }
    });
}
