// Utility function for smooth scrolling to contact section
export const scrollToContact = (e?: React.MouseEvent) => {
  if (e) {
    e.preventDefault();
  }
  
  // Check if we're on the home page
  if (window.location.pathname === '/') {
    // If on home page, scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  } else {
    // If on another page, navigate to home page with contact hash
    // First navigate to home page, then scroll after a short delay
    window.location.href = '/';
    
    // Set a flag in sessionStorage to scroll to contact after page load
    sessionStorage.setItem('scrollToContact', 'true');
  }
}; 