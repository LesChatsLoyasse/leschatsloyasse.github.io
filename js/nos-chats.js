var fromRoot = path => { return document.getElementById('relative-root').textContent + path};
function getAllNewsData() { return JSON.parse(document.getElementById('news-data').textContent); }

document.addEventListener("DOMContentLoaded", () => {
    // --- Configuration ---
    let currentPage = 1;
    const itemsPerPage = 3;
    const animationDuration = 200;
    let isTransitioning = false;
    let totalPages = 1; // Initialisé à 1, sera recalculé

    // --- DOM Elements ---

    // Vues principales
    const nouvellesList = document.getElementById("liste-nouvelles");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const paginationNav = document.getElementById('pagination-section');
    const allData = getAllNewsData()

    // --- Vérification initiale des éléments DOM essentiels ---
    if (!nouvellesList || !paginationNav || !prevButton || !nextButton) {
        console.error("ERREUR CRITIQUE : Un ou plusieurs éléments DOM essentiels sont introuvables. Vérifiez les IDs HTML.");
        // Peut-être afficher un message à l'utilisateur ici
        document.body.innerHTML = "<p style='color:red; padding: 20px;'>Erreur critique : Impossible d'initialiser l'application. Veuillez contacter le support.</p>";
        return; // Arrêter l'exécution
    }

    // NOUVELLE fonction qui simule une récupération (asynchrone)
    function fetchNewsData() {
        console.log("Récupération des actions archivées...");
        return new Promise((resolve, reject) => {
            // Simule un délai réseau (ex: 300ms) pour imiter un appel serveur
            setTimeout(() => {
                try {
                    const data = getAllNewsData();
                    resolve(data); // La Promise réussit et renvoie les données
                } catch (error) {
                    console.error("Erreur lors de la récupération simulée des données :", error);
                    reject("Impossible de charger les données des archives."); // La Promise échoue
                }
            }, 300); // Simule 300ms de délai

            /*
            // ===> PLUS TARD, TU REMPLACERAS LE setTimeout PAR CECI <===
            fetch('/chemin/vers/ton/api/qui/lit/excel') // Adapte l'URL
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP: ${response.status}`);
                    }
                    return response.json(); // Convertit la réponse en JSON
                })
                .then(data => {
                    console.log(`Données récupérées depuis l'API : ${data.length} éléments.`);
                    resolve(data);
                })
                .catch(error => {
                    console.error("Erreur lors de la récupération via API:", error);
                    reject("Impossible de charger les données des adoptions depuis le serveur.");
                });
            */
        });
    }

     // --- Définitions des fonctions (suite) ---

    // --- Logique de récupération des données pour la page ---
    function getNewsDataForPage(pageNumber) {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allData.slice(startIndex, endIndex);
    }

    // --- Rendering ---
    function renderNewsCards(data) {
        nouvellesList.innerHTML = ""; // Efface le contenu précédent

        console.log(data)
        if (!data || data.length === 0) {
            const emptySrc = fromRoot('assets/icones/icone-chat.png');
            const emptyMessageText = "Il n'y a aucun chat à afficher ici";

            const emptyMessageHTML = `
                <div class="empty-grid-message">
                    <img src="${emptyImageSrc}" alt="Aucun chat trouvé">
                    <p>${emptyMessageText}</p>
                    </div>
            `;
            nouvellesList.innerHTML = emptyMessageHTML;
            return;
        }

        data.forEach(news => {
            const card = document.createElement("div");
            let galleryHTML = ''; // Initialiser le HTML pour la galerie

            card.dataset.newsId = news.id;
            card.classList.add("item-news");
            if (Number(news.id) % 2 == 0) {
                card.classList.add("paire");
            }
            card.setAttribute('role', 'article');

            const photos = news.imagesSrc || [];

            // --- Création du HTML pour le carrousel si des photos existent ---
            if (photos.length > 0) { // On crée le conteneur de galerie s'il y a au moins une photo
                galleryHTML = `
                    <div class="item-news-gallery">
                        <div class="gallery-carousel-container">
                            <div class="gallery-carousel-track">
                                ${photos.map(src => `<div class="gallery-carousel-photo"><img src="${src}" alt="Photo de ${news.title || 'nouvelle'}"></div>`).join('')}
                            </div>
                            ${photos.length > 1 ? `
                            <div class="carousel-buttons-container">
                                <ul class="pagination">
                                    <button class="carousel-prev" id="prevButton" aria-label="Photo précédente de la galerie">
                                        <img src="${fromRoot('assets/icones/icon-arrow-2.svg')}" alt="">
                                    </button>
                                    <button class="carousel-next" id="nextButton" aria-label="Photo suivante de la galerie">
                                        <img src="${fromRoot('assets/icones/icon-arrow-2.svg')}" alt="">
                                    </button>
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                 // Si aucune photo, on peut ajouter une image par défaut ou laisser vide
                 galleryHTML = `
                     <div class="item-news-gallery">
                         <img src="${fromRoot('assets/images/image-default.jpg')}" alt="Image par défaut">
                     </div>
                 `;
            }

            // --- Construction de la carte complète ---
            card.innerHTML = `
                        <div class="item-news-text">
                            <p class="section-title">${news.title || 'Titre non disponible'}</p>
                            <p class="text">${news.description || 'Description non disponible'}</p>
                        </div>
                        ${galleryHTML}
            `;

            nouvellesList.appendChild(card);

            // --- Initialisation du carrousel de la galerie SI nécessaire (plus d'une photo) ---
            if (photos.length > 1) {
                const galleryContainer = card.querySelector('.gallery-carousel-container');
                if (!galleryContainer) {
                     console.error("Conteneur de galerie introuvable pour la carte:", news.id);
                     return;
                }

                const track = galleryContainer.querySelector('.gallery-carousel-track');
                const prevButton = galleryContainer.querySelector('.carousel-prev');
                const nextButton = galleryContainer.querySelector('.carousel-next');
                const slides = Array.from(track.children); // Les divs .gallery-carousel-photo

                // S'assurer que les slides ont une largeur définie pour le calcul
                slides.forEach(slide => {
                    slide.style.width = '100%'; // Chaque slide prendra 100% de la largeur du conteneur
                    slide.style.flexShrink = 0; // Empêche le rétrécissement des slides
                });


                let imageWidth = galleryContainer.offsetWidth;
                if (imageWidth === 0) {
                     console.warn("Largeur du conteneur de galerie nulle lors de l'initialisation pour la carte:", news.id);
                     // Masquer les boutons si la largeur est nulle pour éviter des problèmes
                     if (prevButton) prevButton.style.display = 'none';
                     if (nextButton) nextButton.style.display = 'none';
                     return;
                }

                let counter = 0; // Compteur spécifique à CE carrousel de galerie

                track.style.transform = `translateX(0px)`; // Position initiale
                 track.style.display = 'flex'; // Utiliser flexbox pour aligner les slides horizontalement
                 track.style.transition = 'transform 0.5s ease-in-out'; // Ajouter une transition

                const updateCarouselButtons = () => {
                    if (!prevButton || !nextButton) return;
                    prevButton.disabled = counter === 0;
                    nextButton.disabled = counter === slides.length - 1;
                    prevButton.classList.toggle('disabled', counter === 0);
                    nextButton.classList.toggle('disabled', counter === slides.length - 1);
                };

                nextButton.addEventListener('click', () => {
                    if (counter >= slides.length - 1) return;
                    counter++;
                     imageWidth = galleryContainer.offsetWidth; // Recalculer la largeur au clic au cas où
                    track.style.transform = `translateX(-${imageWidth * counter}px)`;
                    updateCarouselButtons();
                });

                prevButton.addEventListener("click", () => {
                    if (counter <= 0) return;
                    counter--;
                     imageWidth = galleryContainer.offsetWidth; // Recalculer la largeur au clic au cas où
                    track.style.transform = `translateX(-${imageWidth * counter}px)`;
                    updateCarouselButtons();
                });

                updateCarouselButtons(); // État initial

                // Gestion du redimensionnement pour la galerie
                window.addEventListener('resize', () => {
                     // Vérifier si le conteneur est toujours dans le DOM et visible
                    if (!document.body.contains(galleryContainer) || galleryContainer.offsetParent === null) {
                        // Optionnel: supprimer l'écouteur d'événement si l'élément n'est plus là
                        // window.removeEventListener('resize', ...);
                        return;
                    }

                    imageWidth = galleryContainer.offsetWidth;
                    if (imageWidth > 0) {
                         track.style.transition = 'none'; // Désactiver la transition pendant le redimensionnement
                         track.style.transform = `translateX(-${imageWidth * counter}px)`;
                         // Réactiver la transition après un court délai pour permettre le repositionnement instantané
                         setTimeout(() => {
                             track.style.transition = 'transform 0.5s ease-in-out';
                         }, 50);
                     } else {
                          // Si la largeur devient nulle, masquer les boutons
                          if (prevButton) prevButton.style.display = 'none';
                          if (nextButton) nextButton.style.display = 'none';
                     }
                });
            }
            // Si une seule photo, on n'initialise pas le carrousel, et l'image unique est déjà dans .item-news-gallery
        });
    };

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
           console.warn(`Action ignorée: Page ${newPage} est hors limites (1-${totalPages}).`);
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
       console.log(`Transition page commencée vers page ${currentPage}. Boutons pagination désactivés.`);

       if (nouvellesList) {
        nouvellesList.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }

       setTimeout(() => {
           nouvellesList.classList.add('fade-out');
           nouvellesList.classList.remove('fade-in');

           setTimeout(() => {
               // !!! Utilise les données filtrées pour la page actuelle !!!
               const newData = getNewsDataForPage(currentPage);
               renderNewsCards(newData);

                nouvellesList.classList.remove('fade-out');
                nouvellesList.classList.add('fade-in');

               setTimeout(() => {
                   console.log(`Transition page terminée. Page finale: ${currentPage}.`);
                   isTransitioning = false; // Fin de la transition
                   // Met à jour l'état final des boutons de pagination
                   updatePaginationButtonStates();
                   console.log("Boutons pagination mis à jour.");
               }, animationDuration);

           }, animationDuration);

       });
   }

    // --- Event Listeners ---
    nextButton.addEventListener("click", () => {
        updatePage(currentPage + 1);
    });

    prevButton.addEventListener("click", () => {
        updatePage(currentPage - 1);
    });

    fetchNewsData()
        .then(fetchedData => {
            // *** Ce code s'exécute SEULEMENT APRES que fetchAdoptionData a résolu la Promise ***
            console.log("Données reçues, initialisation de l'interface.");

            // 2. Attacher les listeners qui dépendent des données ou de l'état initial
            nextButton.addEventListener("click", () => { updatePage(currentPage + 1); });
            prevButton.addEventListener("click", () => { updatePage(currentPage - 1); });

            // 4. Afficher la première page
            const initialData = getNewsDataForPage(currentPage);
            renderNewsCards(initialData); // Affiche les cartes (avec leurs listeners internes)
            updatePaginationButtonStates();   // Mettre à jour l'état des boutons de pagination

            console.log("Application prête !");

        })
        .catch(error => {
            // *** Ce code s'exécute si fetchAdoptionData rejette la Promise ***
            console.error("Erreur critique lors du chargement des données:", error);
            // Afficher un message d'erreur clair à l'utilisateur
            nouvellesList.innerHTML = `<p style='color: red; text-align: center; padding: 40px;'>${error || "Impossible de charger les informations pour le moment. Veuillez réessayer."}</p>`;
            // Optionnel: Cacher les contrôles inutilisables
            if (paginationNav) paginationNav.classList.add('hidden');
        });

    console.log("Attente de la récupération des données..."); // Ce message s'affiche avant la fin du fetch

    // --- Initialisation ---
    console.log("Initialisation de l'application...");
    const initialData = getNewsDataForPage(currentPage); // Récupère la page 1 des données (déjà filtrées par 'all')
    totalPages = Math.ceil(allData.length / itemsPerPage);
    // Assurer qu'il y a au moins une page, même si vide
    if (totalPages < 1) {
        totalPages = 1;
    }
    renderNewsCards(initialData); // Affiche la première page
    updatePaginationButtonStates(); // Définit l'état initial des boutons de pagination
    console.log(`Initialisation terminée. Page: ${currentPage}, Total Pages: ${totalPages}`);
});
