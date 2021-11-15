const options = {method: 'GET'};
let response;

async function connectToAccount() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log(signer);
  console.log("Account:", await signer.getAddress());
  
  return response = await fetch(`https://rinkeby-api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&offset=0&limit=1`, {method: 'GET'})
  .then(async raw => await raw.json())
  .catch(err => console.error(err));
}
