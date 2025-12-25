// src\auth\auth.controller.js
import {
  registerEmail,
  loginEmail,
  loginGoogle,
} from "../services/auth.service";
import { createUserProfile, getUserProfile } from "../services/user.service";
import { showLoading, hideLoading } from "../ui/loading";
import { navigate } from "../app/router";

export const register = async ({ email, password, name }) => {
  try {
    showLoading();

    const cred = await registerEmail(email, password);

    await createUserProfile(cred.user.uid, {
      email,
      name,
    });

    navigate("/home");
  } catch (err) {
    console.error(err);

    alert("Account created, but profile setup failed. Please retry.");
  } finally {
    hideLoading();
  }
};

export const login = async ({ email, password }) => {
  try {
    showLoading();

    const cred = await loginEmail(email, password);
    const profile = await getUserProfile(cred.user.uid);

    if (!profile.biometricsEnabled) {
      navigate("/biometrics");
    } else {
      navigate("/home");
    }
  } catch (err) {
    alert(err.message);
  } finally {
    hideLoading();
  }
};

export const loginWithGoogle = async () => {
  showLoading();
  const cred = await loginGoogle();
  const profile = await getUserProfile(cred.user.uid);

  if (!profile) {
    await createUserProfile(cred.user.uid, {
      email: cred.user.email,
      name: cred.user.displayName,
    });
    navigate("/home");
  } else {
    navigate(profile.biometricsEnabled ? "/home" : "/biometrics");
  }

  hideLoading();
};
