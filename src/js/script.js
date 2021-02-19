

// Global vars
const colorDivs = document.querySelectorAll('.color');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy');

// Slider section variables
const adjustBtns = document.querySelectorAll('.controls__adjust');
const closeAdjustBtns = document.querySelectorAll('.color__sliders-close');
const slidersContainers = document.querySelectorAll('.color__sliders');
const lockButtons = document.querySelectorAll('.controls__lock');

// General panel
const generateBtn = document.querySelector('.panel__generate-btn');

// Save to palette and Local Storage
const saveBtn = document.querySelector('.panel__save-btn');
const submitSave = document.querySelector('.save__submit');
const closeSave = document.querySelector('.save__close');
const saveContainer = document.querySelector('.save');
const saveInput = document.querySelector('.save__name');

// Save to library
const libraryContainer = document.querySelector('.library');
const libraryBtn = document.querySelector('.panel__library-btn');
const libraryClose = document.querySelector('.library__close');

// Create Palette Btn


let initialColors;
let localPaletts;


// For local storage 
let savedPalettes = [];


// Event listeners

generateBtn.addEventListener('click', randomColors);

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

adjustBtns.forEach((item, index) => {
    item.addEventListener('click', () => {
        showAdjustmentPanel(index);
    })
});


closeAdjustBtns.forEach((item, index) => {
    item.addEventListener('click', () => {
        closeSliderPanel(index);
    });
});

lockButtons.forEach((item, index) => {
    item.addEventListener('click', () => {
        lockColor(index);
    })
});



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
        const icons = colorDivs[index].querySelectorAll('.controls button');

        //Check if color is locked
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        }else {
            initialColors.push(chroma(randomColor).hex());
        }

       

        

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
    setTimeout(removePopup, 1000);
}

function showAdjustmentPanel(index) {
    slidersContainers[index].classList.toggle('active');
}

function closeSliderPanel (index) {
    slidersContainers[index].classList.remove('active');
}

function lockColor(index) {
    colorDivs[index].classList.toggle('locked');
    lockButtons[index].children[0].classList.toggle('fa-lock-open'); 
    lockButtons[index].children[0].classList.toggle('fa-lock');
}

// Event listener for library
libraryBtn.addEventListener('click', openLibrary);
libraryClose.addEventListener('click', closeLibrary);

// Event listeneres to save functions
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);

function openLibrary() {
    libraryContainer.classList.add('active');
}
function closeLibrary() {
    libraryContainer.classList.remove('active');
}

function openPalette() {
    saveContainer.classList.add('active');  
}

function closePalette() {
    saveContainer.classList.remove('active');
}

function savePalette() {
    const name = saveInput.value;
    const colors = [];

    // Vars for creating palettes
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));

    //Check palettes in LS
    if(paletteObjects) {
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }

    //Creating a palette
    const paletteObj = {name, colors, nr:paletteNr};

    saveContainer.classList.remove('active');
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    // Generate Object
    savedPalettes.push(paletteObj);

    // Save to local Storage
    savetoLocal(paletteObj);
    saveInput.value = '';

    // Genrating Library
    generateLibrary(paletteObj); 
    
}

// Generate library function
function generateLibrary (paletteObj) {
    const palette = document.createElement('div');
    const title = document.createElement('h4');
    const preview = document.createElement('div');

    const paletteBtn = document.createElement('button');

    palette.classList.add('library-popup__palette');
    title.innerText = paletteObj.name;
    preview.classList.add('library-popup__preview');
    paletteObj.colors.forEach(smallColor => {
        const colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = smallColor;
        preview.appendChild(colorDiv);
    });

    paletteBtn.classList.add('library-popup__btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);

    // Pick palette from library
    paletteBtn.addEventListener('click', e => {
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            const text = colorDivs[index].children[0];
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            checkContrast(color, text);
            updateTextUi(index);
        }); 
        closeLibrary();
        resetInput();
    });
}




// Save palette to Local Storage function
function savetoLocal(paletteObj) {
    checkLocal();
    localPaletts.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPaletts));
}

// Chek Local Storage
function checkLocal() {
    if(localStorage.getItem('palettes') === null) {
        localPaletts = [];
    }else {
        localPaletts = JSON.parse(localStorage.getItem('palettes'));
    }
}

function getLocal() {
    if(localStorage.getItem('palettes') === null) {
        localPaletts = [];
    }else {
        paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        paletteObjects.forEach(paletteObj => {
            savedPalettes = [...paletteObjects];
            generateLibrary (paletteObj);
        });
    }
}
getLocal();
randomColors();

