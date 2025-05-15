import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    message: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                required: true
            },
            sender: {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                username: {
                    type: String,
                    required: true
                }
            },
            messageContent: {
                type: String,
                required: true
            }
        }
}, { timestamps: true });

const Attachment = mongoose.model("Attachment", attachmentSchema);

export default Attachment;