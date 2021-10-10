import './App.css';
import React from 'react';
import ImageUploading from 'react-images-uploading';
import { readContract, interactWrite } from 'smartweave';
import Arweave from 'arweave';
import NeuralHash from './NeuralHash';

// styles
const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
}
const headingAccentStyles = {
  color: "#663399",
}
const paragraphStyles = {
  marginBottom: 48,
}
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}
const listStyles = {
  marginBottom: 96,
  paddingLeft: 0,
}
const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 30,
}

const linkStyle = {
  color: "#8954A8",
  fontWeight: "bold",
  fontSize: 16,
  verticalAlign: "5%",
}

const docLinkStyle = {
  ...linkStyle,
  listStyleType: "none",
  marginBottom: 24,
}

const descriptionStyle = {
  color: "#232129",
  fontSize: 14,
  marginTop: 10,
  marginBottom: 0,
  lineHeight: 1.25,
}

const badgeStyle = {
  color: "#fff",
  backgroundColor: "#088413",
  border: "1px solid #088413",
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 1,
  borderRadius: 4,
  padding: "4px 6px",
  display: "inline-block",
  position: "relative",
  top: -2,
  marginLeft: 10,
  lineHeight: 1,
}


function App() {

  const [images, setImages] = React.useState([]);
  const [imageHash, setImageHash] = React.useState('');
  const [isLoadingImageHash, setIsLoadingImageHash] = React.useState(false);
  const [existingHash, setExistingHash] = React.useState(false);
  const [pendingTransactionId, setPendingTransactionId] = React.useState('');
  const maxNumber = 1;
  const contractId = "dy0QCK-wfl-KoTqsk6fomco64u9YHIhcISjNta71CSA";
  const arweave = Arweave.init({});
  const neuralHash = new NeuralHash();
  

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
    setPendingTransactionId(false);
    setExistingHash(false);
    
    if (imageList.length > 0) {
      setIsLoadingImageHash(true);
      neuralHash.getNeuralHash(imageList[0]).then((hash) => {
        console.log('yay', hash);
        setImageHash(hash);
        lookupImageHash(hash);
        setIsLoadingImageHash(false);
      }).catch((err) => {
        console.error(err);
        setIsLoadingImageHash(false);
      });
    }
  };

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

  const startPollingPendingTransaction = (txid) => {
    console.log("poll", txid);
    arweave.transactions.getStatus(txid).then(res => {
      console.log("status of tx", txid, res.status);
      if (res.status === 202) {
        return setTimeout(() => startPollingPendingTransaction(txid), 5000);
      }
      setPendingTransactionId(false);
    });
  };

  const createPermahash = () => {
    console.log("Storing hash", imageHash);
    const input = {
      'function': 'index',
      'hash': imageHash
    };
    interactWrite(arweave, null, contractId, input).then((result) => {
      console.log('arweave status', result);
      setPendingTransactionId(result);
      readContract(arweave, contractId).then((state) => {
        console.log("state after transaction", state);
        startPollingPendingTransaction(result);
      });
    });
  };

  const isLoading = !!isLoadingImageHash;

  return (
    <div className="App">
    {isLoading &&
      <main style={pageStyles}>
        <h1 style={headingStyles}>
          Doing some work
          <br />
          <span style={headingAccentStyles}>— brb! </span>
          <span role="img" aria-label="Party popper emojis">
          🧐🧐🧐
          </span>
        </h1>
      </main>
    }
    {!isLoading &&
      <main style={pageStyles}>
        <title>Perma Evidence</title>
        <h1 style={headingStyles}>
          Perma Evidence
          <br />
          <span style={headingAccentStyles}>— let it haunt you forever! </span>
          <span role="img" aria-label="Party popper emojis">
            🎉🎉🎉
          </span>
        </h1>
        <p style={descriptionStyle}>
          We create the Neural Hash of your image/nft and store it along with the original uploader.
          <br />
          You can use this to have evidence that your image already existed at a certain point in time.
          <br />
          The neural hash guarantees that even cropped, transformed, and different file formats of your image hash to the same value.
          <br />
          <span style={headingAccentStyles}>— it's digital evidence! </span>
          <span role="img" aria-label="Party popper emojis">
            🎉🎉🎉
          </span>
        </p>
        <p style={paragraphStyles}>
          contract version <a target="_blank" href="https://viewblock.io/arweave/tx/{contractId}">{contractId}</a>
          <span role="img" aria-label="Sunglasses smiley emoji">
            😎
          </span>
        </p>
        {images.length > 0 && imageHash != '' &&
          <div>
            <h3 style={headingStyles}>The Neural Hash of your image is
            <br />
            <span style={headingAccentStyles}>'{imageHash}'</span>
            </h3>
            <br />
            {existingHash && 
              <h3 style={headingStyles}>
              Neural Hash Found in Database - it was recorded by
              <br />
              <span style={headingAccentStyles}>'{existingHash.author}'</span>
              <br />
              <span>on</span>
              <br />
              <span style={headingAccentStyles}>{new Date(existingHash.createdAt * 1000).toUTCString()}  </span>
            </h3>
            }
            {!existingHash && 
              <h1 style={headingStyles}>
              Neural Hash not yet found in database
              <br />
              <span style={headingAccentStyles}>— go ahead and claim it! </span>
              <span role="img" aria-label="Party popper emojis">
                🎉🎉🎉
              </span>
            </h1>
            }
          </div>
        }
        {pendingTransactionId && pendingTransactionId != '' &&
          <h2>
            Your Neural Hash is persisting with transaction id

            <br />
            <span style={headingAccentStyles}><a target="_blank" href="https://viewblock.io/arweave/tx/{pendingTransactionId}">'{pendingTransactionId}'</a>.</span>
            <br />
            <span>
            This might take a few minutes. We check its status every 5 seconds for you (<a target="_blank" href="https://viewblock.io/arweave/tx/{pendingTransactionId}">Block explorer</a>).
            </span>
          </h2>
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
                Click here or Drop image to generate its Neural Hash
              </button>
              }
              &nbsp;
              {images.length > 0 && !pendingTransactionId && <button onClick={onImageRemoveAll}>Remove</button>}
              {imageList.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image['data_url']} alt="" width="100" />
                </div>
              ))}
            </div>
          )}
        </ImageUploading>
        {images.length > 0 && !pendingTransactionId && !existingHash && 
        <button onClick={createPermahash}>Store Neural Hash Permanently (you need to have ARConnect Installed to do this)</button>
        }
      </main>
    }
    </div>
  );
}

export default App;
