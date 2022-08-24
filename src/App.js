import './App.css';
import { useEffect , useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utilis/load_contracts';

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider:null,
    web3:null,
    contract : null
  })
  const [account , setAccount] = useState(null);
  const [balance , setBalance] = useState(null);
  const [reload, shouldReload] = useState(false);
  const reloadEffect = () => shouldReload(!reload);
  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => setAccount(accounts[0]));
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const contract = await loadContract("Funder", provider);
      if (provider) {
        setAccountListener(provider);
        provider.request({ method: "eth_requestAccounts" });
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
        });
      } else {
        console.error("Please install MetaMask!");
      }
      // if (window.ethereum) {
      //   provider = window.ethereum;
      //   try {
      //     await provider.enable();
      //   } catch {
      //     console.error("User is not allowed");
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }
    };

    loadProvider();
  }, []);

 
    


useEffect(() => {
  console.log("working")
  const getAccount = async()=>{
    const account = await web3Api.web3.eth.getAccounts();
    console.log(account)
    setAccount(account[0])
  }
web3Api.web3 && getAccount()
}, [web3Api.web3])
    console.log("this is ->" , web3Api.web3)
    const transferFund = async () => {
      console.log("working")
      const { web3, contract } = web3Api;
      await contract.transfer({
        from: account,
        value: web3.utils.toWei("2", "ether"),
      });
    reloadEffect()
    };
  
    const withdrawFund = async () => {
      const { contract, web3 } = web3Api;
      const withdrawAmout = web3.utils.toWei("2", "ether");
      await contract.withdraw(withdrawAmout, {
        from: account,
      });
      reloadEffect()
    };
    useEffect(() => {
      const loadBalance = async () => {
        const { contract, web3 } = web3Api;
        const balance = await web3.eth.getBalance(contract.address);
        setBalance(web3.utils.fromWei(balance, "ether"));
      };
      web3Api.contract && loadBalance();
    }, [web3Api, reload,transferFund,withdrawFund]);
  return (
    <>
      <div class="card text-center">
        <div class="card-header">Funding</div>
        <div class="card-body">
          <h5 class="card-title">Balance :{balance} ETH </h5>
          <p class="card-text">
           Account : {account ? account : "not connected"}
          </p>
          &nbsp;
          <button type="button" class="btn btn-success " onClick={async()=>{
            const account = await window.ethereum.request({method:"eth_requestAccounts"})
            console.log(account)
          }}>
            Connect To MetaMask
          </button>
          &nbsp;
          <button type="button" class= "btn btn-success " onClick={()=>transferFund()}>
            Transfer
          </button>
          &nbsp;
          <button type="button" class="btn btn-primary " onClick={()=>withdrawFund()} >
            Withdraw
          </button>
        </div>
        <div class="card-footer text-muted">DAPP</div>
      </div>
    </>
  );
}

export default App;
