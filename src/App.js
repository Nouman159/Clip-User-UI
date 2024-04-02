import React, { useState, useEffect } from 'react';
import axios from 'axios';
const App = () => {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [generatedImage, setGeneratedImage] = useState(null);

  const apiKey = process.env.REACT_APP_API_KEY
  console.log(apiKey)


  const handleSubmit = async () => {
    try {
      let err = {};
      if (!image) {
        err.file = 'Upload file!';
      }
      if (!prompt) {
        err.prompt = 'Enter prompt';
      }
      if (Object.keys(err).length > 0) {
        setError(err);
        return;
      }

      setLoading(true);
      const form = new FormData();
      form.append('sketch_file', image);
      form.append('prompt', prompt);

      const response = await fetch('https://clipdrop-api.co/sketch-to-image/v1/sketch-to-image', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },

        body: form,
      });

      if (response.status === 200) {
        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { type: 'image/jpeg' }); // Adjust the type as per your API response
        const imageUrl = URL.createObjectURL(blob);

        const imageUrlBlob = await fetch(imageUrl).then((res) => res.blob());
        const imageUrlFile = new File([imageUrlBlob], 'generatedImage.jpg', { type: 'image/jpeg' });
        setGeneratedImage(imageUrlFile);
        const formData = new FormData();
        formData.append('images', image);
        formData.append('images', imageUrlFile);

        await axios.post('https://1185e918-a617-4a69-9cb8-4e937b7f413e-00-2qsxh0102xo1g.worf.replit.dev/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = Math.min(img.width, img.height);
          canvas.width = maxSize;
          canvas.height = maxSize;
          const x = (img.width - maxSize) / 2;
          const y = (img.height - maxSize) / 2;
          ctx.drawImage(img, x, y, maxSize, maxSize, 0, 0, maxSize, maxSize);
          canvas.toBlob((blob) => {
            const croppedFile = new File([blob], file.name, { type: file.type });
            setImage(croppedFile);
          }, file.type);
        };
      };
    }
  };

  return (
    <div className="min-h-full p-2 md:p-4 lg:p-6">
      <div>
        <div className="flex justify-start max-w-7xl">
          <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <img className="col-span-2 max-h-24 w-full object-contain lg:col-span-1" src="/assets/ClipLogo.png" alt="Transistor" width="188" height="72" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mb-">
        <input type="file" accept="image/*" onChange={handleImageChange} className="border-2 border-gray-400 py-2 px-4 mb-4 md:mb-0 md:mr-4 w-full md:w-auto" />
        {image ? (
          <div className="flex flex-col mt-4 items-center">
            <img src={URL.createObjectURL(image)} alt="Uploaded Image" className="w-full md:w-96 rounded-md mb-4" />
          </div>
        ) :
          <div className="flex flex-col mt-4 items-center">
            <img src='/assets/dummy-image.png' alt="Uploaded Image" className="w-full md:w-96 mb-4 rounded-md" />
          </div>
        }
        {generatedImage && (
          <>
            <div className="flex flex-col mt-4 items-center">
              <img src={URL.createObjectURL(generatedImage)} alt="Generated Image" className="w-full md:w-96 mb-4 rounded-md" />
            </div>

            <div className='flex gap-6'>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded flex items-center"
                onClick={() => {
                  const url = URL.createObjectURL(generatedImage);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'generatedImage.jpg';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <img src='/assets/downloadIcon.png' />
              </button>
            </div>
          </>
        )}
        {error.file && <div className="text-red-500">{error.file}</div>}
      </div>
      <form className="flex flex-col md:flex-row items-center justify-center">
        <div className='p-2 pt-3'>
          <input
            type="text"
            placeholder="Enter prompt"
            className="border-2 border-gray-400 py-2 px-4 mb-4 md:mb-0 md:mr-4 w-full md:w-auto"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      <div className='flex justify-center'>
        {error.prompt && <div className="text-red-500">{error.prompt}</div>}
      </div>
    </div>
  );
};

export default App;
