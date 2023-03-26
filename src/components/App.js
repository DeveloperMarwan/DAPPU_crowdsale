import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { ethers } from "ethers";

// Components
import Navigation from "./Navigation";
import Info from "./Info";
import Loading from "./Loading"
import Progress from "./Progress";
import Buy from "./Buy";

// ABI's
import TOKEN_ABI from "../abis/Token.json"
import CROWDSALE_ABI from "../abis/Crowdsale.json"

import config from "../config.json"

function App() {
    const [provider, setProvider] = useState(null);
    const [crowdsale, setCrowdsale] = useState(null);

    const [account, setAccount] = useState(null);
    const [accountBalance, setAccountBalance] = useState(0);

    const [price, setPrice] = useState(0);
    const [maxTokens, setMaxTokens] = useState(0);
    const [tokensSold, setTokensSold] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

    const loadBlockchainData = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const { chainId } = await provider.getNetwork();
        const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
        console.log(token);

        const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
        console.log(crowdsale);
        setCrowdsale(crowdsale);

        const accounts = await window.ethereum.request({ method : "eth_requestAccounts"});
        const account = accounts[0];
        setAccount(ethers.utils.getAddress(account));

        const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18);
        console.log(accountBalance);
        setAccountBalance(accountBalance);

        const price = ethers.utils.formatUnits(await crowdsale.price(), 18);
        setPrice(price);

        const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18);
        setMaxTokens(maxTokens);

        const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18);
        setTokensSold(tokensSold);

        setIsLoading(false);
    }

    useEffect( () => {
        if (isLoading) {
            loadBlockchainData();
        }
    }, [isLoading]);

    return (
        <Container>
            <Navigation />
            <h1 className="text-center my-4">Introducing DApp Token!</h1>
            {isLoading ? (
                <Loading />
            ) : (
                <div>
                    <p className="text-center"><strong>Current Price: </strong>{price} ETH</p>
                    <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
                    <Progress maxTokens={maxTokens} tokensSold={tokensSold}/>
                </div>
            )}
            <hr/>
            {account && (
                <Info account={account} accountBalance={accountBalance} />
            )}
        </Container>
    )
}

export default App;
