const inputs = document.querySelectorAll("#options input[data-key]");

inputs.forEach((input) => {
  const output = input.nextElementSibling;
  
  if (output && output.tagName.toLowerCase() === 'output') {
    output.textContent = input.value;
    
    output.tabIndex = 0;
    output.style.cursor = 'text';
    
    input.addEventListener('input', () => {
      output.textContent = input.value;
    });
    
    output.addEventListener('click', handleOutputEdit);
    output.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOutputEdit.call(output, e);
      }
    });
  }
  
  function handleOutputEdit(e) {
    const currentValue = input.value;
    const newValue = prompt('Enter new value:', currentValue);
    
    if (newValue !== null) {
      // Validate input
      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && numValue >= input.min && numValue <= input.max) {
        input.value = numValue;
        output.textContent = numValue;
        // Dispatch input event to trigger any listeners
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        alert(`Please enter a value between ${input.min} and ${input.max}`);
      }
    }
  }
});