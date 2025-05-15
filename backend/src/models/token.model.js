import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['email_verification'], // can be extended for other token types like password reset
        default: 'email_verification'
    },
    expires: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Add index for token expiry and cleanup
tokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);
export default Token; 