// Utility function for smooth scrolling to contact section
export const scrollToContact = (e?: React.MouseEvent) => {
  if (e) {
    e.preventDefault();
  }
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}; 