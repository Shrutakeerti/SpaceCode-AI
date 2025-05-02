document.addEventListener("DOMContentLoaded", function () {
  // Initialize particles.js
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 0.5,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 2,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: false,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "bubble",
          },
          onclick: {
            enable: true,
            mode: "repulse",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 150,
            size: 4,
            duration: 2,
            opacity: 0.8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });

    // Create occasional shooting stars
    createShootingStars();
  } else {
    console.warn("particles.js library not loaded");
  }
});

/**
 * Creates shooting stars animation effects on the page
 */
function createShootingStars() {
  const style = document.createElement("style");
  style.textContent = `
        .shooting-star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: linear-gradient(45deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            opacity: 0;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
            box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.8);
            animation: shooting 3s linear forwards;
        }
        
        @keyframes shooting {
            0% {
                transform: translate(0, 0) rotate(-45deg) scale(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
                transform: translate(20px, 20px) rotate(-45deg) scale(1);
            }
            100% {
                transform: translate(300px, 300px) rotate(-45deg) scale(0.2);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);

  // Create shooting stars at random intervals
  setInterval(() => {
    const star = document.createElement("div");
    star.classList.add("shooting-star");

    // Random position at the top of the viewport
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * (window.innerHeight * 0.3); // Top third of screen

    star.style.left = startX + "px";
    star.style.top = startY + "px";

    // Random movement direction using transform
    const angle = Math.random() * 30 + 30; // 30-60 degrees
    star.style.transform = `rotate(${angle}deg)`;

    // Random size
    const size = Math.random() * 3 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";

    // Random duration
    const duration = Math.random() * 2 + 1; // 1-3 seconds
    star.style.animationDuration = duration + "s";

    document.body.appendChild(star);

    // Remove after animation completes
    setTimeout(() => {
      star.remove();
    }, duration * 1000);
  }, 5000); // Create a new star every 5 seconds
}
