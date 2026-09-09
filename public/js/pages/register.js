
// Register page logic.

import "../components/header.js";
import "../components/footer.js";


const registerForm =
    document.getElementById("register-form");

const passwordInput =
    document.getElementById("register-password");

const confirmPasswordInput =
    document.getElementById(
        "register-confirm-password"
    );

const passwordToggle =
    document.querySelector(
        ".rr-password-toggle"
    );


/* ---------------------------------------------------------
   Password Visibility
   --------------------------------------------------------- */

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener("click", () => {

        const shouldShow =
            passwordInput.type === "password";


        passwordInput.type =
            shouldShow
                ? "text"
                : "password";


        passwordToggle.innerHTML =
            shouldShow
                ? '<i class="bi bi-eye-slash"></i>'
                : '<i class="bi bi-eye"></i>';


        passwordToggle.setAttribute(
            "aria-label",
            shouldShow
                ? "Hide password"
                : "Show password"
        );

    });

}


/* ---------------------------------------------------------
   Password Confirmation
   --------------------------------------------------------- */

function validatePasswords() {

    if (
        confirmPasswordInput.value &&
        confirmPasswordInput.value !==
            passwordInput.value
    ) {

        confirmPasswordInput.setCustomValidity(
            "Passwords do not match."
        );

    } else {

        confirmPasswordInput.setCustomValidity("");

    }

}


passwordInput.addEventListener(
    "input",
    validatePasswords
);

confirmPasswordInput.addEventListener(
    "input",
    validatePasswords
);


/* ---------------------------------------------------------
   Register Form
   --------------------------------------------------------- */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        validatePasswords();


        if (!registerForm.checkValidity()) {

            registerForm.reportValidity();

            return;

        }


        const name =
            document
                .getElementById("register-name")
                .value
                .trim();

        const email =
            document
                .getElementById("register-email")
                .value
                .trim();

        const password =
            passwordInput.value;


        const submitButton =
            registerForm.querySelector(
                ".rr-auth-submit"
            );


        const originalButtonText =
            submitButton.innerHTML;


        try {

            submitButton.disabled = true;

            submitButton.innerHTML = `
                Creating Account...
            `;


            const response =
                await fetch(
                    "/api/auth/register",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })

                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Registration failed. Please try again."
                );

                return;

            }


            showAlertModal(
                data.message || "Account created. Please check your email to verify your account.",
                { title: "Check your email", type: "success" }
            );
            window.setTimeout(() => { window.location.href = "/login"; }, 1200);


        } catch (error) {

            console.error(
                "Registration failed:",
                error
            );


            alert(
                "Unable to connect to the server. Please try again."
            );


        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalButtonText;

        }

    }
);

