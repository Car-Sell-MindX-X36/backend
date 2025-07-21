import Vehicle from "../models/Vehicle.js";

export const publishVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    // 1. Kiểm tra xe có tồn tại không
    if (!vehicle) {
      return res.status(404).json({ message: "🚗 Xe không tồn tại" });
    }
    // ⚠️ Tránh agent đăng xe không thuộc quyền của mình
if (vehicle.staff_id.toString() !== req.staff._id.toString()) {
  return res.status(403).json({ message: "🚫 Bạn không có quyền đăng xe này" });
}


    // 2. Chỉ cho phép đăng xe để bán
    if (vehicle.type !== 'sale') {
      return res.status(400).json({ message: "🚗 Chỉ cho phép đăng xe để bán" });
    }

    // 3. Kiểm tra trạng thái xe
    if (vehicle.status === 'sold') {
      return res.status(400).json({ message: "🚗 Xe đã được bán, không thể đăng tải" });
    }

    if (vehicle.status === 'available') {
      return res.status(400).json({ message: "🚗 Xe đã được đăng bán trước đó" });
    }

    // 4. Kiểm tra ảnh (phải có ít nhất 1 ảnh)
    if (!vehicle.images || vehicle.images.length === 0) {
      return res.status(400).json({ message: "🚗 Xe chưa có ảnh, không thể đăng bán" });
    }

    // 5. Kiểm tra mô tả (tối thiểu 10 ký tự)
    if (!vehicle.description || vehicle.description.length < 10) {
      return res.status(400).json({ message: "🚗 Mô tả xe quá ngắn hoặc thiếu" });
    }

    // 6. Kiểm tra giá xe ≥ 100 triệu
    if (!vehicle.price || vehicle.price < 100000000) {
      return res.status(400).json({ message: "🚗 Giá xe phải từ 100 triệu trở lên mới đủ điều kiện đăng bán" });
    }

    // 7. Kiểm tra phần trăm sử dụng nếu là xe cũ
    if (
      vehicle.condition === 'used' &&
      (vehicle.used_percent === undefined || vehicle.used_percent < 60)
    ) {
      return res.status(400).json({ message: "🚗 Vui lòng nhập phần trăm đã sử dụng hợp lệ (≥ 60%) cho xe cũ" });
    }

    // 8. Cập nhật trạng thái thành 'available'
    vehicle.status = 'available';
    const updatedVehicle = await vehicle.save();

    return res.status(200).json({
      message: "🚗 Xe đã được đăng tải thành công",
      vehicle: updatedVehicle,
    });

  } catch (error) {
    console.error("🚨 Error publishing vehicle:", error);
    return res.status(500).json({
      message: "❌ Đăng tải xe thất bại",
      error: error.message,
    });
  }
};
