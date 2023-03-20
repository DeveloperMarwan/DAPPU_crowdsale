const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
}

const ether = tokens;

describe("Crowdsale", () => {
    let crowdsale, token, accounts, deployer, user1;
    const invalidAddress = "0x0000000000000000000000000000000000000000";

    beforeEach( async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user1 = accounts[1];

        const Crowdsale = await ethers.getContractFactory("Crowdsale");
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("My Unstable Token", "MUTKN", 1000000);
        crowdsale = await Crowdsale.deploy(token.address, ether(1), tokens(1000000));
        let txn = await token.connect(deployer).transfer(crowdsale.address, tokens(1000000));
        await txn.wait();
    })

    describe("Deployment", () => {
        it("Returns token address", async () => {
            expect(await crowdsale.token()).to.equal(token.address);
        })

        it("Returns price", async () => {
            expect(await crowdsale.price()).to.equal(ether(1));
        })

        it("Sends tokens to the Crwdsale contract", async () => {
            expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(1000000));
        })
    })

    describe("Buying Tokens", () => {
        const tokenAmt = tokens(100);
        let txn, result;

        describe("Success", () => {
            beforeEach(async () => {
                txn = await crowdsale.connect(user1).buyTokens(tokenAmt, {value: ether(100)});
                result = await txn.wait();
            })
            
            it("Transfers tokens", async () => {
                expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(999900));
                expect(await token.balanceOf(user1.address)).to.equal(tokenAmt);
            })

            it("updates contract ether balance", async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(tokenAmt);
            })

            it("Emits Buy event", async () => {
                await expect(txn).to.emit(crowdsale, "Buy").withArgs(tokenAmt, user1.address);
            })

            it("Updates tokens sold", async () => {
                expect(await crowdsale.tokensSold()).to.equal(tokenAmt);
            })
        })

        describe("Failure", () => {
            it("Rejects insufficient ETH", async () => {
                await expect(crowdsale.connect(user1).buyTokens(tokenAmt, {value: 0})).to.be.reverted;
            })
        })
    })

    describe("Sending Ether", () => {
        const ethAmt = ether(100);
        const tokenAmt = tokens(100);
        let txn, result;

        describe("Success", () => {
            beforeEach(async () => {
                txn = await user1.sendTransaction({ to: crowdsale.address, value: ethAmt});
                result = await txn.wait();
            })

            it("updates contract ether balance", async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(ethAmt);
            })

            it("Updates user token balance", async () => {
                expect(await token.balanceOf(user1.address)).to.equal(tokenAmt);
            })
        })
    })

    describe("Finalizing ICO", () => {
        const ethAmt = ether(100);
        const tokenAmt = tokens(100);
        let txn, result;

        describe("Success", () => {
            beforeEach(async () => {
                txn = await crowdsale.connect(user1).buyTokens(tokenAmt, {value: ethAmt});
                result = await txn.wait();

                txn = await crowdsale.connect(deployer).finalize();
                result = await txn.wait();
            })

            it("Transfers remaining tokens to owner", async () => {
                expect(await token.balanceOf(crowdsale.address)).to.equal(0);
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
            })

            it("Transfers ETH balance to owner", async () => {
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0);
            })

            it("Emits Finalize event", async () => {
                await expect(txn).to.emit(crowdsale, "Finalize").withArgs(tokenAmt, ethAmt);
            })
        })

        describe("Failure", () => {
            it("Prevents non-owner from calling finalize", async () => {
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted;
            })
        })
    })

    describe("Updating Price", () => {
        let txn, result;
        const newPrice = ether(2);

        describe("Success", () => {
            beforeEach(async () => {
                txn = await crowdsale.connect(deployer).setPrice(newPrice);
                result = await txn.wait();
            })

            it("Updates the price", async () => {
                expect(await crowdsale.price()).to.equal(newPrice);
            })
        })

        describe("Failure", () => {
            it("Prevents non-owner from updating the price", async () => {
                await expect(crowdsale.connect(user1).setPrice(newPrice)).to.be.reverted;
            })            
        })
    })
})