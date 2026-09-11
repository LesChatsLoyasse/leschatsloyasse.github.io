var fromRoot = path => { return document.getElementById('relative-root').textContent + path};
function getAllActionsData() { return JSON.parse(document.getElementById('action-data').textContent); }

document.addEventListener("DOMContentLoaded", () => {

    // --- Configuration ---
    let currentPage = 1;
    const itemsPerPage = 3;
    const animationDuration = 200;
    const scrollDelay = 200;
    let isTransitioning = false;
    let totalPages = 1; // Initialisé à 1, sera recalculé
    let allDataMap = new Map();

    // --- DOM Elements ---

    // Vues principales
    const actionList = document.getElementById("liste-actions");
    const actionListSection = document.querySelector(".section-actions");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const allData = getAllActionsData();
    const paginationNav = document.getElementById('pagination-section');


    // --- Vérification initiale des éléments DOM essentiels ---
    if (!actionList || !paginationNav || !prevButton || !nextButton) {
        console.error("ERREUR CRITIQUE : Un ou plusieurs éléments DOM essentiels sont introuvables. Vérifiez les IDs HTML.");
        // Peut-être afficher un message à l'utilisateur ici
        document.body.innerHTML = "<p style='color:red; padding: 20px;'>Erreur critique : Impossible d'initialiser l'application. Veuillez contacter le support.</p>";
        return; // Arrêter l'exécution
    }

    // NOUVELLE fonction qui simule une récupération (asynchrone)
    function fetchActionData() {
        console.log("Récupération des actions archivées...");
        return new Promise((resolve, reject) => {
            // Simule un délai réseau (ex: 300ms) pour imiter un appel serveur
            setTimeout(() => {
                try {
                    const data = getAllActionsData(); // Pour l'instant, on prend nos données locales
                    console.log(`Données récupérées (simulation) : ${data.length} éléments.`);
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
    function getActionDataForPage(pageNumber) {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allData.slice(startIndex, endIndex);
    }

    // --- Rendering ---
    function renderActionCards(data) {
        actionList.innerHTML = ""; // Efface le contenu précédent

        data.forEach(action => {
            const card = document.createElement("div");
            card.classList.add("item-action");
            if(Number(action.id) % 2 == 0) { card.classList.add("paire");}
            card.dataset.actionId = action.id;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            const imageSource = action.imagesSrc[0] || fromRoot('assets/images/image-default.jpg');
            // Utilisation de classes pour les images pour un ciblage CSS plus précis
            card.innerHTML = `
                <div class="item-action-text">
                    <p class="section-title">${action.title}</p>
                    <p class="text">${action.description}</p>
                </div>
                <img src="${imageSource}">
            `;
            actionList.appendChild(card);
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

       if (actionList) {
        actionList.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }

       setTimeout(() => {
           actionList.classList.add('fade-out');
           actionList.classList.remove('fade-in');

           setTimeout(() => {
               // !!! Utilise les données filtrées pour la page actuelle !!!
               const newData = getActionDataForPage(currentPage);
               renderActionCards(newData);

                actionList.classList.remove('fade-out');
                actionList.classList.add('fade-in');

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

    fetchActionData()
        .then(fetchedData => {
            // *** Ce code s'exécute SEULEMENT APRES que fetchAdoptionData a résolu la Promise ***
            console.log("Données reçues, initialisation de l'interface.");

            // 1. Stocker les données et créer la Map pour accès rapide par ID
            const allActions = fetchedData; // Référence globale si nécessaire
            allDataMap = new Map(allActions.map(action => [action.id, action]));

            // 2. Attacher les listeners qui dépendent des données ou de l'état initial
            nextButton.addEventListener("click", () => { updatePage(currentPage + 1); });
            prevButton.addEventListener("click", () => { updatePage(currentPage - 1); });

            // 4. Afficher la première page
            const initialData = getActionDataForPage(currentPage);
            renderActionCards(initialData); // Affiche les cartes (avec leurs listeners internes)
            updatePaginationButtonStates();   // Mettre à jour l'état des boutons de pagination

            console.log("Application prête !");

        })
        .catch(error => {
            // *** Ce code s'exécute si fetchAdoptionData rejette la Promise ***
            console.error("Erreur critique lors du chargement des données:", error);
            // Afficher un message d'erreur clair à l'utilisateur
            actionList.innerHTML = `<p style='color: red; text-align: center; padding: 40px;'>${error || "Impossible de charger les informations pour le moment. Veuillez réessayer."}</p>`;
            // Optionnel: Cacher les contrôles inutilisables
            if (paginationNav) paginationNav.classList.add('hidden');
        });

    console.log("Attente de la récupération des données..."); // Ce message s'affiche avant la fin du fetch

    // --- Initialisation ---
    console.log("Initialisation de l'application...");
    const initialData = getActionDataForPage(currentPage); // Récupère la page 1 des données (déjà filtrées par 'all')
    totalPages = Math.ceil(allData.length / itemsPerPage);
    // Assurer qu'il y a au moins une page, même si vide
    if (totalPages < 1) {
        totalPages = 1;
    }
    renderActionCards(initialData); // Affiche la première page
    updatePaginationButtonStates(); // Définit l'état initial des boutons de pagination
    console.log(`Initialisation terminée. Page: ${currentPage}, Total Pages: ${totalPages}`);
});