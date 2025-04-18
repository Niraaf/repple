import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification,
    EmailAuthProvider,
    linkWithCredential,
    linkWithPopup,
    deleteUser
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        const user = auth.currentUser;
        if (user && user.isAnonymous) {
            const userCredential = await linkWithCredential(user, EmailAuthProvider.credential(email, password));
            localStorage.removeItem("repple-guest_uid");
            localStorage.removeItem("repple-guest_creation_time");
            console.log("User linked:", userCredential.user);
            return userCredential.user;
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created:", userCredential.user);
            return userCredential.user;
        }
    } catch (error) {
        console.error("Error during email/password registration:", error);
        throw error;
    }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const doSignInWithGoogle = async () => {
    try {
        const user = auth.currentUser;
        const provider = new GoogleAuthProvider();

        let userCredential;
        if (user && user.isAnonymous) {
            userCredential = await linkWithPopup(user, provider);
            localStorage.removeItem("repple-guest_uid");
            localStorage.removeItem("repple-guest_creation_time");
            console.log("User linked with Google:", userCredential.user);
        } else {
            userCredential = await signInWithPopup(auth, provider);
            console.log("User signed in with Google:", userCredential.user);
        }

        // TODO: Save user to database here, if needed
        return userCredential.user;
    } catch (error) {
        console.error("Error with Google sign-in:", error);
        throw error;
    }
};

export const doSignInAnonymously = async () => {
    if (auth && auth.currentUser && !auth.currentUser.isAnonymous) {
        console.log("User is already signed in:", auth.currentUser);
        return auth.currentUser;
    }
        
    const expirationPeriodInMinutes = .1;
    const periodInMilliseconds = expirationPeriodInMinutes * 60 * 1000;
    console.log("Expiration period in milliseconds:", periodInMilliseconds);
    let shouldCreateNewAccount = false;
    try {
        const storedUid = localStorage.getItem("repple-guest_uid");
        const storedCreationTime = localStorage.getItem("repple-guest_creation_time");

        if (storedUid && storedCreationTime) {
            const currentTime = new Date().getTime();
            const accountAge = currentTime - parseInt(storedCreationTime);

            // Check if the stored account has expired
            if (accountAge > periodInMilliseconds) {
                // Account expired, delete it
                const user = auth.currentUser;
                if (user && user.uid === storedUid) {
                    try {
                        await deleteUser(user); // Deletes the current anonymous account
                        console.log("Guest account deleted due to expiration.");

                        // Clear localStorage and create a new guest account
                        localStorage.removeItem("repple-guest_uid");
                        localStorage.removeItem("repple-guest_creation_time");
                        shouldCreateNewAccount = true;
                    } catch (error) {
                        console.error("Error deleting user:", error);
                        throw error;
                    }
                }
            } else {
                // Account is valid, reuse the existing anonymous account
                const user = auth.currentUser;
                if (user && user.uid === storedUid) {
                    console.log("Reusing stored anonymous user:", user);
                    return user;
                } else {
                    // Mismatch: localStorage UID doesn't match current user
                    console.warn("Stored UID does not match current user. Clearing localStorage.");
                    localStorage.removeItem("repple-guest_uid");
                    localStorage.removeItem("repple-guest_creation_time");
                    shouldCreateNewAccount = true;
                }
            }
        } else {
            // No stored account, create a new one
            shouldCreateNewAccount = true;
        }

        // If we reach here, either the account is expired or doesn't exist, so create a new one
        if (shouldCreateNewAccount) {
            // Create a new anonymous account if no valid stored account
            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;
            console.log("New anonymous user signed in:", user);

            // Save the UID and creation time to local storage
            localStorage.setItem("repple-guest_uid", user.uid);
            localStorage.setItem("repple-guest_creation_time", new Date().getTime().toString());

            return user;
        }
    } catch (error) {
        console.error("Error signing in anonymously:", error);
        throw error;
    }
};

export const doSignOut = async () => {
    try {
        await signOut(auth);
        console.log("User signed out.");
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const doPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent!");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
};

export const doPasswordChange = async (password) => {
    try {
        const user = auth.currentUser;
        await updatePassword(user, password);
        console.log("Password updated successfully!");
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};

export const doSendEmailVerification = async () => {
    try {
        await sendEmailVerification(auth.currentUser, {
            url: `${window.location.origin}`,
            handleCodeInApp: true,
        });
        console.log("Email verification sent!");
    } catch (error) {
        console.error("Error sending email verification:", error);
        throw error;
    }
};
