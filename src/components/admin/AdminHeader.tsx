import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-belek-black">Панель администратора</h1>
      <Button
        onClick={onLogout}
        className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 shadow-md"
      >
        Выйти
      </Button>
    </div>
  );
};