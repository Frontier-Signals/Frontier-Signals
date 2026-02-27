const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
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