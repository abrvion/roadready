const newsletter = document.getElementById("newsletter");

newsletter.innerHTML = `
    <section class="rr-newsletter">

        <div class="rr-container">

            <div class="rr-newsletter-card">

                <div class="rr-newsletter-content">

                    <span class="rr-newsletter-eyebrow">
                        STAY IN THE LOOP
                    </span>

                    <h2>
                        Get Updates for Your Next Ride.
                    </h2>

                    <p>
                        Be the first to know about new products,
                        special offers and useful riding updates.
                    </p>

                </div>


                <form class="rr-newsletter-form">

                    <label
                        for="newsletter-email"
                        class="visually-hidden"
                    >
                        Email address
                    </label>

                    <input
                        type="email"
                        id="newsletter-email"
                        name="email"
                        placeholder="Enter your email address"
                        autocomplete="email"
                        required
                    >

                    <button type="submit">
                        Subscribe
                        <i class="bi bi-arrow-right"></i>
                    </button>

                </form>

            </div>

        </div>

    </section>
`;

const newsletterForm = newsletter.querySelector(".rr-newsletter-form");
newsletterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = newsletterForm.email.value.trim();
  const button = newsletterForm.querySelector("button");
  const original = button.innerHTML;
  try {
    button.disabled = true; button.textContent = "Subscribing...";
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to subscribe");
    newsletterForm.reset();
    alert(data.message);
  } catch (error) { alert(error.message || "Unable to subscribe"); }
  finally { button.disabled = false; button.innerHTML = original; }
});
