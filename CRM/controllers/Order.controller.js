import Order from '../models/Order.js';
import Vehicle from '../models/Vehicle.js';
import { Customer } from '../models/Customers.js';

export const createOrder = async (req, res) => {
  try {
    const { vehicles, orderType, paymentMethod, note } = req.body;
    const customerId = req.customer._id;

    if (!customerId || !vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin khách hàng và ít nhất 1 xe" });
    }

    if (!['rental', 'buy'].includes(orderType)) {
      return res.status(400).json({ message: "🚫 Loại đơn hàng không hợp lệ" });
    }

    if (!['cash', 'qr', 'installment'].includes(paymentMethod)) {
      return res.status(400).json({ message: "🚫 Phương thức thanh toán không hợp lệ" });
    }

    const vehicleIds = vehicles.map(v => v.vehicleId);
    const duplicateIds = vehicleIds.filter((id, index) => vehicleIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      return res.status(400).json({ message: `🚫 Xe bị lặp trong đơn hàng: ${[...new Set(duplicateIds)].join(', ')}` });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "❌ Không tìm thấy khách hàng" });
    if (customer.banned) return res.status(403).json({ message: "🚫 Tài khoản bị khóa" });

    let totalAmount = 0;
    const vehicleList = [];

    for (const v of vehicles) {
      const vehicle = await Vehicle.findOneAndUpdate(
        {
          _id: v.vehicleId,
          status: 'available',
          type: orderType === 'buy' ? 'sale' : 'rental',
        },
        {
          $set: {
            status: orderType === 'buy' ? 'sold' : 'reserved',
            buyer_id: orderType === 'buy' ? customer._id : undefined, // chỉ update buyer_id nếu mua
          },
        },
        { new: true }
      ).populate('brand');

      if (!vehicle) {
        return res.status(400).json({ message: `🚫 Xe không khả dụng hoặc đã bị người khác đặt: ${v.vehicleId}` });
      }

      if (orderType === 'rental') {
        const { startDate, endDate } = v.rentalPeriod || {};
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!startDate || !endDate || isNaN(start) || isNaN(end) || start >= end) {
          return res.status(400).json({ message: `⏰ Thời gian thuê không hợp lệ: ${v.vehicleId}` });
        }
      }

      vehicleList.push({
        vehicleId: vehicle._id,
        price: vehicle.price,
        rentalPeriod: v.rentalPeriod || {},
        buyer_id: orderType === 'buy' ? customer._id : undefined,
        vehicleSnapshot: {
          name: vehicle.name,
          brand: vehicle.brand?.name || null,
          year: vehicle.year,
          image: vehicle.images?.[0] || null,
        }
      });

      totalAmount += vehicle.price;
    }

    if (paymentMethod === 'installment' && totalAmount < 10000000) {
      return res.status(400).json({ message: "🚫 Trả góp áp dụng từ 10 triệu trở lên" });
    }

    const newOrder = new Order({
      customerId: customer._id,
      vehicles: vehicleList,
      orderType,
      paymentMethod,
      note,
      totalAmount,
    });

    await newOrder.save();

    return res.status(201).json({
      message: "✅ Đơn hàng đã tạo thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error('❌ Lỗi tạo đơn:', error);
    return res.status(500).json({ message: '🚫 Lỗi server' });
  }
};
