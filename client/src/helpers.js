const API = 'http://localhost:3333';
import { auth } from './firebase';


export async function fetchFromAPI(endpointURL, opts) {
  const { method, body } = { method: 'POST', body: null, ...opts }

  const user = auth.currentUser;
  const token = user && (await user.getIdToken())

  const res = await fetch(`${API}/${endpointURL}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      "Content-Type": "application/json",
      Authorizaton: `Bearer ${token}`,
    },
  });

  return res.json()
}