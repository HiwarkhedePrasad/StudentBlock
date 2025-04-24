import { FaWifi, FaUserShield, FaUtensils } from "react-icons/fa";

const FacilitiesSection = () => {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-12">
          Why Stay at <span className="text-blue-600">Anand Hostel?</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
            <FaWifi className="mx-auto text-blue-600 mb-4 text-4xl" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              High-Speed Wi-Fi
            </h3>
            <p className="text-gray-600">
              Stay connected with reliable internet for study and entertainment.
            </p>
          </div>
          <div className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
            <FaUserShield className="mx-auto text-blue-600 mb-4 text-4xl" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              24/7 Security
            </h3>
            <p className="text-gray-600">
              Secure campus with surveillance and friendly staff for your
              safety.
            </p>
          </div>
          <div className="p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
            <FaUtensils className="mx-auto text-blue-600 mb-4 text-4xl" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nutritious Meals
            </h3>
            <p className="text-gray-600">
              Wholesome, hygienic food served daily in our spacious mess.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
