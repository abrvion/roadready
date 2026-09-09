
// Address controller logic.

import {
  addAddress,
  getUserAddresses,
  getUserAddress,
  editAddress,
  removeAddress
} from "../services/addressService.js";

export const createAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      addressLine,
      city,
      postalCode,
      label,
      isDefault
    } = req.body;

    const userId = req.user.id;

    if (
      !name ||
      !phone ||
      !addressLine ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, phone, addressLine and city are required"
      });
    }

    const address = await addAddress(
      userId,
      name,
      phone,
      addressLine,
      city,
      postalCode,
      label,
      isDefault === true
    );

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address
    });
  } catch (error) {
    console.error(
      "Failed to create address:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create address"
    });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses =
      await getUserAddresses(userId);

    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error(
      "Failed to fetch addresses:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses"
    });
  }
};

export const getAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const address = await getUserAddress(
      req.params.id,
      userId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      address
    });
  } catch (error) {
    console.error(
      "Failed to fetch address:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch address"
    });
  }
};

export const updateAddressController = async (
  req,
  res
) => {
  try {
    const {
      name,
      phone,
      addressLine,
      city,
      postalCode,
      label,
      isDefault
    } = req.body;

    const userId = req.user.id;

    if (
      !name ||
      !phone ||
      !addressLine ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, phone, addressLine and city are required"
      });
    }

    const address = await editAddress(
      req.params.id,
      userId,
      name,
      phone,
      addressLine,
      city,
      postalCode,
      label,
      isDefault === true
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      address
    });
  } catch (error) {
    console.error(
      "Failed to update address:",
      error
    );

    if (
      error.message ===
      "You must keep a default address. Make another address default first."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update address"
    });
  }
};

export const deleteAddressController = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const address = await removeAddress(
      req.params.id,
      userId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
      address
    });
  } catch (error) {
    console.error(
      "Failed to delete address:",
      error
    );

    if (
      error.message ===
      "This address is used by an existing order and cannot be deleted."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete address"
    });
  }
};

