import Cart from "../models/cart.js";
import User from "../models/user.js";

async function resolveUserId(req) {
  if (req?.user?.userId) return req.user.userId;
  if (req?.user?.email) {
    const u = await User.findOne({ email: req.user.email }).select("_id").lean();
    return u?._id?.toString() || null;
  }
  return null;
}

export async function getCart(req, res) {
  try {
    const uid = await resolveUserId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ userId: uid });
    return res.json({ items: cart ? cart.items : [] });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
}

export async function addToCart(req, res) {
  try {
    const uid = await resolveUserId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const { item, quantity } = req.body || {};
    if (
      !item ||
      typeof quantity !== "number" ||
      !item.productId ||
      !item.name ||
      typeof item.price !== "number" ||
      !item.image
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    let cart = await Cart.findOne({ userId: uid });
    if (!cart) {
      cart = new Cart({ userId: uid, items: [] });
    }

    const idx = cart.items.findIndex((i) => i.productId === item.productId);
    if (idx >= 0) {
      cart.items[idx].quantity += quantity;
      if (cart.items[idx].quantity <= 0) {
        cart.items.splice(idx, 1);
      }
    } else if (quantity > 0) {
      cart.items.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity,
      });
    }

    await cart.save();
    return res.json({ items: cart.items });
  } catch (error) {
    console.error("Error updating cart:", error);
    return res.status(500).json({ message: "Failed to update cart" });
  }
}

export async function clearCart(req, res) {
  try {
    const uid = await resolveUserId(req);
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    await Cart.deleteOne({ userId: uid });
    return res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
}
