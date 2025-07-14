import mongoose from "mongoose";
const vehicleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
        min: 1886, // Chiếc xe đầu tiên được sản xuất vào năm 1886
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ['rental', 'sale'],
        required: true,
    },
   staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
   },
   buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
   },
   renter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
   },
   images: [{
    type: String,
    required: true,
   },],
   status: {
    type: String,
    enum: ['available', 'sold', 'rented'],
    default: 'available',
   },
},
{
    timestamps: true,
}
);
const Vehicle= mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;