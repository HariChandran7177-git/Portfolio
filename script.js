document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Three.js Premium 3D Background
    const initThreeBackground = () => {
        const canvas = document.querySelector('#bg-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
            // Mix of White, Golden, and Orange particles
            const rand = Math.random();
            if (rand > 0.9) { // Orange
                colors[i] = 1.0; colors[i+1] = 0.415; colors[i+2] = 0.0;
            } else if (rand > 0.75) { // Golden
                colors[i] = 0.831; colors[i+1] = 0.686; colors[i+2] = 0.216;
            } else { // White
                colors[i] = 1.0; colors[i+1] = 1.0; colors[i+2] = 1.0;
            }
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        camera.position.z = 3;

        // Mouse Interaction
        let mouseX = 0;
        let mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
        });

        // Animation Loop
        const clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            particles.rotation.y = elapsedTime * 0.05;
            particles.rotation.x = elapsedTime * 0.02;

            // Smooth mouse follow
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    };

    initThreeBackground();

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Intersection Observer for Reveal Animations
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing after reveal
                // revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Consolidated Scroll State (Navbar + Section Tracker)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const trackerDots = document.querySelectorAll('.tracker-dot');

    const updateScrollStates = () => {
        let current = "";
        const threshold = window.innerHeight * 0.4;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= threshold) {
                current = section.getAttribute('id');
            }
        });

        // Update Navbar
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Update Tracker Dots
        trackerDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.dataset.section === current) {
                dot.classList.add('active');
                dot.classList.add('visited');
            }
        });
    };

    lenis.on('scroll', updateScrollStates);
    // Initial call
    updateScrollStates();

    // 4. Smooth Anchor Scrolling (using Lenis)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            
            // Only target internal anchor links
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    lenis.scrollTo(targetElement, {
                        offset: -68, // Account for navbar height
                        duration: 1.5
                    });
                }
            }
        });
    });

    // 5. Skill Tags Repulsion Effect
    const skillsSection = document.getElementById('skills');
    const skillTags = document.querySelectorAll('.skill-tag');

    if (skillsSection && skillTags.length > 0) {
        skillsSection.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            skillTags.forEach(tag => {
                const rect = tag.getBoundingClientRect();
                const tagCenterX = rect.left + rect.width / 2;
                const tagCenterY = rect.top + rect.height / 2;

                const dx = mouseX - tagCenterX;
                const dy = mouseY - tagCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const radius = 80;

                if (distance < radius) {
                    const strength = (radius - distance) / radius;
                    const pushX = -dx * strength * 0.4;
                    const pushY = -dy * strength * 0.4;
                    
                    tag.style.transform = `translate(${pushX}px, ${pushY}px) scale(1.05)`;
                    tag.style.borderColor = 'var(--accent)';
                    tag.style.opacity = '1';
                } else {
                    tag.style.transform = 'translate(0, 0) scale(1)';
                    tag.style.borderColor = '';
                    tag.style.opacity = '';
                }
            });
        });

        skillsSection.addEventListener('mouseleave', () => {
            skillTags.forEach(tag => {
                tag.style.transform = 'translate(0, 0) scale(1)';
                tag.style.borderColor = '';
                tag.style.opacity = '';
            });
        });
    }

    // 6. Theme Switcher (Light / Dark Mode)
    const themeBtn = document.querySelector('.theme-toggle-btn');
    
    const applyTheme = (theme) => {
        const icon = themeBtn ? themeBtn.querySelector('i') : null;
        if (theme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            if (icon) icon.className = 'fa-solid fa-sun';
        } else {
            document.body.removeAttribute('data-theme');
            if (icon) icon.className = 'fa-solid fa-moon';
        }
    };

    const toggleTheme = () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // 7. Terminal Easter Egg (Ctrl + `)
    const terminal = document.getElementById('terminal-overlay');
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');

    const toggleTerminal = (e) => {
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            terminal.style.display = terminal.style.display === 'block' ? 'none' : 'block';
            if (terminal.style.display === 'block') termInput.focus();
        }
        if (e.key === 'Escape' && terminal.style.display === 'block') {
            terminal.style.display = 'none';
        }
    };
    window.addEventListener('keydown', toggleTerminal);

    const commands = {
        help: "AVAILABLE COMMANDS: help, whoami, skills, projects, contact, certification, clear, exit",
        whoami: "G. HARI CHANDRAN — CSE ENGINEER @ LPU PUNJAB. CODE. ANALYZE. PERFORM.",
        skills: "TECH STACK: C++, PYTHON, JS, ML, DSA, DBMS, WEB DEV.",
        projects: "PROJECTS: 1. SMART RECOVERY SYSTEM (AI) 2. ECG ANOMALY DETECTION (ML). GITHUB: github.com/HariChandran7177",
        contact: "EMAIL: grandhiharichandran@gmail.com | LI: in/harichandrangrandhi",
        certification: "CERTIFICATIONS: Google Networking, UAB Digital Systems, Google Tech Support.",
        exit: () => { terminal.style.display = 'none'; return "LOGGING OUT..."; },
        clear: () => { termOutput.innerHTML = ''; return ""; }
    };

    const typeTerminal = (text, callback) => {
        let i = 0;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        termOutput.appendChild(line);
        const interval = setInterval(() => {
            line.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (callback) callback();
                termOutput.scrollTop = termOutput.scrollHeight;
            }
        }, 15);
    };

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.toLowerCase().trim();
            termInput.value = '';
            const line = document.createElement('div');
            line.innerHTML = `<span class="prompt">hc@portfolio:~$</span> ${cmd}`;
            termOutput.appendChild(line);
            if (commands[cmd]) {
                const result = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
                if (result) typeTerminal(result);
            } else if (cmd !== '') {
                typeTerminal(`COMMAND NOT FOUND: ${cmd}. TYPE 'HELP' FOR LIST.`);
            }
        }
    });

    // 8. Typewriter Tagline
    const taglineEl = document.querySelector('.hero-tagline span');
    const taglineParent = document.querySelector('.hero-tagline');
    if (taglineEl && taglineParent) {
        const phrases = JSON.parse(taglineParent.dataset.phrases);
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        const typeTagline = () => {
            const current = phrases[phraseIdx];
            if (isDeleting) {
                taglineEl.textContent = current.substring(0, charIdx--);
            } else {
                taglineEl.textContent = current.substring(0, charIdx++);
            }
            let speed = isDeleting ? 40 : 80;
            if (!isDeleting && charIdx === current.length + 1) {
                speed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                speed = 500;
            }
            setTimeout(typeTagline, speed);
        };
        typeTagline();
    }

    // 9. Animated Counters
    const statCounters = document.querySelectorAll('.stat-num');
    const animateCounter = (el) => {
        const target = parseFloat(el.dataset.target);
        if (isNaN(target)) return;
        el.classList.add('counted');
        let current = 0;
        const duration = 2000;
        const start = performance.now();
        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            current = ease * target;
            if (target % 1 !== 0) {
                el.textContent = current.toFixed(2);
            } else {
                el.textContent = Math.floor(current) + (target > 10 ? '+' : '');
            }
            if (progress < 1) requestAnimationFrame(update);
            else {
                el.style.color = 'var(--accent)';
                setTimeout(() => el.style.color = '', 500);
            }
        };
        requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.1 });
    statCounters.forEach(c => counterObserver.observe(c));

    // 10. 3D Project Card Tilt
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        const shine = card.querySelector('.card-shine');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;
            
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            
            if (shine) {
                shine.style.opacity = '0.15';
                shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2), transparent 70%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(800px) rotateX(0) rotateY(0) scale(1)`;
            if (shine) shine.style.opacity = '0';
        });
    });

    // 11. Certificate Flip Cards
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // 12. Interactive Skills Radar Chart (Canvas)
    const initRadarChart = () => {
        const canvas = document.getElementById('skill-radar');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const parent = canvas.parentElement;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        ctx.scale(dpr, dpr);

        const centerX = parent.clientWidth / 2;
        const centerY = parent.clientHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.8;

        const data = [
            { label: "FRONTEND", value: 0.65 },
            { label: "BACKEND", value: 0.60 },
            { label: "ML / AI", value: 0.75 },
            { label: "TOOLS", value: 0.70 },
            { label: "DSA", value: 0.72 },
            { label: "SOFT SKILLS", value: 0.85 }
        ];

        let animationProgress = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Grid
            ctx.strokeStyle = '#1e1e1e';
            ctx.lineWidth = 1;
            for (let j = 1; j <= 4; j++) {
                ctx.beginPath();
                const r = radius * (j / 4);
                for (let i = 0; i < data.length; i++) {
                    const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
                    const x = centerX + Math.cos(angle) * r;
                    const y = centerY + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            }

            // Draw Data Polygon
            ctx.beginPath();
            ctx.strokeStyle = '#d4af37';
            ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
            ctx.lineWidth = 2;

            data.forEach((d, i) => {
                const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
                const r = radius * d.value * animationProgress;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw Labels
            ctx.fillStyle = '#666';
            ctx.font = '10px DM Sans';
            ctx.textAlign = 'center';
            data.forEach((d, i) => {
                const angle = (Math.PI * 2 / data.length) * i - Math.PI / 2;
                const x = centerX + Math.cos(angle) * (radius + 25);
                const y = centerY + Math.sin(angle) * (radius + 25);
                ctx.fillText(d.label, x, y);
            });

            if (animationProgress < 1) {
                animationProgress += 0.02;
                requestAnimationFrame(draw);
            }
        };

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) draw();
        });
        observer.observe(canvas);
    };

    initRadarChart();

    // 13. Section Progress Tracker (Handled in consolidated scroll state #3)

    trackerDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = document.getElementById(dot.dataset.section);
            if (target) {
                lenis.scrollTo(target, { offset: -68 });
            }
        });
    });

    // 14. Contact Form Handler (Restored)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.innerText;
            btn.innerText = "MESSAGE SENT";
            btn.style.background = "var(--text-primary)";
            btn.style.color = "var(--bg-primary)";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.color = "";
                contactForm.reset();
            }, 3000);
        });
    }

    // 16. Certificates Animation
    const certList = document.querySelector('.cert-list');
    if (certList) {
        gsap.from('.cert-card', {
            scrollTrigger: {
                trigger: certList,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out"
        });
    }

    // 17. Hero Parallax Starfield
    const initStarfield = () => {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const hero = canvas.parentElement;

        const resize = () => {
            canvas.width = hero.clientWidth;
            canvas.height = hero.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const layers = [
            { count: 120, size: 0.8, speed: 0.05, opacity: 0.3 }, // far
            { count: 60, size: 1.2, speed: 0.1, opacity: 0.5 },  // mid
            { count: 30, size: 1.8, speed: 0.2, opacity: 0.7 }   // near
        ];

        const stars = [];
        layers.forEach((layer, lIdx) => {
            for (let i = 0; i < layer.count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: layer.size,
                    speed: layer.speed,
                    opacity: layer.opacity,
                    baseOpacity: layer.opacity,
                    layerIdx: lIdx,
                    twinkleIdx: Math.random() * 10
                });
            }
        });

        let mouseX = 0;
        let mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.01;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.01;
        });

        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scrollShift = window.scrollY;

            stars.forEach(star => {
                const sIdx = star.layerIdx;
                const layerShiftY = scrollShift * star.speed;
                const layerShiftX = mouseX * (sIdx + 1);

                star.opacity = star.baseOpacity * (0.5 + 0.5 * Math.sin(Date.now() * 0.002 + star.twinkleIdx));

                ctx.beginPath();
                ctx.fillStyle = `rgba(212, 175, 55, ${star.opacity})`;
                
                let xPos = (star.x + layerShiftX) % canvas.width;
                if (xPos < 0) xPos += canvas.width;
                
                let yPos = (star.y - layerShiftY) % canvas.height;
                if (yPos < 0) yPos += canvas.height;

                ctx.arc(xPos, yPos, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(drawStars);
        };

        drawStars();
    };

    initStarfield();

});
