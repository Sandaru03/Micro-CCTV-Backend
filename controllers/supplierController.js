import Supplier from "../models/supplier.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password from .env
    },
});

// Create Supplier (Admin Only)
export function createSupplier(req, res) {
    const defaultPassword = "supplier123";
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    const supplierData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: passwordHash,
        phone: req.body.phone || "Not Given",
        item: req.body.item || ""
    };

    const supplier = new Supplier(supplierData);

    supplier.save()
        .then(() => {
            res.json({
                message: "Supplier Created Successfully with default password"
            });
        })
        .catch(() => {
            res.json({
                message: "Failed to create Supplier"
            });
        });
}

// Get All Suppliers
export function getSupplier(req, res) {
    Supplier.find()
        .then((suppliers) => {
            res.json(suppliers);
        })
        .catch(() => {
            res.json({
                message: "Failed to fetch Supplier",
            });
        });
}

// Update Supplier by Email
export function updateSupplierByEmail(req, res) {
    const email = req.params.email;
    const updateData = { ...req.body };

    if (req.body.password) {
        updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    Supplier.findOneAndUpdate({ email: email }, updateData, { new: true })
        .then((updatedSupplier) => {
            if (!updatedSupplier) {
                return res.status(404).json({ message: "Supplier not found" });
            }
            res.json({
                message: "Supplier updated successfully",
                data: updatedSupplier
            });
        })
        .catch((error) => {
            res.status(500).json({ message: "Failed to update Supplier", error });
        });
}

// Delete Supplier by Email
export function deleteSupplierByEmail(req, res) {
    const email = req.params.email;

    Supplier.findOneAndDelete({ email: email })
        .then((deletedSupplier) => {
            if (!deletedSupplier) {
                return res.status(404).json({ message: "Supplier not found" });
            }
            res.json({
                message: "Supplier deleted successfully",
                data: deletedSupplier
            });
        })
        .catch((error) => {
            res.status(500).json({ message: "Failed to delete Supplier", error });
        });
}

// Supplier Login
export function loginSupplier(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    Supplier.findOne({ email: email })
        .then((supplier) => {
            if (!supplier) {
                return res.status(404).json({ message: "Supplier not found" });
            }

            const isPasswordCorrect = bcrypt.compareSync(password, supplier.password);
            if (isPasswordCorrect) {
                res.json({ message: "Login successful" });
            } else {
                res.status(403).json({ message: "Incorrect password" });
            }
        })
        .catch((error) => {
            res.status(500).json({ message: "Login error", error });
        });
}

// Send Purchase Request Email to Supplier
export async function sendPurchaseRequest(req, res) {
    const email = req.params.email;
    const { item, quantity, requiredDate } = req.body;

    try {
        // Find supplier by email
        const supplier = await Supplier.findOne({ email });
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        // Prepare email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: supplier.email,
            subject: `Purchase Request for ${item}`,
            html: `
                <h2>Purchase Request</h2>
                <p>Dear ${supplier.firstName} ${supplier.lastName},</p>
                <p>We would like to place a purchase request for the following item:</p>
                <ul>
                    <li><strong>Item:</strong> ${item}</li>
                    <li><strong>Quantity:</strong> ${quantity}</li>
                    <li><strong>Required Date:</strong> ${requiredDate}</li>
                </ul>
                <p>Please confirm the availability and provide a quotation at your earliest convenience.</p>
                <p>Thank you,<br>Micro CCTV Security Solution</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        res.json({ message: "Purchase request email sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send purchase request", error });
    }
}