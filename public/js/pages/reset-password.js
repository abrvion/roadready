// Reset password page entry point

import "../components/header.js";
import "../components/footer.js";


const resetPasswordForm =
    document.getElementById("reset-password-form");

const passwordInput =
    document.getElementById("reset-password");

const confirmPasswordInput =
    document.getElementById("reset-confirm-password");

const submitButton =
    resetPasswordForm.querySelector(
        'button[type="submit"]'
    );


// =====================================================
// GET RESET TOKEN FROM URL
// =====================================================

const urlParams =
    new URLSearchParams(window.location.search);

const resetToken =
    urlParams.get("token");


// =====================================================
// CHECK RESET TOKEN
// =====================================================

if (!resetToken) {

    alert(
        "This password reset link is invalid or missing."
    );

    submitButton.disabled = true;

}


// =====================================================
// PASSWORD TOGGLE
// =====================================================

const passwordToggle =
    resetPasswordForm.querySelector(
        ".rr-password-toggle"
    );

if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            const icon =
                passwordToggle.querySelector("i");


            if (icon) {

                icon.classList.toggle(
                    "bi-eye",
                    !isPassword
                );

                icon.classList.toggle(
                    "bi-eye-slash",
                    isPassword
                );

            }


            passwordToggle.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}


// =====================================================
// PASSWORD CONFIRMATION
// =====================================================

confirmPasswordInput.addEventListener(
    "input",
    () => {

        if (
            confirmPasswordInput.value &&
            confirmPasswordInput.value !==
                passwordInput.value
        ) {

            confirmPasswordInput.setCustomValidity(
                "Passwords do not match."
            );

        } else {

            confirmPasswordInput.setCustomValidity(
                ""
            );

        }

    }
);


passwordInput.addEventListener(
    "input",
    () => {

        if (
            confirmPasswordInput.value &&
            confirmPasswordInput.value !==
                passwordInput.value
        ) {

            confirmPasswordInput.setCustomValidity(
                "Passwords do not match."
            );

        } else {

            confirmPasswordInput.setCustomValidity(
                ""
            );

        }

    }
);


// =====================================================
// RESET PASSWORD
// =====================================================

resetPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!resetToken) {
            return;
        }


        if (
            passwordInput.value !==
            confirmPasswordInput.value
        ) {

            confirmPasswordInput.setCustomValidity(
                "Passwords do not match."
            );

            confirmPasswordInput.reportValidity();

            return;

        }


        if (!resetPasswordForm.checkValidity()) {

            resetPasswordForm.reportValidity();

            return;

        }


        const originalButtonText =
            submitButton.innerHTML;


        try {

            submitButton.disabled = true;

            submitButton.innerHTML =
                "Resetting...";


            const response = await fetch(
                "/api/auth/reset-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        token: resetToken,
                        newPassword:
                            passwordInput.value
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to reset password"
                );

            }


            alert(
                "Password reset successful. " +
                "You can now sign in with your new password."
            );


            window.location.href =
                "/login";


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            alert(
                error.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                originalButtonText;

        }

    }
);