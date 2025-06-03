import { useState, useEffect } from "react";
import { supabase } from "@rhythm-sync/database";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBands: 0,
    totalEvents: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total bands
        const { count: bandsCount } = await supabase
          .from("bands")
          .select("*", { count: "exact", head: true });

        // Fetch total events
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        // Fetch total users
        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        setStats({
          totalBands: bandsCount || 0,
          totalEvents: eventsCount || 0,
          totalUsers: usersCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Organizers Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bands</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalBands}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalEvents}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome to RhythmSync Organizers
          </h2>
          <p className="text-gray-600">
            This is your central hub for managing the RhythmSync platform. 
            Here you can oversee bands, events, users, and platform analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 