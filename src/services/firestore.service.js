// src\services\firestore.service.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const addDocument = (path, data) => addDoc(collection(db, path), data);

export const getCollection = async (path) => {
  const snapshot = await getDocs(collection(db, path));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
