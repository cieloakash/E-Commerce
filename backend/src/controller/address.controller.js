import { Address } from "../models/address.model.js";

export const addAddress = async (req, res) => {
  try {
    const { address, phone } = req.body;
    await Address.create({
      address,
      phone,
      user: req.user._id,
    });
    await Address.save();
    res.status(200).json({ success: "Address Updated" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAddress = async (req, res) => {
  try {
    const allAddress = await Address.findBy({ user: req.user._id });
    res.json(allAddress);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getSingleAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    res.json(address);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    await address.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Deleted Address successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
