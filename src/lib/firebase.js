import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set, get, update, child } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const signupUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error.code, error.message);
    throw error;
  }
};

export const logoutUser = () => signOut(auth);

export const createUserDocument = async (userId, data) => {
  if (!userId) {
    throw new Error("User ID is undefined");
  }
  const userRef = ref(db, `users/${userId}`);
  await set(userRef, data);
};

export const getUserDocument = async (userId) => {
  if (!userId) {
    throw new Error("User ID is undefined");
  }
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.error("No data available");
    return null;
  }
};

export const updateUserDocument = async (userId, data) => {
  if (!userId) {
    throw new Error("User ID is undefined");
  }
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, data);
};

export const uploadFile = async (file, userId) => {
  if (!userId) {
    throw new Error("User ID is undefined");
  }
  const fileExtension = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExtension}`;
  const path = `resumes/${userId}/${fileName}`;
  const storageReference = storageRef(storage, path);
  await uploadBytes(storageReference, file);
  return getDownloadURL(storageReference);
};