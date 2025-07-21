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


const uploadImageToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    }).end(fileBuffer);
  });
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: "🚗 Xe không tồn tại" });
    }

    // 1. Chỉ agent tạo xe mới được sửa
    if (vehicle.staff_id.toString() !== req.staff._id.toString()) {
      return res.status(403).json({ message: "🚫 Bạn không có quyền cập nhật xe này" });
    }

    // 2. Không cho sửa buyer_id hoặc renter_id
    const forbiddenFields = ['buyer_id', 'renter_id'];
    for (const field of forbiddenFields) {
      if (req.body[field]) {
        return res.status(400).json({ message: `🚫 Không được cập nhật ${field} trực tiếp` });
      }
    }

    // 3. Xử lý ảnh mới nếu có upload từ FE
    if (req.files && req.files.length > 0) {
      const uploadedImageUrls = [];

      for (const file of req.files) {
        const url = await uploadImageToCloudinary(file.buffer);
        uploadedImageUrls.push(url);
      }

      req.body.images = uploadedImageUrls;
    }

    // 4. Kiểm soát cập nhật status
    const currentStatus = vehicle.status;
    const requestedStatus = req.body.status;

    if (requestedStatus && requestedStatus !== currentStatus) {
      // Chặn từ draft → available (bắt buộc phải dùng hàm publish)
      if (currentStatus === 'draft' && requestedStatus === 'available') {
        return res.status(400).json({ message: "🚫 Vui lòng sử dụng chức năng 'Đăng xe' để công khai xe" });
      }

      // Chỉ cho phép từ available → sold hoặc rented
      if (
        currentStatus === 'available' &&
        (requestedStatus === 'sold' || requestedStatus === 'rented')
      ) {
        vehicle.status = requestedStatus;
      } else {
        return res.status(400).json({
          message: `🚫 Không thể chuyển trạng thái từ ${currentStatus} sang ${requestedStatus}`
        });
      }
    }

    // 5. Chỉ cập nhật những field được phép
    const allowedFields = [
      "title", "description", "price", "year", "model",
      "brand", "type", "condition", "used_percent", "images"
    ];

    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        vehicle[key] = req.body[key];
      }
    }

    const updatedVehicle = await vehicle.save();

    return res.status(200).json({
      message: "✅ Cập nhật thông tin xe thành công",
      vehicle: updatedVehicle,
    });

  } catch (error) {
    console.error("❌ Lỗi khi cập nhật xe:", error);
    return res.status(500).json({
      message: "🚨 Có lỗi xảy ra khi cập nhật xe",
      error: error.message,
    });
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
