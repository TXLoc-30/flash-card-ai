/**
 * Hook for user authentication and account management:
 * 
 * Logging user in
 * Signing user up
 * Logging user out
 * Updating user email
 * Changing user password
 * Deleting account
 */

import { useState, useEffect, useContext } from 'react';
import { auth, db, EmailAuthProvider } from '../firebase/firebaseIndex';
import { firebaseAuth } from '../provider/AuthProvider';

const useAuth = (email = null, password = null, newPassword = null, displayName = null) => {
  const { user } = useContext(firebaseAuth);

  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("pending");

  const [login, setLogin] = useState(0);
  const [signup, setSignup] = useState(0);
  const [logout, setLogout] = useState(0);
  const [changeEmail, setChangeEmail] = useState(0);
  const [changePassword, setChangePassword] = useState(0);
  const [changeDisplayName, setChangeDisplayName] = useState(0);
  const [deleteAccount, setDeleteAccount] = useState(0);

  // Logging user in
  useEffect(() => {
    if (login === 0 || user != null) return;
    setError(null);
    setStatus("loading");

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let _user = userCredential.user;
      console.log("Logged in: ", _user)
      setUserData(_user);
      setStatus("success");
    })
    .catch((error) => {
      console.error("Error logging user in: ", error.message);
      setError(error);
      setStatus("error");
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login]);

  // Signing user up
  useEffect(() => {
    if (signup === 0 || user != null) return;
    setError(null);
    setStatus("loading");

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        let _user = userCredential.user;
        const userData = {
          decks: []
        };
        if (displayName && displayName.trim() !== "") {
          userData.displayName = displayName.trim();
        }
        db.collection('users').doc(_user.uid).set(userData);
        setUserData(_user);
        setStatus("success");
      })
      .catch((error) => {
        console.error("Error signing user in: ", error.message);
        setError(error);
        setStatus("error");
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signup]);

  // Logging user out
  useEffect(() => {
    if (logout === 0 || user === null) return;
    setError(null);
    setStatus("loading");

    auth.signOut()
    .then(() => {
      console.log("Logged out");
      setUserData(null);
      setStatus("success");
    })
    .catch(error => {
      console.error("Error logging user out: ", error.message);
      setError(error.code);
      setStatus("error");
    })

  }, [logout, user]);

  // Changing user email
  useEffect(() => {
    if (changeEmail === 0 || user === null) return;
    setError(null);
    setStatus("loading")

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email, 
      password,
    );
    auth.currentUser.reauthenticateWithCredential(credential).then(function() {
      console.log("User successfully reauthenticated.");
      auth.currentUser.updateEmail(email)
      .then(() => {
        console.log("Successfully updated email.")
        setStatus("success");
      })
      .catch((error) => {
        console.log("An error occurred updating the email: ", error.message);
        setError(error.code);
        setStatus("error");
      });
    }).catch((error) => {
      console.log("An error occurred reauthenticating the user: ", error.message);
      setError(error.code);
      setStatus("error");
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeEmail]);

  // Changing password
  useEffect(() => {
    if (changePassword === 0 || user === null) return;
    setError(null);
    setStatus("loading");

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email, 
      password,
    );
    
    auth.currentUser.reauthenticateWithCredential(credential).then(function() {
      console.log("User successfully reauthenticated.");
      auth.currentUser.updatePassword(newPassword).then(function() {
        console.log("Successfully updated password.");
        setStatus("success");
      }).catch((error) => {
        console.log("An error occurred updating the password: ", error.message);
        setError(error.code);
        setStatus("error");
      });
    }).catch((error) => {
      console.log("An error occurred reauthenticating the user: ", error.message);
      setError(error.code);
      setStatus("error");
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changePassword])

  // Changing display name
  useEffect(() => {
    if (changeDisplayName === 0 || user === null) return;
    setError(null);
    setStatus("loading");

    if (!displayName || displayName.trim() === "") {
      setError({ code: "empty-name" });
      setStatus("error");
      return;
    }

    db.collection('users').doc(user.uid).update({
      displayName: displayName.trim()
    })
    .then(() => {
      console.log("Successfully updated display name.");
      setStatus("success");
    })
    .catch((error) => {
      console.log("An error occurred updating the display name: ", error.message);
      setError(error);
      setStatus("error");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeDisplayName, user]);

  // Delete account
  useEffect(() => {
    if (deleteAccount === 0 || user === null) return;
    setError(null);
    setStatus("loading");

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email, 
      password,
    );

    auth.currentUser.reauthenticateWithCredential(credential).then(function() {
      console.log("User successfully reauthenticated.");
      auth.currentUser.delete().then(() => {
        console.log("User successfully deleted.");
        setStatus("success");
      }).catch((error) => {
        console.log("An error occurred deleting the user: ", error.message);
        setError(error.code);
        setStatus("error");
      })
    }).catch((error) => {
      console.log("An error occurred reauthenticating the user: ", error.message);
      setError(error.code);
      setStatus("error");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteAccount])

  const handleLogin = () => setLogin(prev => prev + 1);
  const handleSignup = () => setSignup(prev => prev + 1);
  const handleLogout = () => setLogout(prev => prev + 1);
  const handleChangeEmail = () => setChangeEmail(prev => prev + 1);
  const handleChangePassword = () => setChangePassword(prev => prev + 1);
  const handleChangeDisplayName = () => setChangeDisplayName(prev => prev + 1);
  const handleDeleteAccount = () => setDeleteAccount(prev => prev + 1);

  return { 
    userData, 
    error, 
    status,
    handleLogin, 
    handleSignup, 
    handleLogout,
    handleChangeEmail,
    handleChangePassword,
    handleChangeDisplayName,
    handleDeleteAccount,
  };
}

export default useAuth;