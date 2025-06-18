"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useAppSelector } from "@/lib/hooks";

interface User {
  name: string;
  email: string;
  profilePhoto: string;
}

export default function ProfilePage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [updateProfile, setUpdateProfile] = useState<boolean>(false);
  const [user, setUser] = useState<User>({
    name: "",
    email: "Loading user details...",
    profilePhoto:
      "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png",
  });

  const [formData, setFormData] = useState<{ name: string; file: File | null }>(
    {
      name: user.name,
      file: null,
    }
  );

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    console.log("Name changed to:", e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, file }));
    if (file) {
      console.log("File selected:", file.name, file.type, file.size, "bytes");
    } else {
      console.log("No file selected.");
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found in localStorage. Please log in.");
      alert("You are not authenticated. Please log in.");
      return;
    }

    if (formData.name.trim() === user.name && !formData.file) {
      alert(
        "No changes detected. Please update your name or select a new picture to save."
      );
      return;
    }

    if (formData.name.trim() === "" && !formData.file) {
      alert("Please enter a name or select a profile picture to update.");
      return;
    }

    const body = new FormData();
    body.append("name", formData.name.trim());

    if (formData.file) {
      body.append("profilePicture", formData.file);
    }

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);

    try {
      const res = await fetch(
        "https://livelywalls.onrender.com/api/profile/update",
        {
          method: "POST",
          headers: headers,
          body,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to update profile. Server response:", errorText);
        throw new Error(
          `Failed to update profile: ${res.status} ${res.statusText} - ${errorText}`
        );
      }

      const result = await res.json();
      const userData = result.data?.user;

      setUser((prev) => ({
        ...prev,
        name: userData?.name || formData.name,
        profilePhoto: userData?.picture || prev.profilePhoto,
      }));

      const updatedUserData = {
        name: userData?.name || formData.name,
        email: user.email,
        profilePhoto: userData?.picture || user.profilePhoto,
        expiry: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day in milliseconds
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedUserData));

      setUpdateProfile(false);
    } catch (error: any) {
      console.error("Error updating profile:", error.message || error);
      alert(`Failed to update profile: ${error.message || "Unknown error"}`);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      const storedProfileString = localStorage.getItem("userProfile");
      let storedProfile = null;
      try {
        storedProfile = storedProfileString
          ? JSON.parse(storedProfileString)
          : null;
      } catch (e) {
        console.error(
          "Error parsing stored user profile from localStorage:",
          e
        );
        localStorage.removeItem("userProfile"); // Clear invalid data
        storedProfile = null;
      }

      const currentTime = new Date().getTime();

      if (
        storedProfile &&
        storedProfile.expiry > currentTime &&
        storedProfile.name &&
        storedProfile.email &&
        storedProfile.profilePhoto
      ) {
        // Data is valid and not expired
        setUser({
          name: storedProfile.name,
          email: storedProfile.email,
          profilePhoto: storedProfile.profilePhoto,
        });
        setFormData((prev) => ({ ...prev, name: storedProfile.name }));
        return;
      }
      const token = localStorage.getItem("authToken");
      if (!token) {
        setUser((prev) => ({
          ...prev,
          email: "Please log in to see details.",
        })); // Update email message
        return;
      }

      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      try {
        const res = await fetch(
          "https://livelywalls.onrender.com/api/profile",
          {
            method: "GET",
            headers: headers,
          }
        );

        console.log("Fetch user profile response status:", res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error(
            "Failed to fetch user profile. Server response:",
            errorText
          );
          throw new Error(
            `Failed to fetch user profile: ${res.status} ${res.statusText} - ${errorText}`
          );
        }

        const apiResponse = await res.json();
        console.log("User profile fetched successfully:", apiResponse);

        // Ensure data exists before trying to access properties
        const fetchedName = apiResponse.data?.Name || "Please update your name";
        const fetchedEmail = apiResponse.data?.Email || "No email available";
        const fetchedPicture =
          apiResponse.data?.Picture ||
          "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png";

        const userData = {
          name: fetchedName,
          email: fetchedEmail,
          profilePhoto: fetchedPicture,
          expiry: new Date().getTime() + 24 * 60 * 60 * 1000, // 1 day in milliseconds
        };

        setUser({
          name: userData.name,
          email: userData.email,
          profilePhoto: userData.profilePhoto,
        });

        setFormData({
          name:
            userData.name !== "Please update your name" ? userData.name : "",
          file: null,
        });
        localStorage.setItem("userProfile", JSON.stringify(userData));
      } catch (error: any) {
        setUser((prev) => ({
          ...prev,
          email: `Error loading: ${error.message || "Unknown error"}`,
        }));
        alert(
          `Failed to fetch user profile: ${error.message || "Unknown error"}`
        );
      }
    };
    loadUserProfile();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <h1 className="text-xl text-gray-600">
          Please log in to view your profile.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-screen bg-gray-50 p-4">
      <img
        src={user.profilePhoto}
        alt="Profile"
        className="w-24 h-24 rounded-full mb-4 object-cover"
      />
      <h1 className="text-2xl font-semibold text-gray-800">{user.name}</h1>
      <p className="text-gray-600 mb-6">{user.email}</p>

      {!updateProfile ? (
        <button
          onClick={() => {
            setUpdateProfile(true);
            setFormData((prev) => ({ ...prev, name: user.name }));
            console.log("Entering update profile mode.");
          }}
          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Update Profile
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="Update name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Dropzone-style file input */}
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-bray-800 dark:bg-gray-700 hover:border-gray-500 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-400"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF (max 800x400px - *check server limits*)
                </p>
                {formData.file && (
                  <p className="text-xs text-green-600 mt-1">
                    File selected: {formData.file.name}
                  </p>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept="image/*" // Restrict to image files
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setUpdateProfile(false); // Cancel update
                setFormData({ name: user.name, file: null }); // Reset form data
                console.log("Cancelling update profile mode.");
              }}
              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
