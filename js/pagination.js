
// --- Configuration ---
let currentPage = 1;
const animationDuration = 200;
let isTransitioning = false;
let totalPages = 1;

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");

const paginationNav = document.getElementById('pagination-section');

// --- Logique de récupération des données pour la page ---
// - data [tableau]: la data de la page qui doit être paginée
// - pageNumber [int]: par défaut à 1, correspond au numero de la page affichée
// - itemsPerPage [int]: le nombre d'items qui doivent être visible au maximum par page
// Return la data pour la page demandée sous forme de tableau

function getDataForPage(data, pageNumber, itemsPerPage) {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
}

// -- Actualisation des boutons en fonction de la pagination --/
// - data [tableau]: la data de la page qui doit être paginée
// - pageNumber [int]: par défaut à 1, correspond au numero de la page affichée
// - itemsPerPage [int]: le nombre d'items qui doivent être visible au maximum par page

function updatePaginationButtonStates(data, itemsPerPage) {
    const scrollDelay = 200;
    let totalPages = Math.ceil(data.length / itemsPerPage);
    // Désactivé si en transition OU si page 1 / dernière page
    prevButton.disabled = isTransitioning || currentPage <= 1;
    nextButton.disabled = isTransitioning || currentPage >= totalPages;
    // console.log(`Update Pagination Buttons: Prev disabled=${prevButton.disabled}, Next disabled=${nextButton.disabled}`);
    if (totalPages < 2) { 
        paginationNav.classList.add('hidden')
    } else {
        paginationNav.classList.remove('hidden')
    }
}

// --- Actualisation de la page  ---
// newPage [int]: correspond à la page actuelle
// section [class html]: la section de la page affectée par la pagination
// return la nouvelle data pour la page demandée
function updatePage(newPag, data, itemsPerPage) {
    // Vérification 1: Page valide ?
if (newPage < 1 || newPage > totalPages) {
    console.warn(`Action ignorée: Page ${newPage} est hors limites (1-${totalPages} pour le filtre '${currentFilter}').`);
    // Si on essaie d'aller hors limite, on s'assure que les boutons sont dans l'état correct final
        isTransitioning = false; // Assure que la transition est marquée comme finie
        updatePaginationButtonStates(data, itemsPerPage); // Met à jour l'état final des boutons
    return;
}
    // Vérification 2: Déjà en transition ?
if (isTransitioning) {
    console.warn("Action ignorée: Transition déjà en cours.");
    return;
}

// --- Début de la Transition ---
isTransitioning = true;
currentPage = newPage;

// Désactive les DEUX boutons de pagination PENDANT la transition
prevButton.disabled = true;
nextButton.disabled = true;
console.log(`Transition page commencée vers page ${currentPage}. Boutons pagination désactivés.`);

return newData;
}


// --- pagination.js ---

