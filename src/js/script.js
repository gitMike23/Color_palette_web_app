

// Global vars
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.panel__generate-btn');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy');

let initialColors;



// Event listeners

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('input', () => {
        updateTextUi(index);
    });
});

currentHexes.forEach(currentHex => {
    currentHex.addEventListener('click', () => {
        copyToClipboard(currentHex);
    });
})


// Functions

function removePopup() {
    popup.classList.remove('active');
}

// Color generator
function generateHex() {

    const hexColor = chroma.random();
    return hexColor;

    // JS method
    /* const letters = "0123456789ABCDEF";
    let hash = "#";

    for(let i = 0; i<6; i++) {
        hash += letters[Math.floor(Math.random() * 16)];
    }
    return hash   */
}

function randomColors() {
    initialColors = [];
    colorDivs.forEach((div,index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        const icons = colorDivs[index].querySelectorAll('.controls button')

        initialColors.push(chroma(randomColor).hex());

        

        // Adding a background and text
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        // Check text contrast
        checkContrast(randomColor, hexText);
        for(icon of icons) {
            checkContrast(randomColor, icon);
        }

        //Initial colorize sliders
        const color = chroma(randomColor);
        const colorSliders = div.querySelectorAll('.color__sliders input');
        const hue = colorSliders[0];
        const brightness = colorSliders[1];
        const saturation = colorSliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });

    //Reset Inputs

    resetInput();
}

function checkContrast(color, text) {
    const luminance = chroma(color).luminance();
    if(luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    // Scale Saturation
    const initSat = color.set('hsl.s', 0); 
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([initSat, color, fullSat]);

    // Scale Brighness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    // Update Input Colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(255, 0, 0), rgb(255, 127, 0), rgb(255, 255, 0), rgb(127, 255, 0), rgb(0, 255,0), rgb(0, 255, 127), rgb(0, 255, 255), rgb(0, 127, 255), rgb(0, 0, 255), rgb(127, 0, 255), rgb(255, 0, 255), rgb(255, 0, 127)`;
}

function hslControls(e) {
    let index = e.target.getAttribute('data-hue') || 
    e.target.getAttribute('data-brightness') || 
    e.target.getAttribute('data-saturation');

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
 
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];
   
    let color = chroma(bgColor).set('hsl.l', brightness.value)
    .set('hsl.h', hue.value)
    .set('hsl.s', saturation.value);

    colorDivs[index].style.backgroundColor = color;

    // Colorize input
    colorizeSliders(color, hue, brightness, saturation);
}


function updateTextUi(index) {
    const activeDiv = colorDivs[index];
    const bgColor = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = bgColor.hex();
    checkContrast(bgColor, textHex);
    for (icon of icons) {
        checkContrast(bgColor, icon);
    }
}


function resetInput() {
    sliders.forEach(slider => {
        switch (slider.name) {
            case 'hue':
                const hueColor = initialColors[slider.getAttribute('data-hue')];
                const hueValue = chroma(hueColor).hsl()[0];
                slider.value = Math.floor(hueValue);
                break;
               
            case 'brightness':
                const brightColor = initialColors[slider.getAttribute('data-brightness')];
                const brightValue = chroma(brightColor).hsl()[2];
                slider.value = Math.floor(brightValue * 100) / 100;            
                break;

            case 'saturation':
                const satColor = initialColors[slider.getAttribute('data-saturation')];
                const satValue = chroma(satColor).hsl()[1];
                slider.value = Math.floor(satValue * 100) / 100;
                break;
           
        }

    });

}

function copyToClipboard(currentHex) {
    const el = document.createElement('textarea');
    el.value = currentHex.innerText;
    document.body.appendChild(el);
    el.select();
    window.navigator.clipboard.writeText(el.value);
    document.body.removeChild(el);

    //Popup animation
    popup.classList.add('active');
    setTimeout(removePopup, 2000);
}

randomColors();

