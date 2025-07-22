import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    vehicles: [
    {
        vehicleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vehicle',
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        rentalPeriod: {
          startDate: { type: Date },
          endDate: { type: Date },
        },
      },
    ],
    orderType: {
        type: String,
        enum: ['rental' , 'buy'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid' , 'paid' , 'failed' , 'partial'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'qr' , 'installment'],
        required: true,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
    },
    constractUrl: String,
    note: String,
    paymentConfirmAt: Date,
    orderCompletedAt: Date,
    
},
{
    timestamps: true,
}
);
const Order = mongoose.model("Order", orderSchema);
export default Order;