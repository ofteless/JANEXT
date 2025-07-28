function dm() {
    if (styleDM) {
        document.body.removeChild(styleDM);
        dmOn = false;
    } else {
        document.body.appendChild(styleDM);
        dmOn = true;
    }
}


const styleDM = document.createElement('style');
styleDM.textContent = `
body {
color: white;
background-color: black;
}

hr {
color: white
}
`;
