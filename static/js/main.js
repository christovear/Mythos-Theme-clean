/*!
 * Mythos Theme for Micro.blog - JavaScript
 * Author: Matt Langford | https://mattlangford.com
 * Repository: https://github.com/mattlangford/mythos-theme
 * License: MIT License
 */

(function() {
    'use strict';

    async function copyToClipboard(text, onCopied) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            onCopied();
            return;
        }

        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            if (!document.execCommand('copy')) {
                throw new Error('Copy command was rejected');
            }
            onCopied();
        } finally {
            textArea.remove();
        }
    }

    function initThemeToggle() {
        const toggle = document.querySelector('.theme-toggle');
        if (!toggle) return;

        const root = document.documentElement;
        const themeColor = document.getElementById('theme-color');

        function updateToggle() {
            const isDark = root.getAttribute('data-theme') === 'dark';
            const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
            toggle.setAttribute('aria-pressed', String(isDark));
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
            if (themeColor) themeColor.setAttribute('content', isDark ? '#111517' : '#ffffff');
        }

        toggle.addEventListener('click', function() {
            const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', nextTheme);
            try { localStorage.setItem('site-theme', nextTheme); } catch (error) {}
            updateToggle();
        });

        updateToggle();
    }
    
    // Mobile menu toggle functionality
    function initMobileMenu() {
        // Enable JavaScript enhancement - hide CSS-only version
        document.documentElement.classList.add('js-enabled');
        
        const menuToggle = document.querySelector('.js-menu-toggle');
        const primaryMenu = document.querySelector('.primary-menu');
        const menuBackdrop = document.querySelector('.menu-backdrop');
        const cssToggleInput = document.querySelector('.menu-toggle-input');
        
        if (!menuToggle || !primaryMenu) return;
        
        // Show the JS menu toggle, hide CSS-only version
        menuToggle.style.display = 'flex';
        if (cssToggleInput) {
            cssToggleInput.style.display = 'none';
        }
        
        // Set up navigation overflow
        initNavigationOverflow();
        
        function openMenu() {
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Close main navigation menu');
            primaryMenu.classList.add('active');
            if (menuBackdrop) menuBackdrop.classList.add('active');
        }

        function closeMenu() {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open main navigation menu');
            primaryMenu.classList.remove('active');
            if (menuBackdrop) menuBackdrop.classList.remove('active');
        }
        
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close menu when clicking backdrop
        if (menuBackdrop) {
            menuBackdrop.addEventListener('click', closeMenu);
        }
        
        // Close menu when clicking outside (but not on backdrop - handled above)
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !primaryMenu.contains(e.target) && 
                (!menuBackdrop || !menuBackdrop.contains(e.target))) {
                closeMenu();
            }
        });
        
        // Close menu when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMenu();
                menuToggle.focus();
            }
        });
        
        // Close menu when window is resized (in case user rotates device)
        window.addEventListener('resize', closeMenu);
    }
    
    
    // Navigation overflow handling for 7+ menu items
    function initNavigationOverflow() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        const navItems = navMenu.querySelectorAll('.nav-item');
        
        // Add scrollable class if 7+ navigation items
        if (navItems.length >= 7) {
            navMenu.classList.add('scrollable');
            
            // Handle scroll-to-bottom detection for fade gradient
            navMenu.addEventListener('scroll', function() {
                const isScrolledToBottom = navMenu.scrollTop + navMenu.clientHeight >= navMenu.scrollHeight - 5;
                navMenu.classList.toggle('scrolled-to-bottom', isScrolledToBottom);
            });
        }
    }
    
    
    // Code block copy functionality
    function initCodeCopy() {
        const codeBlocks = document.querySelectorAll('pre');
        
        codeBlocks.forEach(function(pre) {
            const code = pre.querySelector('code');
            const copyText = (code || pre).textContent;
            const button = document.createElement('button');
            button.className = 'code-copy-button';
            button.textContent = 'Copy';
            button.setAttribute('aria-label', 'Copy code to clipboard');
            
            button.addEventListener('click', async function() {
                try {
                    await copyToClipboard(copyText, function() {
                        showCopiedFeedback(button);
                    });
                } catch (err) {
                    console.error('Failed to copy code:', err);
                }
            });
            
            pre.appendChild(button);
        });
        
        function showCopiedFeedback(button) {
            button.textContent = 'Copied!';
            button.setAttribute('aria-label', 'Code copied to clipboard');
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = 'Copy';
                button.setAttribute('aria-label', 'Copy code to clipboard');
                button.classList.remove('copied');
            }, 2000);
        }
    }
    
    // Copy link button functionality
    function initCopyLinkButtons() {
        const copyButtons = document.querySelectorAll('.copy-link-button');
        
        copyButtons.forEach(function(copyButton) {
            const url = copyButton.dataset.url;
            const copiedText = copyButton.dataset.copiedText;
            
            copyButton.addEventListener('click', async function() {
                try {
                    await copyToClipboard(url, function() {
                        showCopiedFeedback(copyButton, copiedText);
                    });
                } catch (err) {
                    console.error('Failed to copy link:', err);
                }
            });
        });
        
        function showCopiedFeedback(button, copiedText) {
            const originalText = button.innerHTML;
            button.innerHTML = copiedText;
            button.classList.add('copied');
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('copied');
                button.disabled = false;
            }, 2000);
        }
    }

    // Accessible, caption-free photo viewer for post and collection images
    function initPhotoFocus() {
        const imageSelector = '.post-content img, .microblog_collection img, .photos-grid-container img';
        const allImages = Array.from(document.querySelectorAll(imageSelector));
        const imageLinkPattern = /\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i;

        function getPhotoItem(image) {
            if (image.classList.contains('no-photo-focus') || image.dataset.photoFocus === 'off') return null;

            const link = image.closest('a[href]');
            const isCollectionImage = Boolean(image.closest('.microblog_collection, .photos-grid-container'));
            const hasExplicitSource = Boolean(image.dataset.photoFocusSrc);
            const opensAnImage = link && imageLinkPattern.test(link.href);

            // Preserve ordinary linked-image behavior outside photo collections.
            if (link && !isCollectionImage && !hasExplicitSource && !opensAnImage) return null;

            return {
                image: image,
                trigger: link || image
            };
        }

        const photoItems = allImages.map(getPhotoItem).filter(Boolean);
        if (!photoItems.length) return;

        const modal = document.createElement('div');
        modal.className = 'photo-focus';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Photo viewer');
        modal.innerHTML = [
            '<button class="photo-focus-close" type="button" aria-label="Close photo viewer">&times;</button>',
            '<button class="photo-focus-previous" type="button" aria-label="View previous photo">&#8249;</button>',
            '<div class="photo-focus-stage">',
                '<img class="photo-focus-image" alt="">',
            '</div>',
            '<button class="photo-focus-next" type="button" aria-label="View next photo">&#8250;</button>',
            '<span class="photo-focus-status" aria-live="polite"></span>'
        ].join('');
        document.body.appendChild(modal);

        const viewerImage = modal.querySelector('.photo-focus-image');
        const closeButton = modal.querySelector('.photo-focus-close');
        const previousButton = modal.querySelector('.photo-focus-previous');
        const nextButton = modal.querySelector('.photo-focus-next');
        const status = modal.querySelector('.photo-focus-status');
        let group = [];
        let currentIndex = 0;
        let previouslyFocused = null;
        let touchStartX = 0;
        let touchStartY = 0;
        let backgroundState = [];

        function getGroup(item) {
            const image = item.image;
            const collection = image.closest('.microblog_collection, .photos-grid-container');
            const container = collection || image.closest('.post-item, .post') || image.parentElement;
            return photoItems.filter(function(candidate) {
                const candidateImage = candidate.image;
                const candidateCollection = candidateImage.closest('.microblog_collection, .photos-grid-container');
                const candidateContainer = candidateCollection || candidateImage.closest('.post-item, .post') || candidateImage.parentElement;
                return candidateContainer === container;
            });
        }

        function getSource(image) {
            const imageLink = image.closest('a[href]');
            if (image.dataset.photoFocusSrc) return image.dataset.photoFocusSrc;
            if (imageLink && (imageLinkPattern.test(imageLink.href) || image.closest('.microblog_collection, .photos-grid-container'))) {
                return imageLink.href;
            }
            return image.currentSrc || image.src;
        }

        function show(index) {
            if (!group.length) return;
            currentIndex = (index + group.length) % group.length;
            const sourceImage = group[currentIndex].image;
            viewerImage.src = getSource(sourceImage);
            viewerImage.alt = sourceImage.alt || '';

            const hasMultiple = group.length > 1;
            previousButton.hidden = !hasMultiple;
            nextButton.hidden = !hasMultiple;
            status.textContent = hasMultiple ? 'Photo ' + (currentIndex + 1) + ' of ' + group.length : '';
        }

        function setBackgroundInert(isInert) {
            if (!('inert' in HTMLElement.prototype)) return;

            if (isInert) {
                backgroundState = Array.from(document.body.children).filter(function(element) {
                    return element !== modal;
                }).map(function(element) {
                    const state = { element: element, wasInert: element.inert };
                    element.inert = true;
                    return state;
                });
                return;
            }

            backgroundState.forEach(function(state) {
                state.element.inert = state.wasInert;
            });
            backgroundState = [];
        }

        function open(item) {
            group = getGroup(item);
            previouslyFocused = document.activeElement;
            modal.hidden = false;
            document.body.classList.add('photo-focus-open');
            setBackgroundInert(true);
            show(group.indexOf(item));
            closeButton.focus();
        }

        function close() {
            if (modal.hidden) return;
            modal.hidden = true;
            viewerImage.removeAttribute('src');
            document.body.classList.remove('photo-focus-open');
            setBackgroundInert(false);
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
        }

        function previous() {
            show(currentIndex - 1);
        }

        function next() {
            show(currentIndex + 1);
        }

        const registeredTriggers = new Set();

        photoItems.forEach(function(item) {
            const image = item.image;
            const trigger = item.trigger;
            if (registeredTriggers.has(trigger)) return;
            registeredTriggers.add(trigger);

            const description = image.alt ? ': ' + image.alt : '';
            trigger.classList.add('photo-focus-trigger');
            trigger.setAttribute('aria-haspopup', 'dialog');
            if (!trigger.getAttribute('aria-label')) trigger.setAttribute('aria-label', 'View photo' + description);

            if (trigger === image) {
                trigger.setAttribute('tabindex', '0');
                trigger.setAttribute('role', 'button');
            }

            trigger.addEventListener('click', function(event) {
                event.preventDefault();
                open(item);
            });

            trigger.addEventListener('keydown', function(event) {
                const shouldOpen = event.key === ' ' || (trigger === image && event.key === 'Enter');
                if (shouldOpen) {
                    event.preventDefault();
                    open(item);
                }
            });
        });

        closeButton.addEventListener('click', close);
        previousButton.addEventListener('click', previous);
        nextButton.addEventListener('click', next);

        modal.addEventListener('click', function(event) {
            if (event.target === modal || event.target.classList.contains('photo-focus-stage')) close();
        });

        document.addEventListener('keydown', function(event) {
            if (modal.hidden) return;

            const isPreviousKey = event.key === 'ArrowLeft' || event.key === 'Left' || event.keyCode === 37;
            const isNextKey = event.key === 'ArrowRight' || event.key === 'Right' || event.keyCode === 39;

            if (event.key === 'Escape' || event.key === 'Esc') {
                event.preventDefault();
                close();
                return;
            }
            if (isPreviousKey && group.length > 1) {
                event.preventDefault();
                previous();
                return;
            }
            if (isNextKey && group.length > 1) {
                event.preventDefault();
                next();
                return;
            }
            if (event.key === 'Tab') {
                const controls = [closeButton, previousButton, nextButton].filter(function(control) {
                    return !control.hidden;
                });
                const firstControl = controls[0];
                const lastControl = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === firstControl) {
                    event.preventDefault();
                    lastControl.focus();
                } else if (!event.shiftKey && document.activeElement === lastControl) {
                    event.preventDefault();
                    firstControl.focus();
                }
            }
        }, true);

        modal.addEventListener('touchstart', function(event) {
            const touch = event.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        modal.addEventListener('touchend', function(event) {
            if (group.length < 2) return;
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
            if (deltaX > 0) previous();
            else next();
        }, { passive: true });
    }
    
    // Initialize all functionality when DOM is ready
    function init() {
        initThemeToggle();
        initMobileMenu();
        initCodeCopy();
        initCopyLinkButtons();
        initPhotoFocus();
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
