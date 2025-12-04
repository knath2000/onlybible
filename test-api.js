const testBibleAPI = async () => {
  try {
    console.log('Testing Bible API...');

    // Test the correct API format
    const response = await fetch('https://biblia-api.vercel.app/api/v1/juan/3/16');
    if (!response.ok) {
      console.error('API Error:', response.status);
      return;
    }

    const data = await response.json();
    console.log('API Success:', data);

  } catch (error) {
    console.error('API Test Error:', error);
  }
};

testBibleAPI();