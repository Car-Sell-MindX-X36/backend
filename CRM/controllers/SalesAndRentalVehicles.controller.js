import Vehicle from "../models/Vehicle.js";
export const publishVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await Vehicle.findById(id);
        if(!vehicle) {
            return res.status(404).json({ message: "🚗 Xe không tồn tại" });
        }
        if(vehicle.status === 'sold'){
            return res.status(400).json({ message: "🚗 Xe đã được bán, không thể đăng tải" });
        }
        if(vehicle.status === 'available'){
            return res.status(400).json({ message: "🚗 Xe đã được đăng bán trước đó" });
        }
        vehicle.status = 'available';
        const updatedVehicle = await vehicle.save();
        res.status(200).json({ message: "🚗 Xe đã được đăng tải thành công", vehicle: updatedVehicle });
    } catch (error) {
        console.error("🚨 Error publishing vehicle:", error);
        res.status(500).json({ message: "❌ Đăng tải xe thất bại", error: error.message });
    }
}