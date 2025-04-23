// UserContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
      }

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (!profileError) {
          setProfile(profileData);
        } else {
          console.error("Error fetching profile:", profileError);
        }

        const { data: shiftsData, error: shiftsError } = await supabase
          .from("shifts")
          .select("id, start_time, end_time, type, position")
          .eq("user_id", currentUser.id)
          .order("end_time", { ascending: true });

        if (!shiftsError) {
          const now = new Date(
            new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" })
          );

          const upcomingShifts = shiftsData.filter(
            (shift) => new Date(shift.end_time) >= now
          );
          console.log("Upcoming shifts:", upcomingShifts);

          const current = upcomingShifts.find((shift) => {
            const startTime = new Date(shift.start_time);
            const endTime = new Date(shift.end_time);
            return startTime <= now && endTime >= now;
          });

          setCurrentShift(current);
          setShifts(
            current
              ? upcomingShifts.filter((shift) => shift.id !== current.id)
              : upcomingShifts
          );
        } else {
          console.error("Error fetching shifts:", shiftsError);
        }
      }

      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user || null;
        setUser(newUser);
        if (!newUser) {
          setProfile(null);
          setShifts([]);
          setCurrentShift(null);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        profile,
        setProfile,
        shifts,
        setShifts,
        currentShift,
        setCurrentShift,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
