
const endpoint = "https://neural-hash-api.herokuapp.com";

class NeuralHash {
    constructor() {
        this.isAvailable = false;
    }

    getNeuralHash(image) {
        console.log(image);
        return this._checkColdStart().then(() => {
            let data = new FormData();
            data.append("image", image.file);
            return fetch(endpoint + '/hashing', {
                    method: 'POST',
                    body: data
                })
                .then(res => res.json())
                .then(
                (result) => Promise.resolve(result['Neural Hash']),
                (error) => Promise.reject(error))
        })
    }

    _checkColdStart() {
        console.log('starting');
        // TODO Retry
        if (this.isAvailable) return Promise.resolve();
        return fetch(endpoint)
        .then(res => res.json())
        .then(
          (result) => {
            console.log(result);
            const isUp = result['data'] === 'Api is Running';
            this.isAvailable = isUp;
            if (this.isAvailable) return Promise.resolve();
            return this._checkColdStart();
          },
          (error) => Promise.reject(error)
        )
    }
}

export default NeuralHash;