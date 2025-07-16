import Vehicle from "../models/Vehicle.js";
import cloudinary from "../configs/Cloudinary.js";
// Hàm api tạo xe mới
// ✅ Hàm tạo xe kèm upload ảnh
export const createVehicle = async (req, res) => {
  try {
    // Upload từng ảnh lên Cloudinary
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vehicles" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Tạo xe với ảnh đã upload
    const vehicle = new Vehicle({
      ...req.body,
      images: imageUrls,
      staff_id: req.staff._id,
    });

    const savedVehicle = await vehicle.save();

    res.status(201).json({
      message: "🚗 Xe đã được thêm mới kèm ảnh Cloudinary",
      vehicle: savedVehicle,
    });
  } catch (error) {
    console.error("Error creating vehicle: ", error);
    res.status(500).json({
      message: "🚗 Đã có lỗi xảy ra khi thêm xe mới",
      error: error.message,
    });
  }
};
// Hàm api lấy danh sách xe
export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().populate('staff_id buyer_id renter_id');
        res.status(200).json({ message: "🚗 Tổng danh sách xe", vehicles });
    } catch (error) {
        console.error("Error fetching vehicles: ", error);
        res.status(500).json({ message: "🚗 Đã có lỗi xảy ra khi lấy tổng danh sách xe" });
    }
};
// Hàm api lấy xe theo ID
export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('staff_id buyer_id renter_id');
        if (!vehicle) {
            return res.status(404).json({ message: "🚗 Xe chưa đăng tải" });
        }
        res.status(200).json({ message: "🚗 Thông tin xe", vehicle });
    } catch (error) {
        console.error("Error fetching vehicle: ", error);
        res.status(500).json({ message: "🚗 Đã có lỗi xảy ra khi lấy thông tin xe" });
    }
};
// Hàm api cập nhật thông tin xe
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Xe không tồn tại" });
    }

    // ✅ 1. Xoá ảnh cũ nếu có yêu cầu
    const { imagesToRemove } = req.body;
    if (imagesToRemove && imagesToRemove.length > 0) {
      for (const public_id of imagesToRemove) {
        await cloudinary.uploader.destroy(public_id);

        // Xoá trong DB (images[])
        vehicle.images = vehicle.images.filter((img) => img.public_id !== public_id);
      }
    }

    // ✅ 2. Upload ảnh mới nếu có
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "vehicles" },
            (error, result) => {
              if (error) return reject(error);
              return resolve({
                url: result.secure_url,
                public_id: result.public_id
              });
            }
          );
          stream.end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      vehicle.images.push(...uploadedImages);
    }

    // ✅ 3. Cập nhật các field khác
    Object.keys(req.body).forEach((key) => {
      if (!['imagesToRemove'].includes(key)) {
        vehicle[key] = req.body[key];
      }
    });

    const updated = await vehicle.save();
    res.status(200).json({ message: "Cập nhật xe thành công", vehicle: updated });

  } catch (err) {
    console.error("❌ Error updating vehicle:", err);
    res.status(500).json({ message: "Lỗi cập nhật xe", error: err.message });
  }
};
// Hàm api xóa xe
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "🚗 Không tìm thấy xe để xóa" });
    }

    // ✅ Xoá từng ảnh trên Cloudinary (nếu có public_id)
    for (const img of vehicle.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // ✅ Xoá document xe khỏi MongoDB
    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "🚗 Xe và ảnh liên quan đã được xóa thành công",
      vehicleId: req.params.id,
    });
  } catch (error) {
    console.error("❌ Lỗi xóa xe:", error);
    res.status(500).json({ message: "❌ Xảy ra lỗi khi xóa xe", error: error.message });
  }
};
