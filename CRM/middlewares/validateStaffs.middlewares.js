import { staffRegisterSchema } from "../validations/staffRegister.schema.js";
export const validateStaffRegister = (req, res, next) => {
    const {error} = staffRegisterSchema.validate(req.body, {abortEarly: false});
    if (error){
        const errors = error.details.map((err)=>err.message);
        return res.status(400).json({errors});
    }
    next();
}