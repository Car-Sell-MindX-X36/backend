import {Vehicle} from '../models/Vehicle.js';
// Hàm api bán xe
export const postSaleVehicle = async (req, res) => {
    try {
        const newVehicle= new Vehicle({
            ...req.body,
            staff_id: req.staff._id,
            type: 'sale',
        });
        const savedVehicle = await newVehicle.save();
         res.status(201).json({ message: "🛒 Đăng bán xe thành công", vehicle: savedVehicle });
    } catch (error) {
        console.error("🚨 Error posting sale vehicle:", error);
        res.status(500).json({ message: "❌ Đăng bán xe thất bại", error: error.message });
    }
};
// Hàm api cho thuê xe
export const postRentalVehicle = async (req, res) => {
    try {
        const newVehicle = new Vehicle({
            ...req.body,
            staff_id: req.staff._id,
            type: 'rental',
        });
        const savedVehicle = await newVehicle.save();
        res.status(201).json({ message: "🚗 Đăng cho thuê xe thành công", vehicle: savedVehicle });
    } catch (error) {
        console.error("🚨 Error posting rental vehicle:", error);
        res.status(500).json({ message: "❌ Đăng cho thuê xe thất bại", error: error.message });
    }
};