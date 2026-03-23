// frontend/src/components/common/Loader.jsx

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning circle */}
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;