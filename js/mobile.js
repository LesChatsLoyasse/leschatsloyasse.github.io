var fromRoot = path => { return document.getElementById('relative-root').textContent + path};

document.addEventListener("DOMContentLoaded", () => {
    let header = document.getElementById("header");

    let options = {
        root: null,  // Prend le viewport comme référence
        rootMargin: "0px",
        threshold: 0.4 // L’élément doit être visible à 20% pour être détecté
    };

    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible"); // Ajoute la classe "visible"
                observer.unobserve(entry.target); // Arrête d'observer une fois visible
            }
        });
    }, options);

    // Observe chaque élément avec la classe "checkVisibility"
    document.querySelectorAll(".checkVisibility").forEach(checkVisibility => {
        observer.observe(checkVisibility); 
    });

    if (window.matchMedia("(max-width : 767px)").matches) {
        header.innerHTML = `
            <div id="mySidenav" class="sidenav">
                <a id="closeBtn" href="#" class="close">×</a>
                <ul>
                    <li><a href="${fromRoot('index.html')}">Accueil</a></li>
                    <li><a href="${fromRoot('adopter.html')}">Adopter</a></li>
                    <li><a href="${fromRoot('qui-sommes-nous.html')}">Qui sommes nous ?</a></li>
                    <li class="dropdown-burger" id="dropdown"><a href="#">Nos chats<img src="${fromRoot('assets/icones/arrow.png')}"></a>
                    <ul class="dropdown-menu-burger hidden" id="dropdown-menu">
                        <li><a href="${fromRoot('nos-chats/nouvelles-chats.html')}">Des nouvelles de nos chats</a></li>
                        <li><a href="${fromRoot('nos-chats/chats-partis.html')}">Ils nous ont quittés</a></li>
                    </ul>
                </li>
                <li><a href="${fromRoot('nous-aider.html')}">Nous aider</a></li>
                <li class="dropdown-burger" id="dropdown-2"><a href="#">Nos actions<img src="${fromRoot('assets/icones/arrow.png')}"></a>
                    <ul class="dropdown-menu-burger hidden" id="dropdown-menu-2">
                        <li><a href="${fromRoot('nos-actions/actualites.html')}">Nos actions récentes</a></li>
                        <li><a href="${fromRoot('nos-actions/archives.html')}">Archives</a></li>
                        <li><a href="${fromRoot('nos-actions/gazette.html')}">Gazette</a></li>
                    </ul>
                </li>
                <li><a href="${fromRoot('contact.html')}">Contacts</a></li>
                </ul>
            </div>
          
            <a href="#" id="openBtn">
                <span class="burger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </a>
            
            <div class="logo"> <img src="${fromRoot('assets/logo/logo.png')}" alt="Logo Association"> </div>`

        var sidenav = document.getElementById("mySidenav");
        var dropdown = document.getElementById("dropdown");
        var dropdown2 = document.getElementById("dropdown-2");
        var dropdownMenu = document.getElementById("dropdown-menu");
        var dropdownMenu2 = document.getElementById("dropdown-menu-2");

        /* Set the width of the side navigation to 250px */
        document.getElementById("openBtn").onclick = () => { sidenav.classList.add("active"); }
        /* Set the width of the side navigation to 0 */
        document.getElementById("closeBtn").onclick = () => { sidenav.classList.remove("active"); }
        
        if (dropdown && dropdown2) {
            dropdown.addEventListener("click", (evt) => { dropdownMenu.classList.toggle("hidden"); });
            dropdown2.addEventListener("click", (evt) => { dropdownMenu2.classList.toggle("hidden"); });
        }
    }
});