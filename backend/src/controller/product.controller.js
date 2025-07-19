import { Product } from "../models/product.model.js";
import productRoute from "../routes/product.route.js";
import bufferGenerator from "../utils/bufferGenerator.js";

export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "not authorized",
      });
    }
    const { title, description, category, price, stock } = req.body;
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({
        message: "no file to upload. ",
      });
    //   create a promise
    const imageUploadPromise = files.map(async (file) => {
      const fileBuffer = bufferGenerator(file);
      // invoke cloudinary to upload
      const result = await cloudinary.v2.uploader.upload(fileBuffer.content);
      return {
        id: result.public_id,
        url: result.secure_url,
      };
    });
    // reslve promise and upload to cloudinary
    const uploadImage = await Promise.all(imageUploadPromise);
    const product = await Product.create({
      title,
      description,
      stock,
      price,
      images: uploadImage,
      category,
    });
    await product.save();
    res
      .status(201)
      .json({ success: true, message: "Product created successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const { search, category, page, sortByPrice } = req.query;
    const filter = {};
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }
    if (category) {
      filter.category = category;
    }
    const limit = 8;
    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 };
    if (sortByPrice) {
      if (sortByPrice === "lowToHigh") {
        sortOption = { price: 1 };
      } else if (sortByPrice === "highToLow") {
        sortOption = { price: -1 };
      }
    }
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limit)
      .skip(skip);

    const categories = await Product.distinct("category");
    // currently added poduct
    const newProduct = await productRoute.find().sort("-createdAt").limit(4);
    // getting total number of product
    const countProduct = await Product.countDocuments();

    const totalPage = Math.ceil(countProduct / limit);
    res.json({ products, categories, totalPage, newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const relatedProduct = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);
    res.status(200).json({ product, relatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  // for updating
  // 1:check admin logged in or not
  // 2:update the value
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin can access these option" });
    }
    const { title, description, category, price, stock } = req.body;
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    if (price) updateFields.price = price;
    if (stock) updateFields.stock = stock;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res
      .status(200)
      .json({ success: true, message: "Product updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateImg = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin can access these option" });
    }
    const { id } = req.params;
    const files = req.files;
    if (!files || files.lenght === 0) {
      return res.status(400).json({
        message: "no file to upload. ",
      });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldImage = product.images || [];
    for (const img of oldImage) {
      if (img.id) {
        await cloudinary.v2.uploader.destroy(img.id);
      }
    }
    const imageUploadPromise = files.map(async (file) => {
      const fileBuffer = bufferGenerator(file);
      // invoke cloudinary to upload
      const result = await cloudinary.v2.uploader.upload(fileBuffer.content);
      return {
        id: result.public_id,
        url: result.secure_url,
      };
    });
    // reslve promise and upload to cloudinary
    const uploadImage = await Promise.all(imageUploadPromise);
    product.images = uploadImage;
    await product.save();
    res.status(200).json({ message: "updated Image successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", product });
  }
};
