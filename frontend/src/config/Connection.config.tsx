import axios from "axios";
const connection = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});
export default connection;
