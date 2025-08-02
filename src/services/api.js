const BASE_URL = 'https://your-api-url.com';

export async function fetchData(endpoint) {
  const response = await fetch(`${BASE_URL}/${endpoint}`);
  return await response.json();
}
