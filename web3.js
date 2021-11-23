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
  const seedSet = [];
  const defaultProvider = ethers.getDefaultProvider();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();
  //console.log(signer);
  //console.log("Account:", await signer.getAddress());
  
  const abi = checkerContract.abi;
  const checkerContractOnNet = new ethers.Contract("0x2886a6F30115d41A1cF4c3C0e39caf0D28d409A6", abi, signer);
  //console.log(checkerContractOnNet);
  
  let MINTER_ROLE = await checkerContractOnNet.MINTER_ROLE();
  let isMinter = await checkerContractOnNet.hasRole(MINTER_ROLE, signerAddress);
  //console.log(MINTER_ROLE, signerAddress, isMinter);
  
  let balance = await checkerContractOnNet.balanceOf(signerAddress);
  for (let i = 0; i < balance; i++) {
    let tokenID = await checkerContractOnNet.tokenOfOwnerByIndex(signerAddress, i);
    let tokenURL = await checkerContractOnNet.tokenURI(tokenID);
    let _promise = new Promise((resolve, reject) => loadJSON(tokenURL, data => resolve(data)));
    let tokenMetadata = await _promise;
    let _seed = tokenMetadata.properties.seed.value;
    
    seedSet.push(_seed);
  }
  
  return {contract:checkerContractOnNet, isMinter:isMinter, address:signerAddress, seedSet:seedSet};
}
