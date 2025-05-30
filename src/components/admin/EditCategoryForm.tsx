import { useForm } from "react-hook-form";
import { useEffect } from "react";

type CategoryFormData = {
  category: string;
  image?: File | null;       // новое загруженное изображение
  imageUrl?: string;         // существующая ссылка на изображение
};


const EditCategoryForm = ({ categoryData, onSubmit }: { categoryData: any, onSubmit: (data: CategoryFormData) => void }) => {
  const { register, handleSubmit, setValue, watch } = useForm<CategoryFormData>();

  // Установим значения в форму при загрузке
  useEffect(() => {
    if (categoryData) {
      setValue("category", categoryData.category);
      setValue("imageUrl", categoryData.image); // существующее изображение
    }
  }, [categoryData, setValue]);

  const currentImageUrl = watch("imageUrl");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Название категории</label>
        <input
          type="text"
          {...register("category", { required: true })}
          className="input"
        />
      </div>

      <div>
        <label className="block mb-1">Изображение</label>
        {currentImageUrl && (
          <img src={currentImageUrl} alt="Текущее изображение" className="h-24 mb-2 rounded" />
        )}
        <input
          type="file"
          accept="image/*"
          {...register("image")}
          className="input"
        />
      </div>

      <button type="submit" className="btn btn-primary">Сохранить</button>
    </form>
  );
};


export default EditCategoryForm