import './App.css';
import React from 'react';
import ImageUploading from 'react-images-uploading';
import { readContract, interactWrite } from 'smartweave';
import Arweave from 'arweave';

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
  const [imageHash, setImageHash] = React.useState([]);
  const [existingHash, setExistingHash] = React.useState([]);
  const [pendingTransactionId, setPendingTransactionId] = React.useState([]);
  const maxNumber = 1;
  const contractId = "dy0QCK-wfl-KoTqsk6fomco64u9YHIhcISjNta71CSA";
  const arweave = Arweave.init({});
  

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
    setPendingTransactionId(false);
    setExistingHash(false);
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

  return (
    <div className="App">
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
        <p style={paragraphStyles}>
          contract version <a target="_blank" href="https://viewblock.io/arweave/tx/{contractId}">{contractId}</a>
          <span role="img" aria-label="Sunglasses smiley emoji">
            😎
          </span>
        </p>
        {images.length > 0 &&
          <div>
            <h3 style={headingStyles}>The permahash of your image is
            <br />
            <span style={headingAccentStyles}>'{imageHash}'</span>
            </h3>
            <br />
            {existingHash && 
              <h3 style={headingStyles}>
              Hash Found in Database - it was recorded by
              <br />
              <span style={headingAccentStyles}>'{existingHash.author}'</span>
              <br />
              <span>on</span>
              <br />
              <span style={headingAccentStyles}>{new Date(existingHash.createdAt * 1000).toUTCString()}  </span>
            </h3>
            }
          </div>
        }
        {pendingTransactionId && pendingTransactionId != '' &&
          <h2>
            Your permahash is persisting with transaction id

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
                Click or Drop here
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
        <button onClick={createPermahash}>Store Hash Permanently (you need to have ARConnect Installed to do this)</button>
        }
      </main>
    </div>
  );
}

export default App;
