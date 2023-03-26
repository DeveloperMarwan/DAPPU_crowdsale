import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { useState } from "react";
import { ethers } from "ethers";

const Buy = ({ provider, price, crowdsale, setIsLoading}) => {
    const [amount, setAmount] = useState("0");
    const [isWaiting, setIsWaiting] = useState(false);
    
    const buyHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);
        try {
            const signer = await provider.getSigner();
            const value = ethers.utils.parseUnits((amount * price).toString(), "ether");
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), "ether");
            const txn = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: value});
            await txn.wait();
        } catch {
            window.alert("User rejected to transaction reverted");
        }
        setIsLoading(true);
    }
    
    return (
        <Form onSubmit={buyHandler}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control type="number" placeholder="Enter Amount" onChange={(e) => setAmount(e.target.value)}/>
                </Col>
                <Col className="text-center">
                    {isWaiting ? (
                        <Spinner animation="border" />
                    ) : (
                        <Button variant="primary" type="submit" style={{ width: "100%"}}>Buy Tokens</Button>
                    )}
                </Col>
            </Form.Group>
        </Form>
    )
}

export default Buy;