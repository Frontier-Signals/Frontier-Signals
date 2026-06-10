const hamburger = document.querySelector('.hamburger');
        const navContainer = document.getElementById('nav-container');
        const navElement = hamburger ? hamburger.closest('nav') : null;

        function toggleMenu() {
            if (!navContainer && !navElement) return;
            // open/close entire container instead of each list
            if (navContainer) navContainer.classList.toggle('open');
            if (navElement) navElement.classList.toggle('open');
            // update ARIA attribute for accessibility
            const expanded = hamburger && hamburger.getAttribute('aria-expanded') === 'true';
            if (hamburger) hamburger.setAttribute('aria-expanded', (!expanded).toString());
        }

        if (hamburger) {
            hamburger.addEventListener('click', toggleMenu);
            // also allow keyboard activation
            hamburger.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMenu();
                }
            });
        }
				// === JS for Collapsible Menus ===
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
    // Wait for transition to complete, then update parent heights
    setTimeout(() => {
      var parent = content.parentElement;
      while (parent) {
        if (parent.classList && parent.classList.contains('content')) {
          var parentButton = parent.previousElementSibling;
          if (parentButton && parentButton.classList.contains('collapsible') && parentButton.classList.contains('active')) {
            parent.style.maxHeight = parent.scrollHeight + "px";
          }
          parent = parent.parentElement;
        } else {
          parent = parent.parentElement;
        }
      }
    }, 350); // Match the 0.4s transition time from CSS (400ms), use 350 to be safe
  });
}

// Add mobile card labels to data tables from their column headers.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        if (!headers.length) return;
        table.classList.add('data-table');
        table.querySelectorAll('tbody tr').forEach(row => {
            Array.from(row.children).forEach((cell, index) => {
                if (!cell.hasAttribute('data-label')) {
                    cell.setAttribute('data-label', headers[index] || '');
                }
            });
        });
    });
});

// ===== Lazy-load images on narrow screens =====
function enableLazyImages() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
}

window.addEventListener('load', enableLazyImages);
window.addEventListener('resize', enableLazyImages);

// ===== Lightbox for clickable images =====
(function() {
    // create overlay element
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', e => {
        // only close if background (not inner image) is clicked
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    document.querySelectorAll('img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', e => {
            e.stopPropagation(); // prevent bubbling to lightbox
            // skip if image already inside lightbox
            if (img.closest('#lightbox')) return;
            const imgClone = document.createElement('img');
            imgClone.src = img.src;
            while (lightbox.firstChild) lightbox.removeChild(lightbox.firstChild);
            lightbox.appendChild(imgClone);
            lightbox.classList.add('active');
        });
    });
})();
