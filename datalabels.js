const inputs = document.querySelectorAll("#options input[data-key]");

inputs.forEach((i) => {
    const output = i.nextElementSibling;
    if (output && output.tagName.toLowerCase() === 'output') {
        output.value = i.value;
    }

    i.addEventListener('input', () => {
        if (output && output.tagName.toLowerCase() === 'output') {
            output.value = i.value;
        }
    });
});