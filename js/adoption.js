const MALE = 'M'
const FEMALE = 'F'

var fromRoot = path => { return document.getElementById('relative-root').textContent + path};

document.addEventListener("DOMContentLoaded", () => {
    // --- Configuration ---
    let currentPage = 1;
    const cardsPerPage = 6;
    const animationDuration = 200;
    const scrollDelay = 200;
    let isTransitioning = false;
    let currentFilter = 'all'; // <-- État du filtre ('all', 'adultes', 'chatons')
    let filteredAdoptions = []; // <-- Tableau pour les données filtrées
    let totalPages = 1; // Initialisé à 1, sera recalculé
    const networkDelaySim = 300;  // Délai simulé pour la récupération des données (ms)
    let allAdoptionsDataMap = new Map();
    let counter = 0;
    let nextCarousel = "";
    let prevCarousel = "";

    // --- DOM Elements ---

    // Vues principales
    const adoptionGrid = document.getElementById("adoptionGrid");
    const adoptionListSection = document.querySelector(".page-adoption-list");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const detailView = document.getElementById('detailView');
    const allData = getAllAdoptionData()

    //Sélection des boutons de filtre
    const filterAllButton = document.getElementById('filterAllButton');
    const filterAdultesButton = document.getElementById('filterAdultesButton');
    const filterChatonsButton = document.getElementById('filterChatonsButton');
    const filterButtons = [filterAllButton, filterAdultesButton, filterChatonsButton]; // Pour faciliter la gestion UI
    const paginationNav = document.getElementById('pagination-section');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    // Contrôles de la vue détaillée
    const backButton = document.getElementById('backButton');
    const detailImage = document.getElementById('detailImage');
    const detailGenderIcon = document.getElementById('detailGenderIcon');
    const detailName = document.getElementById('detailName');
    const detailAge = document.getElementById('detailAge');
    const detailQuote = document.getElementById('detailQuote');
    const detailDescription = document.getElementById('detailDescription');
    const textAdoption = document.getElementById('text-adoption-list');
    const carouselPhotosContainer = document.getElementById('carouselPhotosContainer');
    const carouselButtonsContainer = document.getElementById('carouselButtonsContainer');
    const imageWidth = 400;
    // Section parente pour le scroll (optionnel, si besoin de scroller vers le haut de la section grille)

    // --- Vérification initiale des éléments DOM essentiels ---
    if (!adoptionGrid || !detailView || !filterButtonsContainer || !paginationNav || !prevButton || !nextButton || !backButton) {
        console.error("ERREUR CRITIQUE : Un ou plusieurs éléments DOM essentiels sont introuvables. Vérifiez les IDs HTML.");
        // Peut-être afficher un message à l'utilisateur ici
        document.body.innerHTML = "<p style='color:red; padding: 20px;'>Erreur critique : Impossible d'initialiser l'application. Veuillez contacter le support.</p>";
        return; // Arrêter l'exécution
    }

    // Fonction pour obtenir TOUTES les données (simulé ici)
    function getAllAdoptionData() {
        return JSON.parse(document.getElementById('adoption-data').textContent);
    }

    // NOUVELLE fonction qui simule une récupération (asynchrone)
    function fetchAdoptionData() {
        return new Promise((resolve, reject) => {
            // Simule un délai réseau (ex: 300ms) pour imiter un appel serveur
            setTimeout(() => {
                try {
                    const data = getAllAdoptionData(); // Pour l'instant, on prend nos données locales
                    resolve(data); // La Promise réussit et renvoie les données
                } catch (error) {
                    console.error("Erreur lors de la récupération simulée des données :", error);
                    reject("Impossible de charger les données des adoptions."); // La Promise échoue
                }
            }, 300);
        });
    }

     // --- Définitions des fonctions (suite) ---

    /**
     * Affiche la vue détaillée pour un chat spécifique.
     * @param {string} catId L'ID unique du chat à afficher.
     */
    function showDetailView(catId) {
        let photos = []; 

        // Vérification si les éléments DOM de la vue détail existent
        if (!detailView || !detailImage || !detailName || !detailAge || !detailQuote || !detailDescription || !detailGenderIcon) {
             console.error("Éléments de la vue détaillée non trouvés dans le DOM.");
             return;
        }

        textAdoption.classList.add("hidden");

        // Trouve les données complètes du chat via son ID dans la Map
        const catData = allAdoptionsDataMap.get(catId);

        if (!catData) {
            console.error(`Impossible de trouver les données pour le chat avec ID: ${catId}`);
            // Optionnel : Afficher un message d'erreur à l'utilisateur ?
            return;
        }

        detailImage.src = catData.imagesSrc[0] || fromRoot('assets/images/image-default.jpg'); // Image par défaut si non spécifiée TODO: changer
        detailImage.alt = `Photo détaillée de ${catData.name}`;
        detailGenderIcon.src = `${fromRoot('assets/icones')}/${catData.gender.toUpperCase() === MALE ? 'male.png' : 'femelle.png'}`;
        detailGenderIcon.alt = catData.gender.toUpperCase() === MALE ? 'Genre: Mâle' : 'Genre: Femelle';
        detailName.textContent = catData.name || "Nom inconnu";
        detailAge.textContent = catData.age || "Age inconnu";
        detailQuote.textContent = catData.quote || "";

        if (catData.imagesSrc.length > 1) {
            photos = catData.imagesSrc.slice(1)


            photos.forEach(photo => {
                const catPhoto = document.createElement("div");
                catPhoto.classList.add("carousel-photo");
                catPhoto.setAttribute('role', 'button');
                catPhoto.setAttribute('tabindex', '0');
                // Utilisation de classes pour les images pour un ciblage CSS plus précis
                catPhoto.innerHTML = `<img src="${photo}">`
                carouselPhotosContainer.appendChild(catPhoto);
            })

            carouselButtonsContainer.innerHTML = `
                <ul class="pagination">
                    <button class="carousel-prev" id="prevButton"><img src="${fromRoot('assets/icones/icon-arrow-2.svg')}"></button>
                    <button class="carousel-next" id="nextButton"><img src="${fromRoot('assets/icones/icon-arrow-2.svg')}"></button>
                </ul>
                `
            nextCarousel = document.querySelector(".carousel-next");
            prevCarousel = document.querySelector(".carousel-prev");
            carouselPhotos = document.querySelector(".carousel-photos-container");
            updateCarouselButtons();

            nextCarousel.addEventListener('click', () => {
                if (counter >= photos.length - 1) return;
                counter++;
                carouselPhotos.style.transform = `translateX(${-imageWidth * counter}px)`;
                updateCarouselButtons();
            });

            prevCarousel.addEventListener("click", () => {
                if (counter <= 0) return;
                counter--;
                carouselPhotos.style.transform = `translateX(${-imageWidth * counter}px)`;
                updateCarouselButtons();
            });
        }

        function updateCarouselButtons() {
            prevCarousel.disabled = counter === 0;
            nextCarousel.disabled = counter === photos.length - 1;
        }

        const descriptionHtml = catData.description ? catData.description.replace(/\n/g, '<br>') : "<p><em>Plus d'informations bientôt disponibles.</em></p>";
        detailDescription.innerHTML = descriptionHtml;

        // --- Gérer l'affichage des sections ---

        // Masquer la vue grille/filtres/pagination
        if(adoptionGrid) adoptionGrid.classList.add('hidden');
        if(filterButtonsContainer) filterButtonsContainer.classList.add('hidden');
        if(paginationNav) paginationNav.classList.add('hidden'); // Assure que paginationNav a été sélectionné

        // Afficher la vue détaillée
        detailView.classList.remove('hidden');

        // Faire défiler la page vers le haut de la vue détaillée pour une meilleure visibilité
        detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Masque la vue détaillée et réaffiche la vue grille.
     */
    function hideDetailView() {
        console.log("Masquage de la vue détaillée, retour à la grille.");

        // Vérification si les éléments DOM existent
         if (!detailView || !adoptionGrid || !filterButtonsContainer || !paginationNav) {
             console.error("Un ou plusieurs éléments nécessaires pour masquer/afficher les vues sont introuvables.");
             return;
         }

        carouselButtonsContainer.innerHTML = ``;
        carouselPhotosContainer.innerHTML = ``;


        textAdoption.classList.remove("hidden");

        // Masquer la vue détaillée
        detailView.classList.add('hidden');

        // Réafficher la vue grille/filtres/pagination
        adoptionGrid.classList.remove('hidden');
        filterButtonsContainer.classList.remove('hidden');
        paginationNav.classList.remove('hidden');

        // Optionnel : Faire défiler vers le haut de la section des filtres/grille
        if (filterButtonsContainer) {
             filterButtonsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (adoptionGrid) {
            adoptionGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // --- Logique de Filtrage ---

    // Fonction pour déterminer si c'est un chaton (ex: <= 1 an)
    function isChaton(ageString) {
        if (!ageString) return false;
        // Extrait le nombre et l'unité (mois ou an)
        const matchAn = ageString.match(/(\d+)\s+an(s)?/i);
        const matchMois = ageString.match(/(\d+)\s+mois/i);

        if (matchMois) {
            return true; // Tout ce qui est en mois est un chaton
        }
        if (matchAn && matchAn[1]) {
            const ageNum = parseInt(matchAn[1], 10);
            return !isNaN(ageNum) && ageNum <= 1; // 1 an ou moins = chaton
        }
        return false; // Format non reconnu
    }
    // Applique le filtre actuel aux données globales

    function applyFilter(allData) {
        if (!allData) {
            console.error("applyFilter appelée sans données!");
            allData = []; // Sécurité
        }

        if (currentFilter === 'chatons') {
            filteredAdoptions = allData.filter(cat => isChaton(cat.age));
        } else if (currentFilter === 'adultes') {
            filteredAdoptions = allData.filter(cat => !isChaton(cat.age));
        } else { // 'all'
            filteredAdoptions = [...allData]; // Copie du tableau complet
        }
        // !! IMPORTANT: Recalculer le nombre total de pages basé sur les données filtrées !!
        totalPages = Math.ceil(filteredAdoptions.length / cardsPerPage);
        // Assurer qu'il y a au moins une page, même si vide
        if (totalPages < 1) {
            totalPages = 1;
        }
        console.log(`Filtre appliqué: ${currentFilter}. Éléments filtrés: ${filteredAdoptions.length}. Pages totales: ${totalPages}`);
    }

    // Met à jour l'apparence des boutons de filtre
    function updateFilterButtonsUI() {
        filterButtons.forEach(button => {
            // Détermine le type de filtre associé à ce bouton via son ID
            let buttonFilterType = 'all'; // Par défaut
            if (button.id === 'filterAdultesButton') buttonFilterType = 'adultes';
            if (button.id === 'filterChatonsButton') buttonFilterType = 'chatons';

            if (buttonFilterType === currentFilter) {
                button.classList.add('filter-active');
            } else {
                button.classList.remove('filter-active');
            }
        });
         console.log(`UI Filtres mise à jour pour filtre actif: ${currentFilter}`);
    }

    // --- Logique de récupération des données pour la page ---
    function getAdoptionDataForPage(pageNumber) {
        // On travaille maintenant sur 'filteredAdoptions'
        const startIndex = (pageNumber - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;
        return filteredAdoptions.slice(startIndex, endIndex);
    }

    // --- Rendering ---
    function renderAdoptionCards(data) {
        adoptionGrid.innerHTML = ""; // Efface le contenu précédent
        if (allData) {  adoptionGrid.classList.remove('is-empty');  }

        if (!adoptionGrid || data.length === 0 ||!data) {
            adoptionGrid.classList.add('is-empty');
            const emptyImageSrc = fromRoot("assets/icones/icone-chat.png");
            const emptyMessageText = "Il n'y a aucun chat à afficher ici";

            const emptyMessageHTML = `
                <div class="empty-grid-message">
                    <img src="${emptyImageSrc}" alt="Aucun chat trouvé">
                    <p>${emptyMessageText}</p>
                    </div>
            `;
            adoptionGrid.innerHTML = emptyMessageHTML;
            return;
        }

        data.forEach(cat => {
            const card = document.createElement("div");
            card.classList.add("page-adoption-card");
            card.dataset.catId = cat.id;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Voir la fiche de ${cat.name}`);
            const imageSource = cat.imagesSrc[0] || fromRoot('assets/images/image-default.jpg');
            // Utilisation de classes pour les images pour un ciblage CSS plus précis
            card.innerHTML = `
                <img src="${imageSource}" alt="Photo de ${cat.name}" class="card-image">
                <div class="page-adoption-card-text">
                    <img 
                        src="${fromRoot('assets/icones')}/${cat.gender.toUpperCase() === MALE ? 'male.png' : 'femelle.png'}" 
                        alt="${cat.gender.toUpperCase() === MALE ? 'Genre: Mâle' : 'Genre: Femelle'}" 
                        class="gender-icon"
                    >
                    <span class="section-title">${cat.name}</span>
                    <span class="text">${cat.age}</span>
                    <span class="citation">${cat.quote}</span>
                </div>
            `;
            adoptionGrid.appendChild(card);

            card.addEventListener('click', () => showDetailView(cat.id));
        });
    }

    // --- Button State Management (Pagination - utilise maintenant 'totalPages' recalculé) ---
    function updatePaginationButtonStates() {
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

    // --- Page Update Logic  ---
    function updatePage(newPage) {
        // Vérification 1: Page valide ? (utilise 'totalPages' qui est basé sur le filtre)
       if (newPage < 1 || newPage > totalPages) {
           console.warn(`Action ignorée: Page ${newPage} est hors limites (1-${totalPages} pour le filtre '${currentFilter}').`);
           // Si on essaie d'aller hors limite, on s'assure que les boutons sont dans l'état correct final
            isTransitioning = false; // Assure que la transition est marquée comme finie
            updatePaginationButtonStates(); // Met à jour l'état final des boutons
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
       if (adoptionListSection) {
           adoptionListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }

       setTimeout(() => {
           adoptionGrid.classList.add('fade-out');
           adoptionGrid.classList.remove('fade-in');

           setTimeout(() => {
               // !!! Utilise les données filtrées pour la page actuelle !!!
               const newData = getAdoptionDataForPage(currentPage);
               renderAdoptionCards(newData);

               adoptionGrid.classList.remove('fade-out');
               adoptionGrid.classList.add('fade-in');

               setTimeout(() => {
                   isTransitioning = false; // Fin de la transition
                   // Met à jour l'état final des boutons de pagination
                   updatePaginationButtonStates();
               }, animationDuration);

           }, animationDuration);

       }, adoptionListSection ? scrollDelay : 0);
   }

   // --- Gestion des clics sur les filtres ---
   function handleFilterClick(filterType, allData) {
        if (currentFilter === filterType) {
            // Si on clique sur le filtre déjà actif, on revient à 'Tous'
            currentFilter = 'all';
        } else {
            // Sinon, on applique le nouveau filtre
            currentFilter = filterType;
        }

        applyFilter(allData);             // 1. Filtrer les données et recalculer totalPages
        updateFilterButtonsUI();   // 2. Mettre à jour l'apparence des boutons filtre
        updatePage(1);             // 3. Afficher la page 1 des résultats filtrés (déclenche aussi updatePaginationButtonStates à la fin)
    }

    // --- Event Listeners ---
    nextButton.addEventListener("click", () => {
        updatePage(currentPage + 1);
    });

    prevButton.addEventListener("click", () => {
        updatePage(currentPage - 1);
    });

    fetchAdoptionData()
        .then(fetchedData => {
            // *** Ce code s'exécute SEULEMENT APRES que fetchAdoptionData a résolu la Promise ***

            // 1. Stocker les données et créer la Map pour accès rapide par ID
            const allAdoptions = fetchedData; // Référence globale si nécessaire
            allAdoptionsDataMap = new Map(allAdoptions.map(cat => [cat.id, cat]));

            // 2. Attacher les listeners qui dépendent des données ou de l'état initial
            filterAllButton.addEventListener('click', () => handleFilterClick('all', allAdoptions)); // Passe les données
            filterAdultesButton.addEventListener('click', () => handleFilterClick('adultes', allAdoptions));
            filterChatonsButton.addEventListener('click', () => handleFilterClick('chatons', allAdoptions));
            nextButton.addEventListener("click", () => { updatePage(currentPage + 1); });
            prevButton.addEventListener("click", () => { updatePage(currentPage - 1); });
            backButton.addEventListener('click', hideDetailView);

            // 3. Initialiser l'état de l'application avec les données reçues
            applyFilter(allAdoptions); // Appliquer filtre 'all' sur les données reçues
            updateFilterButtonsUI();   // Mettre à jour l'UI des filtres

            // 4. Afficher la première page
            const initialData = getAdoptionDataForPage(currentPage);
            renderAdoptionCards(initialData); // Affiche les cartes (avec leurs listeners internes)
            updatePaginationButtonStates();   // Mettre à jour l'état des boutons de pagination

            // 5. Assurer que la vue détail est cachée
            detailView.classList.add('hidden');

            console.log("Application prête !");

        })
        .catch(error => {
            // *** Ce code s'exécute si fetchAdoptionData rejette la Promise ***
            console.error("Erreur critique lors du chargement des données:", error);
            // Afficher un message d'erreur clair à l'utilisateur
            adoptionGrid.innerHTML = `<p style='color: red; text-align: center; padding: 40px;'>${error || "Impossible de charger les informations pour le moment. Veuillez réessayer."}</p>`;
            // Optionnel: Cacher les contrôles inutilisables
            if (filterButtonsContainer) filterButtonsContainer.classList.add('hidden');
            if (paginationNav) paginationNav.classList.add('hidden');
        });

    console.log("Attente de la récupération des données..."); // Ce message s'affiche avant la fin du fetch

    // --- Initialisation ---
    console.log("Initialisation de l'application...");
    applyFilter(allData); // Applique le filtre initial ('all') et calcule totalPages
    updateFilterButtonsUI(); // Met le bouton 'Tous' en actif visuellement
    const initialData = getAdoptionDataForPage(currentPage); // Récupère la page 1 des données (déjà filtrées par 'all')
    renderAdoptionCards(initialData); // Affiche la première page
    updatePaginationButtonStates(); // Définit l'état initial des boutons de pagination
    console.log(`Initialisation terminée. Filtre: ${currentFilter}, Page: ${currentPage}, Total Pages: ${totalPages}`);
});