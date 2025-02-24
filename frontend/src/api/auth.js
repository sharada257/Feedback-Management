import axiosInstance from "./axiosConfig";

export const registerUser = async (userData) => {
  console.log("Registering user with data:", userData); 

  try {
    const response = await axiosInstance.post("register/", userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};



export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post("login/", credentials);
    console.log("Login Response:", response.data); 

    const { token, role, username } = response.data; 

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role.toLowerCase()); 
      localStorage.setItem("username", username);
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("profile/");
    console.log("User Profile:", response.data);
    return response.data;
  } 
  catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};
