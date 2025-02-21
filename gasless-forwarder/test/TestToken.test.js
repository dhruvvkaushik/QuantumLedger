// filepath: /gasless-forwarder/gasless-forwarder/test/TestToken.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestToken", function () {
    let TestToken;
    let testToken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        TestToken = await ethers.getContractFactory("TestToken");
        [owner, addr1, addr2] = await ethers.getSigners();
        testToken = await TestToken.deploy(1000);
        await testToken.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await testToken.owner()).to.equal(owner.address);
        });

        it("Should mint the initial supply to the owner", async function () {
            const ownerBalance = await testToken.balanceOf(owner.address);
            expect(await testToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Minting", function () {
        it("Should mint tokens correctly", async function () {
            await testToken.mint(addr1.address, 100);
            const addr1Balance = await testToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);
        });

        it("Should increase total supply when minting", async function () {
            await testToken.mint(addr1.address, 100);
            expect(await testToken.totalSupply()).to.equal(1100);
        });
    });

    describe("ERC20 functionality", function () {
        it("Should transfer tokens between accounts", async function () {
            await testToken.transfer(addr1.address, 50);
            const addr1Balance = await testToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const initialOwnerBalance = await testToken.balanceOf(owner.address);
            await expect(testToken.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            expect(await testToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });
    });
});