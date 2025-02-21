// filepath: /gasless-forwarder/gasless-forwarder/test/Forwarder.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Forwarder", function () {
    let forwarder;
    let testToken;
    let owner;
    let user;
    let recipient;
    let initialSupply = ethers.utils.parseUnits("1000", 18);

    beforeEach(async function () {
        [owner, user, recipient] = await ethers.getSigners();

        const TestToken = await ethers.getContractFactory("TestToken");
        testToken = await TestToken.deploy(initialSupply);
        await testToken.deployed();

        const Forwarder = await ethers.getContractFactory("Forwarder");
        forwarder = await Forwarder.deploy();
        await forwarder.deployed();

        // Mint tokens to user for testing
        await testToken.mint(user.address, initialSupply);
    });

    it("should forward ERC20 token transfer with permit", async function () {
        const amount = ethers.utils.parseUnits("10", 18);
        const deadline = Math.floor(Date.now() / 1000) + 3600;

        // User approves the forwarder to spend tokens on their behalf
        const nonce = await testToken.nonces(user.address);
        const domain = {
            name: "Test Token",
            version: "1",
            chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
            verifyingContract: testToken.address,
        };

        const permit = {
            owner: user.address,
            spender: forwarder.address,
            value: amount,
            nonce: nonce.toString(),
            deadline: deadline.toString(),
        };

        const types = {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        };

        const signature = await user._signTypedData(domain, types, permit);
        const { v, r, s } = ethers.utils.splitSignature(signature);

        // Execute the transfer
        await forwarder.forwardERC20TransferWithPermit(
            testToken.address,
            user.address,
            recipient.address,
            amount,
            0, // No fee for this test
            deadline,
            v,
            r,
            s
        );

        // Check balances
        const recipientBalance = await testToken.balanceOf(recipient.address);
        expect(recipientBalance).to.equal(amount);
    });

    it("should revert if permit is expired", async function () {
        const amount = ethers.utils.parseUnits("10", 18);
        const deadline = Math.floor(Date.now() / 1000) - 1; // Expired deadline

        const nonce = await testToken.nonces(user.address);
        const domain = {
            name: "Test Token",
            version: "1",
            chainId: await ethers.provider.getNetwork().then((n) => n.chainId),
            verifyingContract: testToken.address,
        };

        const permit = {
            owner: user.address,
            spender: forwarder.address,
            value: amount,
            nonce: nonce.toString(),
            deadline: deadline.toString(),
        };

        const types = {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            Permit: [
                { name: "owner", type: "address" },
                { name: "spender", type: "address" },
                { name: "value", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        };

        const signature = await user._signTypedData(domain, types, permit);
        const { v, r, s } = ethers.utils.splitSignature(signature);

        await expect(
            forwarder.forwardERC20TransferWithPermit(
                testToken.address,
                user.address,
                recipient.address,
                amount,
                0,
                deadline,
                v,
                r,
                s
            )
        ).to.be.revertedWith("Permit expired");
    });
});