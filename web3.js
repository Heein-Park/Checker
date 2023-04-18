/* jshint esversion: 8 */  
const options = {method: 'GET'};

let response;
let provider, signer;

async function pinFileIPFS(name, file, headers) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  let _formData = new FormData();
  _formData.append('file', file, );
  
  const metadata = JSON.stringify({name: name});
  _formData.append('pinataMetadata', metadata);
  
  const pinataOptions = JSON.stringify({cidVersion: 0});
  _formData.append('pinataOptions', pinataOptions);
  
  const _connect = await fetch(url, { method: 'POST', headers: headers, body: _formData});
  if(!_connect.ok) throw _connect.statusText;
  return _connect;
}

async function pinJsonIPFS(object, headers) {
  const json = JSON.stringify(object);

  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  headers['Content-Type'] = 'application/json';
  const _connect = await fetch(url, { method: 'POST', headers: headers, body: json});
  if(!_connect.ok) throw _connect.statusText;
  return _connect;
}

async function unpin(hash, headers) {
  const url = 'https://api.pinata.cloud/pinning/unpin' + '/' + hash;
  const _connect = await fetch(url, { method: 'DELETE', headers: headers});
  if(!_connect.ok) throw _connect.statusText;
  return _connect;
}


async function connectToAccount() {
  try {
    const seedSet = [];
    const defaultProvider = ethers.getDefaultProvider();
    const infuraProvider = new ethers.providers.InfuraProvider("rinkeby", {
      infura : {
          projectId: config.infura.project_ID,
          projectSecret: config.infura.project_secret
      }
    });
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Prompt user for account connections
    await web3Provider.send("eth_requestAccounts", []);
    const signer = await web3Provider.getSigner();
    const signerAddress = ethers.utils.getAddress(await signer.getAddress());
    
    const abi = checkerArtifact.abi;
    const checkerContract = new ethers.Contract(config.contract_address, abi, signer);
    const deployed = await checkerContract.deployed();

    const owner = await deployed.owner();
    const isMinter = (owner == signerAddress);
    
    let balance = await deployed.balanceOf(signerAddress);
    for (let i = 0; i < balance; i++) {
      let tokenID = await deployed.tokenOfOwnerByIndex(signerAddress, i);
      let tokenURL = await deployed.tokenURI(tokenID);
      let _promise = new Promise((resolve, reject) => loadJSON(tokenURL, data => resolve(data)));
      let tokenMetadata = await _promise;
      let _seed = tokenMetadata.properties.seed.value;
      
      seedSet.push(_seed);
    }
    
    return {contract:deployed, isMinter:isMinter, address:signerAddress, seedSet:seedSet};
  } catch (e) {
    throw e;
  }
}
