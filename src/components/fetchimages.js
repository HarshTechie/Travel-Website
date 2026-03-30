import axios from 'axios';

const ACCESS_KEY = 'eH1CxWjtpNQUJSDjQXB_ZhHkFv_E6UL83FYHeXW8-T8';
export const fetchImage = async (query) => {
  try {
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
    });

    if (res.data.results.length > 0) {
      return res.data.results[0].urls.small; // ✅ small size image
    }

    // fallback if no result
    return `https://source.unsplash.com/400x300/?${query},travel`;
  } catch (err) {
    console.error('Image fetch failed:', err);
    return `https://source.unsplash.com/400x300/?${query},travel`;
  }
};
