const PRESETS = {
  default: {
    "--slide-duration": "0.3s",
    "--panel-offset-x": "50vw",
    "--panel-offset-y": "0%",
    "--panel-scale": "0.8",
    "--panel-rot": "0deg",
    "--panel-tilt": "0deg"
  },
  rotation: {
    "--slide-duration": "1s",
    "--panel-offset-x": "30vw",
    "--panel-offset-y": "20%",
    "--panel-scale": "0.8",
    "--panel-rot": "20deg",
    "--panel-tilt": "0deg"
  },
  rotation3d: {
    "--slide-duration": "1s",
    "--panel-offset-x": "30vw",
    "--panel-offset-y": "20%",
    "--panel-scale": "0.8",
    "--panel-rot": "15deg",
    "--panel-tilt": "60deg"
  },
  coverflow: {
    "--slide-duration": "1s",
    "--panel-offset-x": "30vw",
    "--panel-offset-y": "0%",
    "--panel-scale": "1.2",
    "--panel-rot": "0deg",
    "--panel-tilt": "70deg"
  },
  crazy: {
    "--slide-duration": "1.5s",
    "--panel-offset-x": "50vw",
    "--panel-offset-y": "50%",
    "--panel-scale": "0",
    "--panel-rot": "180deg",
    "--panel-tilt": "90deg"
  }
};

// Apply CSS styling override to the page and updates textarea
function updateDemo(vars) {
  let styleContent = '#microframe {\n';
  let textareaContent = '#microframe {\n';

  for (const [name, value] of Object.entries(vars)) {
    const line = `    ${name}: ${value};`;
    styleContent += line + ' ';
    textareaContent += line + '\n';
  }

  styleContent += '}';
  textareaContent += '}';

  document.getElementById("microframe-demo-override").textContent = styleContent;
  document.querySelector('.css-editor').value = textareaContent;
}

// Return proper unit for the variable
function getUnit(varName) {
  if (varName.includes('duration')) return 's';
  if (varName.includes('offset-x') || varName.includes('offset-y')) return varName.includes('y') ? '%' : 'vw';
  if (varName.includes('scale')) return '';
  if (varName.includes('rot') || varName.includes('tilt')) return 'deg';
  return '';
}

const styleEl = document.createElement("style");
styleEl.id = "microframe-demo-override";
document.head.appendChild(styleEl);

const variableInputs = document.querySelectorAll('.variable-inputs input');
const demoVars = {};

// Listen for changes on each input
variableInputs.forEach(input => {
  const varName = input.dataset.var;
  demoVars[varName] = input.value + getUnit(varName); // Initial state

  // Listen for changes
  input.addEventListener('input', () => {
    demoVars[varName] = input.value + getUnit(varName);
    updateDemo(demoVars);
  });
});

// Listen for change on preset buttons
document.querySelectorAll('.preset-buttons button').forEach(button => {
  button.addEventListener('click', () => {
    const presetName = button.dataset.preset;
    if (!(presetName in PRESETS)) return;

    const presetVars = PRESETS[presetName];

    // Update demoVars and inputs
    Object.entries(presetVars).forEach(([name, value]) => {
      demoVars[name] = value;

      const input = document.querySelector(`.variable-inputs input[data-var="${name}"]`);
      if (input) {
        // Strip units for the input field
        input.value = parseFloat(value);
      }
    });

    // Apply changes
    updateDemo(demoVars);
  });
});


// Initial update
updateDemo(demoVars);
