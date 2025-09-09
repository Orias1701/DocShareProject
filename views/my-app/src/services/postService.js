export function fetchPosts() {
  return fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
      console.error('Error fetching posts:', error);
      throw error;
    });