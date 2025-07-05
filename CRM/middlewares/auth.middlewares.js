import { userRegisterSchema } from "../validations/userRegister.schema";
export const validateUserRegister = (req, res, next) => {
    const {error} = userRegisterSchema.validate(req.body, {abortEarly: false});
    if (error){
        const errors = error.details.map((err)=>err.message);
        return res.status(400).json({errors});
    }
    next();
}