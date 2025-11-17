import { API_URL } from "../utils/api";


// api.js
export const BASE_URL = "https://Mobile-application-2.onrender.com/api"; 
export const API_URL = "https://Mobile-application-2.onrender.com/api"; 


fetch(`${API_URL}/api/products`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

  app.get('/', (req, res) => {
  res.send('Server is running!');
});
