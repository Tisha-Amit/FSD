import axios from "axios";

// ─── FakeStore API (Products) ─────────────────────────────────────────────────
const fakeStoreAPI = axios.create({
  baseURL: "https://fakestoreapi.com",
});

// Get all products
export const getProducts = () => fakeStoreAPI.get("/products");

// Get single product
export const getProduct = (id) => fakeStoreAPI.get(`/products/${id}`);

// ─── Our Backend API (Auth, Payment, Upload) ──────────────────────────────────
const backendAPI = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token automatically to every backend request
backendAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecom_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (data) => backendAPI.post("/auth/register", data);
export const loginUser = (data) => backendAPI.post("/auth/login", data);
export const getProfile = () => backendAPI.get("/auth/profile");

// ── Payment ───────────────────────────────────────────────────────────────────
export const processPayment = (data) => backendAPI.post("/payment/process", data);

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return backendAPI.post("/upload/product-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};