import mongoose from "mongoose";

const UserDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  description: { type: String },
  skills: { type: String },
});

export default mongoose.model("UserDetails", UserDetailsSchema);
