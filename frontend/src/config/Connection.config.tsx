import axios from "axios";
const connection = axios.create({
  baseURL: "https://guffsuff-backend.onrender.com",
  withCredentials: true,
});
export default connection;
