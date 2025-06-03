import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          RhythmSync
          <span className="text-purple-600"> Organizers</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage events, venues, and bookings for the RhythmSync platform. 
          Your central hub for organizing musical experiences.
        </p>
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 