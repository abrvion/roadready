
// Address business logic.

import pool from "../config/database.js";

import {
  createAddress,
  getAddressesByUserId,
  getAddressById,
  updateAddress,
  deleteAddress,
  setOtherAddressesNotDefault,
  getAddressCountByUserId,
  getAddressByIdForUpdate,
  isAddressUsedByOrder
} from "../models/Address.js";

export const addAddress = async (
  userId,
  name,
  phone,
  addressLine,
  city,
  postalCode,
  label,
  isDefault
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const addressCount = await getAddressCountByUserId(
      client,
      userId
    );

    // The first address automatically becomes default.
    const shouldBeDefault =
      addressCount === 0 || isDefault === true;

    // If this address should be default,
    // remove default from all other addresses first.
    if (shouldBeDefault) {
      await setOtherAddressesNotDefault(
        client,
        userId
      );
    }

    const address = await createAddress(
      client,
      userId,
      name,
      phone,
      addressLine,
      city,
      postalCode,
      label,
      shouldBeDefault
    );

    await client.query("COMMIT");

    return address;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getUserAddresses = async (userId) => {
  return await getAddressesByUserId(userId);
};

export const getUserAddress = async (
  addressId,
  userId
) => {
  return await getAddressById(
    addressId,
    userId
  );
};

export const editAddress = async (
  addressId,
  userId,
  name,
  phone,
  addressLine,
  city,
  postalCode,
  label,
  isDefault
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingAddress =
      await getAddressByIdForUpdate(
        client,
        addressId,
        userId
      );

    if (!existingAddress) {
      await client.query("ROLLBACK");
      return null;
    }

    /*
      If this address is already the default,
      don't allow the user to remove the only default
      without choosing another address first.
    */
    if (
      existingAddress.is_default &&
      isDefault === false
    ) {
      throw new Error(
        "You must keep a default address. Make another address default first."
      );
    }

    // If this address is being made default,
    // remove default from every other address.
    if (isDefault === true) {
      await setOtherAddressesNotDefault(
        client,
        userId,
        addressId
      );
    }

    const address = await updateAddress(
      client,
      addressId,
      userId,
      name,
      phone,
      addressLine,
      city,
      postalCode,
      label,
      isDefault
    );

    await client.query("COMMIT");

    return address;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const removeAddress = async (
  addressId,
  userId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const address =
      await getAddressByIdForUpdate(
        client,
        addressId,
        userId
      );

    if (!address) {
      await client.query("ROLLBACK");
      return null;
    }

    /*
      An address that has already been used by an order
      cannot be deleted.

      The order still references this saved address,
      so we protect the relationship.
    */
    const usedByOrder =
      await isAddressUsedByOrder(
        client,
        addressId,
        userId
      );

    if (usedByOrder) {
      throw new Error(
        "This address is used by an existing order and cannot be deleted."
      );
    }

    const deletedAddress =
      await deleteAddress(
        client,
        addressId,
        userId
      );

    /*
      If the deleted address was the default,
      promote another saved address.

      We choose the oldest remaining address.
    */
    if (
      deletedAddress &&
      address.is_default
    ) {
      const nextDefaultResult =
        await client.query(
          `
          SELECT id
          FROM addresses
          WHERE user_id = $1
          ORDER BY id
          LIMIT 1;
          `,
          [userId]
        );

      if (
        nextDefaultResult.rows.length > 0
      ) {
        await client.query(
          `
          UPDATE addresses
          SET is_default = TRUE
          WHERE id = $1;
          `,
          [nextDefaultResult.rows[0].id]
        );
      }
    }

    await client.query("COMMIT");

    return deletedAddress;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

