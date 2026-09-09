const hero = document.getElementById("home-hero");

hero.innerHTML = `
    <section class="rr-hero">

        <div class="rr-hero-background">
            <img
                src="/assets/images/hero-motorcycle.png"
                alt="Motorcycle"
            >
        </div>


        <div class="rr-container rr-hero-inner">

            <div class="rr-hero-card">

                <span class="rr-hero-eyebrow">
                    MOTORCYCLE PARTS & ACCESSORIES
                </span>

                <h1 class="rr-hero-title">
                    Everything Your Bike
                    <span>Needs.</span>
                </h1>

                <p class="rr-hero-description">
                    Genuine parts, accessories and riding essentials
                    for your motorcycle. Find the right products and
                    get them delivered across Bangladesh.
                </p>


                <div class="rr-hero-actions">

                    <a
                        href="/shop"
                        class="rr-btn rr-btn-primary"
                    >
                        Shop Products
                        <i class="bi bi-arrow-right"></i>
                    </a>

                    <a
                        href="/bike-finder"
                        class="rr-btn rr-btn-secondary"
                    >
                        <i class="bi bi-bicycle"></i>
                        Find Parts for My Bike
                    </a>

                </div>

            </div>

        </div>

    </section>
`;