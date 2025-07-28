const styleDM = document.createElement('style');
styleDM.textContent = `
body {
    color: white;
    background-color: black;
}

hr {
    color: white;
}
`;

let dmOn = localStorage.getItem('darkMode') === 'true';

if (dmOn) {
    document.body.appendChild(styleDM);
}

function dm() {
    if (dmOn) {
        document.body.removeChild(styleDM);
        dmOn = false;
        localStorage.setItem('darkMode', 'false');
    } else {
        document.body.appendChild(styleDM);
        dmOn = true;
        localStorage.setItem('darkMode', 'true');
    }
}

const dmButton = document.getElementById('dm');
if (dmButton) {
    dmButton.addEventListener("click", dm);
}