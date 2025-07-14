import mongoose from 'mongoose';
const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null,
    },
},
{
    timestamps: true,
});
const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;