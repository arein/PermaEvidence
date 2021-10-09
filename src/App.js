import './App.css';
import React from 'react';
import ImageUploading from 'react-images-uploading';
import { readContract, interactWrite } from 'smartweave';
import Arweave from 'arweave';


function App() {

  const [images, setImages] = React.useState([]);
  const [imageHash, setImageHash] = React.useState([]);
  const [existingHash, setExistingHash] = React.useState([]);
  const maxNumber = 1;
  const contractId = "TTRQsfcDB50dYOSJZ3CL5KDTfVs2rEIQ6Lxm6rDAUEc";
  const arweave = Arweave.init({});

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
  };

  readContract(arweave, contractId).then((state) => {
    console.log(state);
  });

  const lookupImageHash = (hash) => {
    readContract(arweave, contractId).then((state) => {
      console.log(state);
      const found = state.hashes.filter((existingHash) => {
        return existingHash.hash === hash;
      });
      if (found.length > 0) {
        console.log(found[0]);
        setExistingHash(found[0]);
      }
    });
  };

  if (images.length > 0) {
    const base64 = images[0].data_url.replace(/^data:image\/(png|jpg);base64,/, "");
    crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(base64)).then((buf) => {
      const newHash = Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
      if (imageHash !== newHash) {
        setExistingHash(false);
        setImageHash(newHash);
        lookupImageHash(newHash);
      }
    });
  }

  const createPermahash = () => {
    console.log("Storing hash", imageHash);
    const input = {
      'function': 'index',
      'hash': imageHash
    };
    interactWrite(arweave, null, contractId, input).then((result) => {
      console.log('arweave status', result);
      readContract(arweave, contractId).then((state) => {
        console.log(state);
      });
    });
  };

  return (
    <div className="App">
            {images.length > 0 &&
       <div>
          The permahash of your image is '{imageHash}' 
          <span role="img" aria-label="Nerd smiley emoji">
            🤓
          </span>
          <br />
          {existingHash && <p>
              It already exists and was created by {existingHash.author} at {existingHash.createdAt} 
            <span role="img" aria-label="Nerd smiley emoji">
              🤓
            </span>
          </p>
          }
        </div>
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
            {images.length === 0 && <button
              style={isDragging ? { color: 'red' } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            }
            &nbsp;
            {images.length > 0 && <button onClick={onImageRemoveAll}>Remove</button>}
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image['data_url']} alt="" width="100" />
              </div>
            ))}
          </div>
        )}
      </ImageUploading>
      {images.length > 0 &&
       <button onClick={createPermahash}>Store Hash Permanently</button>
      }

    </div>
  );
}

export default App;
