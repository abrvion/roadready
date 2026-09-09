const categories = document.getElementById("shop-categories");

categories.innerHTML = `
    <section class="rr-categories">

        <div class="rr-container">

            <div class="rr-section-header">

                <div>
                    <span class="rr-section-eyebrow">
                        SHOP BY CATEGORY
                    </span>

                    <h2>
                        Find What Your Bike Needs
                    </h2>

                    <p>
                        Browse genuine motorcycle parts, accessories and gear.
                    </p>
                </div>

                <a href="/shop" class="rr-section-link">
                    View All
                    <i class="bi bi-arrow-right"></i>
                </a>

            </div>


            <div class="rr-category-grid">

                <!-- Spare Parts -->

                <a href="/shop?category=spare-parts"
                   class="rr-category-card">

                    <div class="rr-category-image">
                        <img
                            src="/assets/images/categories/spare-parts.jpg"
                            alt="Motorcycle spare parts"
                        >
                    </div>

                    <div class="rr-category-content">

                        <div>
                            <span class="rr-category-label">
                                SHOP
                            </span>

                            <h3>Spare Parts</h3>
                        </div>

                        <span class="rr-category-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </span>

                    </div>

                </a>


                <!-- Accessories -->

                <a href="/shop?category=accessories"
                   class="rr-category-card">

                    <div class="rr-category-image">
                        <img
                            src="/assets/images/categories/accessories.jpg"
                            alt="Motorcycle accessories"
                        >
                    </div>

                    <div class="rr-category-content">

                        <div>
                            <span class="rr-category-label">
                                SHOP
                            </span>

                            <h3>Accessories</h3>
                        </div>

                        <span class="rr-category-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </span>

                    </div>

                </a>


                <!-- Riding Gear -->

                <a href="/shop?category=riding-gear"
                   class="rr-category-card">

                    <div class="rr-category-image">
                        <img
                            src="/assets/images/categories/riding-gear.jpg"
                            alt="Motorcycle riding gear"
                        >
                    </div>

                    <div class="rr-category-content">

                        <div>
                            <span class="rr-category-label">
                                SHOP
                            </span>

                            <h3>Riding Gear</h3>
                        </div>

                        <span class="rr-category-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </span>

                    </div>

                </a>


                <!-- Maintenance -->

                <a href="/shop?category=maintenance"
                   class="rr-category-card">

                    <div class="rr-category-image">
                        <img
                            src="/assets/images/categories/maintenance.jpg"
                            alt="Motorcycle maintenance products"
                        >
                    </div>

                    <div class="rr-category-content">

                        <div>
                            <span class="rr-category-label">
                                SHOP
                            </span>

                            <h3>Maintenance</h3>
                        </div>

                        <span class="rr-category-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </span>

                    </div>

                </a>


                <!-- Electrical -->

                <a href="/shop?category=electrical"
                   class="rr-category-card">

                    <div class="rr-category-image">
                        <img
                            src="/assets/images/categories/electrical.jpg"
                            alt="Motorcycle electrical accessories"
                        >
                    </div>

                    <div class="rr-category-content">

                        <div>
                            <span class="rr-category-label">
                                SHOP
                            </span>

                            <h3>Electrical</h3>
                        </div>

                        <span class="rr-category-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </span>

                    </div>

                </a>


                <!-- Safety -->

                <a href="/shop?category=safety"
                   class="rr-category-card">

                    <div class="rr-category-image">
                        <img
                            src="/assets/images/categories/safety.jpg"
                            alt="Motorcycle safety equipment"
                        >
                    </div>

                    <div class="rr-category-content">

                        <div>
                            <span class="rr-category-label">
                                SHOP
                            </span>

                            <h3>Safety</h3>
                        </div>

                        <span class="rr-category-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </span>

                    </div>

                </a>

            </div>

        </div>

    </section>
`;