import './App.css';
import React from 'react';
import ImageUploading from 'react-images-uploading';


function App() {

  const [images, setImages] = React.useState([]);
const [imageHash, setImageHash] = React.useState([]);
const maxNumber = 1;

const onChange = (imageList, addUpdateIndex) => {
  // data for submit
  setImages(imageList);
};

  if (images.length > 0) {
    const base64 = images[0].data_url.replace(/^data:image\/(png|jpg);base64,/, "");
    crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(base64)).then((buf) => {
      setImageHash(Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join(''));
    });
  }

  return (
    <div className="App">
            {images.length > 0 &&
       <p>
          THe permahash of your image is '{imageHash}' 
          <span role="img" aria-label="Nerd smiley emoji">
            🤓
          </span>
        </p>
      }
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: 'red' } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            <button onClick={onImageRemoveAll}>Remove</button>
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image['data_url']} alt="" width="100" />
              </div>
            ))}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}

export default App;
