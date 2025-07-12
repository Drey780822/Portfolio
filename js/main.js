document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  AOS.init({ duration: 1000 });

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const body = document.body;
  const toggleTheme = () => {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun text-2xl"></i>' : '<i class="fas fa-moon text-2xl"></i>';
    themeToggleMobile.innerHTML = isDark ? '<i class="fas fa-sun text-2xl"></i> Theme' : '<i class="fas fa-moon text-2xl"></i> Theme';
  };
  themeToggle.addEventListener('click', toggleTheme);
  themeToggleMobile.addEventListener('click', toggleTheme);

  // Hamburger Menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    hamburger.innerHTML = mobileMenu.classList.contains('hidden') ? '<i class="fas fa-bars text-2xl"></i>' : '<i class="fas fa-times text-2xl"></i>';
  });

  // Initialize Typed.js (only on index.html)
  if (document.getElementById('typed')) {
    const typed = new Typed('#typed', {
      strings: ['Software Developer', 'Mobile Programmer', 'Database Designer', 'Computer Science Enthusiast'],
      
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    });
  }

  // Initialize Swiper (only on projects.html)
  if (document.querySelector('.swiper-container')) {
    const swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          effect: 'slide'
        },
      },
    });
  }

  // EmailJS (only on contact.html)
  if (document.getElementById('contact-form')) {
    emailjs.init('1p9HBSo5fJ6fUKWfx'); // Replace with your EmailJS public key from dashboard
    document.getElementById('contact-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const formStatus = document.getElementById('form-status');
      const submitText = document.getElementById('submit-text');
      const submitSpinner = document.getElementById('submit-spinner');
      
      submitText.classList.add('hide');
      submitSpinner.classList.add('show');
      formStatus.textContent = 'Sending...';
      formStatus.className = 'text-center mt-4 text-teal-500';

      emailjs.sendForm('service_myxkzgt', 'template_oypxfhg', this)
        .then(() => {
          formStatus.textContent = 'Message sent successfully!';
          formStatus.className = 'text-center mt-4 text-teal-500';
          this.reset();
          submitText.classList.remove('hide');
          submitSpinner.classList.remove('show');
        }, (error) => {
          formStatus.textContent = 'Failed to send message. Please check your EmailJS setup or try again later.';
          formStatus.className = 'text-center mt-4 text-red-500';
          console.error('EmailJS error:', error);
          submitText.classList.remove('hide');
          submitSpinner.classList.remove('show');
        });
    });
  }

  // Back to Top Button
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});