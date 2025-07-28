function saveState(accordionId, isOpen) {
  localStorage.setItem(`accordion-${accordionId}`, isOpen.toString());
}

function loadAccordionState(accordionId) {
  const state = localStorage.getItem(`accordion-${accordionId}`);
  return state === 'true';
}

document.addEventListener('DOMContentLoaded', function() {
  const accordions = document.querySelectorAll('details');
  
  accordions.forEach(accordion => {
    const accordionId = accordion.id;
    
    // load & set
    const shouldOpen = loadAccordionState(accordionId);
    if (shouldOpen) {
      accordion.open = true;
    }
    
    accordion.addEventListener('toggle', function() {
      saveState(accordionId, this.open);
    });
  });
});