import { API_URL } from "../utils/api";

fetch(`${API_URL}/api/products`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