const Pagination = (function() {
    // --- Private Variables & Configuration ---
    let currentPage = 1;
    let totalPages = 1;
    let animationDuration = 200; // Default
    let scrollDelay = 200; // Default
    let isTransitioning = false;
    let itemsPerPage = 6;

    // --- Private DOM Elements (will be passed during init) ---
    let prevButton = null;
    let nextButton = null;
    let paginationNav = null;
    let contentContainer = null; // The element to fade (e.g., adoptionGrid)
    let scrollTarget = null; // The element to scroll into view

    // --- Private Callback Functions (will be passed during init) ---
    let onPageChangeCallback = (newPage) => {
        console.warn("Pagination: onPageChangeCallback not set!");
    }; // Function to call when page needs to render

    // --- Private Functions ---

    /**
     * Updates the enabled/disabled state and visibility of pagination buttons.
     */
    function updatePaginationButtonStates() {
        if (!prevButton || !nextButton || !paginationNav) return;

        // Disable buttons during transition or if at limits
        prevButton.disabled = isTransitioning || currentPage <= 1;
        nextButton.disabled = isTransitioning || currentPage >= totalPages;

        // Hide pagination if only one page or less
        if (totalPages <= 1) {
            paginationNav.classList.add('hidden');
        } else {
            paginationNav.classList.remove('hidden');
        }
         // console.log(`Pagination Buttons Updated: Prev=${!prevButton.disabled}, Next=${!nextButton.disabled}, Visible=${totalPages > 1}`);
    }

    /**
     * Handles the core logic of changing the page, including animations and callbacks.
     * @param {number} newPage - The target page number.
     */
    function _updatePageInternal(newPage) {
        // Check 1: Page valid?
        if (newPage < 1 || newPage > totalPages) {
            console.warn(`Pagination: Action ignored - Page ${newPage} is out of bounds (1-${totalPages}).`);
            isTransitioning = false; // Ensure transition flag is reset if invalid
            updatePaginationButtonStates(); // Update final button state
            return;
        }
        // Check 2: Already transitioning?
        if (isTransitioning) {
            console.warn("Pagination: Action ignored - Transition already in progress.");
            return;
        }

        // --- Start Transition ---
        isTransitioning = true;
        const oldPage = currentPage;
        currentPage = newPage;

        // Disable BOTH buttons during transition
        if (prevButton) prevButton.disabled = true;
        if (nextButton) nextButton.disabled = true;
        console.log(`Pagination: Transition started from page ${oldPage} to ${currentPage}. Buttons disabled.`);

        // 1. Scroll (if target provided)
        if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Use setTimeout for scroll delay ONLY if scrollTarget exists
        setTimeout(() => {
            // 2. Fade Out Content
            if (contentContainer) {
                contentContainer.classList.add('fade-out');
                contentContainer.classList.remove('fade-in');
            }

            // 3. After fade-out animation
            setTimeout(() => {
                // --- CRITICAL: Call the main script's function to RENDER the new content ---
                onPageChangeCallback(currentPage);
                // --- The main script is now responsible for rendering the data for 'currentPage' ---

                // 4. Fade In Content (assuming main script updated the content)
                if (contentContainer) {
                    contentContainer.classList.remove('fade-out');
                    contentContainer.classList.add('fade-in');
                }

                // 5. After fade-in animation
                setTimeout(() => {
                    console.log(`Pagination: Transition finished. Now on page ${currentPage}.`);
                    isTransitioning = false; // End transition
                    // Update final button states
                    updatePaginationButtonStates();
                    console.log("Pagination: Buttons state updated post-transition.");
                }, animationDuration);

            }, animationDuration);

        }, scrollTarget ? scrollDelay : 0); // Apply scroll delay only if scrolling occurred
    }

    // --- Public API ---
    return {
        /**
         * Initializes the pagination module.
         * @param {object} config - Configuration object.
         * @param {HTMLElement} config.prevButtonElement - The 'Previous' button element.
         * @param {HTMLElement} config.nextButtonElement - The 'Next' button element.
         * @param {HTMLElement} config.paginationNavElement - The container for pagination controls.
         * @param {HTMLElement} config.contentContainerElement - The element whose content fades/updates (e.g., grid).
         * @param {HTMLElement} [config.scrollTargetElement] - Optional element to scroll into view on page change.
         * @param {number} [config.itemsPerPage=6] - Number of items per page.
         * @param {number} [config.animDuration=200] - Fade animation duration (ms).
         * @param {number} [config.scrollWait=200] - Delay after scroll before fading (ms).
         * @param {function} config.onPageChange - Callback function executed when the page should change `(newPage) => { /* render content for newPage */ }`.
         /
        initialize: function(config) {
            console.log("Pagination: Initializing...");
            // Store DOM Elements
            prevButton = config.prevButtonElement;
            nextButton = config.nextButtonElement;
            paginationNav = config.paginationNavElement;
            contentContainer = config.contentContainerElement;
            scrollTarget = config.scrollTargetElement; // Optional

            // Store Configuration
            cardsPerPage = config.itemsPerPage || cardsPerPage;
            animationDuration = config.animDuration || animationDuration;
            scrollDelay = config.scrollWait || scrollDelay;

            // Store Callback
            if (typeof config.onPageChange !== 'function') {
                console.error("Pagination Init Error: 'onPageChange' callback function is required.");
                return; // Stop initialization if callback is missing
            }
            onPageChangeCallback = config.onPageChange;

            // Basic DOM element checks
            if (!prevButton || !nextButton || !paginationNav || !contentContainer) {
                 console.error("Pagination Init Error: One or more required DOM elements (prev, next, nav, content container) not provided.");
                 return;
            }

            // Attach Event Listeners
            nextButton.addEventListener("click", () => {
                _updatePageInternal(currentPage + 1);
            });

            prevButton.addEventListener("click", () => {
                _updatePageInternal(currentPage - 1);
            });

            console.log("Pagination: Initialization complete. Listeners attached.");
        },

        /**
         * Updates the pagination state, typically after data filtering.
         * @param {number} newTotalItems - The total number of items after filtering.
         * @param {number} [resetToPage=1] - The page number to reset to (usually 1).
         */
        update: function(newTotalItems, resetToPage = 1) {
            console.log(`Pagination: Updating state - Total Items: ${newTotalItems}, Reset to Page: ${resetToPage}`);
            totalPages = Math.ceil(newTotalItems / cardsPerPage);
            if (totalPages < 1) {
                totalPages = 1; // Ensure at least one page, even if empty
            }

            // Reset to the specified page and trigger update/render via the internal function
            // We call _updatePageInternal *if* the target page is different *or* if totalPages changed significantly (e.g., was 1 now > 1)
            // A simpler approach for filter reset is often just to force page 1 rendering:
            if (currentPage !== resetToPage || totalPages > 0) { // Ensure it triggers if page 1 is the target
                 currentPage = resetToPage; // Set current page directly *before* calling callback
                 onPageChangeCallback(currentPage); // Render the new page 1 content
                 updatePaginationButtonStates(); // Update buttons based on new totalPages and currentPage
            } else {
                // If we're already on the target page and totalPages hasn't changed visibility status, just update buttons
                updatePaginationButtonStates();
            }
            console.log(`Pagination: State updated - Current Page: ${currentPage}, Total Pages: ${totalPages}`);

        },

        /**
         * Gets the current page number.
         * @returns {number} The current page.
         */
        getCurrentPage: function() {
            return currentPage;
        },

         /**
         * Gets the configured number of items per page.
         * @returns {number} Items per page.
         */
         getItemsPerPage: function() {
            return cardsPerPage;
        }
    };
})(); // Immediately invoke the function to create the module instance