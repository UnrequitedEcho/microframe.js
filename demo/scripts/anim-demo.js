const PRESETS = {
  default: `#microframe {
  --slide-duration: 0.3s;
  --panel-offset-x: 50vw;
  --panel-offset-y: 0%;
  --panel-scale: 0.8;
  --panel-rot: 0deg;
  --panel-tilt: 0deg;
}`,

  rotation: `#microframe {
  --slide-duration: 1s;
  --panel-offset-x: 30vw;
  --panel-offset-y: 20%;
  --panel-scale: 0.8;
  --panel-rot: 20deg;
  --panel-tilt: 0deg;
}`,

  rotation3d: `#microframe {
  --slide-duration: 1s;
  --panel-offset-x: 30vw;
  --panel-offset-y: 20%;
  --panel-scale: 0.8;
  --panel-rot: 15deg;
  --panel-tilt: 60deg;
}`,

  coverflow: `#microframe {
  --slide-duration: 1s;
  --panel-offset-x: 30vw;
  --panel-offset-y: 0%;
  --panel-scale: 1.2;
  --panel-rot: 0deg;
  --panel-tilt: 70deg;
}`,

  crazy: `#microframe {
  --slide-duration: 1.5s;
  --panel-offset-x: 50vw;
  --panel-offset-y: 50%;
  --panel-scale: 0;
  --panel-rot: 360deg;
  --panel-tilt: 90deg;
}`
};

const styleEl = document.createElement("style");
styleEl.id = "microframe-demo-override";
document.head.appendChild(styleEl);

function applyDemoVars(vars) {
    const cssVars = Object.entries(vars)
        .map(([name, value]) => `${name}: ${value};`)
        .join(" ");
    document.getElementById("microframe-demo-override").textContent = `
        #microframe {
            ${cssVars}
        }
    `;
}

function parseVariables(cssText) {
  const vars = {};
  const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(cssText))) {
    vars[`--${match[1]}`] = match[2].trim();
  }
  return vars;
}

const editor = document.querySelector(".css-editor");
const presetButtons = document.querySelectorAll(".preset-buttons button");

presetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const preset = btn.dataset.preset;
    if (PRESETS[preset]) {
      editor.value = PRESETS[preset];
    }
    applyDemoVars(parseVariables(editor.value));
  });
});


editor.addEventListener("input", () => {
  applyDemoVars(parseVariables(editor.value));
});
