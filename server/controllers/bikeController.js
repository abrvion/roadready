import {
  listBikes,
  getBikeById,
  getCompatibleProducts,
  createBike,
  updateBike,
  deleteBike,
  replaceCompatibility
} from "../models/Bike.js";

const normalizeYear = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 1950 || year > 2100) {
    throw new Error("Invalid bike year");
  }
  return year;
};

export const getBikes = async (req, res) => {
  try {
    const bikes = await listBikes({
      search: req.query.search || "",
      status: req.query.status || "active"
    });
    res.json({ success: true, bikes });
  } catch (error) {
    console.error("Failed to load bikes:", error);
    res.status(500).json({ success: false, message: "Failed to load bikes" });
  }
};

export const getBikeProducts = async (req, res) => {
  try {
    const bike = await getBikeById(req.params.id);
    if (!bike || bike.status !== "active") {
      return res.status(404).json({ success: false, message: "Bike not found" });
    }
    const products = await getCompatibleProducts(req.params.id);
    res.json({ success: true, bike, products });
  } catch (error) {
    console.error("Failed to load compatible products:", error);
    res.status(500).json({ success: false, message: "Failed to load compatible products" });
  }
};

export const adminListBikes = async (req, res) => {
  try {
    res.json({ success: true, bikes: await listBikes({ search: req.query.search || "", status: "all" }) });
  } catch (error) {
    console.error("Admin bike list failed:", error);
    res.status(500).json({ success: false, message: "Failed to load bikes" });
  }
};

export const adminCreateBike = async (req, res) => {
  try {
    const make = String(req.body?.make || "").trim();
    const model = String(req.body?.model || "").trim();
    if (!make || !model) return res.status(400).json({ success: false, message: "Make and model are required" });
    const yearFrom = normalizeYear(req.body?.yearFrom);
    const yearTo = normalizeYear(req.body?.yearTo);
    if (yearFrom && yearTo && yearFrom > yearTo) return res.status(400).json({ success: false, message: "Year range is invalid" });
    const bike = await createBike({ make, model, yearFrom, yearTo });
    res.status(201).json({ success: true, bike });
  } catch (error) {
    console.error("Admin bike create failed:", error);
    res.status(error.code === "23505" ? 409 : 500).json({ success: false, message: error.code === "23505" ? "That bike already exists" : "Failed to create bike" });
  }
};

export const adminUpdateBike = async (req, res) => {
  try {
    const make = String(req.body?.make || "").trim();
    const model = String(req.body?.model || "").trim();
    const status = req.body?.status;
    if (!make || !model || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ success: false, message: "Make, model and valid status are required" });
    }
    const yearFrom = normalizeYear(req.body?.yearFrom);
    const yearTo = normalizeYear(req.body?.yearTo);
    if (yearFrom && yearTo && yearFrom > yearTo) return res.status(400).json({ success: false, message: "Year range is invalid" });
    const bike = await updateBike(req.params.id, { make, model, yearFrom, yearTo, status });
    if (!bike) return res.status(404).json({ success: false, message: "Bike not found" });
    res.json({ success: true, bike });
  } catch (error) {
    console.error("Admin bike update failed:", error);
    res.status(500).json({ success: false, message: "Failed to update bike" });
  }
};

export const adminDeleteBike = async (req, res) => {
  try {
    const bike = await deleteBike(req.params.id);
    if (!bike) return res.status(404).json({ success: false, message: "Bike not found" });
    res.json({ success: true, message: "Bike deleted" });
  } catch (error) {
    console.error("Admin bike delete failed:", error);
    res.status(500).json({ success: false, message: "Failed to delete bike" });
  }
};

export const adminSetCompatibility = async (req, res) => {
  try {
    const bike = await getBikeById(req.params.id);
    if (!bike) return res.status(404).json({ success: false, message: "Bike not found" });
    const productIds = Array.isArray(req.body?.productIds) ? req.body.productIds : [];
    const products = await replaceCompatibility(req.params.id, productIds);
    res.json({ success: true, products });
  } catch (error) {
    console.error("Admin compatibility update failed:", error);
    res.status(500).json({ success: false, message: "Failed to update compatibility" });
  }
};
