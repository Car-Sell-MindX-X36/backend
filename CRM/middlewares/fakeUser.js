// middlewares/fakeUser.middleware.js
export const fakeUser = (req, res, next) => {
  req.user = {
    _id: "664e3adfbf2348a1e0e4fc0a", // ID HR thật trong MongoDB nếu có
    role: "hr",
  };
  next();
};
