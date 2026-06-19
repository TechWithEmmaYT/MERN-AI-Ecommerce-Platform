import CategoryModel from "../models/category.model";

export const getCategoriesService = async () => {
  const categories = await CategoryModel.find({ isActive: true })
    .sort({ _id: 1, })
    .lean();

  return { categories };
};
