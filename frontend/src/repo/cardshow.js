// export const fetchNewsData = async () => {
//   try {
//     const response = await fetch('http://localhost:8000/news/news');
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const data = await response.json();
//     const newsWithImages = await Promise.all(
//       data.map(async (news) => {
//         const imageResponse = await fetch(`http://localhost:8000/news/news/${news.news_id}/image`);
//         const imageBlob = await imageResponse.blob();
//         const imageObjectURL = URL.createObjectURL(imageBlob);
//         return { ...news, imageURL: imageObjectURL };
//       })
//     );
//     return newsWithImages;
//   } catch (error) {
//     console.error('Error fetching news data:', error);
//     return []; // ส่งคืนอาร์เรย์ว่างในกรณีที่เกิดข้อผิดพลาด
//   }
// };
