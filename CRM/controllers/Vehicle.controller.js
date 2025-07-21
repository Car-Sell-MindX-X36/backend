import Vehicle from "../models/Vehicle.js";
import Brand from "../models/Brand.js";
import cloudinary from "../configs/Cloudinary.js";

// ✅ Hàm tạo xe kèm upload ảnh
export const createVehicle = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      model,
      year,
      price,
      type,
      condition,
      used_percent,
    } = req.body;

    const parsedPrice = Number(price);
    const parsedYear = Number(year);
    const parsedUsed = Number(used_percent);

    if (!title || !description || description.length < 10) {
      return res.status(400).json({ message: "📝 Vui lòng nhập tiêu đề và mô tả tối thiểu 10 ký tự" });
    }

    if (!brand || !model || !parsedYear || parsedYear < 1886) {
      return res.status(400).json({ message: "📅 Năm sản xuất không hợp lệ (>= 1886)" });
    }

    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return res.status(404).json({ message: "🚫 Hãng xe không tồn tại" });
    }


    if (!type || !['rental', 'sale'].includes(type)) {
      return res.status(400).json({ message: "📦 Loại xe phải là 'rental' hoặc 'sale'" });
    }

    if (!parsedPrice || parsedPrice < 150000) {
      return res.status(400).json({ message: "💰 Giá xe phải từ 150.000 trở lên" });
    }

    if (type === 'sale' && parsedPrice < 100000000) {
      return res.status(400).json({ message: "💰 Xe bán phải có giá từ 100 triệu trở lên" });
    }

    if (type === 'rental' && parsedPrice < 150000) {
      return res.status(400).json({ message: "💰 Giá thuê xe phải từ 150.000 trở lên" });
    }

    if (!condition || !['new', 'used'].includes(condition)) {
      return res.status(400).json({ message: "🛠 Tình trạng xe phải là 'new' hoặc 'used'" });
    }

    if (condition === 'used') {
      if (parsedUsed === undefined || parsedUsed < 60 || parsedUsed > 99) {
        return res.status(400).json({
          message: "⚠️ Xe cũ phải có phần trăm sử dụng từ 60% đến 99%",
        });
      }
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "🖼 Vui lòng thêm ít nhất 1 ảnh xe" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "vehicles" },
          (error, result) => {
            if (error) return reject(error);
            resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(file.buffer);
      });
    });

    const imageResults = await Promise.all(uploadPromises);

    const vehicle = new Vehicle({
      title,
      description,
      brand,
      model,
      year: parsedYear,
      price: parsedPrice,
      type,
      condition,
      used_percent: condition === 'used' ? parsedUsed : undefined,
      images: imageResults,
      staff_id: req.staff._id,
      status: 'draft',
    });

    const savedVehicle = await vehicle.save();

    res.status(201).json({
      message: "🚗 Xe đã được thêm mới kèm ảnh Cloudinary",
      vehicle: savedVehicle,
    });
  } catch (error) {
    console.error("❌ Error creating vehicle: ", error);
    res.status(500).json({
      message: "🚗 Đã có lỗi xảy ra khi thêm xe mới",
      error: error.message,
    });
  }
};


// Hàm api lấy danh sách xe
export const getAllVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalVehicles = await Vehicle.countDocuments();

    const vehicles = await Vehicle.find()
      .populate([
        { path: 'staff_id' },
        { path: 'buyer_id' },
        { path: 'renter_id' },
        { path: 'brand', select: 'name' } // ✅ populate tên hãng
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "🚗 Danh sách xe theo trang",
      currentPage: page,
      totalPages: Math.ceil(totalVehicles / limit),
      totalVehicles,
      vehicles,
    });

  } catch (error) {
    console.error("❌ Error fetching vehicles: ", error);
    res.status(500).json({
      message: "🚗 Đã có lỗi xảy ra khi lấy danh sách xe",
      error: error.message,
    });
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

    // ✅ Kiểm tra quyền sở hữu
    if (vehicle.staff_id.toString() !== req.staff._id.toString()) {
      return res.status(403).json({ message: "🚫 Bạn không có quyền sửa xe này" });
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

    // ✅ 3. Cập nhật các field khác (ngoại trừ ảnh xoá)
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

    // ✅ Kiểm tra quyền sở hữu
    if (vehicle.staff_id.toString() !== req.staff._id.toString()) {
      return res.status(403).json({ message: "🚫 Bạn không có quyền xoá xe này" });
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
// Lấy toàn bộ hãng xe để đổ vào dropdown form tạo xe
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select('name') // chỉ lấy field 'name'
    res.status(200).json({
      message: "✅ Danh sách hãng xe",
      brands,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách brand:", error)
    res.status(500).json({
      message: "❌ Lỗi khi lấy danh sách hãng xe",
      error: error.message,
    });
  }
};
