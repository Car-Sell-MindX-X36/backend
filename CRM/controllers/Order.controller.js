import Order from '../models/Order.js';
import Vehicle from '../models/Vehicle.js';
import Customer from '../models/Customers.js';
import Staff from '../models/Staffs.js';

export const createOrder = async (req, res) => {
  try {
    const { customerId, vehicles, orderType, paymentMethod, staffId, note } = req.body;

    // ✅ Validate cơ bản
    if (!customerId || !vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin khách hàng và ít nhất 1 xe" });
    }

    if (!['rental', 'buy'].includes(orderType)) {
      return res.status(400).json({ message: "🚫 Loại đơn hàng không hợp lệ" });
    }

    if (!['cash', 'qr', 'installment'].includes(paymentMethod)) {
      return res.status(400).json({ message: "🚫 Phương thức thanh toán không hợp lệ" });
    }

    // ✅ Check duplicate vehicleId
    const vehicleIds = vehicles.map(v => v.vehicleId);
    const duplicateIds = vehicleIds.filter((id, index) => vehicleIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      return res.status(400).json({ message: `🚫 Xe bị lặp trong đơn hàng: ${[...new Set(duplicateIds)].join(', ')}` });
    }

    // ✅ Kiểm tra tồn tại khách hàng và nhân viên
    const [customer, staff] = await Promise.all([
      Customer.findById(customerId),
      Staff.findById(staffId),
    ]);

    if (!customer) {
      return res.status(404).json({ message: "❌ Không tìm thấy khách hàng" });
    }

    if (!staff) {
      return res.status(404).json({ message: "❌ Không tìm thấy nhân viên" });
    }

    // ✅ Validate role của nhân viên
    if (!['agent', 'manager'].includes(staff.role)) {
      return res.status(403).json({ message: "🚫 Nhân viên không có quyền tạo đơn hàng" });
    }

    // ✅ Duyệt danh sách xe
    let totalAmount = 0;
    const vehicleList = [];

    for (const v of vehicles) {
      const vehicle = await Vehicle.findById(v.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: `❌ Xe không tồn tại: ${v.vehicleId}` });
      }

      // 🚫 Nếu nghiệp vụ yêu cầu kiểm tra quyền quản lý xe:
      // if (staff.role === 'agent' && vehicle.createdBy.toString() !== staffId) {
      //   return res.status(403).json({ message: `🚫 Xe không thuộc quyền quản lý của agent: ${v.vehicleId}` });
      // }

      if (vehicle.status !== 'available') {
        return res.status(400).json({ message: `🚫 Xe không khả dụng: ${vehicle._id}` });
      }

      if (orderType === 'rental') {
        const { startDate, endDate } = v.rentalPeriod || {};
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (!startDate || !endDate || isNaN(start) || isNaN(end) || start >= end) {
          return res.status(400).json({ message: `⏰ Thời gian thuê không hợp lệ cho xe: ${v.vehicleId}` });
        }
      }

      // ✅ Add vào danh sách hợp lệ
      vehicleList.push({
        vehicleId: v.vehicleId,
        price: vehicle.price,
        rentalPeriod: v.rentalPeriod || {},
      });

      totalAmount += vehicle.price;
    }

    // ✅ Validate nếu thanh toán trả góp
    if (paymentMethod === 'installment' && totalAmount < 10000000) {
      return res.status(400).json({ message: "🚫 Trả góp chỉ áp dụng cho đơn từ 10 triệu trở lên" });
    }

    // ✅ Tạo đơn hàng
    const newOrder = new Order({
      customerId: customer._id,
      vehicles: vehicleList,
      orderType,
      paymentMethod,
      staffId,
      note,
      totalAmount,
    });

    await newOrder.save();

    return res.status(201).json({
      message: "✅ Tạo đơn hàng thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error);
    return res.status(500).json({ message: '🚫 Lỗi server khi tạo đơn hàng' });
  }
};
