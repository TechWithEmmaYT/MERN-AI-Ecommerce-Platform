

export type CategoryType = {
      _id:string;
      name: string;
      imageUrl: string;
      description: string;
      isActive: boolean
      slug: string;
      createdAt:string;
      updatedAt: string
}
export type CategoryResponseType = {
    message: string;
     categories: CategoryType[]
};
