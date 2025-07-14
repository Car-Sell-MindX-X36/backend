import Vehicle from "../models/Vehicle.js";
// Tạo xe mới
export const createVehicle = async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        const savedVehicle = await vehicle.save();
        res.status(201).json({message: "🚗 Xe đã được thêm mới" , vehicle: savedVehicle})
    }catch(error){
        console.error("Error creating vehicle: ", error);
        res.status(500).json({message: "🚗 Đã có lỗi xảy ra khi thêm xe mới"})
    }
};
// Lấy danh sách tất cả xe
export const getAllVehicles = async(req , res) => {
    try { 
        const vehicle = await Vehicle.find().populate('staff_id buyer_id renter_id');
        res.status(200).json({message: "🚗 Tổng danh sách xe", vehicle: vehicle});
    }catch(error){
        console.error("Error fetching vehicles: ", error);
        res.status(500).json({message: "🚗 Đã có lỗi xảy ra khi lấy tổng danh sách xe"})
    }
};
// Lấy thông tin xe theo ID
export const getVehicleById = async (req , res) => {
    try{
        const vehicle = await Vehicle.findById(req.params.id).populate('staff_id buyer_id renter_id');
        if(!vehicle) {
            return res.status(404).json({message: "🚗 Xe chưa đăng tải"});
        }
        res.status(200).json({message: "🚗 Thông tin xe", vehicle: vehicle});
    }catch(error){
        console.error("Error fetching vehicle: ", error);
        res.status(500).json({message: "🚗 Đã có lỗi xảy ra khi lấy thông tin xe"})
    }
};
// Sửa thông tin xe
export const updateVehicle = async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: '🚗 Không tìm thấy xe để sửa đổi thông tin' });
    }
    res.status(200).json({ message: '🔧 Cập nhật thông tin xe thành công', data: updated });
  } catch (err) {
    res.status(400).json({ message: '❌ Cập nhật thông tin xe thất bại', error: err.message });
  }
};
// Xóa xe theo ID
export const deleteVehicle = async (req , res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if(!deletedVehicle){
            return res.status(404).json({message: "🚗 Không tìm thấy xe để xóa"});
        }
        res.status(200).json({message: "🚗 Xe đã được xóa thành công", vehicle: deletedVehicle});
    }catch(error){
        console.error("Error deleting vehicle: ", error);
        res.status(500).json({message: "🚗 Đã có lỗi xảy ra khi xóa xe"})
    }
}